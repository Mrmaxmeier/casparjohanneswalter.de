import * as React from 'react'
import { Route, Link, Switch, RouteComponentProps } from 'react-router-dom'

import { _404Page } from './404'
import { KitharaCalc } from '../research/kithara_components'
import { Rechner as PartchFraction } from '../research/partch_bruch_rechner'
import { FractionToCents, FrequencyToPitch } from '../research/converterComponents'
import { SoundGen } from '../research/soundgen'
import { DiffTone } from '../research/difftone'
import { FractionWindowing } from '../research/fraction_windowing'
import { PianoMultiphonicCalculatorII } from '../research/piano_multiphonic'
import { HarmonicBeatingCalculator } from '../research/harmonic_beating'
import { TonalityDiamond } from '../research/tonalitydiamond'
import { ChordPlayer } from '../research/chordplayer'
import { ChordPlayer2 } from '../research/chordplayer2'
import { ArciorganoPlayer } from '../research/arciorganoplayer'
import { SuperCembaloPlayer } from '../research/supercembaloplayer'
import { FrettedInstrumentPlayer } from '../research/fretted_instrument_player'
import { Limit5MatrixPlayer } from '../research/limit5matrix'
// import { MeanToneCircle } from '../research/mean_tone_circle'

export class Converters extends React.PureComponent {
  render () {
    return (
      <div>
        <FractionToCents />
        <FrequencyToPitch />
      </div>
    )
  }
}

let kitharaDescription = () => <div>
    <p>
      Der Kithara I Calculator berechnet die Tonhöhen aller Saiten der Kithara I, wenn der Glissandostab (Pyrex Rod) auf einen bestimmten neuen Punkt (Ratio) geschoben wird bzw. er berechnet die Obertöne auf allen Saiten.
    </p>
    <ol>
      <li>
        Wählen Sie aus den Presets einen der 12 „hexads“ der Kithara I aus.
        [Jeder „hexad“ ist ein set aus sechs Saiten in einer harmonisch konsistenten Stimmung. Diese leere-Saiten-Stimmung erscheint in der oberen Reihe.
        Die Grundstimmung als O-dentity bzw. U-dentity erscheint ganz links; die sechs Kästchen daneben geben die Stimmung aller sechs Saiten des „hexads“ an.]
        <br />
        Alternativ dazu können auch individuell in die Kästchen für die Stimmung der sechs Saiten frei sechs „ratios“ [Teiltonverhältnisse] inklusive der gewünschten Oktavlagen (im englischen System; a4 = 440 Hz) eingetragen werden.
      </li>
      <li>
        Tragen Sie in die untere Reihe eine Information ein, die als Grundlage der Neuberechnung der Tonhöhen aller sechs Saiten dient.
        <ol type="a">
          <li>
            Eine Zieltonhöhe einer beliebigen Saite (als „ratio“ mit Angabe der Oktavlage).
            Durch das Drücken des „apply“-Knopfes darunter wird berechnet, wie alle Saiten klingen würden, wenn der Glissandostab (Pyrex Rod) auf diese Stelle geschoben worden wäre.
          </li>
          <li>
            Eine neue Grundstimmung (O-dentity bzw. U-dentity) als „ratio“ in das höhere Feld unten links.
            Durch den „apply“-Knopf darunter berechnen sich alle sechs Saiten neu. Die software sucht sich die geeignete Oktavlage selbst, damit die Stimmung innerhalb der ersten Oktave über der leere-Saiten-Stimmung bleibt.
          </li>
          <li>
            Durch einen Eintrag in das Feld „overtone“.
            Das Drücken des „apply“-Knopfes darunter berechnet die Tonhöhen dieses Obertones auf allen sechs Saiten der leere-Saiten-Stimmung.
          </li>
        </ol>
      </li>
    </ol>
    <p>
      Die Tonhöhen sind angegeben als Ratios, als konventionelle temperierte Notation, gerundet zu 1/12 Tönen und als Abstand in Cents zum Bezugston G = 1/1.
    </p>
  </div>

let soundGenDescription = () => <div>
    <p>
      Der Sound generator besteht aus 32 Sinuston-Generatoren. Wenn die Oktave auf 2 gestellt wird (wie im default eingestellt) erzeugt dieser poly-Generator ein Spektrum von 32 Partialtönen eines Grundtones, dessen Frequenz man bei frequency eingeben kann.
    </p>
    <p>
      Die Intensität der Partialtöne nimmt nach oben hin logarithmisch ab. Bei tiefen Tönen verläuft diese Kurve flacher und bei hohen Töhen steiler. So haben die tiefen Töne genug Unterstützung durch die Obertöne während hohe Töne immer ähnlicher einem Sinuston werden.
    </p>
  </div>

let partchFractionDescription = () => <p>
    Ein Bruch (oberes Feld) wird mit einer Reihe von Brüchen (2. Zeile) verrechnet.
    Die dritte Zeile gibt das Produkt der Brüche aus (die entsprechenden Intervalle über dem Bruch).
    Die vierte Zeile gibt die Teilung vom oberen Bruch durch die Reihe der unteren Brüche aus (die entsprechenden Intervalle unter dem Bruch).
    Die Brüche der beiden unteren Reihen sind so oktaviert, dass sie zwischen 1 und 2 liegen.
  </p>

let musicCalculators: PageDef[] = [
  {
    id: 'kithara',
    title: 'Kithara I Calculator',
    description: kitharaDescription,
    component: KitharaCalc
  },
  {
    id: 'partch_fraction',
    title: 'Partch Fraction Calculator',
    description: partchFractionDescription,
    component: PartchFraction
  },
  {
    id: 'converters',
    title: 'Converters',
    component: Converters
  },
  {
    id: 'soundgen',
    title: 'Sound Generator',
    description: soundGenDescription,
    component: SoundGen
  },
  {
    id: 'difftone',
    title: 'Difference Tone Generator',
    component: DiffTone
  },
  {
    id: 'piano_multiphonic_calculator_2',
    title: 'Piano Multiphonic Calculator II',
    component: PianoMultiphonicCalculatorII
  },
  {
    id: 'harmonic_beating_calculator',
    title: 'Harmonic Beating Calculator I',
    component: HarmonicBeatingCalculator
  },
  {
    id: 'tonality_diamond',
    title: 'Tonality Diamond',
    component: TonalityDiamond
  },
  {
    id: 'chord_player',
    title: 'Chord Player I',
    component: ChordPlayer,
    description: function chordPlayerDescription () {
      return <p><a href="/static/chord_player_1_manual.pdf">Introduction</a></p>
    }
  },
  {
    id: 'chord_player_2',
    title: 'Chord Player II',
    component: ChordPlayer2
  },
  {
    id: 'arciorgano_player',
    title: 'Arciorgano Player',
    component: ArciorganoPlayer
  },
  {
    id: 'supercembalo_player',
    title: 'Super Cembalo Player',
    component: SuperCembaloPlayer
  },
  {
    id: 'fretted_instrument_player',
    title: 'Fretted Instrument Player',
    component: FrettedInstrumentPlayer
  },
  {
    id: 'limit5matrix',
    title: 'Limit-5 Matrix Player',
    component: Limit5MatrixPlayer
  }
]

let additionalMathTools: PageDef[] = [
  {
    id: 'fraction_windowing',
    title: 'Fraction Windowing',
    component: FractionWindowing
  }
]

export interface PageDef {
  id: string,
  title: string,
  component: any, // TODO: typeof React.Component,
  description?: () => JSX.Element
}

export const subpages = ([] as PageDef[]).concat(musicCalculators, additionalMathTools)

export class ResearchPage extends React.PureComponent<RouteComponentProps<any>, {}> {
  render () {
    let link = (id: string, title: string) => <li key={id}>
        <Link to={'/research/' + id}>{title}</Link>
      </li>
    return (
      <div>
        <Switch>
          <Route exact path="/research">
            <div>
              <h3>Music calculators</h3>
              <ul>
                {musicCalculators.map((d, i) => link(d.id, d.title))}
              </ul>
              <h3>Additional Math Tools</h3>
              <ul>
                {additionalMathTools.map((d, i) => link(d.id, d.title))}
              </ul>
            </div>
          </Route>
          {subpages.map((page: PageDef) =>
            <Route key={page.id} path={'/research/' + page.id}>
              <div>
                <h3>{page.title}</h3>
                {page.description ? page.description() : null}
                <page.component />
              </div>
            </Route>
          )}
          <Route component={_404Page} />
        </Switch>
      </div>
    )
  }
}
