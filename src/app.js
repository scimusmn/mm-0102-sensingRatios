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
    if (Math.abs(val - this.oldVol) > .02) {
      audio.left.setVolume(val);
      audio.right.setVolume(val);
      resetMuteTimeout();
      this.oldVol = val;

    }
  };

  //callbacks for hardware buttons

  µ('#resetButton').onData = function(val) {
    if (val) resetForNewUser();
  };

  µ('#cycleButton').onData = function(val) {
    if (val) cycleActivity();
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
  µ('#trace').lineColor = '#f00';

  //set the canvas to redraw at 30fps
  setInterval(function() {

    µ('#trace').draw();

    // Update audio visualizers
    updateAmplitudes(audio.left.getVolume(), audio.right.getVolume());

  }, 1000 / 30);

  // Set up key listeners (for debug w/o Arduino)
  document.onkeypress = function(e) {
    var keyCode = (window.event) ? e.which : e.keyCode;

    if (keyCode === 97) { // 'a' = Screen activity button

      cycleActivity();

    } else if (keyCode === 110) { // 'n' = New user button

      resetForNewUser();

    } else if (keyCode === charCode('m')) { // 'm' = mute

      if (audio.left.muted) audio.left.unmute(), audio.right.unmute();
      else audio.left.mute(), audio.right.mute();

    } else if (keyCode === charCode('l')) { // 'm' = mute
      µ('#light').write(!µ('#light').state);
    }

  };
});
