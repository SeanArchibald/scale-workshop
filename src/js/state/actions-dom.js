// DOM changes, need to sync with state

jQuery('#input_range_main_vol').on('input', function () {
  state.set('main volume', parseFloat(jQuery(this).val()))
})

jQuery('#velocity-toggler').on('click', () => {
  state.set('midi velocity sensing', !state.get('midi velocity sensing'))
})

jQuery('#midi-out-toggler').on('click', () => {
  state.set('midi out enabled', !state.get('midi out enabled'))
})

// hide virtual keyboard when mobile hamburger menu button is clicked
jQuery('button.navbar-toggle').on('click', () => {
  state.set('virtual keyboard visible', false)
  state.set('mobile menu visible', !state.get('mobile menu visible'))
})

// Touch keyboard (#nav_play) option clicked
jQuery('#nav_play, #launch-kbd').on('click', (event) => {
  event.preventDefault()
  state.set('virtual keyboard visible', !state.get('virtual keyboard visible'))
})
