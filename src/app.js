include(['src/Muse/graph.js', 'src/interface.js', 'src/Muse/audio.js', 'src/Muse/hardware.js', 'src/Muse/config.js', 'src/vendor/CanvasSineWave.js'], function() {

  //check to see if there is a calibration stored for the sliders.
  if (localStorage.yMin) {
    //grab the calibrations if there is one present.
    µ('#yAxis').min = localStorage.yMin;
    µ('#yAxis').max = localStorage.yMax;
    µ('#xAxis').min = localStorage.xMin;
    µ('#xAxis').max = localStorage.xMax;
  } else {
    //warn if there is no slider calibration, warn about it.
    alert('Sliders not calibrated; pull sliders all the way toward you and press "l"');
  }

  //on mouse move over the trace, update the mouse position
  µ('#trace').addEventListener('mousemove', function(evt) {
    var rect = this.getBoundingClientRect();
    this.mouse = {
      x: (evt.clientX - rect.left) / this.width,
      y: 1 - ((evt.clientY - rect.top) / this.height),
    };

    //add the current mouse position to the stack of current points.
    this.addPoint(this.mouse);
  }, false);

  //set the timeout to mute the sound after a period of inactivity.
  var muteTimeout = null;

  var resetMuteTimeout = function() {
    clearTimeout(muteTimeout);
    muteTimeout = setTimeout(function() {
      audio.left.mute();
      audio.right.mute();
    }, µ('config-file').muteTimeout);
  };

  //set the callback for volume control from the pot.

  //initialize the value to store the previous pot position.
  µ('#volumeControl').old = 0;
  µ('#volumeControl').onData = function(val) {
    //if the current volume value is different from the previous volume
    // value, process the new value.
    if (Math.abs(val - this.old) > .02) {

      //if the audio is muted, unmute it.
      if (audio.left.muted) {
        audio.right.unmute();
        audio.left.unmute();
      }

      //set the volume of each channel to the current knob position
      audio.left.setVolume(val);
      audio.right.setVolume(val);

      //reset the timeout for muting the audio.
      resetMuteTimeout();
      this.old = val;
    }
  };

  /////////////////////////////////
  //callbacks for hardware buttons
  /////////////////////////////////

  var doubleBtnPress = false;

  µ('#resetButton').onData = function(val) {
    //if the button switched from not pressed to pressed, trigger reset
    if (val) resetForNewUser();

    // TEMP - Secret toggle for testing sine waves...
    //if (val && doubleBtnPress) cycleSineMode();
    //doubleBtnPress = true;
    //setTimeout(function() { doubleBtnPress = false; }, 500);

    // End TEMP
  };

  µ('#cycleButton').onData = function(val) {
    //if the button switched from not pressed to pressed, cycle the screens
    if (val) cycleActivity();
  };

  //when the window resizes, resize the canvas.
  window.onresize = function() {
    µ('#trace').height = µ('#trace').clientHeight;
    µ('#trace').width = µ('#trace').clientWidth;
  };

  //when the trace receives a new point, update the audio tones.
  µ('#trace').onNewPoint = function() {
    //with a new point, reset the mute timeout.
    resetMuteTimeout();

    //call the functions to update the frequency.
    audio.left.changeFrequency(1 - µ('#trace').lastPoint().y, 1 / µ('#trace').range.y.divs);
    audio.right.changeFrequency(µ('#trace').lastPoint().x, 1 / µ('#trace').range.x.divs);

    //change the displayed frequency
    updateFrequencyReadouts(audio.left.getFrequency(), audio.right.getFrequency());

  };

  //set the trace to fade in the window
  µ('#trace').fade = true;
  µ('#trace').lineColor = 'rgba(0, 120, 174, 1)';

  //set the canvas to redraw at 30fps
  setInterval(function() {

    µ('#trace').draw();

  }, 1000 / 30);

  // Set up key listeners (for debug w/o Arduino)
  document.onkeypress = function(e) {
    var keyCode = (window.event) ? e.which : e.keyCode;

    if (keyCode === 97) { // 'a' = Screen activity button

      µ('#cycleButton').onData(true);

    } else if (keyCode === 110) { // 'n' = New user button

      µ('#resetButton').onData(true);

    } else if (keyCode === charCode('m')) { // 'm' = mute

      if (audio.left.muted) audio.left.unmute(), audio.right.unmute();
      else audio.left.mute(), audio.right.mute();

    } else if (keyCode == charCode('l')) {
      //store the current raw reading from the slider as the min calibration
      localStorage.yMin = µ('#xAxis').min = µ('#yAxis').raw;
      localStorage.xMin = µ('#xAxis').min = µ('#xAxis').raw;

      //alert that the minimum has been set, instruct how to set the high.
      alert('Minimum set. Push sliders forward, and press "h"');
    } else if (keyCode == charCode('h')) {
      //store the current raw reading from the slider as the max calibration
      localStorage.yMax = µ('#xAxis').max = µ('#yAxis').raw;
      localStorage.xMax = µ('#xAxis').max = µ('#xAxis').raw;
      alert('Maximum set. Sliders calibrated.');
    }

  };
});
