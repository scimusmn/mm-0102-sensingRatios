include(["src/web-socket.js"],function(){

	//extending HTMLElement for the input pin elements
	var inputPin = inheritFrom(HTMLElement,function(){
		this.createdCallback = function () {
	    this.type = this.getAttribute("type");
			this.pin = this.getAttribute("pin");
			if(this.type == "analog"){
				this.min = $("|>low",this);
				this.max = $("|>hi",this);
				this.report = this.getAttribute("report");
				var result = this.getAttribute("result").split(".");
				if(result.length>1){
					this.target = $(result[0])
					this.which = result[1];
				}
			}
	  }
	});

	document.registerElement('input-pin', inputPin);

	var webArduino = inheritFrom(HTMLElement,function(){
		var self= this;
		var arduino = this;
		this.digiHandlers =[];
		this.anaHandlers =[];
		var START = 128;
		var DIGI_READ = 0;
		var DIGI_WRITE = 32;	//pins 2-13
		var ANA_READ = 64;
		var DIGI_WATCH_2 = 72; //pins 14-19
		var ANA_REPORT = 80;
		var ANA_WRITE = 96;		//pins 3,5,6,9,10,11
		var DIGI_WATCH = 112;	//pins 2-13

		var wsClient = null;

	  this.onMessage = function(evt) {
			msg = evt.data;
			if(msg.length>1)
			for(var i=0; i<msg.length; i++){
				var chr = msg.charCodeAt(i);
				if(chr&ANA_READ){  //if the packet is analogRead
					var pin = ((chr & 56)>>3);				//extract the pin number
					var val = ((chr & 7)<<7)+(msg.charCodeAt(++i)&127); //extract the value
					if(typeof self.anaHandlers[pin] == 'function') self.anaHandlers[pin](pin,val);
				}
				else if(chr&(START+DIGI_READ)){			//if the packet is digitalRead
					var pin = ((chr & 62)>>1);
					var val = chr&1;
					if(typeof self.digiHandlers[pin] == 'function') self.digiHandlers[pin](val);
				}
			}
	  };

		function asChar(val) {
			return String.fromCharCode(val);
		}

	  arduino.digitalWrite = function(pin, state) {
			if(pin<=13) wsClient.send("r|"+asChar(START+DIGI_WRITE+((pin&15)<<1)+(state&1)));
			else console.log("Pin must be less than or equal to 13");
	  };

	  arduino.digitalRead = function(pin) {
	    wsClient.send("r|"+asChar(START+DIGI_READ+(pin&31)));
	  };

	  arduino.analogWrite = function(pin, val) {
			if(val>=0&&val<256)
	    	wsClient.send("r|"+asChar(START+ANA_WRITE+((pin&7)<<1)+(val>>7))+asChar(val&127));
	  };

	  arduino.watchPin = function(pin, handler) {
	    if(pin<=13) wsClient.send("r|"+asChar(START+DIGI_WATCH+(pin&15)));
			else wsClient.send("r|"+asChar(START+DIGI_WATCH_2+((pin-13)&7)));
	    arduino.digiHandlers[pin] = handler;
	  };

	  this.analogReport = function(pin, interval, handler) {
			interval/=2;
			if(interval<256){
				wsClient.send("r|"+asChar(START+ANA_REPORT+((pin&7)<<1)+(interval>>7))+asChar(interval&127));
		    arduino.anaHandlers[pin] = handler;
			}
			else console.log("interval must be less than 512");
	  };

		arduino.setAnalogHandler = function(pin, handler) {
	    arduino.anaHandlers[pin] = handler;
	  };

	  arduino.setHandler = function(pin, handler) {
	    arduino.handlers[pin] = handler;
	  };

	  arduino.analogRead = function(pin) {
	    wsClient.send("r|"+asChar(START+ANA_READ+((pin&7)<<1)));
	  };

	  arduino.stopReport = function(pin) {
	    wsClient.send(asChar(START+ANA_REPORT+((pin&7)<<1))+asChar(0));
	  };

		arduino.onConnect = function(){};
		arduino.connectCB = function () {
			var inputPins = [].slice.call(this.querySelectorAll("input-pin"));
			inputPins.forEach(function(item, i, arr) {
				if(item.type === "analog"){
					self.analogReport(item.pin,item.report,function (pin,val) {
						item.target.newValue(map(val,item.min,item.max,0,1),item.which);
					});
				}
			});

			arduino.onConnect();
		}

		this.createdCallback = function () {
			var self = this;
			$("$web-socket").onArduinoConnect = arduino.connectCB.bind(self);
			wsClient = $("$web-socket");
	    if(typeof $("$web-socket") === 'object')
				$("$web-socket").customCallback = this.onMessage.bind(this);

	  }
	});

	document.registerElement('web-arduino', webArduino);

	window.webArduino = webArduino;
});
