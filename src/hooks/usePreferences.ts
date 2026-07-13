import { useCallback, useEffect, useState } from 'react'
import {
  type UserPreferences,
  PREFS_STORAGE_KEY,
  applyPreferences,
  getStoredPreferences,
} from '../preferences'

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences)

  useEffect(() => {
    applyPreferences(preferences)
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((current) => ({ ...current, ...patch }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setPreferences((current) => ({ ...current, onboardingComplete: false }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setPreferences((current) => ({ ...current, onboardingComplete: true }))
  }, [])

  return {
    preferences,
    updatePreferences,
    resetOnboarding,
    completeOnboarding,
  }
}
