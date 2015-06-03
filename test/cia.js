var SLICE = Array.prototype.slice;
var CONCAT = Array.prototype.concat;
function EventProxy () {
  this._callbacks = {};
  this._fired = {};
};

EventProxy.prototype.bind = function (ev, callback) {
  this._callbacks[ev] = this._callbacks[ev] || [];
  this._callbacks[ev].push(callback);
  return this;
};
EventProxy.prototype.clear = function () {
  this._callbacks = {};       
  return this;
};  

EventProxy.prototype.fire = function (eventname, data) {
  var list = this._callbacks[eventname];    
  if (list) {
    for (var i = 0;i < list.length; i++) {              
        var args = SLICE.call(arguments, 1);
        list[i].apply(this, args);
    }    
  }
  return this;
};

EventProxy.prototype.done = function (handler) {
  var that = this;
  return function (err, data) {
    if (err) {
      // fire error event and put all arguments to the error handler
      return that.fire.apply(that, ['error'].concat(SLICE.call(arguments)));
    }
    // callback(err, args1, args2, ...) exclude err arg
    var args = SLICE.call(arguments, 1);    
    // put all arguments to the done handler
    //ep.done('some');    
    return that.fire.apply(that, [handler].concat(args));
  };
};
module.exports.EventProxy = EventProxy