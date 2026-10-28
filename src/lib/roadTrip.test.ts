import { describe, expect, it } from 'vitest'
import { l03, seal } from '../data/cars'
import { planTrip } from './roadTrip'

const drivenKm = (plan: ReturnType<typeof planTrip>) =>
  plan.legs.reduce((km, leg) => (leg.kind === 'drive' ? km + leg.km : km), 0)

describe('planTrip', () => {
  it('drives Paris to Marseille with two Seal stops and three L03 stops', () => {
    const sealPlan = planTrip(seal.highwayTest, 775)
    const l03Plan = planTrip(l03.highwayTest, 775)

    expect(sealPlan.stops).toBe(2)
    expect(l03Plan.stops).toBe(3)
    expect(sealPlan.chargeMinutes).toBeCloseTo(69.1, 1)
    expect(l03Plan.chargeMinutes).toBeCloseTo(51.8, 1)
    expect(l03Plan.stopMinutes).toBeLessThan(sealPlan.stopMinutes)
  })

  it('covers exactly the trip distance and never charges longer than a 10-80 % session', () => {
    for (const test of [seal.highwayTest, l03.highwayTest]) {
      for (const distanceKm of [120, 465, 585, 775, 930]) {
        const plan = planTrip(test, distanceKm)
        expect(drivenKm(plan)).toBeCloseTo(distanceKm, 6)
        for (const leg of plan.legs) {
          if (leg.kind === 'charge') expect(leg.minutes).toBeLessThanOrEqual(test.charge10to80Min)
        }
      }
    }
  })

  it('needs no stop when one charge covers the trip', () => {
    const plan = planTrip(seal.highwayTest, 300)
    expect(plan).toEqual({ legs: [{ kind: 'drive', km: 300 }], stops: 0, chargeMinutes: 0, stopMinutes: 0 })
  })
})
