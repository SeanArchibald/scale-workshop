const setPitchBendLimit = R.curry((channel, semitones) => {
  return [
    (commands.cc << 4) | (channel - 1),
    cc.registeredParameterLSB,
    0,
    (commands.cc << 4) | (channel - 1),
    cc.registeredParameterMSB,
    0,
    (commands.cc << 4) | (channel - 1),
    cc.dataEntry,
    semitones,
    (commands.cc << 4) | (channel - 1),
    cc.registeredParameterLSB,
    127,
    (commands.cc << 4) | (channel - 1),
    cc.registeredParameterMSB,
    127
  ]
})

const pitchBendAmountToDataBytes = (pitchBendAmount) => {
  const realValue = pitchBendAmount - pitchBendMin
  return [realValue & 0b01111111, (realValue >> 7) & 0b01111111]
}

const bendPitch = R.curry((channel, pitchBendAmount) => {
  return R.concat(
    [(commands.pitchbend << 4) | (channel - 1)],
    pitchBendAmountToDataBytes(pitchBendAmount)
  )
})

const noteOn = R.curryN(2, (channel, note, pitchBendAmount = null, velocity = 127) => {
  return R.concat(pitchBendAmount !== null ? bendPitch(channel, pitchBendAmount) : [], [
    (commands.noteOn << 4) | (channel - 1),
    note,
    velocity
  ])
})

const noteOff = R.curryN(2, (channel, note, velocity = 127) => {
  return [(commands.noteOff << 4) | (channel - 1), note, velocity]
})
