import type { Car, CarId, Trim } from '../data/types'
import { formatEur, formatNumber } from './format'
import { highwayProfile, highwayRangeKm } from './roadTrip'

export type Winner = CarId | 'tie'

export interface Metric {
  readonly id: string
  readonly label: string
  readonly better: 'higher' | 'lower'
  readonly read: (car: Car, trim: Trim) => number
  readonly format: (value: number) => string
  /** True when the value is derived from another trim's measurement. */
  readonly estimated?: (car: Car, trim: Trim) => boolean
}

export const METRICS: readonly Metric[] = [
  { id: 'price', label: 'Prix', better: 'lower', read: (_, t) => t.priceEur, format: formatEur },
  { id: 'power', label: 'Puissance', better: 'higher', read: (_, t) => t.powerHp, format: (v) => `${formatNumber(v)} ch` },
  { id: 'sprint', label: '0 à 100 km/h', better: 'lower', read: (_, t) => t.zeroTo100S, format: (v) => `${formatNumber(v, 1)} s` },
  { id: 'wltp', label: 'Autonomie WLTP', better: 'higher', read: (_, t) => t.wltpKm, format: (v) => `${formatNumber(v)} km` },
  {
    id: 'highway',
    label: 'Autonomie à 130 km/h',
    better: 'higher',
    read: (c, t) => highwayRangeKm(highwayProfile(c, t)),
    format: (v) => `${formatNumber(Math.round(v))} km`,
    estimated: (c, t) => !highwayProfile(c, t).measured,
  },
  { id: 'charge', label: 'Recharge 10-80 % (annoncée)', better: 'lower', read: (_, t) => t.dc10to80Min, format: (v) => `${formatNumber(v)} min` },
  { id: 'dc', label: 'Puissance de charge', better: 'higher', read: (_, t) => t.dcPeakKw, format: (v) => `${formatNumber(v)} kW` },
  { id: 'trunk', label: 'Coffres (arrière + avant)', better: 'higher', read: (c, t) => c.trunkL + t.frunkL, format: (v) => `${formatNumber(v)} L` },
  { id: 'weight', label: 'Poids à vide', better: 'lower', read: (_, t) => t.weightKg, format: (v) => `${formatNumber(v)} kg` },
  {
    id: 'batteryWarranty',
    label: 'Garantie batterie',
    better: 'higher',
    read: (c) => c.batteryWarranty.km,
    format: (v) => `${formatNumber(v)} km`,
  },
]

export function winner(metric: Metric, seal: number, l03: number): Winner {
  if (seal === l03) return 'tie'
  const sealAhead = metric.better === 'higher' ? seal > l03 : seal < l03
  return sealAhead ? 'seal' : 'l03'
}
