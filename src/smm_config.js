var configFile = inheritFrom(HTMLElement, function() {
  this.loaded = false;
  this.onLoad = function() {};

  this.createdCallback = function() {
    var _this = this;
    _this.loaded = true;
    var fileAddress = this.getAttribute('file');
    ajax(fileAddress, function(xml) {
      var kids = xml.firstChild.children;
      for (var i = 0; i < kids.length; i++) {
        var temp = kids[i].innerHTML;
        var type = kids[i].getAttribute('type');
        if (type == 'num') temp = parseFloat(temp);
        _this[kids[i].tagName] = temp;
      }
    });
  };
});

document.registerElement('config-file', configFile);
