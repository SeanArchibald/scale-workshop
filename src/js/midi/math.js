const add = (a, b) => Decimal.add(a, b)

const subtract = (a, b) => Decimal.sub(a, b)

const multiply = (a, b) => Decimal.mul(a, b)

const divide = (a, b) => Decimal.div(a, b)

const pow = (a, b) => Decimal.pow(a, b)

const log = (a, b) => Decimal.log(a, b)

const floor = (a) => Decimal.floor(a)

const moveNUnits = (ratioOfSymmetry, divisionsPerRatio, n, frequency) => {
  // return frequency * ratioOfSymmetry ** (n / divisionsPerRatio)
  return multiply(frequency, pow(ratioOfSymmetry, divide(n, divisionsPerRatio)))
}

const getDistanceInUnits = (ratioOfSymmetry, divisionsPerRatio, freq2, freq1) => {
  // return divisionsPerRatio * Math.log(freq2 / freq1, ratioOfSymmetry)
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

const getNoteFrequency = (midinote) => {
  return moveNSemitones(
    subtract(R.clamp(0, 127, midinote), referenceNote.id),
    referenceNote.frequency
  )
}

const getNoteId = (frequency) => {
  return floor(add(getDistanceInSemitones(frequency, referenceNote.frequency), referenceNote.id))
}
