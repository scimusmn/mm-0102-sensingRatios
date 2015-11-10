
// I've changed this selector function
// to use 'µ' instead of '$'. '$' is so commonly
// associated with jquery that it will be confusing
// for future developers. The change also allows
// incorporation of jquery without conflicts.
// -@tnordberg, 10/09/2015

function µ(id, elem) {
  var ret;
  var root = ((elem) ? elem : document);
  var spl = id.split('>');
  switch (spl[0].charAt(0)) {
    case '|':
      ret = root;
      break;
    default:
      ret = root.querySelector(spl[0]);
      break;
  }
  if (spl.length <= 1) return ret;
  else return ret.getAttribute(spl[1]);
};

function inheritFrom(parent, addMethods) {
  var _parent = parent;
  var ret = function() {
    if (_parent) {
      _parent.apply(this, arguments);
    }
  };

  //console.log(_parent);

  ret.prototype = Object.create(_parent && _parent.prototype, {
    constructor: {
      value: ret,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (_parent) ret.__proto__ = _parent;

  if (typeof addMethods === 'function')
    addMethods.call(ret.prototype);

  return ret;
}

Function.prototype.inherits = function(parent) {
  this.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (parent) this.__proto__ = parent;
};

function ajax(src, fxn) {
  var http = new XMLHttpRequest();
  var ret = 0;

  http.open('get', src);
  http.responseType = 'document';
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      ret = http.responseXML;
      fxn(ret);
    }
  };

  http.send(null);

  return ret;
}

/***************************************
these work like this:

For custom elements:
-----------------------------------------
var DateSpan = inheritFrom(HTMLSpanElement);

DateSpan.prototype.createdCallback = function () {
    this.textContent = 'Today's date: ' + new Date().toJSON().slice(0, 10);
  };

  document.registerElement('date-today', DateSpan);

for extending functions:
------------------------------------------
fociiActions.inherits(Array);
function fociiActions() {
  Array.apply(this,arguments);
  var self = this;
  this.addElement = function (el) {
    this.push({'elem':el,'attr':new fociiAttr()})
    return this.last().attr;
  }
  this.addFxn = function (fxn) {
    this.push(fxn);
  }
  this.addItem = function (item) {
    if(typeof item === 'function') self.addFxn(item);
    else return self.addElement(item);
  }
}
******************************************/

function b64toBlobURL(b64Data, contentType, sliceSize) {
  var parts = b64Data.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(parts[3]);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return URL.createObjectURL(blob);
}

var revokeBlobURL = function(URL) {
  window.URL.revokeObjectURL(URL);
};

var charCode = function(string) {
  return string.charCodeAt(0);
};

function degToRad(d) {
  // Converts degrees to radians
  return d * 0.0174532925199432957;
}

function itoa(i)
{
  return String.fromCharCode(i);
}

function bitRead(num, pos) {
  return (num & Math.pow(2, pos)) >> pos;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
}

Array.prototype.min = function(){
  return Math.min.apply({},this);
}

Array.prototype.max = function(){
  return Math.max.apply({},this);
}

Array.prototype.last = function(){
  return this[this.length-1];
}

function getPos(el) {
    // yay readability
    for (var lx=0, ly=0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

function aveCont(points){
  if(points===undefined) points=5;
  var samps = [];
  this.ave=0;
  var ind=0;
  var tot=0;
  for(var i=0; i<points; i++){
    samps.push(0.0);
  }

  this.changeNumSamps = function(num){
    samps.length=0;
    for(var i=0; i<num; i++){
      samps.push(0.0);
    }
  }

  this.addSample=function(val){
    tot-=samps[ind];
    samps[ind]=val;
    tot+=val;
    this.ave=tot/samps.length;
    ind=(ind+1)%samps.length;
    return this.ave;
  }

  return this;
}

function map(val,inMin,inMax,outMin,outMax){
  return (val-inMin)*(outMax-outMin)/(inMax-inMin)+outMin;
}

function clamp(val,Min,Max) {
  with (Math){
    return max(Min,min(val,Max));
  }
}

function sign(x) {
    return (x > 0) - (x < 0);
}

function zeroPad(num, size) {
  var s = num+'';
  while (s.length < size) s = '0' + s;
  return s;
}

// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
function reduce(numerator,denominator){
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(numerator,denominator);
  return [numerator/gcd, denominator/gcd];
}
