include([], function() {
  var websocket = function() {
    this.address = 'ws://localhost:8080/';
    this.connectInterval = null;
    this.serialport = '';
    var ws = null;
    this.messageCallback = function(evt) {};

    this.connectCallback = function() {};

    this.onArduinoConnect = function() {};

    this.onSerialOpen = function() {};

    this.send = function(msg) {};

    this.openSerialPort = function(sp, cb) {
      this.onSerialOpen = cb;
      this.serialport = sp;
      console.log('Attempting connection to ' + sp + '...');
      ws.send('sp|' + sp);
    };

    this.connect = function() {
      var _this = this;
      if ('WebSocket' in window) {
        ws = new WebSocket(this.address); //ws://echo.websocket.org is the default testing server
        ws.onopen = function()
        {
          // Web Socket is connected, send data using send()
          clearInterval(_this.connectInterval);
          if (_this.serialport.length)
            _this.openSerialPort(_this.serialport, _this.onArduinoConnect);
          _this.connectCallback();
          ws.onmessage = function(evt) {
            var spl = evt.data.split('=');
            if (spl[0] == 'sp') {
              if (spl[1] == 'err')
                console.log(_this.serialport + ' does not exist');
              else if (spl[1] == 'ack') {
                setTimeout(_this.onSerialOpen, 2000);
                console.log('Connection successful');
              }
            } else _this.messageCallback(evt);
          };
        };

        ws.onerror = function(error) {
          //if ('WebSocket' in window) _this.connectInterval = setInterval(_this.connect.bind(_this),2000);
        }

        ws.onclose = function() {
          //_this.connectInterval = setInterval(_this.connect.bind(_this),2000);
        };

        this.send = function(msg) {
          ws.send(msg);
        }
      }    else {
        clearInterval(_this.connectInterval);
        console.log('Websocket not supported');
      }
    }
  };

  ////////////////////////////////////////////////
  //  arduino
  ////////////////////////////////////////////////

  var webArduino = inheritFrom(HTMLElement, function(){
    var _this= this;
    this.digiHandlers =[];
    this.anaHandlers =[];
    var START = 128;
    var DIGI_READ = 0;
    var DIGI_WRITE = 32;  //pins 2-13
    var ANA_READ = 64;
    var DIGI_WATCH_2 = 72; //pins 14-19
    var ANA_REPORT = 80;
    var ANA_WRITE = 96;    //pins 3,5,6,9,10,11
    var DIGI_WATCH = 112;  //pins 2-13

    this.ws = null;

    this.onMessage = function(evt) {
      msg = evt.data;
      if(msg.length>1)
      for(var i=0; i<msg.length; i++){
        var chr = msg.charCodeAt(i);
        if(chr&ANA_READ){  //if the packet is analogRead
          var pin = ((chr & 56)>>3);        //extract the pin number
          var val = ((chr & 7)<<7)+(msg.charCodeAt(++i)&127); //extract the value
          //console.log(pin);
          if(typeof _this.anaHandlers[pin] == 'function') _this.anaHandlers[pin](pin,val);
        }
        else if(chr&(START+DIGI_READ)){      //if the packet is digitalRead
          var pin = ((chr & 62)>>1);
          var val = chr&1;
          //console.log(pin);
          if(typeof _this.digiHandlers[pin] == 'function') _this.digiHandlers[pin](val);
        }
      }
    };

    function asChar(val) {
      return String.fromCharCode(val);
    }

    this.digitalWrite = function(pin, state) {
      if(pin<=13) this.ws.send('r|'+asChar(START+DIGI_WRITE+((pin&15)<<1)+(state&1)));
      else console.log('Pin must be less than or equal to 13');
    };

    this.digitalRead = function(pin) {
      this.ws.send('r|'+asChar(START+DIGI_READ+(pin&31)));
    };

    this.analogWrite = function(pin, val) {
      if(val>=0&&val<256)
        this.ws.send('r|'+asChar(START+ANA_WRITE+((pin&7)<<1)+(val>>7))+asChar(val&127));
    };

    this.watchPin = function(pin, handler) {
      if(pin<=13) this.ws.send('r|'+asChar(START+DIGI_WATCH+(pin&15)));
      else this.ws.send('r|'+asChar(START+DIGI_WATCH_2+((pin-13)&7)));
      this.digiHandlers[pin] = handler;
    };

    this.analogReport = function(pin, interval, handler) {
      interval/=2;
      if(interval<256){
        this.ws.send('r|'+asChar(START+ANA_REPORT+((pin&7)<<1)+(interval>>7))+asChar(interval&127));
        this.anaHandlers[pin] = handler;
      }
      else console.log('interval must be less than 512');
    };

    this.setAnalogHandler = function(pin, handler) {
      this.anaHandlers[pin] = handler;
    };

    this.setHandler = function(pin, handler) {
      this.handlers[pin] = handler;
    };

    this.analogRead = function(pin) {
      this.ws.send('r|'+asChar(START+ANA_READ+((pin&7)<<1)));
    };

    this.stopReport = function(pin) {
      this.ws.send(asChar(START+ANA_REPORT+((pin&7)<<1))+asChar(0));
    };

    this.onConnect = function(){console.log('woops');};
    this.connectCB = function () {
      this.onConnect();
      var inputPins = [].slice.call(this.querySelectorAll('input-pin'));
      inputPins.forEach(function(item, i, arr) {
        if(item.type === 'analog'){
          //console.log(item.pin);
          _this.analogReport(item.pin,item.report,function (pin,val) {
            //console.log(pin + ' is ' + val);
            if(item.target)
              item.target.newValue(map(val,item.min,item.max,0,1),item.which);
          });
        }
        else if(item.type === 'digital'){
          _this.watchPin(item.pin,function (pin,val){
            item.target[item.which](val);
          });
        }
      });
    }

    this.createdCallback = function () {
      var _this = this;
      µ('web-socket').onArduinoConnect = this.connectCB.bind(_this);
      this.ws = µ('web-socket');
      if(typeof µ('web-socket') === 'object')
        µ('web-socket').customCallback = this.onMessage.bind(this);

    }
  });

  ////////////////////////////////////////////////
  //  custom elements
  ////////////////////////////////////////////////

  // create the elements used for hardware input

  var inPut = inheritFrom(HTMLElement, function() {
    this.onData = function(val) {

    };

    this.createdCallback = function() {
      this.type = this.getAttribute('type');
      this.pin = this.getAttribute('pin');
      if(this.type == 'analog'){
        this.min = µ('|>low',this);
        this.max = µ('|>hi',this);
        this.report = this.getAttribute('report');
        var result = this.getAttribute('result');
        if (result&&result.length > 1) {
          result = result.split('.');
          this.target = µ(result[0]);
          this.which = result[1];
        }
      }
      else if (this.type == 'digital') {
        var result = this.getAttribute('result');
        if (result) {
          result=result.split('.');
          this.target = µ(result[0]);
          this.which = result[1];
        }
        this.debounce =0;
        this.hit = false;
        var temp = this.getAttribute('debounce');
        if(temp) this.debounce = parseInt(temp);
      }
    };
  });

  document.registerElement('in-put', inPut);

  // create the elements used for hardware output

  var outPut = inheritFrom(HTMLElement, function() {
    this.mode = true;

    this.set = function(val) {
      if(this.mode) this.parentElement.analogWrite(this.pin,val);
      else this.parentElement.digitalWrite(this.pin,val);
    };

    this.createdCallback = function() {
      this.type = this.getAttribute('type');
      this.pin = this.getAttribute('pin');
      if(this.type == 'analog'){
        this.mode = false;
      } else {
        this.mode = true;
      }
    };
  });

  document.registerElement('out-put', outPut);

  /////////////////////////////////////////////////////////////
  // create the hard-ware tag. inherit the functions from the arduino,
  // in order to send the control information to the arduino.
  /////////////////////////////////////////////////////////////

  var hardWare = inheritFrom(webArduino, function() {
    // function to call when the websocket server connects to the serial port.
    this.connectCB = function() {
      var _this = this;
      this.onConnect();
      var inputs = [].slice.call(this.querySelectorAll('in-put'));
      inputs.forEach(function(item, i, arr) {
        if(item.type === 'analog'){
          console.log(item.pin);
          _this.analogReport(item.pin,item.report,function (pin,val) {
            if(item.min&&item.max) val = map(val,item.min,item.max,0,1);
            if(!item.target) item.onData(val);
            else item.target[item.which](val);
          });
        }
        else if(item.type === 'digital'){
          _this.watchPin(item.pin,function (pin,val){
            if(!item.hit){
              if(!item.target) item.onData(val);
              else item.target[item.which](val);

              item.hit = true;
              item.dbTimer = setTimeout(function () {item.hit = false; },item.debounce);
            }
          });
        }
      });
    };

    this.createdCallback = function() {
      var _this = this;
      this.serial = this.getAttribute('serialport');
      console.log(this.serial);
      this.ws = new websocket();
      this.ws.messageCallback = _this.onMessage.bind(_this);
      this.ws.connectCallback = function () {
        _this.ws.openSerialPort(_this.serial,_this.connectCB.bind(_this));
      }
      this.ws.connect();
    };
  });

  document.registerElement('hard-ware', hardWare);
});
