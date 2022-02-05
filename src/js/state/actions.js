// non-DOM changes, need to sync with state

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    state.set('virtual keyboard visible', false)
  }
})
