// data changed, sync it with the DOM

state.on('main volume', (value) => {
  jQuery('#input_range_main_vol').val(value)
})

state.on('midi velocity sensing', (value) => {
  const velocityToggleBtn = jQuery('#velocity-toggler')

  if (value) {
    velocityToggleBtn.removeClass('btn-basic').addClass('btn-success').text('on')
  } else {
    velocityToggleBtn.removeClass('btn-success').addClass('btn-basic').text('off')
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

state.on('midi modal visible', (value) => {
  const modal = document.getElementById('midi-modal')
  if (value) {
    if (!modal) {
      document.body.appendChild(renderMidiModal(midi))
    }
  } else {
    if (modal) {
      modal.parentNode.removeChild(modal)
    }
  }
})
