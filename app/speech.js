import wav from 'wav'
import EventEmitter from 'events'

const CAPTURE_PREV_FRAMES = 4
const MAX_FRAMES_BEFORE_RESET = 100
const SILENCE_FRAMES_BEFORE_CAPTURE = 7

class Speech extends EventEmitter {
  constructor() {
    super()
    this.ringIndex = 0
    this.triggerIndex = 0
    this.writing = false
    this.triggered = false
    this.dropSilence = 0
    this.ring = []
  }

  record(buffer) {
    if (!this.writing) {
      if (this.ringIndex >= MAX_FRAMES_BEFORE_RESET) {
        this.reset()
      }
      this.ring.push(buffer)
      this.ringIndex++
    }
  }

  silence() {
    if (!this.writing && this.triggered && this.dropSilence++ >= SILENCE_FRAMES_BEFORE_CAPTURE) {
      this.writing = true
      console.log('Writing audio')

      let startIndex = (this.triggerIndex - CAPTURE_PREV_FRAMES) <= 0 ? 0 : this.triggerIndex - CAPTURE_PREV_FRAMES
      let stopIndex = this.ring.length - 1
      console.log(`Start: ${startIndex}, End: ${stopIndex}`)

      let frames = this.ring.slice(startIndex, stopIndex)
      const fileName = this.writeToBuffer(frames)
      this.emit('command', fileName)

      this.reset()
      this.writing = false
    }
  }

  trigger() {
    if (!this.writing) {
      this.triggerIndex = this.ringIndex
      this.triggered = true
    }
  }

  reset() {
    console.log('Resetting ring')
    this.ring = []
    this.triggered = false
    this.ringIndex = 0
    this.triggerIndex = 0
    this.dropSilence = 0
  }

  writeToBuffer(frames) {
    const filename = new Date().toISOString()
    const speechBuffer = new wav.FileWriter(`/tmp/${filename}.wav`, {
      channels: 1,
      sampleRate: 16000,
      bitDepth: 16
    })

    for (var i = 0; i < frames.length; i++) {
      console.log(`Writing index: ${i}`)
      const frame = frames[i]
      speechBuffer.write(frame)
    }

    speechBuffer.end()
    return speechBuffer.path
  }
}

export default Speech
