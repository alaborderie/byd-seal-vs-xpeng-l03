import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { CARS } from '../data/cars'
import type { CarId } from '../data/types'

export const CAR_STYLE = {
  seal: { text: 'text-seal', bg: 'bg-seal', soft: 'bg-seal-soft', faded: 'bg-seal/35', border: 'border-t-seal' },
  l03: { text: 'text-l03-ink', bg: 'bg-l03', soft: 'bg-l03-soft', faded: 'bg-l03/35', border: 'border-t-l03' },
} as const satisfies Record<CarId, Record<string, string>>

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

interface SectionProps {
  readonly id: string
  readonly index: string
  readonly eyebrow: string
  readonly title: string
  readonly intro?: ReactNode
  readonly children: ReactNode
}

export function Section({ id, index, eyebrow, title, intro, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 md:py-28">
      <Reveal>
        <p className="font-display text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          {index} · {eyebrow}
        </p>
        <h2 id={`${id}-title`} className="mt-3 font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
        {intro && <p className="mt-4 max-w-2xl text-lg text-pretty text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  )
}

export function CarName({ car, className = '' }: { car: CarId; className?: string }) {
  const { brand, model } = CARS[car]
  return (
    <span className={`font-display font-semibold ${CAR_STYLE[car].text} ${className}`}>
      {brand} {model}
    </span>
  )
}

/** Seal on the left, L03 on the right, everywhere on the page. */
export function Split({ seal, l03, className = '' }: { seal: ReactNode; l03: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 md:gap-10 ${className}`}>
      <div>{seal}</div>
      <div>{l03}</div>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-line bg-surface p-5 shadow-sm shadow-slate-200/60 md:p-8 ${className}`}>
      {children}
    </div>
  )
}
