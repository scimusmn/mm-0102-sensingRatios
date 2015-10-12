include(['src/arduinoControl.js','src/smm_graph.js', 'src/interface.js', 'src/audio.js','src/hardware.js'], function() {

  //mute the left and right audio channels.
  audio.left.unmute();
  audio.right.unmute();

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

  //when the window resizes, resize the canvas.
  window.onresize = function() {
    µ('#trace').height = µ('#trace').clientHeight;
    µ('#trace').width = µ('#trace').clientWidth;
  }

  //when the trace receives a new point, update the audio tones.
  µ('#trace').onNewPoint = function() {
    audio.left.changeFrequency(1-µ('#trace').lastPoint().y,.125);
    audio.right.changeFrequency(µ('#trace').lastPoint().x,.125);


    updateFrequencyReadouts(audio.left.getFrequency(), audio.right.getFrequency());

  };

  //set the trace to fade in the window
  µ('#trace').fade = true;
  µ('#trace').lineColor = '#f00';

  //set the canvas to redraw at 30fps
  setInterval(function() {µ('#trace').draw();}, 1000 / 30);


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
