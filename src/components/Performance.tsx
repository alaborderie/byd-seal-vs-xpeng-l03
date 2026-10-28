import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CARS, selectedTrim } from '../data/cars'
import type { CarId, Selection, Trim } from '../data/types'
import { formatNumber } from '../lib/format'
import { CarSilhouette } from './CarSilhouette'
import { CAR_STYLE, Card, CarName, Section, Split } from './ui'

// Constant acceleration: distance grows with the square of time.
const EASE_IN_QUAD = [0.11, 0, 0.5, 0] as const

function Lane({ car, trim, run }: { car: CarId; trim: Trim; run: string | null }) {
  const reduceMotion = useReducedMotion()
  const progress = useMotionValue(0)
  const elapsed = useMotionValue(0)
  const clock = useTransform(elapsed, (seconds) => `${formatNumber(seconds, 1)} s`)
  const x = useTransform(progress, (p) => `calc(${p} * (100cqw - 9rem))`)
  const spin = useTransform(progress, [0, 1], [0, 1800])

  useEffect(() => {
    if (reduceMotion || run === null) {
      const done = reduceMotion ? 1 : 0
      progress.set(done)
      elapsed.set(done * trim.zeroTo100S)
      return
    }
    progress.set(0)
    elapsed.set(0)
    const options = { duration: trim.zeroTo100S }
    const moves = [
      animate(progress, 1, { ...options, ease: EASE_IN_QUAD }),
      animate(elapsed, trim.zeroTo100S, { ...options, ease: 'linear' }),
    ]
    return () => {
      for (const move of moves) move.stop()
    }
  }, [run, trim.zeroTo100S, progress, elapsed, reduceMotion])

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">
          <CarName car={car} /> <span className="text-muted">{trim.name}</span>
        </p>
        <motion.p className={`font-display text-2xl font-bold tabular ${CAR_STYLE[car].text}`}>{clock}</motion.p>
      </div>
      <div className="relative h-24 rounded-2xl bg-[repeating-linear-gradient(90deg,transparent_0_46px,#E2E8F0_46px_48px)] [container-type:inline-size] md:h-28">
        <div className="absolute inset-y-3 right-0 w-1.5 rounded-full bg-[repeating-linear-gradient(180deg,#0F172A_0_8px,#fff_8px_16px)]" />
        <motion.div style={{ x }} className="absolute bottom-2 left-2 w-36">
          <CarSilhouette car={car} spin={spin} />
        </motion.div>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-b border-line py-3 last:border-0 sm:flex sm:items-baseline sm:justify-between sm:gap-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display font-semibold tabular sm:text-right">{value}</dd>
    </div>
  )
}

function Specs({ car, trim }: { car: CarId; trim: Trim }) {
  return (
    <Card>
      <CarName car={car} className="text-lg" />
      <dl className="mt-3">
        <Spec label="Puissance" value={`${formatNumber(trim.powerKw)} kW · ${formatNumber(trim.powerHp)} ch`} />
        <Spec label="Couple" value={`${formatNumber(trim.torqueNm)} Nm`} />
        <Spec label="Transmission" value={trim.drivetrain === 'awd' ? 'Intégrale' : 'Propulsion'} />
        <Spec label="Vitesse max" value={`${formatNumber(trim.topSpeedKmh)} km/h`} />
        <Spec label="Rapport poids/puissance" value={`${formatNumber(trim.weightKg / trim.powerHp, 1)} kg/ch`} />
      </dl>
    </Card>
  )
}

export function Performance({ selection }: { selection: Selection }) {
  const sealTrim = selectedTrim(CARS.seal, selection)
  const l03Trim = selectedTrim(CARS.l03, selection)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30% 0px' })
  const [replays, setReplays] = useState(0)
  // Both lanes restart together whenever either trim changes.
  const run = inView ? `${replays}-${sealTrim.id}-${l03Trim.id}` : null

  const gap = Math.abs(sealTrim.zeroTo100S - l03Trim.zeroTo100S)
  const faster = sealTrim.zeroTo100S < l03Trim.zeroTo100S ? 'seal' : 'l03'

  return (
    <Section
      id="performances"
      index="02"
      eyebrow="Performances"
      title="La course du 0 à 100 km/h"
      intro="En temps réel, avec les chiffres officiels des finitions choisies."
    >
      <div ref={ref} className="grid gap-6">
        <Lane car="seal" trim={sealTrim} run={run} />
        <Lane car="l03" trim={l03Trim} run={run} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg">
            {gap === 0 ? (
              'Égalité parfaite.'
            ) : (
              <>
                <CarName car={faster} /> passe les 100 km/h{' '}
                <strong className="font-display tabular">{formatNumber(gap, 1)} s</strong> plus tôt.
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setReplays((count) => count + 1)
            }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            <RotateCcw aria-hidden className="size-4" />
            Relancer la course
          </button>
        </div>
      </div>
      <Split className="mt-12" seal={<Specs car="seal" trim={sealTrim} />} l03={<Specs car="l03" trim={l03Trim} />} />
    </Section>
  )
}
