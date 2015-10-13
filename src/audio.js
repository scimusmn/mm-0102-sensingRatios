include([],function () {
  var synth = function(which){
    var _this = this;
    var audio = new window.AudioContext();

    var osc = audio.createOscillator();
    var gain = audio.createGain();
    var panNode = audio.createStereoPanner();

    /*var real = new Float32Array(4);
    var imag = new Float32Array(4);

    real[0] = 0;
    imag[0] = 0;
    real[1] = .1;
    imag[1] = -.1;

    var wave = audio.createPeriodicWave(real, imag);

    osc.setPeriodicWave(wave);*/
    osc.frequency.value = 50;
    osc.type = 'sine';


    gain.gain.value = 1;

    //sets the pan of the channel
    panNode.pan.value = ((which=='left') ? -1 : 1);

    osc.connect(gain);
    gain.connect(panNode);
    panNode.connect(audio.destination);
    osc.start(0);


    this.rampTimer;

    this.volume = 1;
    this.volScale = 1;
    this.muted = false;

    this.getVolume = function () {
      return this.volume;
    }
    this.setVolume = function (vol) {
      this.volume = vol;
      if(!this.muted) gain.gain.value = vol*this.volScale;
    }

    this.mute = function () {
      this.muted=true;
      gain.gain.value = 0;
    }

    this.unmute = function () {
      this.muted=false;
      gain.gain.value = this.volume*this.volScale;
    }

    this.setFrequency = function (freq) {
      osc.frequency.value = freq;
    }

    this.getFrequency = function () {
      return osc.frequency.value
    }

    this.changeFrequency = function (val,octSize) {
      //this sets the frequency to drop to zero in the first division,
      //but be based on 50 hz otherwise.
      var base=(val>octSize) ? 50 : 50.*val/octSize;
      var targFreq = base*Math.pow(2, (val/octSize))/2;

      targFreq = clamp(targFreq,0,6400);

      this.volScale=Math.pow(50./targFreq,.7);
      if(this.volScale>1) this.volScale=1;

      if(!this.muted) gain.gain.value = this.volume*this.volScale;
      this.setFrequency(targFreq);
    }
  };

  window.audio = {
    left: new synth('left'),
    right: new synth('right')
  }

  window.synth = synth;
});
