import Microphone from 'mic'
import Speech from './speech'
import { publish } from './pubsub'

import {
  Detector,
  Models
} from 'snowboy'

const mic = Microphone({
  rate: '16000',
  channels: '1',
  fileType: 'wav'
})

const micStream = mic.getAudioStream()

const speech = new Speech()
const models = new Models()

speech.on('command', (file) => {
  publish(file)
  console.log(file)
})

models.add({
  file: './models/baxter.pmdl',
  sensitivity: '0.5',
  hotwords : 'baxter'
})

const detector = new Detector({
  resource: "./models/common.res",
  models: models,
  audioGain: 2.0
})

micStream.on('data', (buffer) => {
  speech.record(buffer)
})

detector.on('error', () => {
  console.error('error')
})

detector.on('silence', () => {
  speech.silence()
})

detector.on('hotword', (index, hotword, buffer) => {
  console.log(`Detected hotword: ${hotword}`)
  speech.trigger()
})

micStream.pipe(detector)
mic.start()
