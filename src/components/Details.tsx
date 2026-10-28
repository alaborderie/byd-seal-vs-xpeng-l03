import { motion } from 'motion/react'
import { Check, Minus, ShieldCheck, ShieldQuestion, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import { CARS, selectedTrim } from '../data/cars'
import { EQUIPMENT, type Car, type CarId, type Selection } from '../data/types'
import { formatNumber } from '../lib/format'
import { CAR_STYLE, Card, CarName, EASE_OUT, GROW, REVEAL_ON_VIEW, Reveal, Section, Split } from './ui'

function EquipmentCell({ car, detail }: { car: CarId; detail: string | null }) {
  const mirrored = car === 'seal'
  return (
    <div className={`flex min-w-0 items-start gap-2 ${mirrored ? 'flex-row-reverse text-right' : ''}`}>
      {detail ? (
        <Check aria-label="Oui" className={`mt-0.5 size-5 shrink-0 ${CAR_STYLE[car].text}`} />
      ) : (
        <Minus aria-label="Non" className="mt-0.5 size-5 shrink-0 text-muted/60" />
      )}
      <span className={`min-w-0 text-sm break-words hyphens-auto ${detail ? 'text-ink' : 'text-muted'}`}>
        {detail ?? 'Absent'}
      </span>
    </div>
  )
}

export function Equipment({ selection }: { selection: Selection }) {
  const trims = { seal: selectedTrim(CARS.seal, selection), l03: selectedTrim(CARS.l03, selection) }
  return (
    <Section
      id="equipements"
      index="06"
      eyebrow="Technologie et équipements"
      title="Ce qu’il y a à bord"
      intro={
        <>
          Écran central de 15,6 pouces des deux côtés. Combiné de 10,25 pouces pour la Seal, 8,88 pouces pour le L03.
          La liste suit les finitions choisies : {trims.seal.name} et {trims.l03.name}.
        </>
      }
    >
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {EQUIPMENT.map((item, index) => (
          <motion.li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 px-3 py-4 md:gap-8 md:px-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
          >
            <EquipmentCell car="seal" detail={trims.seal.equipment[item.id]} />
            <p className="w-20 text-center text-[11px] font-semibold tracking-wide break-words hyphens-auto text-muted uppercase md:w-40 md:text-xs">
              {item.label}
            </p>
            <EquipmentCell car="l03" detail={trims.l03.equipment[item.id]} />
          </motion.li>
        ))}
      </ul>
    </Section>
  )
}

function NcapBar({ label, value, car }: { label: string; value: number; car: CarId }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-display font-semibold tabular">{value} %</span>
      </div>
      <motion.div {...REVEAL_ON_VIEW} className="mt-1 h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={`h-full rounded-full ${CAR_STYLE[car].bg}`}
          style={{ width: `${value}%`, originX: 0 }}
          variants={GROW}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </motion.div>
    </div>
  )
}

function SafetyCard({ car }: { car: Car }) {
  const ncap = car.euroNcap
  const km = (value: number) => `${formatNumber(value)} km`
  return (
    <Card className="h-full">
      <CarName car={car.id} className="text-lg" />
      {ncap.status === 'rated' ? (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted">
            <ShieldCheck aria-hidden className={`size-5 ${CAR_STYLE[car.id].text}`} />
            Euro NCAP {ncap.year}
          </p>
          <p className="mt-2 flex gap-1" role="img" aria-label={`${ncap.stars} étoiles sur 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                aria-hidden
                className={`size-6 ${index < ncap.stars ? 'fill-amber-400 text-amber-400' : 'text-line'}`}
              />
            ))}
          </p>
          <div className="mt-4 grid gap-3">
            <NcapBar car={car.id} label="Adulte" value={ncap.adultPct} />
            <NcapBar car={car.id} label="Enfant" value={ncap.childPct} />
            <NcapBar car={car.id} label="Usagers vulnérables" value={ncap.vulnerablePct} />
            <NcapBar car={car.id} label="Aides à la sécurité" value={ncap.assistPct} />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldQuestion aria-hidden className="size-5 text-muted" />
            Euro NCAP : pas encore de note
          </p>
          <p className="mt-2 text-sm text-muted">{ncap.note}</p>
        </div>
      )}
      <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm">
        <div className="grid gap-0.5 sm:flex sm:justify-between sm:gap-3">
          <dt className="text-muted">Garantie véhicule</dt>
          <dd className="font-display font-semibold tabular sm:text-right">
            {car.vehicleWarranty.years} ans · {km(car.vehicleWarranty.km)}
            {car.vehicleWarranty.note && (
              <span className="block text-xs font-normal text-muted">{car.vehicleWarranty.note}</span>
            )}
          </dd>
        </div>
        <div className="grid gap-0.5 sm:flex sm:justify-between sm:gap-3">
          <dt className="text-muted">Garantie batterie</dt>
          <dd className="font-display font-semibold tabular sm:text-right">
            {car.batteryWarranty.years} ans · {km(car.batteryWarranty.km)} · {car.batteryWarranty.sohPct} %
          </dd>
        </div>
      </dl>
    </Card>
  )
}

export function Safety() {
  return (
    <Section
      id="securite"
      index="07"
      eyebrow="Sécurité et garanties"
      title="Prouvé d’un côté, promis de l’autre"
      intro="La Seal a ses cinq étoiles depuis 2023. Le L03 attend encore son passage chez Euro NCAP."
    >
      <Split seal={<SafetyCard car={CARS.seal} />} l03={<SafetyCard car={CARS.l03} />} />
    </Section>
  )
}

function Opinions({ car }: { car: Car }) {
  return (
    <Card className="h-full">
      <CarName car={car.id} className="text-lg" />
      <ul className="mt-4 grid gap-3">
        {car.pros.map((pro) => (
          <li key={pro} className="flex gap-2 text-sm">
            <ThumbsUp aria-label="Point fort" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            {pro}
          </li>
        ))}
      </ul>
      <ul className="mt-5 grid gap-3 border-t border-line pt-5">
        {car.cons.map((con) => (
          <li key={con} className="flex gap-2 text-sm">
            <ThumbsDown aria-label="Point faible" className="mt-0.5 size-4 shrink-0 text-rose-600" />
            {con}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function Press() {
  return (
    <Section
      id="presse"
      index="08"
      eyebrow="Ce qu’en dit la presse"
      title="Les essais, résumés"
      intro="Ce qui revient d’un essai à l’autre dans la presse française et britannique. Les essais de la Seal datent surtout de 2023-2024 : le restylage 2026 a agrandi le coffre (400 à 485 L) et le coffre avant (53 à 72 L) et ajouté quelques équipements, sans toucher à la batterie ni aux moteurs."
    >
      <Split seal={<Opinions car={CARS.seal} />} l03={<Opinions car={CARS.l03} />} />
    </Section>
  )
}

export function PickIf({ car }: { car: Car }) {
  return (
    <Reveal>
      <Card className={`h-full border-t-4 ${CAR_STYLE[car.id].border}`}>
        <p className="text-sm text-muted">Prends</p>
        <p className={`font-display text-2xl font-bold ${CAR_STYLE[car.id].text}`}>
          {car.id === 'seal' ? 'la' : 'le'} {car.brand} {car.model} si…
        </p>
        <ul className="mt-4 grid gap-3">
          {car.pickIf.map((reason) => (
            <li key={reason} className="flex gap-2 text-sm md:text-base">
              <Check aria-hidden className={`mt-0.5 size-5 shrink-0 ${CAR_STYLE[car.id].text}`} />
              {reason}
            </li>
          ))}
        </ul>
      </Card>
    </Reveal>
  )
}
