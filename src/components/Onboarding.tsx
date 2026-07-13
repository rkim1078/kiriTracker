import { useCallback, useEffect, useState } from 'react'

interface OnboardingStep {
  title: string
  body: string
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Kiri Tracker',
    body: 'This board follows the Harada Method: one central goal, eight foundations around it, and daily actions that support each foundation.',
  },
  {
    title: 'Track mode',
    body: 'Click a daily action square to log it for today. Click a foundation to open its 3×3 region and focus on that area’s actions.',
  },
  {
    title: 'Edit mode',
    body: 'Switch to Edit to rename your goal, foundations, and daily actions. Your labels save automatically.',
  },
  {
    title: 'Simplified grid',
    body: 'Prefer less clutter? Open Settings and choose Simplified layout — you’ll see only the goal and eight foundations. Click a foundation to reveal its daily actions.',
  },
  {
    title: 'Activity & settings',
    body: 'Scroll down for your activity heatmap. Use the gear icon for themes, density, quotes, and to replay this guide anytime.',
  },
]

interface OnboardingProps {
  open: boolean
  onComplete: () => void
}

export function Onboarding({ open, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onComplete])

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      onComplete()
      return
    }
    setStep((s) => s + 1)
  }, [step, onComplete])

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="onboarding-overlay" role="presentation">
      <div
        className="onboarding-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <p className="onboarding-step-indicator">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 id="onboarding-title" className="onboarding-title">
          {current.title}
        </h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot ${i === step ? 'onboarding-dot--active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 0 ? (
            <button type="button" className="onboarding-btn onboarding-btn--ghost" onClick={back}>
              Back
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-btn onboarding-btn--ghost"
              onClick={onComplete}
            >
              Skip
            </button>
          )}
          <button type="button" className="onboarding-btn onboarding-btn--primary" onClick={next}>
            {isLast ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
