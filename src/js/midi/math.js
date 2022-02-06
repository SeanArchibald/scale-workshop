const add = R.curry((a, b) => Decimal.add(a, b))

const subtract = R.curry((a, b) => Decimal.sub(a, b))

const multiply = R.curry((a, b) => Decimal.mul(a, b))

const divide = R.curry((a, b) => Decimal.div(a, b))

const pow = R.curry((a, b) => Decimal.pow(a, b))

const log = R.curry((a, b) => Decimal.log(a, b))

const floor = (a) => Decimal.floor(a)

const moveNUnits = R.curryN(4, (ratioOfSymmetry, divisionsPerRatio, n, frequency) =>
  R.compose(multiply(frequency), pow(ratioOfSymmetry), divide(n))(divisionsPerRatio)
)

const getDistanceInUnits = R.curryN(
  4,
  (ratioOfSymmetry, divisionsPerRatio, frequency2, frequency1) =>
    R.compose(
      multiply(divisionsPerRatio),
      log(R.__, ratioOfSymmetry),
      divide(frequency2)
    )(frequency1)
)

const moveNSemitones = moveNUnits(octaveRatio, semitonesPerOctave)
const getDistanceInSemitones = getDistanceInUnits(octaveRatio, semitonesPerOctave)

const bendingRatio = moveNSemitones(maxBendingDistanceInSemitones, 1)

const bendNUnits = moveNUnits(bendingRatio, pitchBendMax)
const getBendingDistance = getDistanceInUnits(bendingRatio, pitchBendMax)

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
