import { MotionConfig } from 'motion/react'
import { useRef, useState } from 'react'
import { Equipment, Press, Safety } from './components/Details'
import { Energy } from './components/Energy'
import { Hero } from './components/Hero'
import { Performance } from './components/Performance'
import { RoadTrip } from './components/RoadTrip'
import { Scoreboard } from './components/Scoreboard'
import { Size } from './components/Size'
import { StickyBar } from './components/StickyBar'
import { Verdict } from './components/Verdict'
import { DEFAULT_SELECTION } from './data/cars'
import type { CarId, Selection } from './data/types'

export default function App() {
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION)
  const track = useRef<HTMLElement>(null)
  const select = (car: CarId, trimId: string) => {
    setSelection((current) => ({ ...current, [car]: trimId }))
  }

  return (
    <MotionConfig reducedMotion="user">
      <Hero />
      <StickyBar selection={selection} onSelect={select} track={track} />
      <main ref={track}>
        <Scoreboard selection={selection} />
        <Performance selection={selection} />
        <Energy selection={selection} />
        <RoadTrip selection={selection} />
        <Size selection={selection} />
        <Equipment selection={selection} />
        <Safety />
        <Press />
        <Verdict />
      </main>
    </MotionConfig>
  )
}
