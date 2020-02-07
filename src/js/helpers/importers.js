/* global alert, jQuery */

function is_file_api_supported() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    return true;
  } else {
    // File API not supported
    alert('Trying to load a file? Sorry, your browser doesn\'t support the HTML5 File API. Please try using a different browser.');
    return false;
  }
}

function import_scala_scl() {
  // check File API is supported
  if ( is_file_api_supported() ) {
    // trigger load file dialog
    jQuery( "#scala-file" ).trigger('click');
  }
}

function import_anamark_tun() {
  // check File API is supported
  if ( is_file_api_supported() ) {
    // trigger load file dialog
    jQuery( "#anamark-tun-file" ).trigger('click');
  }
}

export {
  import_anamark_tun,
  import_scala_scl
}
