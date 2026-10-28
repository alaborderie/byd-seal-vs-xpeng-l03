import { describe, expect, it } from 'vitest'
import { l03, seal } from '../data/cars'
import type { Car } from '../data/types'
import { highwayProfile, highwayRangeKm, planTrip } from './roadTrip'

const trim = (car: Car, id: string) => {
  const found = car.trims.find((t) => t.id === id)
  if (!found) throw new Error(`unknown trim ${id}`)
  return found
}

const drivenKm = (plan: ReturnType<typeof planTrip>) =>
  plan.legs.reduce((km, leg) => (leg.kind === 'drive' ? km + leg.km : km), 0)

const sealDesign = highwayProfile(seal, trim(seal, 'design'))
const l03Performance = highwayProfile(l03, trim(l03, 'performance-ultra'))

describe('highwayProfile', () => {
  it('keeps the measurement on the tested trims', () => {
    expect(sealDesign).toEqual({ kwhPer100Km: 23.5, usableKwh: 82.5, charge10to80Min: 37, measured: true })
    expect(Math.round(highwayRangeKm(sealDesign))).toBe(351)
    expect(Math.round(highwayRangeKm(l03Performance))).toBe(300)
  })

  it('corrects other trims by their official figures', () => {
    const excellence = highwayProfile(seal, trim(seal, 'excellence'))
    // L'argus measured 25.5 kWh/100 km at 130 km/h and 10 °C on an Excellence.
    expect(excellence.kwhPer100Km).toBeCloseTo(25.1, 5)
    expect(excellence.measured).toBe(false)

    const standard = highwayProfile(l03, trim(l03, 'standard'))
    expect(standard.usableKwh).toBe(57.6)
    expect(standard.charge10to80Min).toBeCloseTo(21.5, 5)
    expect(highwayRangeKm(standard)).toBeLessThan(highwayRangeKm(highwayProfile(l03, trim(l03, 'long-range'))))
  })
})

describe('planTrip', () => {
  it('drives Paris to Marseille with two Seal stops and three L03 stops', () => {
    const sealPlan = planTrip(sealDesign, 775)
    const l03Plan = planTrip(l03Performance, 775)

    expect(sealPlan.stops).toBe(2)
    expect(l03Plan.stops).toBe(3)
    expect(sealPlan.chargeMinutes).toBeCloseTo(69.1, 1)
    expect(l03Plan.chargeMinutes).toBeCloseTo(51.8, 1)
    expect(l03Plan.stopMinutes).toBeLessThan(sealPlan.stopMinutes)
  })

  it('covers exactly the trip distance and never charges longer than a 10-80 % session', () => {
    for (const profile of [sealDesign, l03Performance]) {
      for (const distanceKm of [120, 465, 585, 775, 930]) {
        const plan = planTrip(profile, distanceKm)
        expect(drivenKm(plan)).toBeCloseTo(distanceKm, 6)
        for (const leg of plan.legs) {
          if (leg.kind === 'charge') expect(leg.minutes).toBeLessThanOrEqual(profile.charge10to80Min)
        }
      }
    }
  })

  it('needs no stop when one charge covers the trip', () => {
    const plan = planTrip(sealDesign, 300)
    expect(plan).toEqual({ legs: [{ kind: 'drive', km: 300 }], stops: 0, chargeMinutes: 0, stopMinutes: 0 })
  })
})
