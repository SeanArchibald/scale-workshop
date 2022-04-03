const MidiChannel = ({ type, name, id, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div style="display:flex;flex-direction:column;padding:0 10px;align-items:center">
      <input id="${type}--${name}--${id}" style="margin:0" type="checkbox" ${
    enabled ? 'checked="checked"' : ''
  } />
      <label for="${type}--${name}--${id}">${id}</label>
    </div>
  `
  const content = template.content
  content.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
    midi.toggleChannel(type, name, id, e.target.checked)
  })
  return content
}

const MidiDevice = ({ type, name, channels, enabled }) => {
  const template = document.createElement('template')
  template.innerHTML = `
    <div style="display:flex;align-items:center">
      <div style="padding:0 10px">
        <input id="${type}--${name}" style="margin:0" type="checkbox" ${
    enabled ? 'checked="checked"' : ''
  } />
      </div>
      <h4 style="flex-grow:1"><label style="margin:0" for="${type}--${name}">${name}</label></h4>
      <div class="channels" style="display:flex"></div>
    </div>
  `
  const content = template.content
  channels.forEach((channel) => {
    content.querySelector('.channels').appendChild(MidiChannel({ type, name, ...channel }))
  })
  content.getElementById(`${type}--${name}`).addEventListener('change', (e) => {
    midi.toggleDevice(type, name, e.target.checked)
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
    <div id="midi-modal" style="user-select:none">
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
    content.querySelector('.inputs').appendChild(MidiDevice({ type: 'input', name, ...input }))
  })
  Object.entries(outputs).forEach(([name, output]) => {
    content.querySelector('.outputs').appendChild(MidiDevice({ type: 'output', name, ...output }))
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
