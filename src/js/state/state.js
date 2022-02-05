class State extends EventEmitter {
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
      this.emit(key, newValue, oldValue)
    }
  }
  ready() {
    Object.entries(this.data).forEach(([key, value]) => {
      this.emit(key, value)
    })
  }
}

const state = new State({
  'main volume': 0.8,
  'midi velocity sensing': true,
  'virtual keyboard visible': false,
  'mobile menu visible': false
})
