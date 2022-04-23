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

const MidiModal = ({ devices: { inputs, outputs }, whiteOnly }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div id="midi-modal">
      <h2>MIDI Settings</h2>

      <h3>INPUT ports of attached MIDI devices</h3>
      <div class="inputs"></div>

      <h3>OUTPUT ports of attached MIDI devices</h3>
      <div class="outputs"></div>

      <h3>Settings</h3>
      <div class="settings">
        <label>
          <input name="midi-whitemode" type="checkbox" ${whiteOnly ? 'checked="checked"' : ''} />
          <h4>White Key Only mode</h4>
          <p>remaps the keyboard so that it doesn't take note of black keys</p>
        </label>
      </div>
    </div>
  `
  const content = template.content
  Object.values(inputs).forEach((input) => {
    content
      .querySelector('.inputs')
      .appendChild(MidiDevice({ type: 'input', deviceId: input.port.id, ...input }))
  })
  Object.values(outputs).forEach((output) => {
    content
      .querySelector('.outputs')
      .appendChild(MidiDevice({ type: 'output', deviceId: output.port.id, ...output }))
  })
  content.querySelector('[name="midi-whitemode"]').addEventListener('change', (e) => {
    midi.whiteOnly = e.target.checked
  })
  return content
}

const renderMidiModal = (midi) => {
  const content = document.createDocumentFragment()
  content.appendChild(MidiModal(midi._))
  return content
}
