// import Pizzicato from 'pizzicato'
// TODO: remove pizzicato dep
const Pizzicato = require<{
  Sound: any,
  context: any,
}>('pizzicato')
namespace Pizzicato {
  export type Wave = any
  export type Sound = any
}
import { max, sqrt, log } from 'mathjs'

export interface IAudioProvider {
  setOptions: (_: { volume: number, frequency: number }) => void,
  unload: () => void,
  play: () => void,
  stop: () => void,
  setPlaying: (v: boolean) => void,
}


export interface IPlayable {
  play: () => void,
  stop: () => void,
  setPlaying: (v: boolean) => void,
}

interface Options {
  frequency: number,
  volume: number
}

export class AudioProvider implements IAudioProvider, IPlayable {
  private options: Options
  private wavetype: string
  private playing: boolean
  private wave: Pizzicato.Wave

  constructor (options: Partial<Options>, wavetype: string) {
    this.options = {
      frequency: 440,
      volume: 1.0,
      ...options
    }
    this.wave = null
    this.playing = false
    this.wavetype = wavetype || 'sine'
  }
  init () {
    if (typeof window === 'undefined') { return }
    this.wave = new Pizzicato.Sound({
      source: 'wave',
      options: Object.assign({type: this.wavetype}, this.options)
    })
  }
  play () {
    if (typeof window === 'undefined') { return }
    if (!this.wave) {
      this.init()
    }
    this.wave.play()
    this.playing = true
  }
  stop () {
    if (typeof window === 'undefined') { return }
    if (this.wave) {
      this.wave.stop()
    }
    this.playing = false
  }
  setPlaying(v: boolean) { v ? this.play() : this.stop() }
  unload () {
    if (typeof window === 'undefined') { return }
    this.stop()
    delete this.wave
  }
  setOptions (options: Options) {
    let oldOptions = this.options
    this.options = options
    if (this.wave) {
      if (options.frequency) {
        this.wave.frequency = options.frequency
      }
      if (options.volume) {
        this.wave.volume = options.volume
      }
      /* TODO: test change of wavetype
      if (oldOptions.type !== options.type) {
        let playing = this.playing
        this.stop()
        this.wave = null
        if (playing) {
          this.play()
        }
      }
      */
    }
  }
}

export class SoundGenProvider implements IAudioProvider {
  private options: Options
  private playing: boolean
  private count: number
  private _freq?: number
  private _waves: Pizzicato.Sound[]

  constructor (options: Partial<Options>) {
    this.options = {
      frequency: 440,
      volume: 1.0,
      ...options
    }
    this.count = 16
    this._waves = new Array(this.count).fill(null)
    this._freq = undefined
    this.playing = false
  }

  volume (index: number, f?: number) {
    let refFreq = f || this.options.frequency
    refFreq = max(refFreq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return (Math.pow(sC, index) * this.options.volume) || 0
  }

  frequency (index: number, f?: number) {
    let freq = f || this.options.frequency
    return (index + 1) * freq
  }

  init () {
    if (typeof window === 'undefined') { return }
    this._waves = this._waves.map((_, index) => new Pizzicato.Sound({
      source: 'wave',
      options: {
        frequency: this.frequency(index),
        volume: this.volume(index)
      }
    }))
  }

  play () {
    if (typeof window === 'undefined') { return }
    if (!this._waves[0]) {
      this.init()
    }
    this._waves.forEach((wave) => wave.play())
    this.playing = true
  }

  stop () {
    if (typeof window === 'undefined') { return }
    if (this._waves[0]) {
      this._waves.forEach((wave) => wave.stop())
    }
    this.playing = false
  }

  setPlaying(v: boolean) { v ? this.play() : this.stop() }

  unload () {
    this.stop()
  }

  linearRampFrequency (fromFreq: number, toFreq: number, duration: number) {
    if (typeof window === 'undefined') { return }
    this._freq = toFreq
    this._waves.forEach((wave, index) => {
      if (wave) {
        let f = this.frequency(index, fromFreq)
        let t = this.frequency(index, toFreq)
        let param = wave.sourceNode.frequency
        param.setValueAtTime(f, Pizzicato.context.currentTime)
        param.linearRampToValueAtTime(t, Pizzicato.context.currentTime + duration / 1000)
      }
    })
  }

  setVol (volume: number, duration?: number) {
    // TODO: duration unused?
    this._waves.forEach((wave, index) => {
      if (wave && this._freq) {
        wave.volume = this.volume(index, this._freq) * volume
      }
    })
  }

  setOptions (options: Options) {
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
