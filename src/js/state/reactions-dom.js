// data changed, sync it with the DOM

state.on('main volume', (value) => {
  jQuery('#input_range_main_vol').val(value)
})

state.on('midi velocity sensing', (value) => {
  const velocityToggleBtn = jQuery('#velocity-toggler')

  if (value) {
    velocityToggleBtn.removeClass('btn-basic').addClass('btn-success').text('velocity: on')
  } else {
    velocityToggleBtn.removeClass('btn-success').addClass('btn-basic').text('velocity: off')
  }
})

state.on('virtual keyboard visible', (value) => {
  if (value) {
    touch_kbd_open()
  } else {
    touch_kbd_close()
  }
})

state.on('mobile menu visible', (value) => {
  if (value) {
    jQuery('#mobile-menu').show()
  } else {
    jQuery('#mobile-menu').hide()
  }
})

state.on('midi modal visible', (value, ...args) => {
  const midiModal = document.getElementById('modal_midi_settings')
  if (value && state.get('midi enabled')) {
    renderMidiInputsTo(midiModal.querySelector('.inputs'))
    renderMidiOutputsTo(midiModal.querySelector('.outputs'))
    renderMidiSettingsTo(midiModal.querySelector('.settings'))
  }
})

state.on('midi enabled', (value) => {
  if (value) {
    jQuery('#midi-enabler')
      .prop('disabled', true)
      .removeClass('btn-danger')
      .addClass('btn-success')
      .text('on')
  }
})
