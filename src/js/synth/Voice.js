/*
import jQuery from 'jquery'
*/

const getEnvelopeByName = name => {
  const envelope = {
    attackTime: 0,
    decayTime: 0,
    sustain: 1,
    releaseTime: 0
  }

  switch ( name ) {
    case 'organ' :
      envelope.attackTime = 0.008; envelope.decayTime = 0.1; envelope.sustain = 0.8; envelope.releaseTime = 0.008; break;
    case 'pad' :
      envelope.attackTime = 1; envelope.decayTime = 3; envelope.sustain = 0.5; envelope.releaseTime = 3; break;
    case 'perc-short' :
      envelope.attackTime = 0.001; envelope.decayTime = 0.2; envelope.sustain = 0.001; envelope.releaseTime = 0.2; break;
    case 'perc-medium' :
      envelope.attackTime = 0.001; envelope.decayTime = 1; envelope.sustain = 0.001; envelope.releaseTime = 1; break;
    case 'perc-long' :
      envelope.attackTime = 0.001; envelope.decayTime = 5; envelope.sustain = 0.001; envelope.releaseTime = 5; break;
  }

  return envelope
}

const getEnvelopeName = () => jQuery( '#input_select_synth_amp_env' ).val()

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
  constructor (audioCtx, frequency, velocity) {
    this.frequency = frequency;
    this.velocity = 0.2 * velocity / 127;
    if (this.velocity === 0) {
      this.velocity = 0.001; // prevent 0 value for velocity - safe for using exponential ramp
    }

    this.vco = audioCtx.createOscillator();
    this.vca = audioCtx.createGain();

    const envelope = getEnvelopeByName(getEnvelopeName())

    this.attackTime = envelope.attackTime
    this.decayTime = envelope.decayTime
    this.sustain = envelope.sustain
    this.releaseTime = envelope.releaseTime

    // debug(envelope);

    this.oscillators = [];
  }

  bindSynth (synth) {
    this.synth = synth
  }
  bindDelay (delay) {
    this.delay = delay
  }

  start () {
    const now = this.synth.now();
  
    /* VCO */
    this.vco.type = this.synth.waveform;
    this.vco.frequency.value = this.frequency;
  
    /* VCA */
    this.vca.gain._startTime = now
    this.vca.gain.value = 0;
    this.vca.gain.setValueAtTime(this.vca.gain.value, now); // initial gain
    this.vca.gain.linearRampToValueAtTime(this.velocity, now + this.attackTime); // attack
    this.vca.gain.exponentialRampToValueAtTime(this.velocity * this.sustain, now + this.attackTime + this.decayTime); // decay & sustain
  
    /* routing */
    this.vco.connect( this.vca );
    this.vca.connect( this.delay.channelL );
    this.vca.connect( this.synth.masterGain );
  
    this.vco.start(0);
  
    /* keep track of oscillators used */
    this.oscillators.push(this.vco);
  }

  stop () {
    const now = this.synth.now();
    const vcaGain = this.vca.gain
    this.oscillators.forEach(oscillator => {
      // Firefox and Safari doesn't support cancelAndHoldAtTime.. shame!!
      if (isFunction(vcaGain.cancelAndHoldAtTime)) {
        vcaGain.cancelAndHoldAtTime(now);
      } else {
        vcaGain.cancelScheduledValues(now);
        vcaGain.setValueAtTime(interpolateValueAtTime(0, this.velocity, getEnvelopeByName(getEnvelopeName()), now - this.vca.gain._startTime), now)
      }
      vcaGain.exponentialRampToValueAtTime( 0.001, now + this.releaseTime ); // release
      oscillator.stop( now + this.releaseTime );
    });
  }
}
