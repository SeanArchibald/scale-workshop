const getEnvelopeByName = name => {
  const envelope = {
    attackTime: 0,
    decayTime: 0,
    sustain: 1,
    releaseTime: 0
  }

  switch (name) {
    case 'organ':
      envelope.attackTime = 0.01; envelope.decayTime = 0.1; envelope.sustain = 0.8; envelope.releaseTime = 0.01; break;
    case 'pad':
      envelope.attackTime = 1; envelope.decayTime = 3; envelope.sustain = 0.5; envelope.releaseTime = 7; break;
    case 'perc-short':
      envelope.attackTime = 0.005; envelope.decayTime = 0.2; envelope.sustain = 0.0001; envelope.releaseTime = 0.2; break;
    case 'perc-medium':
      envelope.attackTime = 0.005; envelope.decayTime = 1; envelope.sustain = 0.0001; envelope.releaseTime = 1; break;
    case 'perc-long':
      envelope.attackTime = 0.01; envelope.decayTime = 5; envelope.sustain = 0.0001; envelope.releaseTime = 5; break;
  }

  return envelope
}

const getEnvelopeName = () => jQuery('#input_select_synth_amp_env').val()

// https://github.com/mohayonao/pseudo-audio-param/blob/master/lib/expr.js#L3
function getLinearRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 + a * (v1 - v0);
}

// https://github.com/mohayonao/pseudo-audio-param/blob/master/lib/expr.js#L18
function getExponentialRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }
  if (v0 === v1) {
    return v0;
  }

  a = (t - t0) / (t1 - t0);

  if ((0 < v0 && 0 < v1) || (v0 < 0 && v1 < 0)) {
    return v0 * Math.pow(v1 / v0, a);
  }

  return 0;
}

const interpolateValueAtTime = (minValue, maxValue, envelope, t) => {
  // interpolate attack
  if (envelope.attackTime > t) {
    return getLinearRampToValueAtTime(t, minValue, maxValue, 0, envelope.attackTime)
  }

  // interpolate decay
  if (envelope.attackTime + envelope.decayTime > t) {
    return getExponentialRampToValueAtTime(t, maxValue, maxValue * envelope.sustain, envelope.attackTime, envelope.attackTime + envelope.decayTime)
  }

  // interpolate sustain
  return maxValue * envelope.sustain
}

class Voice {
  constructor(audioCtx) {

    // set up oscillator
    this.vco = audioCtx.createOscillator()

    // set up amplitude envelope generator
    this.vca = audioCtx.createGain()
    
  }

  init() {

    // timing
    const now = this.synth.now()

    this.vca.gain.setValueAtTime(0.0001, now)

    // routing
    this.vco.connect(this.vca)
    this.vco.start()
    this.vca.connect(this.delay.channelL)
    this.vca.connect(this.synth.masterGain)
  }

  start(frequency, velocity) {

    // start timing
    const now = this.synth.now()
    this.vca.gain._startTime = now

    // tune oscillator to correct frequency
    this.vco.frequency.setValueAtTime(frequency, now)

    // set oscillator waveform
    switch(this.synth.waveform) {
      case "warm1":
        this.vco.setPeriodicWave(synth.custom_waveforms.warm1);
        break;
      case "warm2":
        this.vco.setPeriodicWave(synth.custom_waveforms.warm2);
        break;
      case "warm3":
        this.vco.setPeriodicWave(synth.custom_waveforms.warm3);
        break;
      case "warm4":
        this.vco.setPeriodicWave(synth.custom_waveforms.warm4);
        break;
      case "octaver":
        this.vco.setPeriodicWave(synth.custom_waveforms.octaver);
        break;
      case "brightness":
        this.vco.setPeriodicWave(synth.custom_waveforms.brightness);
        break;
      case "harmonicbell":
        this.vco.setPeriodicWave(synth.custom_waveforms.harmonicbell);
        break;
      case "semisine":
        this.vco.setPeriodicWave(synth.custom_waveforms.semisine);
        break;
      default:
        this.vco.type = this.synth.waveform;
    }

    // get target gain   
    if (velocity === 0) {
      // in exponentialRampToValueAtTime, target gain can't be 0
      this.targetGain = 0.0001; 
    }
    else {
      // use velocity to determine target gain
      this.targetGain = velocity = 0.2 * velocity / 127;
    }

    // get and set amplitude envelope
    const envelope = getEnvelopeByName(getEnvelopeName())
    this.attackTime = envelope.attackTime
    this.decayTime = envelope.decayTime
    this.sustain = envelope.sustain
    this.releaseTime = envelope.releaseTime

    // Attack
    this.cancelEnvelope(this.vca.gain, now)
    this.vca.gain.setValueAtTime(0.0001, now);
    this.vca.gain.linearRampToValueAtTime(this.targetGain, now + this.attackTime);

    // Decay & Sustain
    this.vca.gain.exponentialRampToValueAtTime(this.targetGain * this.sustain, now + this.attackTime + this.decayTime);
  }

  stop() {

    // timing
    const now = this.synth.now();

    // Release
    this.cancelEnvelope(this.vca.gain, now)
    this.vca.gain.exponentialRampToValueAtTime(0.0001, now + this.releaseTime);
  }

  // cancels any scheduled envelope changes in a given property's value
  cancelEnvelope(property, now) {

    // Firefox and Safari do not support cancelAndHoldAtTime
    if (isFunction(property.cancelAndHoldAtTime)) {
      property.cancelAndHoldAtTime(now);
    }
    else {
      property.cancelScheduledValues(now);
      property.setValueAtTime(interpolateValueAtTime(0.0001, this.targetGain, getEnvelopeByName(getEnvelopeName()), now - property._startTime), now)
    }
  }

  bindSynth(synth) {
    this.synth = synth
  }
  bindDelay(delay) {
    this.delay = delay
  }
}
