class Model extends EventEmitter {
  constructor(initialData = {}) {
    super()
    this.data = initialData
  }
  get(key) {
    return this.data[key]
  }
  set(key, newValue) {
    const oldValue = this.data[key]
    if (oldValue !== newValue) {
      this.data[key] = newValue
      this.emit('change', key, newValue, oldValue)
    }
  }
}

const model = new Model({
  'main volume': 0.8
})
