import type { Car, Trim } from '../data/types'

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

/** Gaps this small are inside the model's error: linear charging, one consumption per car. */
export const TIE_MINUTES = 3

export interface HighwayProfile {
  readonly kwhPer100Km: number
  readonly usableKwh: number
  readonly charge10to80Min: number
  readonly measured: boolean
}

/**
 * The tested trim keeps Automobile Propre's measurement. Another trim of the
 * same body shares its aerodynamics, which dominate at 130 km/h, so it only
 * adds or removes the WLTP gap between the two trims (weight, tyres, motors).
 * Charging scales by the ratio of the official 10-80 % times.
 */
export function highwayProfile(car: Car, trim: Trim): HighwayProfile {
  const test = car.highwayTest
  const tested = car.trims.find((candidate) => candidate.id === test.trimId)
  if (!tested) throw new Error(`${car.model}: tested trim ${test.trimId} is not in the range`)
  return {
    kwhPer100Km: test.kwhPer100Km + trim.wltpKwhPer100Km - tested.wltpKwhPer100Km,
    usableKwh: trim.batteryKwh,
    charge10to80Min: test.charge10to80Min * (trim.dc10to80Min / tested.dc10to80Min),
    measured: trim.id === tested.id,
  }
}

export function highwayRangeKm(profile: HighwayProfile): number {
  return (profile.usableKwh / profile.kwhPer100Km) * 100
}

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
 * and its duration is prorated on the 10-80 % time, as if the charging power
 * stayed at its session average.
 */
export function planTrip(profile: HighwayProfile, distanceKm: number): TripPlan {
  const kwhPerKm = profile.kwhPer100Km / 100
  const onBoardKwh = (TRIP_RULES.startSoc - TRIP_RULES.reserveSoc) * profile.usableKwh
  const perStopKwh = (TRIP_RULES.stopSoc - TRIP_RULES.reserveSoc) * profile.usableKwh
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
    const minutes = (kwh / perStopKwh) * profile.charge10to80Min
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
