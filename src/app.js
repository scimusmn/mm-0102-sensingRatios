include(['src/arduinoControl.js','src/smm_graph.js', 'src/interface.js', 'src/vendor/timbre.js','src/hardware.js','src/smm_config.js'], function() {

  //declare the the wave functions for the left and right audio channels.
  var left = T('sin', {freq:440,mul:.5});
  var right = T('sin', {freq:440,mul:.5});

  var pos = T(0);
  var posRight = T(1);

  /* Comment out to mute sounds during development */
  // T('pan', {pos:0}, left).play();
  // T('pan', {pos:1}, right).play();

  left.newVal = 0;
  right.newVal = 0;

  //ramp function for smoothing the audio audio tones.
  function ramp(channel,newVal) {
    if (Math.abs(channel.freq.value - newVal) > 1) {
      channel.newVal = newVal;
      channel.freq.value -= sign(channel.freq.value - channel.newVal) * 1;
      setTimeout(function() {ramp(channel, channel.newVal);}, 1);
    } else channel.freq.value = newVal;
  }

  //on mouse move over the trace, update the mouse position
  _S('#trace').addEventListener('mousemove', function(evt) {
    var rect = this.getBoundingClientRect();
    this.mouse = {
      x: (evt.clientX - rect.left) / this.width,
      y: (evt.clientY - rect.top) / this.height,
    };

    //add the current mouse position to the stack of current points.
    this.addPoint(this.mouse);
  }, false);

  //when the window resizes, resize the canvas.
  window.onresize = function() {
    _S('#trace').height = _S('#trace').clientHeight;
    _S('#trace').width = _S('#trace').clientWidth;
  }

  //when the trace receives a new point, update the audio tones.
  _S('#trace').onNewPoint = function() {
    ramp(left, Math.pow(2, _S('#trace').lastPoint().x * 7 + 4));
    ramp(right, Math.pow(2, (1 - _S('#trace').lastPoint().y) * 7 + 4));

    updateFrequencyReadouts(Math.round(_S('#trace').lastPoint().x * 100), Math.round(_S('#trace').lastPoint().y * 100));

  };

  //set the trace to fade in the window
  _S('#trace').fade = true;
  _S('#trace').lineColor = '#f00';

  //set the canvas to redraw at 30fps
  setInterval(function() {_S('#trace').draw();}, 1000 / 30);

  // Set up key listeners (for debug w/o Arduino)
  document.onkeypress = function (e) {
      var keyCode = (window.event) ? e.which : e.keyCode;

      if (keyCode === 97){ // 'a' = Screen activity button

        cycleActivity();

      } else if (keyCode === 110) { // 'n' = New user button

        resetForNewUser();

      }
  };
});
