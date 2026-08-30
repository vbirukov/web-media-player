/**
 * Demo mode configuration
 * Enables MOCK data for testing without backend
 */

import { mockCatalog, mockUserState } from './mockData'

export const DEMO_MODE = true // Set to false for production

export function getDemoCatalog() {
  if (!DEMO_MODE) return null
  return mockCatalog
}

export function getDemoUserState() {
  if (!DEMO_MODE) return null
  return mockUserState
}

// Simulate API delay
export function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock catalog loader
export async function loadDemoCatalog() {
  await simulateDelay(800)
  return mockCatalog
}

// Mock text content loader
export async function loadDemoTextContent(trackId: string) {
  await simulateDelay(300)
  const { getMockTextContent } = await import('./mockData')
  return getMockTextContent(trackId)
}
