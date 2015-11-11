include(['src/smm_graph.js', 'src/interface.js', 'src/audio.js', 'src/hardware.js', 'src/smm_config.js', 'src/vendor/CanvasSineWave.js'], function() {

  //mute the left and right audio channels.
  audio.left.mute();
  audio.right.mute();

  //on mouse move over the trace, update the mouse position
  µ('#trace').addEventListener('mousemove', function(evt) {
    var rect = this.getBoundingClientRect();
    this.mouse = {
      x: (evt.clientX - rect.left) / this.width,
      y: (evt.clientY - rect.top) / this.height,
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

  µ('#volumeControl').old = 0;
  µ('#volumeControl').onData = function(val) {
    if (Math.abs(val - this.old) > .02) {
      audio.left.setVolume(val);
      audio.right.setVolume(val);
      resetMuteTimeout();
      this.old = val;
    }
  };

  //callbacks for hardware buttons

  // TEMP - should be removed eventually
  var doubleBtnPress = false;

  µ('#resetButton').onData = function(val) {
    console.log('resetbut is ' + val);
    if (val) resetForNewUser();

    // TEMP - Secret toggle for testing sine waves...
    if (val && doubleBtnPress) cycleSineMode();
    doubleBtnPress = true;
    setTimeout(function() { doubleBtnPress = false; }, 500);

    // End TEMP
    console.log('reset');
  };

  µ('#cycleButton').onData = function(val) {
    if (val) cycleActivity();
    console.log('cycle');
  };

  //when the window resizes, resize the canvas.
  window.onresize = function() {
    µ('#trace').height = µ('#trace').clientHeight;
    µ('#trace').width = µ('#trace').clientWidth;
  };

  //when the trace receives a new point, update the audio tones.
  µ('#trace').onNewPoint = function() {
    resetMuteTimeout();
    audio.left.changeFrequency(1 - µ('#trace').lastPoint().y, 1 / µ('#trace').range.y.divs);
    audio.right.changeFrequency(µ('#trace').lastPoint().x, 1 / µ('#trace').range.x.divs);

    updateFrequencyReadouts(Math.round(audio.left.getFrequency()), Math.round(audio.right.getFrequency()));

  };

  //set the trace to fade in the window
  µ('#trace').fade = true;
  µ('#trace').lineColor = 'rgba(0, 120, 174, 1)';

  //set the canvas to redraw at 30fps
  setInterval(function() {

    µ('#trace').draw();

    // Update audio visualizers
    // updateAmplitudes(audio.left.getVolume(), audio.right.getVolume());

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

    } else if (keyCode === charCode('l')) { // 'm' = mute
      µ('#light').write(!µ('#light').state);
    }

  };
});
