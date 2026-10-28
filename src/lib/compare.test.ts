import { describe, expect, it } from 'vitest'
import { l03, seal } from '../data/cars'
import { METRICS, winner } from './compare'

const metric = (id: string) => {
  const found = METRICS.find((m) => m.id === id)
  if (!found) throw new Error(`unknown metric ${id}`)
  return found
}

describe('winner', () => {
  it('rewards the lower value when lower is better', () => {
    expect(winner(metric('price'), 47_990, 37_990)).toBe('l03')
    expect(winner(metric('sprint'), 5.9, 6.6)).toBe('seal')
  })

  it('rewards the higher value when higher is better', () => {
    expect(winner(metric('wltp'), 570, 520)).toBe('seal')
    expect(winner(metric('dc'), 150, 236)).toBe('l03')
  })

  it('calls a tie on equal values', () => {
    expect(winner(metric('wltp'), 520, 520)).toBe('tie')
  })

  it('derives the motorway range from the shared test and flags estimates', () => {
    const highway = metric('highway')
    const l03Performance = l03.trims.find((t) => t.id === 'performance-ultra')
    if (!l03Performance) throw new Error('missing trim')
    expect(Math.round(highway.read(seal, seal.trims[0]))).toBe(351)
    expect(Math.round(highway.read(l03, l03Performance))).toBe(300)
    expect(highway.estimated?.(l03, l03.trims[0])).toBe(true)
    expect(highway.estimated?.(l03, l03Performance)).toBe(false)
  })
})
