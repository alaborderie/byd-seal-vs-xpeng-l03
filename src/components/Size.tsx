import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { CARS, selectedTrim } from '../data/cars'
import type { Car, CarId, Selection } from '../data/types'
import { formatNumber } from '../lib/format'
import { CarSilhouette } from './CarSilhouette'
import { CAR_STYLE, Card, CarName, EASE_OUT, Section, Split } from './ui'

const SEAL_WIDTH_PCT = 62
const L03_WIDTH_PCT = (SEAL_WIDTH_PCT * CARS.l03.lengthMm) / CARS.seal.lengthMm

function Overlay() {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const settled = useMotionValue(1)
  const progress = reduceMotion ? settled : smooth

  const sealX = useTransform(progress, [0, 0.6], ['-34%', '0%'])
  const l03X = useTransform(progress, [0, 0.6], ['34%', '0%'])
  const solid = useTransform(progress, [0.45, 0.65], [1, 0])
  const outline = useTransform(progress, [0.45, 0.65], [0, 1])
  const labels = useTransform(progress, [0.6, 0.8], [0, 1])

  return (
    <div ref={ref} className={reduceMotion ? 'relative' : 'relative h-[220vh]'}>
      <div className="sticky top-24 flex min-h-[70svh] flex-col justify-center">
        <div className="relative mx-auto aspect-[3/1] w-full max-w-5xl">
          {(['seal', 'l03'] as const).map((car) => (
            <motion.div
              key={car}
              style={{ x: car === 'seal' ? sealX : l03X, width: `${car === 'seal' ? SEAL_WIDTH_PCT : L03_WIDTH_PCT}%` }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
            >
              <div className="relative">
                <motion.div style={{ opacity: solid }}>
                  <CarSilhouette car={car} />
                </motion.div>
                <motion.div style={{ opacity: outline }} className="absolute inset-0">
                  <CarSilhouette car={car} outline />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div style={{ opacity: labels }} className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-6 text-center">
          {(['seal', 'l03'] as const).map((car) => (
            <p key={car} className="text-sm md:text-base">
              <CarName car={car} />
              <span className="mt-1 block font-display text-xl font-semibold tabular md:text-2xl">
                {formatNumber(CARS[car].lengthMm / 1000, 2)} m × {formatNumber(CARS[car].heightMm / 1000, 2)} m
              </span>
              <span className="text-muted">longueur × hauteur</span>
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex sm:items-baseline sm:justify-between sm:gap-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display font-semibold tabular sm:text-right">{value}</dd>
    </div>
  )
}

function Cargo({ car, frunkL, maxL }: { car: Car; frunkL: number; maxL: number }) {
  const style = CAR_STYLE[car.id]
  const parts = [
    { label: 'Coffre', liters: car.trunkL, className: style.bg },
    { label: 'Avant', liters: frunkL, className: style.soft },
  ]
  return (
    <div className="mt-5">
      <p className="text-sm text-muted">
        Volume total <strong className="font-display text-ink tabular">{formatNumber(car.trunkL + frunkL)} L</strong>
      </p>
      <div className="mt-2 flex h-9 gap-1 overflow-hidden rounded-lg bg-line/50">
        {parts.map((part, index) => (
          <motion.div
            key={part.label}
            className={`flex items-center px-2 text-xs font-semibold whitespace-nowrap ${part.className} ${
              index === 0 ? 'text-white' : 'text-ink'
            }`}
            style={{ width: `${(part.liters / maxL) * 100}%`, originX: 0 }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.15, ease: EASE_OUT }}
          >
            {formatNumber(part.liters)} L
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Arrière puis coffre avant. Ouverture : {car.trunkOpening.toLowerCase()}.</p>
    </div>
  )
}

function Dimensions({ car, selection, maxL }: { car: Car; selection: Selection; maxL: number }) {
  const trim = selectedTrim(car, selection)
  const mm = (value: number) => `${formatNumber(value)} mm`
  return (
    <Card>
      <CarName car={car.id} className="text-lg" />
      <dl className="mt-3">
        <Row label="Longueur" value={mm(car.lengthMm)} />
        <Row label="Largeur" value={mm(car.widthMm)} />
        <Row label="Hauteur" value={mm(car.heightMm)} />
        <Row label="Empattement" value={mm(car.wheelbaseMm)} />
        <Row label="Garde au sol" value={mm(car.groundClearanceMm)} />
        <Row label="Cx" value={formatNumber(car.dragCoefficient, 3)} />
        <Row label="Poids à vide" value={`${formatNumber(trim.weightKg)} kg`} />
        <Row label="Remorquage freiné" value={`${formatNumber(trim.towingBrakedKg)} kg`} />
      </dl>
      <Cargo car={car} frunkL={trim.frunkL} maxL={maxL} />
    </Card>
  )
}

export function Size({ selection }: { selection: Selection }) {
  const totals = (['seal', 'l03'] as const satisfies readonly CarId[]).map(
    (id) => CARS[id].trunkL + selectedTrim(CARS[id], selection).frunkL,
  )
  const maxL = Math.max(...totals)
  return (
    <Section
      id="gabarit"
      index="05"
      eyebrow="Gabarit et coffre"
      title="Superposées à l’échelle"
      intro="Continue de défiler : les deux silhouettes se rejoignent et se superposent au millimètre près."
    >
      <Overlay />
      <Split
        className="mt-12"
        seal={<Dimensions car={CARS.seal} selection={selection} maxL={maxL} />}
        l03={<Dimensions car={CARS.l03} selection={selection} maxL={maxL} />}
      />
    </Section>
  )
}
