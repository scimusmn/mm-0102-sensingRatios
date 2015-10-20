/**
 * CanvasSineWave
 *
 * Intended as a lightweight method of drawing
 * an animated Sine Wave. You can control sine wave
 * parameters in realtime using setter methods.
 * Frequency and amplitude do not correspond
 * to any real world units.
 * Draw function based on code found here: http://goo.gl/uDnl
 *
 */

var CanvasSineWave = function(_canvas, _options) {

  // Setup canvas
  this.canvas = _canvas;
  this.context = this.canvas.getContext('2d');;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.xAxis = Math.floor(this.height / 2);
  this.yAxis = 0;

  // Set options and defaults
  if (typeof _options === 'undefined') _options = {};

  this.showAxis = _options.showAxis || false;
  this.showFade = _options.showFade || false;

  this.amplitude = _options.amplitude || 40;
  this.frequency = _options.frequency || 5;
  this.resolution = _options.resolution || 5; // Pixel length of each line segment
  this.speed = _options.speed || 0.125;

  this.color = _options.color || 'rgba(255, 0, 0, 0.5)';
  this.strokeWidth = _options.strokeWidth || 10;

  this.xAxis;
  this.yAxis;

  this.animationFrameLoop = {};

  /**
   * Initialize variables and begin the animation.
   */
  this.init = function() {

    this.context.strokeStyle = '#333';
    this.context.lineJoin = 'round';

    this.context.save();

    if (this.showFade === true) {

      this.canvas.style['-webkit-mask-image'] = '-webkit-gradient(linear, 99% 100%, 33% 100%, from(rgba(0, 0, 0, 0)), to(rgb(0, 0, 0)))';

    }

    // Start draw loop
    this.draw();

  };

  /**
   * Set Frequency
   */
  this.setFrequency = function(val) {

    this.frequency = val;

  };

  /**
   * Set Amplitude
   */
  this.setAmplitude = function(val) {

    this.amplitude = val;

  };

  /**
   * Set Color
   */
  this.setColor = function(val) {

    this.color = val;

  };

  /**
   * Draw loop.
   *
   * This function draws one frame of the
   * animation, waits 30ms, and then calls
   * itself again.
   */
  this.draw = function() {

    // Clear the canvas
    this.context.clearRect(0, 0, this.width, this.height);

    // Draw the Axis in their own path
    if (this.showAxis === true) {
      this.context.beginPath();
      this.drawAxis();
      this.context.stroke();
    }

    // Set styles for animated graphics
    this.context.save();
    this.context.strokeStyle = this.color;
    this.context.fillStyle = '#fff';
    this.context.lineWidth = this.strokeWidth;

    // Draw the sine curve at time draw.t, as well as the circle.
    this.context.beginPath();
    this.drawSine(this.draw.t);
    this.context.stroke();

    // Restore original styles
    this.context.restore();

    // Update the time and draw again
    this.draw.seconds = this.draw.seconds - this.speed;
    this.draw.t = this.draw.seconds * Math.PI;

    this.animationFrameLoop = window.requestAnimationFrame(this.draw.bind(this));

  };

  this.draw.seconds = 0;
  this.draw.t = 0;

  /**
   * Draw Axis
   */
  this.drawAxis = function() {

    // Draw X and Y Axis
    this.context.moveTo(0, this.xAxis);
    this.context.lineTo(this.width, this.xAxis);
    this.context.moveTo(this.yAxis, 0);
    this.context.lineTo(this.yAxis, this.height);

    // Draw X axis tick at PI
    this.context.moveTo(this.yAxis + Math.PI * this.amplitude, this.xAxis + 5);
    this.context.lineTo(this.yAxis + Math.PI * this.amplitude, this.xAxis - 5);

  };

  /**
   * Draw Sine
   *
   * The sine curve is drawn in <this.resolution> pixel long segments starting at the origin.
   *
   */
  this.drawSine = function(t) {

    // Set the initial x and y, starting at 0,0 and translating to the origin on
    // the canvas.
    var x = t;
    var y = Math.sin(x);
    this.context.moveTo(this.yAxis, this.amplitude * this.y + this.xAxis);

    // Loop to draw segments
    for (i = this.yAxis; i <= this.width; i += this.resolution) {
      x = t + ((this.yAxis + i) / this.amplitude) * this.frequency;
      y = Math.sin(x);
      this.context.lineTo(i, this.amplitude * y + this.xAxis);
    }

  };

  // Kick things off...
  this.init();

};
