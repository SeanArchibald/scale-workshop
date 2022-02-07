// data changed, handle programmatic reaction - no DOM changes

state.on('main volume', (newValue) => {
  synth.setMainVolume(newValue)
})
