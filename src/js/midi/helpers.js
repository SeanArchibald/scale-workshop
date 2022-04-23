const getNameFromPort = (port) => {
  const { name, version, manufacturer } = port
  return `${name} (version ${version}) ${manufacturer}`
}

const allMidiKeys = [...Array(128).keys()] // [0, 1, 2, ..., 127]

const whiteMidiKeys = Object.keys(whiteOnlyMap).map((id) => parseInt(id))

const blackMidiKeys = R.difference(allMidiKeys, whiteMidiKeys)
