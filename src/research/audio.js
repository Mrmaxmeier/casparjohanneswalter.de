import Pizzicato from 'pizzicato'
import { max, sqrt, log } from 'mathjs'

export class AudioProvider {
  constructor (options, wavetype) {
    this.options = options
    this.wave = null
    this.playing = false
    this.wavetype = wavetype || 'sine'
  }
  init () {
    this.wave = new Pizzicato.Sound({
      source: 'wave',
      options: Object.assign({type: this.wavetype}, this.options)
    })
  }
  play () {
    if (!this.wave) {
      this.init()
    }
    this.wave.play()
    this.playing = true
  }
  stop () {
    if (this.wave) {
      this.wave.stop()
    }
    this.playing = false
  }
  unload () {
    this.stop()
    delete this.wave
  }
  setOptions (options) {
    let oldOptions = this.options
    this.options = options
    if (this.wave) {
      if (options.frequency) {
        this.wave.frequency = options.frequency
      }
      if (options.volume) {
        this.wave.volume = options.volume
      }
      if (oldOptions.type !== options.type) {
        let playing = this.playing
        this.stop()
        this.wave = null
        if (playing) {
          this.play()
        }
      }
    }
  }
}

export class SoundGenProvider extends AudioProvider {
  volume (index, f) {
    let refFreq = f || this.options.frequency
    refFreq = max(refFreq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return (Math.pow(sC, index) * this.options.volume) || 0
  }

  frequency (index, f) {
    let octave = 2
    let freq = f || this.options.frequency
    return Math.pow(octave, log(index + 1, 2)) * freq
  }

  constructor (options) {
    super(options)
    this.count = 16
    this._waves = Array(this.count).fill()
  }

  init () {
    this._waves = this._waves.map((_, index) => new Pizzicato.Sound({
      source: 'wave',
      options: {
        frequency: this.frequency(index),
        volume: this.volume(index)
      }
    }))
  }

  play () {
    if (!this._waves[0]) {
      this.init()
    }
    this._waves.forEach((wave) => wave.play())
    this.playing = true
  }

  stop () {
    if (this._waves[0]) {
      this._waves.forEach((wave) => wave.stop())
    }
    this.playing = false
  }

  unload () {
    this.stop()
  }

  linearRampFrequency (fromFreq, toFreq, duration) {
    this._waves.forEach((wave, index) => {
      if (wave) {
        let f = this.frequency(index, fromFreq)
        let t = this.frequency(index, toFreq)
        wave.volume = this.volume(index, toFreq)
        let param = wave.sourceNode.frequency
        param.setValueAtTime(f, Pizzicato.context.currentTime)
        param.linearRampToValueAtTime(t, Pizzicato.context.currentTime + duration / 1000)
      }
    })
  }

  setOptions (options) {
    this.options = options
    if (this._waves[0]) {
      if (options.frequency) {
        this._waves.forEach((wave, index) => {
          wave.frequency = this.frequency(index)
        })
      }
      if (options.volume || options.frequency) {
        this._waves.forEach((wave, index) => {
          wave.volume = this.volume(index)
        })
      }
    }
  }
}
