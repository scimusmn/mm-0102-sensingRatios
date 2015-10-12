include(['src/arduinoControl.js'], function() {
  var inPut = inheritFrom(HTMLElement, function() {
    this.handler = function(val) {

    };

    this.createdCallback = function() {

    };
  });

  document.registerElement('in-put', inPut);

  var outPut = inheritFrom(HTMLElement, function() {
    this.mode = true;

    this.set = function(val) {
    };

    this.createdCallback = function() {

    };
  });

  document.registerElement('out-put', outPut);

  var hardWare = inheritFrom(webArduino, function() {
    this.connectCB = function() {

    };

    this.createdCallback = function() {

    };
  });

  document.registerElement('hard-ware', hardWare);
});
