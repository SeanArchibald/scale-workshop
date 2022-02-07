const getNameFromPort = (port) => `${port.name} (version ${port.version}) ${port.manufacturer}`

const getAllKeys = () => R.unfold((n) => (n > keyIdMax ? false : [n, n + 1]), keyIdMin)
const getWhiteKeys = R.compose(R.map(parseInt), R.keys, () => whiteOnlyMap)
const getBlackKeys = R.converge(R.difference, [getAllKeys, getWhiteKeys])
