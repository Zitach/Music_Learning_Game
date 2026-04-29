import { useEffect, useState } from 'react'
import { useTutorial } from './TutorialProvider'

export function TutorialOverlay() {
  const { isActive, currentStep, steps, nextStep, skipTutorial } = useTutorial()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return
    const el = document.querySelector(steps[currentStep].targetSelector)
    if (el) setTargetRect(el.getBoundingClientRect())
  }, [isActive, currentStep, steps])

  if (!isActive || !steps[currentStep]) return null

  const step = steps[currentStep]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={nextStep}
    >
      {targetRect && (
        <div
          style={{
            position: 'absolute',
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45), 0 0 20px rgba(139, 92, 246, 0.3)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: targetRect ? targetRect.bottom + 20 : '40%',
          left: targetRect ? targetRect.left : '50%',
          transform: targetRect ? undefined : 'translateX(-50%)',
          background: 'var(--panel-strong)',
          border: '1px solid var(--line)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
          borderRadius: 16,
          padding: '20px 28px',
          maxWidth: 320,
          backdropFilter: 'blur(18px)',
          zIndex: 10001,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }}>
          {currentStep + 1} / {steps.length}
        </div>
        <h3 style={{ color: 'var(--text)', margin: '0 0 8px', fontSize: 18 }}>{step.title}</h3>
        <p style={{ color: 'var(--muted)', margin: '0 0 16px', fontSize: 14, lineHeight: 1.6 }}>
          {step.description}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={nextStep}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--gold), var(--warning))',
              color: 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {currentStep < steps.length - 1 ? '下一步' : '完成'}
          </button>
          <button
            onClick={skipTutorial}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            跳过教程
          </button>
        </div>
      </div>
    </div>
  )
}
