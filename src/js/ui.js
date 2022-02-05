/**
 * ui.js
 * User interface
 */

// use jQuery UI tooltips instead of default browser tooltips
jQuery(function () {
  jQuery(document).tooltip()
})

// set "accordion" settings UI
jQuery(function () {
  jQuery('#settings-accordion').accordion({
    collapsible: true, // allow all tabs to be closed
    active: false, // start all tabs closed
    heightStyle: 'content', // size each section to content
    icons: null, // turn off triangle icons
    header: '> div > h3'
  })
})

function touch_kbd_open() {
  // check if scale already set up - we can't use the touch kbd if there is no scale
  if (tuning_table['note_count'] == 0) {
    alert("Can't open the touch keyboard until you have created or loaded a scale.")
    return
  }

  // remove info from keys
  jQuery('#virtual-keyboard td').each(function (index) {
    // clear content of cell
    jQuery(this).empty()
    // remove any classes that might be on the cell
    jQuery(this).attr('class', '')
  })

  // display tuning info on virtual keys
  jQuery('#virtual-keyboard td').each(function () {
    // get the coord data attribute and figure out the midinote
    const midinote = touch_to_midinote(getCoordsFromKey(this))

    // add text to key
    //jQuery(this).append("<p><small>midi</small> <strong>" + midinote + "</strong></p>");
    //jQuery(this).append("<p><strong>" + tuning_table['freq'][midinote].toFixed(1) + "</strong><br/><small>Hz</small></p>");

    // get the number representing this key color, with the first item being 0
    var keynum = (midinote - tuning_table['base_midi_note']).mod(key_colors.length)

    // set the color of the key
    this.classList.add('key', key_colors[keynum])
  })

  state.set('mobile menu visible', false)

  // show the virtual keyboard
  jQuery('#virtual-keyboard').slideDown()
}

function touch_kbd_close() {
  // hide the virtual keyboard
  jQuery('#virtual-keyboard').slideUp()
}
