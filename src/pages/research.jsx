import React, {Component} from 'react'
import { Link } from 'react-router'

import { KitharaCalc } from '../research/kithara_components.js'
import { Rechner as PartchFractionRechner } from '../research/partch_bruch_rechner.js'
import { FractionToCents, FrequencyToPitch } from '../research/converterComponents.jsx'
import { SoundGen } from '../research/soundgen.jsx'
import { DiffTone } from '../research/difftone.jsx'
import { FractionWindowing } from '../research/fraction_windowing.jsx'
import { PianoMultiphonicCalculatorII } from '../research/piano_multiphonic.jsx'
import { HarmonicBeatingCalculator } from '../research/harmonic_beating.jsx'

export class Kithara extends Component {
  render () {
    return (
      <div>
        <h3>Kithara I Calculator</h3>
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
        <KitharaCalc />
      </div>
    )
  }
}

export class PartchFraction extends Component {
  render () {
    return (
      <div>
        <h3>Partch Fraction Calculator</h3>
        <p>
          Ein Bruch (oberes Feld) wird mit einer Reihe von Brüchen (2. Zeile) verrechnet.
          Die dritte Zeile gibt das Produkt der Brüche aus (die entsprechenden Intervalle über dem Bruch).
          Die vierte Zeile gibt die Teilung vom oberen Bruch durch die Reihe der unteren Brüche aus (die entsprechenden Intervalle unter dem Bruch).
          Die Brüche der beiden unteren Reihen sind so oktaviert, dass sie zwischen 1 und 2 liegen.
        </p>
        <PartchFractionRechner />
      </div>
    )
  }
}

export class Converters extends Component {
  render () {
    return (
      <div>
        <h3>Converters</h3>
        <FractionToCents />
        <FrequencyToPitch />
      </div>
    )
  }
}

export class SoundGenPage extends Component {
  render () {
    return (
      <div>
        <h3>Sound generator</h3>
        <p>
          Der Sound generator besteht aus 32 Sinuston-Generatoren. Wenn die Oktave auf 2 gestellt wird (wie im default eingestellt) erzeugt dieser poly-Generator ein Spektrum von 32 Partialtönen eines Grundtones, dessen Frequenz man bei frequency eingeben kann.
        </p>
        <p>
          Die Intensität der Partialtöne nimmt nach oben hin logarithmisch ab. Bei tiefen Tönen verläuft diese Kurve flacher und bei hohen Töhen steiler. So haben die tiefen Töne genug Unterstützung durch die Obertöne während hohe Töne immer ähnlicher einem Sinuston werden.
        </p>
        <SoundGen />
      </div>
    )
  }
}

export class DiffTonePage extends Component {
  render () {
    return (
      <div>
        <h3>Difference tone generator</h3>
        <DiffTone />
      </div>
    )
  }
}

export class FractionWindowingPage extends Component {
  render () {
    return (
      <div>
        <h3>Fraction Windowing</h3>
        <FractionWindowing />
      </div>
    )
  }
}

export class PianoMultiphonicCalculatorIIPage extends Component {
  render () {
    return (
      <div>
        <h3>Piano Multiphonic Calculator 2</h3>
        <PianoMultiphonicCalculatorII />
      </div>
    )
  }
}

export class HarmonicBeatingCalculatorPage extends Component {
  render () {
    return (
      <div>
        <h3>Harmonic Beating Calculator 1</h3>
        <HarmonicBeatingCalculator />
      </div>
    )
  }
}

export class ResearchPage extends Component {
  render () {
    // TODO
    return (
      <div>
        <h3>Music calculators</h3>
        <ul>
          <li><Link to='/research/kithara'>Kithara I Calculator</Link></li>
          <li><Link to='/research/partch_fraction'>Partch Fraction Calculator</Link></li>
          <li><Link to='/research/converters'>Converters</Link></li>
          <li><Link to='/research/soundgen'>Sound Generator</Link></li>
          <li><Link to='/research/difftone'>Difference Tone Generator</Link></li>
          <li><Link to='/research/piano_multiphonic_calculator_2'>Piano Multiphonic Calculator II</Link></li>
          <li><Link to='/research/harmonic_beating_calculator'>Harmonic Beating Calculator I</Link></li>
        </ul>
        <h3>Additional Math Tools</h3>
        <ul>
          <li><Link to='/research/fraction_windowing'>Fraction Windowing</Link></li>
        </ul>
      </div>
    )
  }
}
