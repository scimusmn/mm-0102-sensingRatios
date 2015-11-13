include([], function() {
  var synth = function(which) {
    var _this = this;
    var audio = new window.AudioContext();

    var osc = audio.createOscillator();
    var gain = audio.createGain();
    var panNode = audio.createStereoPanner();

    /*var real = new Float32Array([0, 1, .5, 0, -.5, -1]);
    var imag = new Float32Array([0, 1, .5, 0, -.5, 0]);

    var wave = audio.createPeriodicWave(real, imag);

    osc.setPeriodicWave(wave)*/;

    osc.frequency.value = 50;

    //osc.type = 'sawtooth';

    gain.gain.value = 1;

    //sets the pan of the channel
    panNode.pan.value = ((which == 'left') ? -1 : 1);

    osc.connect(gain);
    gain.connect(panNode);
    panNode.connect(audio.destination);
    osc.start(0);

    this.rampTimer;
    this.volume = 1;
    this.eVolume = 1;
    this.volScale = 1;
    this.muted = false;

    this.rampVolume = function(vol) {
      if (Math.abs(_this.volume - vol) > .01 || this.muted) {
        _this.volume += sign(vol - _this.volume) * .01;
        gain.gain.value = _this.volume * _this.volScale;
        clearTimeout(_this.rampTimer);
        _this.rampTimer = setTimeout(function() {_this.rampVolume(vol);}, 1);
      } else _this.setVolume(vol);
    };

    this.getVolume = function() {
      return this.volume;
    };

    this.setVolume = function(vol) {
      this.volume = vol;
      this.eVolume = vol;
      if (this.volume > 0) muted = false;
      else muted = true;
      gain.gain.value = this.volume * this.volScale;
    };

    this.mute = function() {
      this.muted = true;
      this.rampVolume(0);
    };

    this.unmute = function() {
      this.muted = false;
      this.rampVolume(this.eVolume);
    };

    this.setFrequency = function(freq) {
      osc.frequency.value = freq;
    };

    this.getFrequency = function() {
      return osc.frequency.value;
    };

    this.changeFrequency = function(val, octSize) {
      //this sets the frequency to drop to zero in the first division,
      //but be based on 50 hz otherwise.
      var base = (val > octSize) ? 50 : 50. * val / octSize;

      //make the freq jump an octave every division.
      var targFreq = base * Math.pow(2, (val / octSize)) / 2;

      //restrict freq to 6400hz max
      targFreq = Math.floor(clamp(targFreq, 0, 6400));

      //scale the volume as frequency increases, so it isn't totally obnoxious.
      this.volScale = Math.pow(50. / targFreq, .8);
      if (this.volScale > 1) this.volScale = 1;

      if (!this.muted) gain.gain.value = this.volume * this.volScale;
      else this.unmute();

      this.setFrequency(targFreq);
    };
  };

  window.audio = {
    left: new synth('left'),
    right: new synth('right'),
  };

  window.synth = synth;
});
