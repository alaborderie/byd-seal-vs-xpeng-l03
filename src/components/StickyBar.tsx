import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import type { RefObject } from 'react'
import { CARS } from '../data/cars'
import type { CarId, Selection } from '../data/types'
import { CarSilhouette } from './CarSilhouette'
import { CAR_STYLE } from './ui'

interface TrimPickerProps {
  readonly car: CarId
  readonly value: string
  readonly onChange: (trimId: string) => void
}

function TrimPicker({ car, value, onChange }: TrimPickerProps) {
  const { brand, model, trims } = CARS[car]
  const label = `Finition ${brand} ${model}`
  const style = CAR_STYLE[car]
  return (
    <>
      <label className="sr-only" htmlFor={`trim-${car}`}>
        {label}
      </label>
      <select
        id={`trim-${car}`}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        className={`h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium lg:hidden ${style.text}`}
      >
        {trims.map((trim) => (
          <option key={trim.id} value={trim.id}>
            {trim.name}
          </option>
        ))}
      </select>
      <fieldset className="hidden gap-1 rounded-2xl bg-page p-1 ring-1 ring-line lg:flex">
        <legend className="sr-only">{label}</legend>
        {trims.map((trim) => {
          const checked = trim.id === value
          return (
            <label
              key={trim.id}
              className={`relative flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                checked ? 'text-white' : 'text-muted hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name={`trim-radio-${car}`}
                value={trim.id}
                checked={checked}
                onChange={() => {
                  onChange(trim.id)
                }}
                className="sr-only"
              />
              {checked && (
                <motion.span
                  layoutId={`trim-pill-${car}`}
                  className={`absolute inset-0 rounded-xl ${style.bg}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{trim.shortName}</span>
            </label>
          )
        })}
      </fieldset>
    </>
  )
}

function ProgressCars({ progress }: { progress: MotionValue<number> }) {
  const inset = useTransform(progress, [0, 1], ['0%', '50%'])
  const sealShift = useTransform(progress, [0, 1], ['0%', '-100%'])
  const l03Shift = useTransform(progress, [0, 1], ['0%', '100%'])
  const spin = useTransform(progress, [0, 1], [0, 1440])
  return (
    <div aria-hidden className="relative mx-4 hidden h-10 flex-1 md:block">
      <div className="absolute inset-x-0 bottom-1 h-px bg-line" />
      <motion.div style={{ left: inset, x: sealShift }} className="absolute bottom-1">
        <CarSilhouette car="seal" spin={spin} className="w-20" />
      </motion.div>
      <motion.div style={{ right: inset, x: l03Shift }} className="absolute bottom-1">
        <CarSilhouette car="l03" facing="left" spin={spin} className="w-[77px]" />
      </motion.div>
    </div>
  )
}

interface StickyBarProps {
  readonly selection: Selection
  readonly onSelect: (car: CarId, trimId: string) => void
  readonly track: RefObject<HTMLElement | null>
}

export function StickyBar({ selection, onSelect, track }: StickyBarProps) {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.3 })
  return (
    <div className="sticky top-0 z-40 border-b border-line/80 bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <span className={`hidden font-display text-sm font-bold xl:inline ${CAR_STYLE.seal.text}`}>Seal</span>
          <TrimPicker
            car="seal"
            value={selection.seal}
            onChange={(trimId) => {
              onSelect('seal', trimId)
            }}
          />
        </div>
        {reduceMotion ? <div className="hidden flex-1 md:block" /> : <ProgressCars progress={progress} />}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:flex-none">
          <TrimPicker
            car="l03"
            value={selection.l03}
            onChange={(trimId) => {
              onSelect('l03', trimId)
            }}
          />
          <span className={`hidden font-display text-sm font-bold xl:inline ${CAR_STYLE.l03.text}`}>L03</span>
        </div>
      </div>
    </div>
  )
}
