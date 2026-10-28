import type { HighwayTest } from '../data/types'

export const DESTINATIONS = [
  { id: 'nantes', label: 'Nantes', distanceKm: 385 },
  { id: 'lyon', label: 'Lyon', distanceKm: 465 },
  { id: 'bordeaux', label: 'Bordeaux', distanceKm: 585 },
  { id: 'marseille', label: 'Marseille', distanceKm: 775 },
  { id: 'nice', label: 'Nice', distanceKm: 930 },
] as const

export type Destination = (typeof DESTINATIONS)[number]

export const TRIP_RULES = {
  startSoc: 1,
  reserveSoc: 0.1,
  stopSoc: 0.8,
  overheadMinPerStop: 5,
} as const

export type TripLeg =
  | { readonly kind: 'drive'; readonly km: number }
  | { readonly kind: 'charge'; readonly minutes: number }

export interface TripPlan {
  readonly legs: readonly TripLeg[]
  readonly stops: number
  readonly chargeMinutes: number
  readonly stopMinutes: number
}

/**
 * Leaves full, arrives with the reserve, and charges from the reserve to
 * `stopSoc` at each stop. The last stop only takes the energy still needed,
 * and its duration is prorated on the measured 10-80 % time.
 */
export function planTrip(test: HighwayTest, distanceKm: number): TripPlan {
  const kwhPerKm = test.kwhPer100Km / 100
  const onBoardKwh = (TRIP_RULES.startSoc - TRIP_RULES.reserveSoc) * test.usableKwh
  const perStopKwh = (TRIP_RULES.stopSoc - TRIP_RULES.reserveSoc) * test.usableKwh
  const missingKwh = distanceKm * kwhPerKm - onBoardKwh

  if (missingKwh <= 0) {
    return { legs: [{ kind: 'drive', km: distanceKm }], stops: 0, chargeMinutes: 0, stopMinutes: 0 }
  }

  const stops = Math.ceil(missingKwh / perStopKwh)
  const legs: TripLeg[] = [{ kind: 'drive', km: onBoardKwh / kwhPerKm }]
  let remainingKwh = missingKwh
  let chargeMinutes = 0

  for (let stop = 0; stop < stops; stop++) {
    const kwh = Math.min(perStopKwh, remainingKwh)
    const minutes = (kwh / perStopKwh) * test.charge10to80Min
    legs.push({ kind: 'charge', minutes }, { kind: 'drive', km: kwh / kwhPerKm })
    remainingKwh -= kwh
    chargeMinutes += minutes
  }

  return {
    legs,
    stops,
    chargeMinutes,
    stopMinutes: chargeMinutes + stops * TRIP_RULES.overheadMinPerStop,
  }
}
