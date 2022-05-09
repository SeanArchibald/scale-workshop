const MidiChannel = ({ type, deviceId, channelId, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div class="channel">
      <input id="${type}--${deviceId}--${channelId}" type="checkbox" ${
    enabled ? 'checked="checked"' : ''
  } />
      <label for="${type}--${deviceId}--${channelId}">${channelId}</label>
    </div>
  `
  const content = template.content
  content.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
    const isEnabled = e.target.checked
    midi.setChannel(type, deviceId, channelId, isEnabled)
  })
  return content
}

const MidiDevice = ({ type, deviceId, name, channels, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div class="device">
      <div class="checkbox-wrapper">
        <input id="${type}--${name}" type="checkbox" ${enabled ? 'checked="checked"' : ''} />
      </div>
      <h4><label for="${type}--${name}">${name}</label></h4>
      <div class="channels"></div>
    </div>
  `
  const content = template.content
  channels.forEach(({ id, enabled }) => {
    content
      .querySelector('.channels')
      .appendChild(MidiChannel({ type, deviceId, channelId: id, enabled }))
  })
  content.getElementById(`${type}--${name}`).addEventListener('change', (e) => {
    const isEnabled = e.target.checked
    midi.setDevice(type, deviceId, isEnabled)
  })
  return content
}

const renderMidiInputsTo = (container) => {
  const { inputs } = midi._.devices

  container.innerHTML = ''
  Object.values(inputs).forEach((input) => {
    container.appendChild(MidiDevice({ type: 'input', deviceId: input.port.id, ...input }))
  })
}

const renderMidiOutputsTo = (container) => {
  const { outputs } = midi._.devices

  container.innerHTML = ''
  Object.values(outputs).forEach((output) => {
    container.appendChild(MidiDevice({ type: 'output', deviceId: output.port.id, ...output }))
  })
}

const renderMidiSettingsTo = (container) => {
  const { whiteOnly } = midi._
  container.querySelector('#input_midi_whitemode').checked = whiteOnly
}
