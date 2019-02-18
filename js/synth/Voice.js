class Voice {
  constructor (audioCtx, frequency, velocity) {
    this.frequency = frequency;
    this.velocity = 0.2 * velocity / 127;
    if (this.velocity === 0) {
      this.velocity = 0.001; // prevent 0 value for velocity - safe for using exponential ramp
    }

    this.vco = audioCtx.createOscillator();
    this.vca = audioCtx.createGain();

    switch ( jQuery( '#input_select_synth_amp_env' ).val() ) {
      case 'organ' :
        this.attackTime = 0.008; this.decayTime = 0.1; this.sustain = 0.8; this.releaseTime = 0.008; break;
      case 'pad' :
        this.attackTime = 1; this.decayTime = 3; this.sustain = 0.5; this.releaseTime = 3; break;
      case 'perc-short' :
        this.attackTime = 0.001; this.decayTime = 0.2; this.sustain = 0.001; this.releaseTime = 0.2; break;
      case 'perc-medium' :
        this.attackTime = 0.001; this.decayTime = 1; this.sustain = 0.001; this.releaseTime = 1; break;
      case 'perc-long' :
        this.attackTime = 0.001; this.decayTime = 5; this.sustain = 0.001; this.releaseTime = 5; break;
    }
    // debug("attack " + this.attackTime); debug("decay " + this.decayTime); debug("sustain " + this.sustain); debug("release " + this.releaseTime);

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
      // Firefox doesn't support cancelAndHoldAtTime.. shame!!
      if (isFunction(vcaGain.cancelAndHoldAtTime)) {
        vcaGain.cancelAndHoldAtTime(now);
      } else {
        vcaGain.cancelScheduledValues(now);
      }
      vcaGain.exponentialRampToValueAtTime( 0.001, now + this.releaseTime ); // release
      oscillator.stop( now + this.releaseTime );
    });
  }
}
