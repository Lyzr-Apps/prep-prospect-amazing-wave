'use client'

import { useState, useEffect } from 'react'

export interface DayPlannerConfig {
  scheduleTime: string
  timezone: string
  enabled: boolean
  companyDomains: string
  emailRecipient: string
  linkedInUrl: string
  previousCompanies: string
  hometown: string
  enableApollo: boolean
  enableLinkedIn: boolean
  enableNews: boolean
  enableSports: boolean
  enableConnections: boolean
  selectedDate: string
}

const DEFAULT_CONFIG: DayPlannerConfig = {
  scheduleTime: '06:00',
  timezone: 'America/New_York',
  enabled: true,
  companyDomains: 'company.com',
  emailRecipient: '',
  linkedInUrl: '',
  previousCompanies: '',
  hometown: '',
  enableApollo: true,
  enableLinkedIn: true,
  enableNews: true,
  enableSports: true,
  enableConnections: true,
  selectedDate: new Date().toISOString().split('T')[0],
}

const CONFIG_STORAGE_KEY = 'day-planner-config'

/**
 * Custom hook for managing Day Planner configuration with localStorage persistence
 */
export function useConfig() {
  const [config, setConfigState] = useState<DayPlannerConfig>(DEFAULT_CONFIG)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as DayPlannerConfig
        setConfigState(parsed)
        console.log('Configuration loaded from localStorage')
      }
    } catch (error) {
      console.error('Failed to load configuration from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save configuration to localStorage whenever it changes
  const setConfig = (newConfig: DayPlannerConfig | ((prev: DayPlannerConfig) => DayPlannerConfig)) => {
    setConfigState((prev) => {
      const updated = typeof newConfig === 'function' ? newConfig(prev) : newConfig

      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated))
        console.log('Configuration saved to localStorage')
      } catch (error) {
        console.error('Failed to save configuration to localStorage:', error)
      }

      return updated
    })
  }

  // Reset to default configuration
  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    console.log('Configuration reset to defaults')
  }

  // Export configuration as JSON file
  const exportConfig = () => {
    try {
      const dataStr = JSON.stringify(config, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `day-planner-config-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      console.log('Configuration exported')
    } catch (error) {
      console.error('Failed to export configuration:', error)
    }
  }

  // Import configuration from JSON file
  const importConfig = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const parsed = JSON.parse(content) as DayPlannerConfig
          setConfig(parsed)
          console.log('Configuration imported successfully')
          resolve()
        } catch (error) {
          console.error('Failed to import configuration:', error)
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  return {
    config,
    setConfig,
    resetConfig,
    exportConfig,
    importConfig,
    isLoaded,
  }
}
