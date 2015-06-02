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
EventProxy.prototype.clear = function (eventname) {
  var calls = this._callbacks;
  if (!eventname) {      
    this._callbacks = {};
  }     
  return this;
};  
/**
 * Trigger an event, firing all bound callbacks. Callbacks are passed the
 * same arguments as `trigger` is, apart from the event name.
 * Listening for `"all"` passes the true event name as the first argument.
 * @param {String} eventname Event name
 * @param {Mix} data Pass in data
 */
EventProxy.prototype.emit = function (eventname, data) {
  var list, ev, callback, i, l;
  var both = 2;
  var calls = this._callbacks;
    // ev = both ? eventname : ALL_EVENT;
    ev = eventname 
    list = calls[ev];
    // console.log(list)
    if (list) {
      for (i = 0, l = list.length; i < l; i++) {
        if (!(callback = list[i])) {
          list.splice(i, 1);
          i--;
          l--;
        } else {
          var args = [];
          var start = both ? 1 : 0;
          for (var j = start; j < arguments.length; j++) {
            args.push(arguments[j]);
          }
          callback.apply(this, args);
        }
      }
    
  }
  return this;
};

EventProxy.prototype.done = function (handler, callback) {
  var that = this;
  return function (err, data) {
    if (err) {
      // put all arguments to the error handler
      return that.emit.apply(that, ['error'].concat(SLICE.call(arguments)));
    }

    // callback(err, args1, args2, ...)
    var args = SLICE.call(arguments, 1);

    if (typeof handler === 'string') {
      // getAsync(query, ep.done('query'));
      // or
      // getAsync(query, ep.done('query', function (data) {
      //   return data.trim();
      // }));
      if (callback) {
        // only replace the args when it really return a result
        return that.emit(handler, callback.apply(null, args));
      } else {
        // put all arguments to the done handler
        //ep.done('some');
        //ep.on('some', function(args1, args2, ...){});
        // emit(handle,arg1,arg2,arg3)
        return that.emit.apply(that, [handler].concat(args));
      }
    }

    // speed improve for mostly case: `callback(err, data)`
    if (arguments.length <= 2) {
      return handler(data);
    }

    // callback(err, args1, args2, ...)
    handler.apply(null, args);
  };
};

module.exports.EventProxy = EventProxy