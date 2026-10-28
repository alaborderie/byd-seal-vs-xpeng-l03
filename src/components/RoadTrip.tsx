import { motion } from 'motion/react'
import { Flag, MapPin, Zap } from 'lucide-react'
import { useState } from 'react'
import { CARS } from '../data/cars'
import type { CarId } from '../data/types'
import { DESTINATIONS, TRIP_RULES, planTrip, type Destination, type TripPlan } from '../lib/roadTrip'
import { formatMinutes, formatNumber } from '../lib/format'
import { CAR_STYLE, CarName, EASE_OUT, Section } from './ui'

const CRUISE_KMH = 130

function legMinutes(leg: TripPlan['legs'][number]): number {
  return leg.kind === 'drive' ? (leg.km / CRUISE_KMH) * 60 : leg.minutes + TRIP_RULES.overheadMinPerStop
}

function tripMinutes(plan: TripPlan): number {
  return plan.legs.reduce((sum, leg) => sum + legMinutes(leg), 0)
}

function Timeline({ car, plan, scaleMinutes }: { car: CarId; plan: TripPlan; scaleMinutes: number }) {
  const style = CAR_STYLE[car]
  const test = CARS[car].highwayTest
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm">
          <CarName car={car} /> <span className="text-muted">{test.trimName}</span>
        </p>
        <p className="text-sm text-muted">
          <strong className={`font-display text-lg tabular ${style.text}`}>
            {plan.stops} arrêt{plan.stops > 1 ? 's' : ''}
          </strong>{' '}
          · {formatMinutes(plan.chargeMinutes)} de charge · {formatMinutes(tripMinutes(plan))} au total
        </p>
      </div>
      <div className="flex h-12 items-stretch gap-0.5 overflow-hidden rounded-xl bg-line/50">
        {plan.legs.map((leg, index) => (
          <motion.div
            // Legs are positional and never reorder.
            key={index}
            title={leg.kind === 'drive' ? `${formatNumber(leg.km)} km` : `${formatMinutes(leg.minutes)} de charge`}
            className={`flex items-center justify-center overflow-hidden ${
              leg.kind === 'drive' ? style.soft : `${style.bg} text-white`
            }`}
            style={{ width: `${(legMinutes(leg) / scaleMinutes) * 100}%`, originX: 0 }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: EASE_OUT }}
          >
            {leg.kind === 'charge' && <Zap aria-hidden className="size-4 shrink-0" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function RoadTrip() {
  const [destination, setDestination] = useState<Destination>(DESTINATIONS[3])
  const plans = {
    seal: planTrip(CARS.seal.highwayTest, destination.distanceKm),
    l03: planTrip(CARS.l03.highwayTest, destination.distanceKm),
  }
  const scaleMinutes = Math.max(tripMinutes(plans.seal), tripMinutes(plans.l03))
  const delta = Math.round(plans.seal.stopMinutes - plans.l03.stopMinutes)
  const extraStops = plans.l03.stops - plans.seal.stops
  const reason =
    delta < 0
      ? 'grâce à sa plus grosse batterie'
      : extraStops > 0
        ? `malgré ${extraStops} arrêt${extraStops > 1 ? 's' : ''} de plus`
        : 'grâce à sa recharge plus rapide'

  return (
    <Section
      id="road-trip"
      index="04"
      eyebrow="Road trip"
      title="Au départ de Paris, à 130 km/h"
      intro="La grosse batterie de la Seal contre la recharge éclair du L03. Le calcul utilise la consommation mesurée sur autoroute, identique pour les deux : 23,5 kWh/100 km."
    >
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Destination</legend>
        {DESTINATIONS.map((option) => {
          const checked = option.id === destination.id
          return (
            <label
              key={option.id}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                checked ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink hover:border-accent'
              }`}
            >
              <input
                type="radio"
                name="destination"
                className="sr-only"
                checked={checked}
                onChange={() => {
                  setDestination(option)
                }}
              />
              <MapPin aria-hidden className="size-4" />
              {option.label}
              <span className={checked ? 'text-white/80' : 'text-muted'}>{formatNumber(option.distanceKm)} km</span>
            </label>
          )
        })}
      </fieldset>

      <div key={destination.id} className="mt-10 grid gap-8">
        <Timeline car="seal" plan={plans.seal} scaleMinutes={scaleMinutes} />
        <Timeline car="l03" plan={plans.l03} scaleMinutes={scaleMinutes} />
      </div>

      <p className="mt-8 flex items-start gap-2 text-lg text-pretty" aria-live="polite">
        <Flag aria-hidden className="mt-1 size-5 shrink-0 text-accent" />
        <span>
          {delta === 0 ? (
            'Les deux arrivent en même temps.'
          ) : (
            <>
              Vers {destination.label}, <CarName car={delta > 0 ? 'l03' : 'seal'} /> arrive{' '}
              <strong className="font-display tabular">{formatMinutes(Math.abs(delta))}</strong> plus tôt, {reason}.
            </>
          )}
        </span>
      </p>
      <p className="mt-4 text-sm text-muted">
        Hypothèses : départ à 100 %, arrivée à 10 %, arrêts de 10 à 80 % avec le dernier écourté, 5 min de manœuvre par arrêt.
        Mesures Automobile Propre : Seal Design (2024, 82,5 kWh, 37 min de 10 à 80 %) et L03 Performance Ultra (2026,
        70,4 kWh nets, 21 min 30).
      </p>
    </Section>
  )
}
