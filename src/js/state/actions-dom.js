// DOM changes, need to sync with state

jQuery('#input_range_main_vol').on('input', function () {
  state.set('main volume', parseFloat(jQuery(this).val()))
})

jQuery('#velocity-toggler').on('click', () => {
  state.set('midi velocity sensing', !state.get('midi velocity sensing'))
})
