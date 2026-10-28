import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Equal } from 'lucide-react'
import { l03, seal, selectedTrim } from '../data/cars'
import type { CarId, Selection } from '../data/types'
import { METRICS, winner, type Metric, type Winner } from '../lib/compare'
import { CAR_STYLE, CarName, EASE_OUT, GROW, REVEAL_ON_VIEW, Reveal, Section } from './ui'

interface Row {
  readonly metric: Metric
  readonly values: Readonly<Record<CarId, number>>
  readonly estimated: Readonly<Record<CarId, boolean>>
  readonly winner: Winner
}

function share(metric: Metric, own: number, other: number): number {
  const best = metric.better === 'higher' ? Math.max(own, other) : Math.min(own, other)
  return metric.better === 'higher' ? own / best : best / own
}

function Bar({ car, row }: { car: CarId; row: Row }) {
  const other: CarId = car === 'seal' ? 'l03' : 'seal'
  const scale = share(row.metric, row.values[car], row.values[other])
  const won = row.winner === car
  const style = CAR_STYLE[car]
  return (
    <div className={`flex items-center gap-3 ${car === 'seal' ? 'flex-row-reverse' : ''}`}>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/60 md:h-4">
        <motion.div
          className={`h-full rounded-full ${won ? style.bg : style.faded}`}
          style={{ originX: car === 'seal' ? 1 : 0, marginLeft: car === 'seal' ? 'auto' : 0, width: `${scale * 100}%` }}
          variants={GROW}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      </div>
      <span
        className={`w-[4.5rem] shrink-0 font-display text-xs font-semibold tabular sm:w-24 sm:text-sm md:w-28 md:text-base ${
          car === 'seal' ? 'text-left' : 'text-right'
        } ${won ? style.text : 'text-muted'}`}
      >
        <span className="sr-only">{car === 'seal' ? 'Seal' : 'L03'} : </span>
        {row.estimated[car] && <span title="Estimation">≈ </span>}
        {row.metric.format(row.values[car])}
      </span>
    </div>
  )
}

function Verdict({ result }: { result: Winner }) {
  if (result === 'tie') return <Equal aria-label="Égalité" className="size-4 text-muted" />
  const Icon = result === 'seal' ? ChevronLeft : ChevronRight
  return <Icon aria-label={result === 'seal' ? 'Avantage Seal' : 'Avantage L03'} className={`size-5 ${CAR_STYLE[result].text}`} />
}

export function Scoreboard({ selection }: { selection: Selection }) {
  const sealTrim = selectedTrim(seal, selection)
  const l03Trim = selectedTrim(l03, selection)
  const rows: Row[] = METRICS.map((metric) => {
    const values = { seal: metric.read(seal, sealTrim), l03: metric.read(l03, l03Trim) }
    const estimated = {
      seal: metric.estimated?.(seal, sealTrim) ?? false,
      l03: metric.estimated?.(l03, l03Trim) ?? false,
    }
    return { metric, values, estimated, winner: winner(metric, values.seal, values.l03) }
  })
  const tally = (car: CarId) => rows.filter((row) => row.winner === car).length

  return (
    <Section
      id="match"
      index="01"
      eyebrow="Le match"
      title="Dix critères, un tableau d’affichage"
      intro="La barre la plus longue marque l’avantage. Change de finition dans la barre du haut : tout le tableau se recalcule."
    >
      <Reveal className="mb-10 flex items-center justify-center gap-6 font-display md:gap-10">
        <div className="text-right">
          <CarName car="seal" className="block text-sm md:text-base" />
          <span className="text-xs text-muted">{sealTrim.name}</span>
        </div>
        <p className="text-5xl font-bold tabular md:text-7xl" aria-live="polite">
          <span className="sr-only">
            Seal {tally('seal')} critères, L03 {tally('l03')} critères.
          </span>
          <span aria-hidden className={CAR_STYLE.seal.text}>{tally('seal')}</span>
          <span aria-hidden className="mx-3 text-line">:</span>
          <span aria-hidden className={CAR_STYLE.l03.text}>{tally('l03')}</span>
        </p>
        <div>
          <CarName car="l03" className="block text-sm md:text-base" />
          <span className="text-xs text-muted">{l03Trim.name}</span>
        </div>
      </Reveal>
      <ul className="space-y-5 md:space-y-6">
        {rows.map((row) => (
          <motion.li key={row.metric.id} {...REVEAL_ON_VIEW}>
            <p className="mb-2 flex items-center justify-center gap-2 text-center text-sm font-medium text-ink">
              {row.metric.label}
              <Verdict result={row.winner} />
            </p>
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              <Bar car="seal" row={row} />
              <Bar car="l03" row={row} />
            </div>
          </motion.li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-muted">
        Autonomie à 130 km/h : mesurée par Automobile Propre sur la Seal Design (2024) et le L03 Performance Ultra
        (2026). Pour les autres finitions (≈), la mesure est corrigée de l’écart de consommation WLTP entre les finitions.
      </p>
    </Section>
  )
}
