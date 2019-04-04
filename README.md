# Scale Workshop

![Scale Workshop screenshot](https://raw.githubusercontent.com/SeanArchibald/scale-workshop/master/assets/img/scale-workshop-og-image.png)


## Description

[Scale Workshop](http://sevish.com/scaleworkshop/) allows you to design microtonal scales and play them in your web browser. Export your scales for use with VST instruments. Convert Scala files to various tuning formats.


## Frequently Asked Questions

### What kinds of microtonal scales are possible with Scale Workshop?

Scale Workshop can play any kind of microtonal scale, such as equal temperaments, just intonation, historical and traditional scales, non-octave scales, and any arbitrary tunings. The application offers a few methods to generate scales automatically based on parameters you set, or otherwise you can enter your scale data manually.

### Can I play and hear my scale?

Yes, the built-in synth allows you to play your scales within the web browser. If your browser supports web MIDI then you can use a connected MIDI device to play notes. Otherwise you can use your computer keyboard (e.g. a QWERTY keyboard) as an isomorphic keyboard controller to hear your scales. You can also play on a touch device using the 'Touch Keyboard' feature.

### Can I use Scale Workshop to tune up other synths?

Scale Workshop supports any synth that uses Scala (.scl/.kbm) files or AnaMark TUN (.tun) files. It can also export Native Instruments Kontakt tuning scripts, Max/MSP coll tuning tables and Pure Data text tuning tables.

The Xen Wiki has a [list of microtonal software plugins](https://en.xen.wiki/w/List_of_Microtonal_Software_Plugins) that support Scala and AnaMark files.

### How do I enter scale/tuning data manually?

Scale data should be entered in to the large text field labeled ‘Scale data’. Add each note on its own new line. Cents and ratios are both supported.

* To specify a ratio, simply write it in the format e.g. `3/2`
* To specify an interval in cents, include a . in the line e.g. `701.9` or `1200.`
* To specify n steps out of m-EDO, write it in the format `n\m`

No need to enter `0.` or `1/1` on the first line as your scale is automatically assumed to contain this interval.

The interval on the final line is assumed to be your interval of equivalence (i.e. your octave or pseudo-octave).

Don't add any other weird data to a line. Don't try to mix decimals with ratios (e.g. `2/1.5`). Scale Workshop will try to gracefully ignore any rubbish that you put in, but it's very possible that weird stuff will happen.

### Can I copy and paste the contents of a Scala file (.scl) directly into the 'Scale data' field?

Scala files contain non-tuning related comments at the top of the file, so Scale Workshop will throw an error if you try to paste them in directly. Instead you can use the ‘Load .scl’ function, which automatically removes those comments for you. Or you can paste the Scala file but remove the comments manually.

### Can I convert a TUN file to another format?

Yes, start by clicking New > Import .TUN and then load your TUN file into Scale Workshop. Then click Export and select your desired output format. Note that Scale Workshop is not a fully compliant AnaMark TUN v2 parser, however it should be able to read TUN files exported by Scala and Scale Workshop.

### How do I make my own keyboard mapping?

Keyboard mappings are not currently supported. You can still export a Scala keyboard mapping file (.kbm) but it will assume a linear mapping.
However you can always use duplicate lines in your tuning in order to skip any keys that you don't want to include, or write your .kbm file manually.

### Can I undo/redo?

Use your browser's Back/Forward navigation buttons to undo/redo changes to your tuning.

### How can I share my tunings with a collaborator?

Use Export > Share scale as URL. The given URL can be copied and pasted to another person. When they open the link they will see a Scale Workshop page with your scale already tuned in.

### How can I save my work for later?

You can bookmark the current page to save your work for later. This works because your tuning data is stored within the bookmarked URL.

### When I export a tuning, I get a weird filename, why?

Exporting a file with the correct filename is not supported in Safari (iOS and macOS). You can try to use Firefox, Chrome or Opera instead.

### Can I run this software offline?

Yes, just download the project from GitHub as a zip file and run index.htm from your web browser.

### Can you add a new feature to Scale Workshop?

Probably! Just add your feature request to the [issue tracker](https://github.com/SeanArchibald/scale-workshop/issues) on GitHub.

### I found a bug

Please [create a bug report](https://github.com/SeanArchibald/scale-workshop/issues) detailing the steps to reproduce the issue. You should also include which web browser and OS you are using.


## Contributing

Please base any work on develop branch, and pull requests should also be made against develop branch not master.


## Changelog

### 0.9.9
* Added a selection of preset scales
* Fix issue using delay in some situations
* Fix issue stretching/compressing scales in some situations
* Minor interface and user guide improvements

### 0.9.8
* Fix .scl import bug

### 0.9.7
* Added user guide
* Fix `n\m` style data input

### 0.9.6
* Improved modal dialogs on mobile
* Fix regression exporting .tun files

### 0.9.5
* Loading the synth is now delayed as much as possible
* Better compatibility for exported Scala files (placeholder description will be used if user doesn't provide a tuning description)
* Improved mode input - you can optionally enter a list of scale degrees from the base note (e.g. 2 4 5 7 9 11 12)
* Stricter validation of tuning data input, improves security
* More default/auto keyboard colour layouts added

### 0.9.4
* Import AnaMark .tun files (NOT compliant to the AnaMark v2 spec, but should import tun files generated by Scala and Scale Workshop)
* Dvorak and Programmer Dvorak keyboard layouts are now supported
* Code refactoring and improvements
* Fix: Scale Workshop will no longer prevent keyboard shortcuts from being used

### 0.9.3
* Undo/redo function (via browser back/forward navigation)
* Various UI improvements, mostly for phone-sized devices
* Code refactoring and improvements (thanks Lajos)

### 0.9.2
* Added key colour customisation
* Added 'About Scale Workshop' screen
* When sharing scale by URL, key colour layout and synth options will now carry across
* When using a menu option that opens a modal dialog, the first field will automatically be selected
* Choice of regional keyboard layout is now remembered across sessions
* Delay time control now shows milliseconds value

### 0.9.1
* Improved rank-2 temperament generator. You can now specify how many generators up or down from 1/1

### 0.9
* Added virtual keyboard for touch interfaces (experimental)

### 0.8.9
* Improved workflow ('Calculate' button removed as the app now responds to scale data changes automatically)
* Improved no-javascript error message
* Fix: Scala .scl file export now preserves ratios instead of converting them to cents

### 0.8.8
* Fix stuck notes in Mozilla Firefox (due to differing implementations of the Web Audio API between web browsers, the amplitude envelopes are going to sound slightly different in Firefox)
* Fix blank option shown in 'Line endings format' when using Scale Workshop for the first time
* Fix styling issue with light theme when hovering over top menu option

### 0.8.7

* Basic MIDI input support
* General Settings are now automatically saved and restored across sessions
* Added "Night Mode" dark theme for late night sessions in the workshop
* Added user.js file where you can add your own custom script if needed

### 0.8.6

* Added info tooltips
* URL fix for Xenharmonic Wiki

### 0.8.5

* Added amplitude envelope for synth notes (organ, pad, and percussive presets)
* Added main volume control
* Added keyboard layout setting for international keyboards (English and Hungarian supported)

### 0.8.4

* Added delay effect
* Added 'auto' function for base frequency, which calculates the frequency for the specified MIDI note number assuming 12-EDO A440
* Added option to choose between Microsoft/Unix line endings
* Added indicator to show when Qwerty isomorphic keyboard is active (when typing in a text field, it is inactive)
* Added 'Quiet' button in case things get noisy in the workshop
* Added share scale as URL to email, twitter
* Fix sharing scale as URL - isomorphic mapping
* Removed debug option - debug messages will now be output to the JavaScript console by default. Use `debug = false;` in console to disable
* Improved options menu - options instantly take effect when changed (removed Apply/Save button)

### 0.8.3

* Fix sharing scale as URL - now the qwerty isomorphic mapping is correctly shared

### 0.8.2

* Settings have been moved to the right-side column (desktop)
* Added option to export a list of frequencies in text format readable by Pure Data's [text] object

### 0.8.1

* Choice of waveform for the synth: triangle, sawtooth, square, sine
* Settings menus added - General, Synth and Note Input settings
* Qwerty isomorphic keyboard mapping can be changed in the Note Input settings
* Qwerty isomorphic keyboard mapping is saved when sharing scale by URL
* Currently displayed notes are now highlighted in the tuning data table
* Fix stuck note in FireFox when pressing `/` key
* UI improvement (for large screens): tall columns are now contained within one window and individually scrollable
* Tuning data table is now displayed more compactly to show more info at once

### 0.8

* Synth added: use the QWERTY keys to play current scale
* Export a scale as a URL with the 'Share scale as URL' option

### 0.7.1

* Fix missing line breaks on Notepad and some other text editors
* Improved readme formatting (thanks suhr!)

### 0.7.0

* Scale modifiers added: ‘stretch’, ‘random variance’, ‘mode’
* Users can now input `n\m` to specify n steps out of m-EDO
* When generating a rank-2 temperament, display the scale sizes which are MOS
* Improve UI for user input, using custom modals instead of JS prompts
* Code refactored to reduce the amount of duplication
* Code is now split up over various js files so it's easier to navigate
* Change logo/favicon to square shape

### 0.6

* Generate rank-2 temperaments

### 0.5

* Fix incorrect base frequency when exporting TUN format and NI Kontakt format
* Export Scala .kbm format

### 0.4

* All dependencies (Bootstrap, jQuery etc.) now included in scaleworkshop directory
* Import Scala .scl format
* Export Scala .scl format
* Export AnaMark TUN format
* Export Native Instruments Kontakt script format
* Export Max/MSP coll format

### 0.3

* Generate equal-tempered tuning
* Generate harmonic series segment tuning
* Generate subharmonic series segment tuning

### 0.2

* Allow tuning data input to be parsed into a frequency table

### 0.1

* Initial version


## Contributors

* Sevish
* Scott Thompson
* Lajos Mészáros
* Carl Lumma
* Tobia


## License

Copyright (c) 2017-2019 Sean Archibald

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
