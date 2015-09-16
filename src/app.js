include(["src/arduinoControl.js","src/smm_graph.js","src/vendor/timbre.js"],function () {

  var left = T("sin", {freq:440,mul:.05});
  var right = T("sin", {freq:440,mul:.05});

  left.newVal = 0;
  right.newVal = 0;

  function ramp(channel,newVal) {
    if(Math.abs(channel.freq.value-newVal)>.4){
      channel.newVal = newVal;
      channel.freq.value -= sign(channel.freq.value-channel.newVal)*.4;
      setTimeout(function(){ramp(channel,channel.newVal);},1);
    }
    else channel.freq.value = newVal;
  }

  $("#trace").addEventListener('mousemove', function(evt) {
    var rect = this.getBoundingClientRect();
    this.mouse = {
      x: (evt.clientX - rect.left)/this.width,
      y: (evt.clientY - rect.top)/this.height
    };
    this.addPoint(this.mouse);
  }, false);

  window.onresize = function(){
    $("#trace").height=$("#trace").clientHeight;
    $("#trace").width= $("#trace").clientWidth;
  }

  $("#trace").onNewPoint = function () {
    ramp(left,Math.pow(2,$("#trace").lastPoint().x*7+4));
    ramp(right,Math.pow(2,$("#trace").lastPoint().y*7+4));
  }

  $("#trace").fade = true;
  $("#trace").lineColor = "#f00";

  var pos = T(0);
  var posRight = T(1);

  T("pan", {pos:pos}, left).play();
  T("pan", {pos:posRight}, right).play();
  //T("pan", {pos:1}, T("sin", {freq:330})).play();
  

  setInterval(function(){$("#trace").draw();},1000/30);
});
