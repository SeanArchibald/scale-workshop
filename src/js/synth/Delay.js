class Delay {
  constructor(synth) {
    this.time = 0.3
    this.gain = 0.4
    this.inited = false
    this.synth = synth
  }
  enable() {
    if (this.inited) {
      this.panL.connect(this.synth.masterGain)
      this.panR.connect(this.synth.masterGain)
    }
  }
  disable() {
    if (this.inited) {
      this.panL.disconnect(this.synth.masterGain)
      this.panR.disconnect(this.synth.masterGain)
    }
  }
  init(audioCtx) {
    if (!this.inited) {
      this.inited = true
      this.channelL = audioCtx.createDelay(5.0)
      this.channelR = audioCtx.createDelay(5.0)
      this.gainL = audioCtx.createGain(0.8)
      this.gainR = audioCtx.createGain(0.8)
      // this.lowpassL = audioCtx.createBiquadFilter()
      // this.lowpassR = audioCtx.createBiquadFilter()
      // this.highpassL = audioCtx.createBiquadFilter()
      // this.highpassR = audioCtx.createBiquadFilter()
      this.panL = audioCtx.createPanner()
      this.panR = audioCtx.createPanner()

      // feedback loop with gain stage
      this.channelL.connect(this.gainL)
      this.gainL.connect(this.channelR)
      this.channelR.connect(this.gainR)
      this.gainR.connect(this.channelL)

      // filters
      // this.gainL.connect( this.lowpassL );
      // this.gainR.connect( this.lowpassR );
      // this.lowpassL.frequency.value = 6500;
      // this.lowpassR.frequency.value = 7000;
      // this.lowpassL.Q.value = 0.7;
      // this.lowpassR.Q.value = 0.7;
      // this.lowpassL.type = 'lowpass';
      // this.lowpassR.type = 'lowpass';
      // this.lowpassL.connect( this.highpassL );
      // this.lowpassR.connect( this.highpassR );
      // this.highpassL.frequency.value = 130;
      // this.highpassR.frequency.value = 140;
      // this.highpassL.Q.value = 0.7;
      // this.highpassR.Q.value = 0.7;
      // this.highpassL.type = 'highpass';
      // this.highpassR.type = 'highpass';
      // this.highpassL.connect( this.panL );
      // this.highpassR.connect( this.panR );

      // panning
      this.gainL.connect(this.panL) // if you uncomment the above filters lines, then comment out this line
      this.gainR.connect(this.panR) // if you uncomment the above filters lines, then comment out this line
      this.panL.setPosition(-1, 0, 0)
      this.panR.setPosition(1, 0, 0)

      // setup delay time and gain for delay lines
      const now = synth.now()
      this.channelL.delayTime.setValueAtTime(this.time, now)
      this.channelR.delayTime.setValueAtTime(this.time, now)
      this.gainL.gain.setValueAtTime(this.gain, now)
      this.gainR.gain.setValueAtTime(this.gain, now)

      // check on init if user has already enabled delay
      if (jQuery('#input_checkbox_delay_on').is(':checked')) {
        this.enable()
      }
    }
  }
}
