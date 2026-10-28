export type CarId = 'seal' | 'l03'

export type Drivetrain = 'rwd' | 'awd'

export const EQUIPMENT = [
  { id: 'hud', label: 'Affichage tête haute' },
  { id: 'audio', label: 'Système audio' },
  { id: 'frontSeats', label: 'Sièges avant' },
  { id: 'massage', label: 'Massage des sièges' },
  { id: 'roof', label: 'Toit vitré' },
  { id: 'dampers', label: 'Amortisseurs à fréquence variable' },
  { id: 'adas', label: 'Aides à la conduite' },
  { id: 'cameras', label: 'Caméras 360°' },
  { id: 'v2l', label: 'Prise V2L' },
  { id: 'heatPump', label: 'Pompe à chaleur' },
  { id: 'phone', label: 'CarPlay et Android Auto' },
  { id: 'connectivity', label: 'Connectivité et mises à jour' },
] as const

export type EquipmentId = (typeof EQUIPMENT)[number]['id']

/** A detail label when the trim has the item, `null` when it lacks it. */
export type Equipment = Readonly<Record<EquipmentId, string | null>>

export interface Trim {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly priceEur: number
  readonly drivetrain: Drivetrain
  readonly powerKw: number
  readonly powerHp: number
  readonly torqueNm: number
  readonly zeroTo100S: number
  readonly topSpeedKmh: number
  readonly batteryKwh: number
  readonly wltpKm: number
  readonly wltpKwhPer100Km: number
  readonly dcPeakKw: number
  readonly dc10to80Min: number
  readonly weightKg: number
  readonly frunkL: number
  readonly towingBrakedKg: number
  readonly equipment: Equipment
}

export type EuroNcap =
  | {
      readonly status: 'rated'
      readonly year: number
      readonly stars: number
      readonly adultPct: number
      readonly childPct: number
      readonly vulnerablePct: number
      readonly assistPct: number
    }
  | { readonly status: 'pending'; readonly note: string }

export interface Warranty {
  readonly years: number
  readonly km: number
  readonly note?: string
}

/** Automobile Propre's fixed 130 km/h motorway run, the one test both cars share. */
export interface HighwayTest {
  readonly trimId: string
  readonly year: number
  readonly kwhPer100Km: number
  readonly charge10to80Min: number
  readonly sourceUrl: string
}

export interface Car {
  readonly id: CarId
  readonly brand: string
  readonly model: string
  readonly body: string
  readonly tagline: string
  /** A time-limited dealer offer, shown next to the list price. */
  readonly offer?: string
  readonly lengthMm: number
  readonly widthMm: number
  readonly heightMm: number
  readonly wheelbaseMm: number
  readonly groundClearanceMm: number
  readonly groundClearanceNote: string
  readonly dragCoefficient: number
  readonly trunkL: number
  readonly trunkOpening: string
  readonly chemistry: string
  readonly voltage: string
  readonly euroNcap: EuroNcap
  readonly vehicleWarranty: Warranty
  readonly batteryWarranty: Warranty & { readonly sohPct: number }
  readonly highwayTest: HighwayTest
  readonly trims: readonly [Trim, ...Trim[]]
  readonly pros: readonly string[]
  readonly cons: readonly string[]
  readonly pickIf: readonly string[]
}

export type Selection = Readonly<Record<CarId, string>>
