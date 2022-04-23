const getNameFromPort = (port) => {
  const { id, name, version, manufacturer } = port
  return `${name} (version ${version}) ${manufacturer} (${id})`
}

const getAllKeys = () => {
  return [...Array(128).keys()]
}

const getWhiteKeys = () => {
  return Object.keys(whiteOnlyMap).map((id) => parseInt(id))
}

const getBlackKeys = () => {
  return R.difference(getAllKeys(), getWhiteKeys())
}
