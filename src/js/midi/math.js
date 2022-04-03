const add = R.curry((a, b) => Decimal.add(a, b))

const subtract = R.curry((a, b) => Decimal.sub(a, b))

const multiply = R.curry((a, b) => Decimal.mul(a, b))

const divide = R.curry((a, b) => Decimal.div(a, b))

const pow = R.curry((a, b) => Decimal.pow(a, b))

const log = R.curry((a, b) => Decimal.log(a, b))

const floor = (a) => Decimal.floor(a)

const moveNUnits = (ratioOfSymmetry, divisionsPerRatio, n, frequency) => {
  return multiply(frequency, pow(ratioOfSymmetry, divide(n, divisionsPerRatio)))
}

const getDistanceInUnits = (ratioOfSymmetry, divisionsPerRatio, freq2, freq1) => {
  return multiply(divisionsPerRatio, log(divide(freq2, freq1), ratioOfSymmetry))
}

const moveNSemitones = (n, frequency) => {
  return moveNUnits(octaveRatio, semitonesPerOctave, n, frequency)
}

const getDistanceInSemitones = (freq2, freq1) => {
  return getDistanceInUnits(octaveRatio, semitonesPerOctave, freq2, freq1)
}

const bendingRatio = moveNSemitones(maxBendingDistanceInSemitones, 1)

const getBendingDistance = (freq2, freq1) => {
  return getDistanceInUnits(bendingRatio, pitchBendMax, freq2, freq1)
}

const getNoteFrequency = R.compose(
  moveNSemitones(R.__, referenceNote.frequency),
  subtract(R.__, referenceNote.id),
  R.clamp(keyIdMin, keyIdMax)
)

const getNoteId = R.compose(
  floor,
  add(R.__, referenceNote.id),
  getDistanceInSemitones(R.__, referenceNote.frequency)
)
