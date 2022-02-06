const subtractValuesFrom = (toRemove, from) => reject(contains(R.__, toRemove), from)

const iteratorToArray = (iterator) => {
  const values = []

  for (let item = iterator.next(); item && !item.done; item = iterator.next()) {
    values.push(item.value)
  }

  return values
}

const getNameFromPort = (port) => `${port.name} (version ${port.version}) ${port.manufacturer}`

const updatePorts = (ports, type, devices, onMidiMessage) => {
  const namesOfOldPorts = R.keys(devices[type + 's'])
  const namesOfNewPorts = R.map(
    updatePort(R.__, devices, onMidiMessage),
    iteratorToArray(ports.values())
  )

  R.forEach((name) => {
    delete devices[type + 's'][name]
  }, subtractValuesFrom(namesOfNewPorts, namesOfOldPorts))
}

const updatePort = R.curry((port, devices, onMidiMessage) => {
  const name = getNameFromPort(port)
  const device =
    devices[port.type + 's'][name] ||
    R.assoc('port', port, port.type === 'input' ? defaultInputData : defaultOutputData)

  device.connected = false

  if (port.state === 'connected') {
    if (port.connection === 'closed') {
      port.open()
    } else if (port.connection === 'open') {
      if (port.type === 'input') {
        port.onmidimessage = onMidiMessage(device)
      }
      device.connected = true
    }
  }

  devices[port.type + 's'][name] = device

  return name
})

const getAllKeys = () => R.unfold((n) => (n > keyIdMax ? false : [n, n + 1]), keyIdMin)
const getWhiteKeys = R.compose(R.map(parseInt), R.keys, () => whiteOnlyMap)
const getBlackKeys = R.converge(R.difference, [getAllKeys, getWhiteKeys])
