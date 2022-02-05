// data changed, sync it with the DOM

state.on('main volume', (newValue) => {
  jQuery('#input_range_main_vol').val(newValue)
})
