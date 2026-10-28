const numberFormats = new Map<number, Intl.NumberFormat>()

export function formatNumber(value: number, fractionDigits = 0): string {
  let format = numberFormats.get(fractionDigits)
  if (!format) {
    format = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    numberFormats.set(fractionDigits, format)
  }
  return format.format(value)
}

export function formatEur(value: number): string {
  return `${formatNumber(value)} €`
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded} min`
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`
}
