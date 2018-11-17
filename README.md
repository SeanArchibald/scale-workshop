# Scale Workshop

![Scale Workshop screenshot](https://raw.githubusercontent.com/SeanArchibald/scale-workshop/master/assets/img/scale-workshop-og-image.png)


## Description

[Scale Workshop](http://sevish.com/scaleworkshop/) is a tool that allows you to create microtonal tunings within your web browser. Your created tunings can be exported and downloaded to your device in the various formats. These tuning files can be loaded into some synthesizers, allowing you to play microtonal music with them.


## Frequently Asked Questions

### Is this a replacement for Scala/LMSO?

No, those pieces of software are much more sophisticated. The goal of this project is *quick* input/generation/audition of tunings within the web browser. It's just a simple tool you can use conveniently.

### How do I enter tuning data?

Tuning data should be entered in to the text area labeled ‘Tuning Data’. Add each note on its own new line. Cents and ratios are both supported.

* To specify a ratio, simply write it in the format e.g. `3/2`
* To specify an interval in cents, include a . in the line e.g. `701.9` or `1200.`
* To specify n steps out of m-EDO, write it in the format `n\m`

No need to enter `0.` or `1/1` on the first line as your scale is automatically assumed to contain this interval.

The interval on the final line is assumed to be your interval of equivalence (i.e. your octave or pseudo-octave).

Don't add any other weird data to a line. Don't try to mix decimals with ratios (e.g. `2/1.5`). Scale Workshop will try to gracefully ignore any rubbish that you put in, but it's very possible that weird stuff will happen.

### Can I copy and paste the contents of a Scala file (.scl) directly into the Tuning Data field?

Scala files contain non-tuning related comments at the top of the file, so Scale Workshop will throw an error if you try to paste them in directly. Instead you can use the ‘Load .scl’ function, which automatically removes those comments for you. Or you can paste the Scala file but remove the comments manually.

### Can I play and hear my scales in the browser?

Yes, this project now contains a synth that allows you to hear your current scale. New features and documentation coming later.

### Are non-octave based scales supported?

Yeah.

### How do I make my own Scala keyboard mapping?

Keyboard mappings are not currently supported. You can still export a Scala keyboard mapping file (.kbm) but it will assume a linear mapping.
However you can always use duplicate lines in your tuning in order to skip any keys that you don't want to include, or write your .kbm file manually.

### When I export a tuning, I get a weird filename, why?

Exporting a file with the correct filename is not supported in Safari (iOS and macOS). You can try to use Firefox, Chrome or Opera instead.

### Can you add a new feature to Scale Workshop?

Probably! Just add your feature request to the issues tracker on GitHub:
https://github.com/SeanArchibald/scale-workshop/issues

### I found a bug

Please create a bug report with as much info as possible about the issue and how to reproduce it:
https://github.com/SeanArchibald/scale-workshop/issues


## Contributing

Please base any work on develop branch, and pull requests should also be made against develop branch not master.


## Changelog

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


## Roadmap

### 0.x.x

* UI improvements
* More scale modifiers e.g. ‘quantize to BPM’, ‘sort ascending’, ‘octave reduce’
* What should go here?

### 1.0

* Stable


## Contributors

* Sevish
* Scott Thompson
* Lajos Mészáros
* Carl Lumma


## License

Copyright (c) 2017-2018 Sean Archibald

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
