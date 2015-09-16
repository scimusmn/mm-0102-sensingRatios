var includeManager = new function(){
  var self =this;
  this.root =document.location.origin+document.location.pathname;
  this.includes = [];
  this.register = function (srcs,loadFxn,callSrc) {
    var src = callSrc.substring(this.root.length);
    this.includes[src]={src:src,srcs:srcs,loadFxn:loadFxn,done:false,dependents:[]};
  }

  this.checkIncludes = function (src) {
    if(~src.indexOf(self.root)) src = src.substring(self.root.length);
    var incl = self.includes[src];
    //console.log("Checking includes for "+src);
    if(typeof incl == 'object'){
      var loaded = true;
      for (var i = 0; i < incl.srcs.length; i++) {
        var next =self.includes[incl.srcs[i]];
        if(typeof next == 'object'){
          //console.log(next.src+" is "+((next.done)?"done":"not done"));
          if(!next.done){
            loaded = false;
            if(next.dependents.indexOf(src)==-1) next.dependents.push(src);
          }
        }
      }
      if(loaded){
        //console.log(incl.src+" and includes are done");
        incl.done=true;
        if(typeof incl.loadFxn == 'function') incl.loadFxn();
        for (var i = 0; i < incl.dependents.length; i++) {
          //console.log("recheck "+incl.dependents[i]);
          self.checkIncludes(incl.dependents[i]);
        }
      }
    }
  }
}

function include(srcLocations,onLoaded){
  //console.log("includes for "+document.currentScript.src);
  var curScript = document.currentScript.src;
  var numLoaded = 0;
  includeManager.register(srcLocations,onLoaded,curScript);
  var loaded = function () {
    if(++numLoaded>=srcLocations.length){
      includeManager.checkIncludes(curScript)
    }
  }
  var scripts = [].slice.call(document.querySelectorAll("script"));
  var found =false;
  for (var i = 0; i < srcLocations.length; i++) {
    //console.log("-->"+srcLocations[i]);
    scripts.forEach(function (item,index,array) {
      if(item.getAttribute("src")==srcLocations[i]) found=true;
    });
    if(!found){
      var scrpt = document.createElement("script");
      scrpt.src = srcLocations[i];
      scrpt.addEventListener('load', loaded, false);
      document.head.insertBefore(scrpt,document.currentScript);//
    }
  }
}

var includer = new function (){

  this.script = document.currentScript;
  this.app = this.script.getAttribute("main");

  include(["src/smm_utils.js",this.app]);
};
