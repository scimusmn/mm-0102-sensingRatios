include(['src/arduinoControl.js','src/smm_graph.js','src/vendor/timbre.js'], function() {

  //declare the the wave functions for the left and right audio channels.
  var left = T('sin', {freq:440,mul:.5});
  var right = T('sin', {freq:440,mul:.5});

  var pos = T(0);
  var posRight = T(1);

  T('pan', {pos:0}, left).play();
  T('pan', {pos:1}, right).play();

  left.newVal = 0;
  right.newVal = 0;

  //ramp function for smoothing the audio audio tones.
  function ramp(channel,newVal) {
    if (Math.abs(channel.freq.value - newVal) > .4) {
      channel.newVal = newVal;
      channel.freq.value -= sign(channel.freq.value - channel.newVal) * .4;
      setTimeout(function() {ramp(channel, channel.newVal);}, 1);
    } else channel.freq.value = newVal;
  }

  //on mouse move over the trace, update the mouse position
  $('#trace').addEventListener('mousemove', function(evt) {
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
    $('#trace').height = $('#trace').clientHeight;
    $('#trace').width = $('#trace').clientWidth;
  }

  //when the trace receives a new point, update the audio tones.
  $('#trace').onNewPoint = function() {
    ramp(left, Math.pow(2, $('#trace').lastPoint().x * 7 + 4));
    ramp(right, Math.pow(2, (1 - $('#trace').lastPoint().y) * 7 + 4));

    newPointUpdate(Math.round($('#trace').lastPoint().x * 100), Math.round($('#trace').lastPoint().y * 100));

  };

  function newPointUpdate(inLeft, inRight) {

    console.log('updateInterface', inLeft, inRight);

    var digitPadding = 4;

    // Update left frequency readout
    var newLeft = zeroPad(inLeft, digitPadding);
    $('#fLeft').innerHTML = newLeft;

    // Update right frequency readout
    var newRight = zeroPad(inRight, digitPadding);
    $('#fRight').innerHTML = newRight;

  }

  //set the trace to fade in the window
  $('#trace').fade = true;
  $('#trace').lineColor = '#f00';

  //set the canvas to redraw at 30fps
  setInterval(function() {$('#trace').draw();}, 1000 / 30);
});
