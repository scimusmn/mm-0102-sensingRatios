var web_socket = inheritFrom(HTMLElement,function(){
  this.address = "ws://localhost:8080/",
  this.customCallback = function (evt) {},
  this.connectCallback = function () {};
  this.onArduinoConnect = function () {};
  this.connectInterval = null,
  this.serialport = "",
  this.send = function(msg){},
  this.connect = function(){
        var self = this;
        if ("WebSocket" in window){
            var ws = new WebSocket(this.address); //ws://echo.websocket.org is the default testing server
            ws.onopen = function()
            {
                // Web Socket is connected, send data using send()
                clearInterval(self.connectInterval);
                self.connectCallback();
                ws.onmessage = function (evt) {
                    var spl = evt.data.split("=")
                    if(spl[0]=="sp"){
                      if(spl[1]=="err")
                        console.log(self.serialport+" does not exist");
                      else if(spl[1]=="ack"){
                        setTimeout(self.onArduinoConnect,2000);
                        console.log("Connection successful");
                      }
                    }
                    else self.customCallback(evt);
                };
                if(self.serialport.length){
                  console.log("Attempting connection to "+self.serialport+"...");
                  ws.send("sp|"+self.serialport)
                }
            };
            ws.onerror = function ( error ) {
                //if ("WebSocket" in window) self.connectInterval = setInterval(self.connect.bind(self),2000);
            }
            ws.onclose = function(){
                //self.connectInterval = setInterval(self.connect.bind(self),2000);
            };
            this.send = function (msg) {
                ws.send(msg);
            }
        }
       else {
       		clearInterval(self.connectInterval);
       		console.log("Websocket not supported");
       }
	}
  this.createdCallback = function () {
    var self = this;
    self.serialport = self.getAttribute("serialport");
    self.connect();
  }
});

document.registerElement('web-socket', web_socket);
