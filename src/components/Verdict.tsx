import { motion, useReducedMotion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { CARS } from '../data/cars'
import { CarSilhouette } from './CarSilhouette'
import { PickIf } from './Details'
import { EASE_OUT, Section, Split } from './ui'

const REPO_URL = 'https://github.com/alaborderie/byd-seal-vs-xpeng-l03'

const SOURCES = [
  { label: 'Configurateur et page Seal, BYD France', url: 'https://www.byd.com/fr/voitures-electriques/seal' },
  { label: 'Configurateur L03, XPENG France', url: 'https://store.xpeng.com/fr/configurator/L03' },
  {
    label: 'Fiche technique L03, XPENG Allemagne (septembre 2026)',
    url: 'https://s-cdn.xpeng.com/commoncms/prod/2026-10-08/065b977dab264145b5a928143fae2f97.pdf?name=Germany_L03_SpecsSheet_092026',
  },
  { label: 'Garanties XPENG France', url: 'https://www.xpeng.com/fr/service' },
  { label: 'Euro NCAP, BYD Seal (2023)', url: 'https://www.euroncap.com/assessments/byd/seal/1044/' },
  { label: 'Automobile Propre, Supertest Seal (consommations)', url: CARS.seal.highwayTest.sourceUrl },
  {
    label: 'Automobile Propre, Supertest Seal (recharge)',
    url: 'https://www.automobile-propre.com/articles/essai-byd-seal-les-temps-de-recharge-et-de-voyage-de-notre-supertest',
  },
  { label: 'Automobile Propre, essai L03', url: CARS.l03.highwayTest.sourceUrl },
  {
    label: 'L’argus, essai L03 Performance Ultra',
    url: 'https://www.largus.fr/actualite-automobile/essai-xpeng-l03-performance-ultra-2026-un-suv-pour-technophiles-40011009.html',
  },
] as const

export function Verdict() {
  const reduceMotion = useReducedMotion()
  const enter = (from: number) =>
    reduceMotion
      ? {}
      : {
          initial: { x: `${from}%`, opacity: 0 },
          whileInView: { x: '0%', opacity: 1 },
          viewport: { once: true, margin: '-15%' },
          transition: { duration: 1.1, ease: EASE_OUT },
        }

  return (
    <>
      <Section
        id="verdict"
        index="09"
        eyebrow="Verdict"
        title="Deux bonnes réponses, deux profils"
        intro="La Seal gagne sur l’autonomie par charge, le coffre, les performances et la sécurité prouvée. Le L03 gagne sur le prix, la recharge et l’équipement, et arrive souvent plus tôt sur un long trajet malgré des arrêts plus fréquents. Le bon choix dépend de ta façon de rouler."
      >
        <div className="mb-12 grid grid-cols-2 items-end gap-[2vw]">
          <motion.div {...enter(-60)} className="flex justify-end">
            <CarSilhouette car="seal" className="w-[min(44vw,520px)]" />
          </motion.div>
          <motion.div {...enter(60)} className="flex justify-start">
            <CarSilhouette car="l03" facing="left" className="w-[min(42.6vw,504px)]" />
          </motion.div>
        </div>
        <Split seal={<PickIf car={CARS.seal} />} l03={<PickIf car={CARS.l03} />} />
      </Section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-display text-lg font-semibold">Méthode</p>
            <p className="mt-3 text-sm text-pretty text-muted">
              Six modèles d’IA ont fait la même recherche chacun de leur côté : Claude Opus 5.5, Claude Sonnet 5.5,
              GPT-6.1 Sol, GPT-6.1 Terra, DeepSeek V4.1 Flash et Grok 4.7. Chaque désaccord a ensuite été tranché sur une
              source primaire relue à la main. Données au 28 octobre 2026, prix TTC hors options, aucune des deux voitures
              n’ouvrant droit au coup de pouce.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6">
              {[
                { label: 'Récap complet', href: `${REPO_URL}/blob/main/RECAP.md` },
                { label: 'Rapports bruts', href: `${REPO_URL}/tree/main/research` },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline"
                >
                  {link.label}
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Sources principales</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {SOURCES.map((source) => (
                <li key={source.url}>
                  <a href={source.url} className="text-muted underline-offset-4 hover:text-accent hover:underline">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
