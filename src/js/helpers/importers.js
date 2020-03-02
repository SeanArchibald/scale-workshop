/* global alert, jQuery */

function isFileApiSupported () {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    return true
  } else {
    // File API not supported
    alert('Trying to load a file? Sorry, your browser doesn\'t support the HTML5 File API. Please try using a different browser.')
    return false
  }
}

function importScalaScl () {
  // check File API is supported
  if (isFileApiSupported()) {
    // trigger load file dialog
    jQuery('#scala-file').trigger('click')
  }
}

function importAnamarkTun () {
  // check File API is supported
  if (isFileApiSupported()) {
    // trigger load file dialog
    jQuery('#anamark-tun-file').trigger('click')
  }
}

export {
  importAnamarkTun,
  importScalaScl
}
