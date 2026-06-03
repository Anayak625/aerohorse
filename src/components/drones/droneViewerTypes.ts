export type DroneViewMode = 'standard' | 'wireframe' | 'thermal' | 'xray'

export const viewModeLabels: Record<DroneViewMode, string> = {
  standard: 'Standard',
  wireframe: 'Wireframe',
  thermal: 'Thermal IR',
  xray: 'X-Ray',
}
