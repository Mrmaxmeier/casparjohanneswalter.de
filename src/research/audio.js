import Pizzicato from 'pizzicato'
import math from 'mathjs'

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
  volume (index) {
    let refFreq = this.options.frequency
    refFreq = math.max(refFreq, 32)
    let sC = 1 / math.sqrt(refFreq / 16)
    return Math.pow(sC, index) * this.options.volume
  }

  frequency (index) {
    let octave = 2
    return Math.pow(octave, math.log(index + 1, 2)) * this.options.frequency
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

  setOptions (options) {
    this.options = options
    if (this._waves[0]) {
      if (options.frequency) {
        this._waves.forEach((wave, index) => {
          wave.frequency = this.frequency(index)
        })
      }
      if (options.volume) {
        this._waves.forEach((wave, index) => {
          wave.volume = this.volume(index)
        })
      }
    }
  }
}
