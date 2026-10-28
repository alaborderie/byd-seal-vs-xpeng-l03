import { motion, type MotionValue } from 'motion/react'
import { useId } from 'react'
import type { CarId } from '../data/types'

interface Profile {
  readonly lengthMm: number
  readonly heightMm: number
  /** Body outline from the rear sill, over the roof, down to the front sill; the arches close it. */
  readonly bodyTop: string
  readonly sillY: number
  readonly wheelRadius: number
  readonly archGap: number
  readonly wheelX: readonly [rear: number, front: number]
  readonly glass: string
  readonly headlight: string
  readonly taillight: string
  readonly doorLines: string
  readonly cladding: boolean
  readonly bodyStops: readonly [top: string, middle: string, bottom: string]
}

// Side profiles in millimetres, front to the right, ground at y = heightMm.
const PROFILES: Readonly<Record<CarId, Profile>> = {
  seal: {
    lengthMm: 4800,
    heightMm: 1460,
    bodyTop: `M 210 1262 C 90 1240 30 1150 30 1050 L 28 780 C 30 650 70 540 170 470
      C 700 260 1500 40 2350 10 C 2750 0 2980 40 3090 90
      C 3330 240 3560 420 3740 520 C 4150 575 4520 630 4710 720
      C 4790 760 4808 850 4798 950 C 4790 1070 4760 1180 4640 1262`,
    sillY: 1262,
    wheelRadius: 350,
    archGap: 48,
    wheelX: [980, 3900],
    glass: `M 760 470 C 1300 260 1900 110 2380 95 C 2760 90 2950 120 3040 170
      C 3230 300 3390 410 3480 480 C 2700 520 1700 520 760 470 Z`,
    headlight: 'M 4560 720 C 4650 730 4730 760 4780 810 L 4770 840 C 4700 800 4620 780 4540 770 Z',
    taillight: 'M 40 760 C 120 700 260 640 420 600 L 430 630 C 280 680 150 740 45 800 Z',
    doorLines: 'M 2420 120 L 2440 1240 M 3460 500 L 3480 1180',
    cladding: false,
    bodyStops: ['#1E3A8A', '#3B82F6', '#1D4ED8'],
  },
  l03: {
    lengthMm: 4650,
    heightMm: 1600,
    bodyTop: `M 180 1382 C 70 1350 22 1260 22 1150 L 30 900 C 40 800 80 730 150 690
      C 600 470 1400 80 2150 20 C 2560 0 2800 40 2930 110
      C 3170 280 3400 470 3560 560 C 3950 610 4330 680 4540 760
      C 4625 800 4652 900 4648 1010 C 4640 1150 4620 1290 4500 1382`,
    sillY: 1382,
    wheelRadius: 362,
    archGap: 53,
    wheelX: [920, 3770],
    glass: `M 720 690 C 1250 430 1800 170 2200 120 C 2550 90 2760 120 2880 180
      C 3060 300 3220 420 3310 500 C 2500 570 1600 600 720 690 Z`,
    headlight: 'M 4400 760 L 4630 860 L 4625 885 L 4390 790 Z',
    taillight: 'M 26 850 L 300 790 L 306 822 L 28 884 Z',
    doorLines: 'M 2280 140 L 2300 1300 M 3300 520 L 3320 1290',
    cladding: true,
    bodyStops: ['#0E7490', '#22D3EE', '#0891B2'],
  },
}

function archSpan(profile: Profile, radius: number): number {
  const centerY = profile.heightMm - profile.wheelRadius
  return Math.sqrt(radius ** 2 - (profile.sillY - centerY) ** 2)
}

function bodyPath(profile: Profile): string {
  const radius = profile.wheelRadius + profile.archGap
  const span = archSpan(profile, radius)
  const [rear, front] = profile.wheelX
  const y = profile.sillY
  return `${profile.bodyTop}
    L ${front + span} ${y} A ${radius} ${radius} 0 1 0 ${front - span} ${y}
    L ${rear + span} ${y} A ${radius} ${radius} 0 1 0 ${rear - span} ${y} Z`
}

function wellPath(profile: Profile): string {
  const radius = profile.wheelRadius + profile.archGap
  const span = archSpan(profile, radius)
  const y = profile.sillY
  return profile.wheelX.map((x) => `M ${x + span} ${y} A ${radius} ${radius} 0 1 0 ${x - span} ${y} Z`).join(' ')
}

function claddingPath(profile: Profile): string {
  const radius = profile.wheelRadius + profile.archGap + 30
  const span = archSpan(profile, radius)
  const y = profile.sillY
  const arches = profile.wheelX.map((x) => `M ${x + span} ${y} A ${radius} ${radius} 0 1 0 ${x - span} ${y}`)
  const [rear, front] = profile.wheelX
  return `${arches.join(' ')} M ${rear + span} ${y - 40} L ${front - span} ${y - 40}`
}

interface WheelProps {
  readonly cx: number
  readonly cy: number
  readonly radius: number
  readonly spin: MotionValue<number> | undefined
}

function CarWheel({ cx, cy, radius, spin }: WheelProps) {
  const rim = radius * 0.64
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="#0F172A" />
      <circle cx={cx} cy={cy} r={rim} fill="#E2E8F0" />
      <motion.g style={{ rotate: spin ?? 0 }}>
        <circle cx={cx} cy={cy} r={rim} fill="none" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d={`M ${cx - rim * 0.08} ${cy} L ${cx - rim * 0.16} ${cy - rim * 0.96} L ${cx + rim * 0.16} ${cy - rim * 0.96} L ${cx + rim * 0.08} ${cy} Z`}
            fill="#475569"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
      </motion.g>
      <circle cx={cx} cy={cy} r={rim * 0.22} fill="#1E293B" />
    </g>
  )
}

interface CarSilhouetteProps {
  readonly car: CarId
  readonly facing?: 'left' | 'right'
  readonly spin?: MotionValue<number>
  readonly outline?: boolean
  readonly className?: string
}

export function CarSilhouette({ car, facing = 'right', spin, outline = false, className }: CarSilhouetteProps) {
  const profile = PROFILES[car]
  const bodyId = useId()
  const glassId = useId()
  const { lengthMm, heightMm } = profile
  const body = bodyPath(profile)
  const flip = facing === 'left' ? `translate(${lengthMm} 0) scale(-1 1)` : undefined
  const [top, middle, bottom] = profile.bodyStops

  return (
    <svg
      viewBox={`0 0 ${lengthMm} ${heightMm + 40}`}
      className={className}
      role="img"
      aria-label={car === 'seal' ? 'Silhouette de la BYD Seal' : 'Silhouette du XPENG L03'}
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={middle} />
          <stop offset="55%" stopColor={bottom} />
          <stop offset="100%" stopColor={top} />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="55%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>
      <g transform={flip}>
        {outline ? (
          <>
            <path d={body} fill={bottom} fillOpacity={0.08} stroke={bottom} strokeWidth={18} strokeLinejoin="round" />
            {profile.wheelX.map((x) => (
              <circle
                key={x}
                cx={x}
                cy={heightMm - profile.wheelRadius}
                r={profile.wheelRadius}
                fill="none"
                stroke={bottom}
                strokeWidth={14}
              />
            ))}
          </>
        ) : (
          <>
            <ellipse cx={lengthMm / 2} cy={heightMm + 6} rx={lengthMm * 0.46} ry={30} fill="#0F172A" opacity={0.16} />
            <path d={wellPath(profile)} fill="#0B1120" />
            <path d={body} fill={`url(#${bodyId})`} />
            {profile.cladding && (
              <path d={claddingPath(profile)} fill="none" stroke="#0F172A" strokeOpacity={0.55} strokeWidth={60} />
            )}
            <path d={profile.glass} fill={`url(#${glassId})`} />
            <path d={profile.doorLines} stroke="#0F172A" strokeOpacity={0.22} strokeWidth={8} fill="none" />
            <path d={profile.headlight} fill="#E0F2FE" />
            <path d={profile.taillight} fill="#BE123C" opacity={0.85} />
            {profile.wheelX.map((x) => (
              <CarWheel key={x} cx={x} cy={heightMm - profile.wheelRadius} radius={profile.wheelRadius} spin={spin} />
            ))}
          </>
        )}
      </g>
    </svg>
  )
}
