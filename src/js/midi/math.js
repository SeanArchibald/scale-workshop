const moveNUnits = (ratioOfSymmetry, divisionsPerRatio, n, frequency) => {
  // return frequency * ratioOfSymmetry ** (n / divisionsPerRatio)
  return Decimal.mul(frequency, Decimal.pow(ratioOfSymmetry, Decimal.div(n, divisionsPerRatio)))
}

const getDistanceInUnits = (ratioOfSymmetry, divisionsPerRatio, freq2, freq1) => {
  // return divisionsPerRatio * Math.log(freq2 / freq1, ratioOfSymmetry)
  return Decimal.mul(divisionsPerRatio, Decimal.log(Decimal.div(freq2, freq1), ratioOfSymmetry))
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
    Decimal.sub(R.clamp(0, 127, midinote), referenceNote.id),
    referenceNote.frequency
  )
}

const getNoteId = (frequency) => {
  return Decimal.floor(
    Decimal.add(getDistanceInSemitones(frequency, referenceNote.frequency), referenceNote.id)
  )
}
