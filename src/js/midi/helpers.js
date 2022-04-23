const getNameFromPort = (port) => {
  const { name, version, manufacturer } = port
  return `${name} (version ${version}) ${manufacturer}`
}

const getAllKeys = () => {
  return [...Array(128).keys()] // [0, 1, 2, ..., 127]
}

const getWhiteKeys = () => {
  return Object.keys(whiteOnlyMap).map((id) => parseInt(id))
}

const getBlackKeys = () => {
  return R.difference(getAllKeys(), getWhiteKeys())
}
