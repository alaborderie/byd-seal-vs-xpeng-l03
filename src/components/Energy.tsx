import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { BatteryCharging, RotateCcw, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CARS, selectedTrim } from '../data/cars'
import type { CarId, Selection, Trim } from '../data/types'
import { formatNumber } from '../lib/format'
import { CAR_STYLE, Card, CarName, Section, Split } from './ui'

const SECONDS_PER_MINUTE = 0.25
const FROM_SOC = 0.1
const TO_SOC = 0.8

function ChargingBattery({ car, trim, run }: { car: CarId; trim: Trim; run: string | null }) {
  const reduceMotion = useReducedMotion()
  const soc = useMotionValue(FROM_SOC)
  const minutes = useMotionValue(0)
  const fill = useTransform(soc, (value) => `${value * 100}%`)
  const percent = useTransform(soc, (value) => `${Math.round(value * 100)} %`)
  const clock = useTransform(minutes, (value) => `${Math.round(value)} min`)

  useEffect(() => {
    if (reduceMotion || run === null) {
      soc.set(reduceMotion ? TO_SOC : FROM_SOC)
      minutes.set(reduceMotion ? trim.dc10to80Min : 0)
      return
    }
    soc.set(FROM_SOC)
    minutes.set(0)
    const options = { duration: trim.dc10to80Min * SECONDS_PER_MINUTE, ease: 'linear' } as const
    const fills = [animate(soc, TO_SOC, options), animate(minutes, trim.dc10to80Min, options)]
    return () => {
      for (const fillAnimation of fills) fillAnimation.stop()
    }
  }, [run, trim.dc10to80Min, soc, minutes, reduceMotion])

  const style = CAR_STYLE[car]
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CarName car={car} className="text-lg" />
        <motion.span className={`font-display text-2xl font-bold tabular md:text-3xl ${style.text}`}>{clock}</motion.span>
      </div>
      <div className="mt-5 flex items-center gap-1.5">
        <div className="relative h-16 flex-1 overflow-hidden rounded-xl border-2 border-ink/80 bg-page p-1 md:h-20">
          <motion.div style={{ width: fill }} className={`h-full rounded-lg ${style.bg}`} />
          <motion.span className="absolute inset-0 grid place-items-center font-display text-lg font-bold text-ink tabular mix-blend-difference invert">
            {percent}
          </motion.span>
        </div>
        <div className="h-6 w-2 rounded-r-md bg-ink/80" />
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Batterie</dt>
          <dd className="font-display text-base font-semibold tabular">{formatNumber(trim.batteryKwh, 1)} kWh</dd>
        </div>
        <div>
          <dt className="text-muted">Chimie</dt>
          <dd className="font-display text-base font-semibold">{CARS[car].chemistry}</dd>
        </div>
        <div>
          <dt className="text-muted">Charge DC max</dt>
          <dd className="font-display text-base font-semibold tabular">{formatNumber(trim.dcPeakKw)} kW</dd>
        </div>
        <div>
          <dt className="text-muted">Tension</dt>
          <dd className="font-display text-base font-semibold">{CARS[car].voltage}</dd>
        </div>
        <div>
          <dt className="text-muted">Autonomie WLTP</dt>
          <dd className="font-display text-base font-semibold tabular">{formatNumber(trim.wltpKm)} km</dd>
        </div>
        <div>
          <dt className="text-muted">Conso WLTP</dt>
          <dd className="font-display text-base font-semibold tabular">{formatNumber(trim.wltpKwhPer100Km, 1)} kWh/100</dd>
        </div>
      </dl>
    </Card>
  )
}

export function Energy({ selection }: { selection: Selection }) {
  const sealTrim = selectedTrim(CARS.seal, selection)
  const l03Trim = selectedTrim(CARS.l03, selection)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30% 0px' })
  const [replays, setReplays] = useState(0)
  // Both batteries restart together whenever either trim changes.
  const run = inView ? `${replays}-${sealTrim.id}-${l03Trim.id}` : null
  const saved = sealTrim.dc10to80Min - l03Trim.dc10to80Min

  return (
    <Section
      id="recharge"
      index="03"
      eyebrow="Batterie et recharge"
      title="De 10 à 80 %, chrono en main"
      intro="Temps officiels sur borne rapide. Ici, une minute de charge passe en un quart de seconde."
    >
      <div ref={ref}>
        <Split seal={<ChargingBattery car="seal" trim={sealTrim} run={run} />} l03={<ChargingBattery car="l03" trim={l03Trim} run={run} />} />
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-lg">
            <Zap aria-hidden className="size-5 text-accent" />
            <span>
              {saved > 0 ? (
                <>
                  Sur les temps annoncés, <CarName car="l03" /> rend la main{' '}
                  <strong className="font-display tabular">{saved} min</strong> plus tôt à chaque arrêt.
                </>
              ) : (
                <>
                  <CarName car="seal" /> charge aussi vite ou plus vite.
                </>
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setReplays((count) => count + 1)
            }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            <RotateCcw aria-hidden className="size-4" />
            Rebrancher
          </button>
        </div>
        <p className="mt-6 flex gap-2 text-sm text-muted">
          <BatteryCharging aria-hidden className="mt-0.5 size-4 shrink-0" />
          En essai, Automobile Propre a mesuré 36 à 37 min sur la Seal Design (48 min batterie chaude) et 21 min 30 sur le
          L03 Performance Ultra, avec un pic à 220 kW.
        </p>
      </div>
    </Section>
  )
}
