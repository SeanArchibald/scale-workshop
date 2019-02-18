class Synth {
  constructor() {
    this.keymap = Keymap.EN
    this.isomorphicMapping = {
      vertical: 5, // how many scale degrees as you move up/down by rows
      horizontal: 1  // how many scale degrees as you move left/right by cols
    }
    this.active_voices = {} // polyphonic voice management
    this.waveform = 'triangle'
    this.inited = false

    this.delay = new Delay(this)
  }

  init (audioCtx) {
    if (!this.inited) {
      this.inited = true
      this.audioCtx = audioCtx
      // master gain
      this.masterGain = audioCtx.createGain(); // create master gain before output
      this.masterGain.gain.value = 0.8;
      // master filter
      this.masterLPfilter = audioCtx.createBiquadFilter();
      this.masterLPfilter.frequency.value = 5000;
      this.masterLPfilter.Q.value = 1;
      this.masterLPfilter.type = 'lowpass';
      // connect master gain control > filter > master output
      this.masterGain.connect( this.masterLPfilter );
      this.masterLPfilter.connect( audioCtx.destination );

      this.delay.init(audioCtx)
    }
  }

  noteOn ( midinote, velocity = 127 ) {
    const frequency = tuning_table.freq[ midinote ];

    if ( !isNil(frequency) ) {
      // make sure note triggers only on first input (prevent duplicate notes)
      if ( isNil(this.active_voices[midinote]) ) {
        const voice = new Voice( this.audioCtx, frequency, velocity );
        voice.bindDelay(this.delay)
        voice.bindSynth(this)
        voice.start()
        this.active_voices[midinote] = voice;
        jQuery( "#tuning-table-row-" + midinote ).addClass( "bg-playnote" );

        debug( "Play note " + midinote + " (" + frequency.toFixed(3) + " Hz) velocity " + velocity);
      }
    }
  }
  noteOff ( midinote ) {
    if ( !isNil(this.active_voices[midinote]) ) {
      this.active_voices[midinote].stop();
      delete this.active_voices[midinote];
      jQuery( "#tuning-table-row-" + midinote ).removeClass( "bg-playnote" );

      debug( "Stop note " + midinote );
    }
  }

  now() {
    return this.audioCtx.currentTime
  }

  // this function stops all active voices and cuts the delay
  panic () {
    // show which voices are active (playing)
    debug( this.active_voices );

    // loop through active voices
    for ( i=0; i<127; i++ ) {
      // turn off voice
      this.noteOff( i );
    }

    // turn down delay gain
    jQuery( "#input_range_feedback_gain" ).val( 0 );
    this.delay.gain = 0;
    const now = this.now()
    this.delay.gainL.gain.setValueAtTime(this.delay.gain, now);
    this.delay.gainR.gain.setValueAtTime(this.delay.gain, now);
  }
}
