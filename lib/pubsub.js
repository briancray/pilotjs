define([], function () {
"use strict";

var arrSlice = Array.prototype.slice;
var instances = {};
var dateNow = Date.now;

function Pubsub () {}

Pubsub.prototype = {
    init: function (id) {
        this.id = typeof id === 'string' ? id : pilot.generateId('pubsub');
        this.handlers = {};
        return instances[this.id] = this;
    },
    on: function (e, handler, retain) {
        retain = typeof retain === 'undefined' ? true : retain;
        var handlers = this.handlers[e] || (this.handlers[e] = []);
        handlers.push({handler: handler, retain: retain});
        return this;
    },
    one: function (e, handler) {
        return this.on(e, handler, false);
    },
    off: function (e) {
        if (e && typeof e === 'string') {
            this.handlers[e] = [];
        }
        else if (typeof e === 'undefined') {
            this.handlers = {};
        }
        return this;
    },
    trigger: function (e) {
        var handlers, args, nsIndex;
        if ((nsIndex = e.indexOf('.local')) !== -1) {
            args = arrSlice.call(arguments, 1);
            e = e.slice(0, nsIndex);
            handlers = this.handlers[e];
            if (handlers && handlers.length) {
                this.handlers[e] = handlers.filter(function (h) {
                    return h.handler.apply(null, args), h.retain;
                });
            }
        }
        else {
            args = arrSlice.call(arguments, 0);
            Pubsub.trigger.apply(null, args);
        }
        return this;
    },
    destroy: function (e) {
        instances[this.id] = null;
    }
};

Pubsub.trigger = function () {
    var args, id;
    args = arrSlice.call(arguments, 0);
    args[0] = args[0] + '.local';
    for (id in instances) {
        instances.hasOwnProperty(id) && instances[id].trigger.apply(instances[id], args);
    }
};

return Pubsub;

});
