import { motion } from 'motion/react'
import { Flag, MapPin, Zap } from 'lucide-react'
import { useState } from 'react'
import { CARS, selectedTrim } from '../data/cars'
import type { CarId, Selection } from '../data/types'
import { formatMinutes, formatNumber } from '../lib/format'
import {
  DESTINATIONS,
  TIE_MINUTES,
  TRIP_RULES,
  highwayProfile,
  planTrip,
  type Destination,
  type HighwayProfile,
  type TripPlan,
} from '../lib/roadTrip'
import { CAR_STYLE, CarName, EASE_OUT, GROW, REVEAL_ON_VIEW, Section } from './ui'

const CRUISE_KMH = 130

function legMinutes(leg: TripPlan['legs'][number]): number {
  return leg.kind === 'drive' ? (leg.km / CRUISE_KMH) * 60 : leg.minutes + TRIP_RULES.overheadMinPerStop
}

function tripMinutes(plan: TripPlan): number {
  return Math.round(plan.legs.reduce((sum, leg) => sum + legMinutes(leg), 0))
}

interface TimelineProps {
  readonly car: CarId
  readonly trimName: string
  readonly profile: HighwayProfile
  readonly plan: TripPlan
  readonly scaleMinutes: number
}

function Timeline({ car, trimName, profile, plan, scaleMinutes }: TimelineProps) {
  const style = CAR_STYLE[car]
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm">
          <CarName car={car} /> <span className="text-muted">{trimName}</span>{' '}
          <span className="rounded-full bg-line/70 px-2 py-0.5 text-xs text-muted">
            {profile.measured ? 'mesuré' : 'estimé'} · {formatNumber(profile.kwhPer100Km, 1)} kWh/100
          </span>
        </p>
        <p className="text-sm text-muted">
          <strong className={`font-display text-lg tabular ${style.text}`}>
            {plan.stops} arrêt{plan.stops > 1 ? 's' : ''}
          </strong>{' '}
          · {formatMinutes(plan.chargeMinutes)} de charge · {formatMinutes(tripMinutes(plan))} au total
        </p>
      </div>
      <motion.div {...REVEAL_ON_VIEW} className="flex h-12 items-stretch gap-0.5 overflow-hidden rounded-xl bg-line/50">
        {plan.legs.map((leg, index) => (
          <motion.div
            // Legs are positional and never reorder.
            key={index}
            title={leg.kind === 'drive' ? `${formatNumber(leg.km)} km` : `${formatMinutes(leg.minutes)} de charge`}
            className={`flex items-center justify-center overflow-hidden ${
              leg.kind === 'drive' ? style.soft : `${style.bg} text-white`
            }`}
            style={{ width: `${(legMinutes(leg) / scaleMinutes) * 100}%`, originX: 0 }}
            variants={GROW}
            transition={{ duration: 0.5, delay: index * 0.12, ease: EASE_OUT }}
          >
            {leg.kind === 'charge' && <Zap aria-hidden className="size-4 shrink-0" />}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export function RoadTrip({ selection }: { selection: Selection }) {
  const [destination, setDestination] = useState<Destination>(DESTINATIONS[3])
  const trip = (car: CarId) => {
    const trim = selectedTrim(CARS[car], selection)
    const profile = highwayProfile(CARS[car], trim)
    const plan = planTrip(profile, destination.distanceKm)
    return { car, trim, profile, plan, minutes: tripMinutes(plan) }
  }
  const sealTrip = trip('seal')
  const l03Trip = trip('l03')
  const trips = [sealTrip, l03Trip]
  const scaleMinutes = Math.max(sealTrip.minutes, l03Trip.minutes)
  const delta = sealTrip.minutes - l03Trip.minutes
  const extraStops = l03Trip.plan.stops - sealTrip.plan.stops
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
      intro="La grosse batterie de la Seal contre la recharge éclair du L03, avec les finitions choisies en haut de page. Le calcul part des consommations mesurées sur autoroute par Automobile Propre."
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
              <span className={checked ? 'text-white' : 'text-muted'}>{formatNumber(option.distanceKm)} km</span>
            </label>
          )
        })}
      </fieldset>

      <div key={destination.id} className="mt-10 grid gap-8">
        {trips.map((trip) => (
          <Timeline
            key={trip.car}
            car={trip.car}
            trimName={trip.trim.name}
            profile={trip.profile}
            plan={trip.plan}
            scaleMinutes={scaleMinutes}
          />
        ))}
      </div>

      <p className="mt-8 flex items-start gap-2 text-lg text-pretty" aria-live="polite">
        <Flag aria-hidden className="mt-1 size-5 shrink-0 text-accent" />
        <span>
          {Math.abs(delta) <= TIE_MINUTES ? (
            <>Vers {destination.label}, les deux arrivent quasiment en même temps : l’écart est dans la marge du calcul.</>
          ) : (
            <>
              Vers {destination.label}, <CarName car={delta > 0 ? 'l03' : 'seal'} /> arrive environ{' '}
              <strong className="font-display tabular">{formatMinutes(Math.abs(delta))}</strong> plus tôt, {reason}.
            </>
          )}
        </span>
      </p>
      <p className="mt-4 text-sm text-pretty text-muted">
        Hypothèses : départ à 100 %, arrivée à 10 %, arrêts de 10 à 80 % avec le dernier écourté, 5 min de manœuvre par
        arrêt. Le temps de charge est proportionnel à l’énergie reprise, comme si la puissance restait à sa moyenne de
        session : la vraie courbe varie, surtout batterie chaude. Mesures Automobile Propre : Seal Design (2024, 23,5
        kWh/100 km, 37 min de 10 à 80 %) et L03 Performance Ultra (2026, 23,5 kWh/100 km, 21 min 30). Les autres finitions
        sont estimées : même carrosserie, donc même aérodynamique, corrigée de l’écart de consommation WLTP, et temps
        de charge au prorata du temps officiel.
      </p>
    </Section>
  )
}
