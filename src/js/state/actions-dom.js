// DOM changes, need to sync with state

jQuery('#input_range_main_vol').on('input', function () {
  state.set('main volume', parseFloat(jQuery(this).val()))
})
