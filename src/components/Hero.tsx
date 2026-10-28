import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { CARS } from '../data/cars'
import type { CarId } from '../data/types'
import { formatEur } from '../lib/format'
import { CarSilhouette } from './CarSilhouette'
import { CAR_STYLE } from './ui'

function HeroStats({ car }: { car: CarId }) {
  const { brand, model, body, tagline, trims } = CARS[car]
  const from = Math.min(...trims.map((trim) => trim.priceEur))
  return (
    <div className={car === 'seal' ? 'text-right' : 'text-left'}>
      <p className={`font-display text-2xl font-bold md:text-4xl ${CAR_STYLE[car].text}`}>
        {brand} {model}
      </p>
      <p className="mt-1 text-sm font-medium tracking-wide text-muted uppercase">{body}</p>
      <p className="mt-3 hidden text-base text-pretty text-ink md:block">{tagline}</p>
      <p className="mt-2 font-display text-lg font-semibold tabular md:text-xl">dès {formatEur(from)}</p>
    </div>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const settled = useMotionValue(1)
  const progress = reduceMotion ? settled : smooth

  const sealX = useTransform(progress, [0, 0.7], ['-70%', '0%'])
  const l03X = useTransform(progress, [0, 0.7], ['70%', '0%'])
  const spin = useTransform(progress, [0, 0.7], [0, 1080])
  const titleOpacity = useTransform(progress, [0, 0.3], [1, 0])
  const titleY = useTransform(progress, [0, 0.3], [0, -48])
  const statsOpacity = useTransform(progress, [0.5, 0.78], [0, 1])
  const statsY = useTransform(progress, [0.5, 0.78], [24, 0])
  const vsScale = useTransform(progress, [0.6, 0.85], [0.3, 1])
  const vsOpacity = useTransform(progress, [0.6, 0.8], [0, 1])
  const cueOpacity = useTransform(progress, [0, 0.15], [1, 0])
  const stageY = useTransform(progress, [0, 0.7], ['0vh', '-14vh'])

  return (
    <section ref={ref} aria-label="Introduction" className={reduceMotion ? 'relative' : 'relative h-[300vh]'}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_60%_at_50%_0%,#DBEAFE_0%,transparent_70%)]"
        />
        <motion.header style={reduceMotion ? {} : { opacity: titleOpacity, y: titleY }} className="relative px-5 text-center">
          <p className="font-display text-sm font-semibold tracking-[0.25em] text-accent uppercase">
            Comparatif · France · octobre 2026
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance md:text-7xl">
            Berline ou SUV coupé ?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted">
            La BYD Seal et le XPENG L03, face à face.{reduceMotion ? '' : ' Fais défiler : elles se rapprochent.'}
          </p>
        </motion.header>

        <motion.div style={reduceMotion ? {} : { y: stageY }}>
        <div className="relative mt-10 grid grid-cols-2 items-end gap-[3vw] px-[2vw] md:mt-16">
          <motion.div style={{ x: sealX }} className="flex justify-end">
            <CarSilhouette car="seal" spin={spin} className="w-[min(44vw,640px)]" />
          </motion.div>
          <motion.div style={{ x: l03X }} className="flex justify-start">
            <CarSilhouette car="l03" facing="left" spin={spin} className="w-[min(42.6vw,620px)]" />
          </motion.div>
          <motion.span
            style={{ scale: vsScale, opacity: vsOpacity }}
            className="absolute bottom-[38%] left-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white shadow-lg md:size-16 md:text-lg"
          >
            VS
          </motion.span>
        </div>

        <motion.div style={{ opacity: statsOpacity, y: statsY }} className="mt-8 grid grid-cols-2 gap-[6vw] px-[6vw]">
          <HeroStats car="seal" />
          <HeroStats car="l03" />
        </motion.div>
        </motion.div>

        <motion.a
          href="#match"
          style={{ opacity: cueOpacity }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-sm text-muted"
        >
          Défiler
          <ChevronDown aria-hidden className="size-5 motion-safe:animate-bounce" />
        </motion.a>
      </div>
    </section>
  )
}
