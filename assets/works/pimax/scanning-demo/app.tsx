const { useEffect, useRef, useState } = React;

type Stage = 'camera' | 'scanning' | 'resolving' | 'result' | 'openingTemplates' | 'templates'

const assets = './assets'
const scanDuration = 3200
const resolveDuration = 700
const templateTransitionDuration = 480
const dotFadeDuration = 110

function Header({
  title,
  template = false,
  onBack,
}: {
  title: string
  template?: boolean
  onBack: () => void
}) {
  return (
    <header className="app-header">
      <button className="icon-button" onClick={onBack} aria-label="Back">
        <img src={`${assets}/cc59b.svg`} alt="" />
      </button>
      <h1>{title}</h1>
      <button className="icon-button" aria-label={template ? 'Delete' : 'Help'}>
        <img src={`${assets}/${template ? 'f7101' : 'ff409'}.svg`} alt="" />
      </button>
    </header>
  )
}

function CameraButton({
  scanning,
  running,
  onClick,
}: {
  scanning: boolean
  running: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`camera-button ${scanning ? 'is-scanning' : ''}`}
      onClick={onClick}
      disabled={scanning}
      aria-label={scanning ? 'Scanning lights' : 'Take photo'}
    >
      {scanning && (
        <svg className={`progress-ring ${running ? 'is-running' : ''}`} viewBox="0 0 88 88" aria-hidden="true">
          <circle className="progress-track" cx="44" cy="44" r="38" />
          <circle className="progress-value" cx="44" cy="44" r="38" />
        </svg>
      )}
      <img src={`${assets}/be89e.svg`} alt="" />
    </button>
  )
}

function LightTree({ colored = false, template = 0 }: { colored?: boolean; template?: number }) {
  const filters = ['none', 'hue-rotate(78deg) saturate(1.25)', 'hue-rotate(205deg) saturate(1.4)', 'hue-rotate(300deg)']

  if (colored) {
    return (
      <div
        className="light-tree rainbow-tree"
        style={{ filter: filters[template] }}
        role="img"
        aria-label="Animated rainbow lights"
      />
    )
  }

  return (
    <img
      className="light-tree white"
      src={`${assets}/fcd5b.svg`}
      alt=""
    />
  )
}

function DetectionDots({
  mode,
  onReady,
}: {
  mode: 'scanning' | 'resolving' | 'result'
  onReady?: () => void
}) {
  const objectRef = useRef<HTMLObjectElement>(null)

  const getDots = () =>
    Array.from(objectRef.current?.contentDocument?.querySelectorAll<SVGPathElement>('path') ?? [])

  const fillDots = () => {
    const dots = getDots()
    dots.forEach((dot) => {
      dot.style.transition = `fill-opacity ${resolveDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
    })

    objectRef.current?.contentDocument?.documentElement.getBoundingClientRect()
    requestAnimationFrame(() => {
      dots.forEach((dot) => {
        dot.style.fillOpacity = '1'
      })
    })
  }

  const initializeDots = () => {
    const document = objectRef.current?.contentDocument
    const dots = getDots()
    if (!document || dots.length === 0) return

    if (mode === 'result') {
      dots.forEach((dot) => {
        dot.style.opacity = '1'
        dot.style.fillOpacity = '1'
      })
      requestAnimationFrame(() => {
        if (objectRef.current) objectRef.current.style.opacity = '1'
        onReady?.()
      })
      return
    }

    const animationStyles = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    animationStyles.textContent = `
      @keyframes recognized-dot-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `
    document.documentElement.appendChild(animationStyles)

    const randomOrder = dots.map((_, index) => index)

    for (let index = randomOrder.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[randomOrder[index], randomOrder[swapIndex]] = [randomOrder[swapIndex], randomOrder[index]]
    }

    dots.forEach((dot, index) => {
      const revealIndex = randomOrder.indexOf(index)
      const progress = revealIndex / Math.max(dots.length - 1, 1)
      let timelineProgress: number

      if (progress <= 0.32) {
        timelineProgress = (progress / 0.32) * 0.25
      } else if (progress <= 0.68) {
        timelineProgress = 0.34 + ((progress - 0.32) / 0.36) * 0.28
      } else {
        const finalStart = 1 - dotFadeDuration / scanDuration
        timelineProgress = 0.72 + ((progress - 0.68) / 0.32) * (finalStart - 0.72)
      }

      const delay = timelineProgress * scanDuration

      dot.style.opacity = '0'
      dot.style.fillOpacity = mode === 'resolving' ? '1' : '0'
      dot.style.animation = `recognized-dot-in ${dotFadeDuration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`
      dot.style.animationPlayState = 'paused'
    })

    requestAnimationFrame(() => {
      if (objectRef.current) objectRef.current.style.opacity = '1'
      dots.forEach((dot) => {
        dot.style.animationPlayState = 'running'
      })
      onReady?.()
    })
  }

  useEffect(() => {
    if (mode === 'resolving') fillDots()
  }, [mode])

  return (
    <object
      ref={objectRef}
      className="detection-object"
      data={`${assets}/fcd5b.svg`}
      type="image/svg+xml"
      onLoad={initializeDots}
      aria-label="Recognized light points"
    />
  )
}

function BottomActions({
  onAgain,
  onSave,
  transitioning = false,
  leaving = false,
}: {
  onAgain: () => void
  onSave: () => void
  transitioning?: boolean
  leaving?: boolean
}) {
  return (
    <div
      className={`bottom-bar result-actions ${transitioning ? 'is-entering' : ''} ${leaving ? 'is-leaving' : ''}`}
    >
      <button className="secondary-button" onClick={onAgain} disabled={transitioning || leaving}>
        Again
      </button>
      <button className="primary-button" onClick={onSave} disabled={transitioning || leaving}>
        Save
      </button>
    </div>
  )
}

function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: number
  onSelect: (index: number) => void
}) {
  const gradients = [
    'linear-gradient(135deg,#ff0000 0%,#ffe600 39%,#6691ff 74%,#ff03b8 100%)',
    'linear-gradient(135deg,#fff500 0%,#ff0099 35%,#6675ff 68%,#03ff86 100%)',
    'linear-gradient(135deg,#ff00a8 0%,#00ffa3 35%,#34de30 68%,#ff2103 100%)',
    'linear-gradient(135deg,#ff00a8 0%,#00ffa3 35%,#34de30 68%,#ff2103 100%)',
  ]

  return (
    <div className="template-picker" aria-label="Color templates">
      {gradients.map((gradient, index) => (
        <button
          key={gradient + index}
          className={`template-swatch ${selected === index ? 'selected' : ''}`}
          style={{ '--swatch': gradient } as CSSProperties}
          onClick={() => onSelect(index)}
          aria-label={`Template ${index + 1}`}
          aria-pressed={selected === index}
        >
          <span />
          {index === 3 && (
            <span className="edit-overlay">
              <img src={`${assets}/49814.svg`} alt="" />
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function App() {
  const [stage, setStage] = useState<Stage>('camera')
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [scanReady, setScanReady] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const scanStartedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const startScan = () => {
    if (stage !== 'camera') return
    scanStartedRef.current = false
    setScanReady(false)
    setStage('scanning')
  }

  const handleScanReady = () => {
    if (scanStartedRef.current) return

    scanStartedRef.current = true
    setScanReady(true)
    timeoutRef.current = window.setTimeout(() => {
      setStage('resolving')
      timeoutRef.current = window.setTimeout(() => setStage('result'), resolveDuration)
    }, scanDuration)
  }

  const reset = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    scanStartedRef.current = false
    setScanReady(false)
    setStage('camera')
  }

  const openTemplates = () => {
    setStage('openingTemplates')
    timeoutRef.current = window.setTimeout(() => setStage('templates'), templateTransitionDuration)
  }

  const closeTemplates = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setStage('result')
  }

  useEffect(() => {
    let timer: number | undefined;
    if (stage === 'camera') timer = window.setTimeout(startScan, 1100);
    if (stage === 'result') timer = window.setTimeout(openTemplates, 1400);
    if (stage === 'templates') {
      const sequence = [
        window.setTimeout(() => setSelectedTemplate(1), 2300),
        window.setTimeout(() => setSelectedTemplate(2), 4600),
        window.setTimeout(() => { setSelectedTemplate(0); reset(); }, 7600),
      ];
      return () => sequence.forEach(window.clearTimeout);
    }
    return () => window.clearTimeout(timer);
  }, [stage]);

  const isPhotoStage = stage === 'camera' || stage === 'scanning' || stage === 'resolving'
  const isRecognizing = stage === 'scanning' || stage === 'resolving'
  const showsDetectedLights =
    stage === 'scanning' || stage === 'resolving' || stage === 'result' || stage === 'openingTemplates'
  const isTemplateView = stage === 'openingTemplates' || stage === 'templates'
  const keepsTemplateTreeMounted = stage === 'result' || isTemplateView
  const detectedMode = stage === 'scanning' || stage === 'resolving' ? stage : 'result'

  return (
    <main className={`scanner-app stage-${stage}`}>
      <div className="asset-preloads" aria-hidden="true">
        <img src={`${assets}/d070e.svg`} alt="" />
        <img src={`${assets}/c6cb7.svg`} alt="" />
      </div>

      {isPhotoStage && (
        <img className="camera-image" src={`${assets}/f8685.png`} alt="A decorated Christmas tree" />
      )}
      {isRecognizing && <div className="scan-dim" aria-hidden="true" />}
      {!isPhotoStage && <img className="ambient-bg" src={`${assets}/73a64.svg`} alt="" />}

      <Header
        title={isTemplateView ? 'Rainbow' : 'Scanning'}
        template={isTemplateView}
        onBack={isTemplateView ? closeTemplates : reset}
      />

      {showsDetectedLights && (
        <div className="detection-layer" aria-hidden="true">
          <DetectionDots mode={detectedMode} onReady={stage === 'scanning' ? handleScanReady : undefined} />
        </div>
      )}

      {keepsTemplateTreeMounted && (
        <div className={`template-tree-wrap ${stage === 'result' ? 'is-dormant' : ''}`}>
          <LightTree colored template={selectedTemplate} />
        </div>
      )}

      {isTemplateView && (
        <>
          <TemplatePicker selected={selectedTemplate} onSelect={setSelectedTemplate} />
        </>
      )}

      {isPhotoStage && (
        <div className={`capture-area ${stage === 'resolving' ? 'is-leaving' : ''}`}>
          <CameraButton
            scanning={isRecognizing}
            running={scanReady || stage === 'resolving'}
            onClick={startScan}
          />
        </div>
      )}

      {(stage === 'resolving' || stage === 'result' || stage === 'openingTemplates') && (
        <BottomActions
          transitioning={stage === 'resolving'}
          leaving={stage === 'openingTemplates'}
          onAgain={reset}
          onSave={openTemplates}
        />
      )}

      {isTemplateView && (
        <div className="bottom-bar template-actions is-entering">
          <button className="playlist-button" aria-label="Add to playlist">
            <img src={`${assets}/cf4d6.svg`} alt="" />
          </button>
          <button className="primary-button" onClick={() => setStage('result')}>
            Apply
          </button>
        </div>
      )}
    </main>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
