const MidiChannel = ({ id, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <label>
      <input type="checkbox" ${enabled ? 'checked="checked"' : ''} />
      <span>${id}</span>
    </label>
  `
  return template.content
}

const MidiDevice = ({ name, channels, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div style="display:flex">
      <input type="checkbox" ${enabled ? 'checked="checked"' : ''} />
      <h4>${name}</h4>
      <div class="channels" style="display:flex"></div>
    </div>
  `
  const content = template.content
  channels.forEach((channel) => {
    content.querySelector('.channels').appendChild(MidiChannel(channel))
  })
  return content
}

const MidiModal = ({
  status: {
    devices: { inputs, outputs }
  },
  whiteOnly
}) => {
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
        <label style="display:flex">
          <input name="midi-whitemode" type="checkbox" ${whiteOnly ? 'checked="checked"' : ''} />
          <h4>White Key Only mode</h4>
          <p>remaps the keyboard so that it doesn't take note of black keys</p>
        </label>
      </div>
    </div>
  `
  const content = template.content
  Object.entries(inputs).forEach(([name, input]) => {
    content.querySelector('.inputs').appendChild(MidiDevice({ name, ...input }))
  })
  Object.entries(outputs).forEach(([name, output]) => {
    content.querySelector('.outputs').appendChild(MidiDevice({ name, ...output }))
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
