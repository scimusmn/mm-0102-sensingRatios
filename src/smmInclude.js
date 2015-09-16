var debug = false;

var includeManager = new function(){
  var self =this;
  this.root =document.location.origin+document.location.pathname;
  this.includes = [];
  this.register = function (srcs,loadFxn,src) {
    this.shorten(src);
    var dep = [];
    if(typeof this.includes[src] == 'object'){
       dep = this.includes[src].dependents;
    }
    this.includes[src]={src:src,srcs:srcs,loadFxn:loadFxn,done:false,dependents:dep};
  }

  this.shorten = function (src) {
    if(~src.indexOf(self.root)) src = src.substring(self.root.length);
    return src;
  }

  this.checkIncludes = function (src) {
    src = this.shorten(src);
    var incl = self.includes[src];
    if(debug) console.log("Checking includes for "+src);
    if(typeof incl == 'object'){
      var loaded = true;
      for (var i = 0; i < incl.srcs.length; i++) {
        var next =self.includes[incl.srcs[i]];
        if(typeof next == 'object'){
          if(debug) console.log(next.src+" is "+((next.done)?"done":"not done"));
          if(!next.done){
            loaded = false;
            if(next.dependents.indexOf(src)==-1) next.dependents.push(src);
          }
        }
      }
      if(loaded&&!incl.done){
        if(debug) console.log("Note: "+incl.src+" and includes are done");
        incl.done=true;
        if(typeof incl.loadFxn == 'function') incl.loadFxn();
        for (var i = 0; i < incl.dependents.length; i++) {
          if(debug) console.log("recheck "+incl.dependents[i]);
          self.checkIncludes(incl.dependents[i]);
        }
      }
    }
  }
}

function include(srcLocations,onLoaded){
  var curScript = includeManager.shorten(document.currentScript.src);
  if(debug) console.log("These are the includes for "+curScript);
  var numLoaded = 0;
  includeManager.register(srcLocations,onLoaded,curScript);
  var loaded = function () {
    if(++numLoaded>=srcLocations.length){
      includeManager.checkIncludes(curScript);
    }
  }
  var scripts = [].slice.call(document.querySelectorAll("script"));
  var found =false;
  for (var i = 0; i < srcLocations.length; i++) {
    if(debug) console.log("-->"+srcLocations[i]);
    scripts.forEach(function (item,index,array) {
      if(item.getAttribute("src")==srcLocations[i]) found=true;
    });
    if(!found){
      //includeManager.addDependent(srcLocations[i],curScript);
      var scrpt = document.createElement("script");
      scrpt.src = srcLocations[i];
      scrpt.addEventListener('load', loaded, false);
      if(debug) console.log(document.currentScript.parentElement);
      document.head.insertBefore(scrpt,document.currentScript);//
    }
    else loaded();
  }
}

var includer = new function (){

  this.script = document.currentScript;
  this.app = this.script.getAttribute("main");

  include(["src/smm_utils.js",this.app]);
};
