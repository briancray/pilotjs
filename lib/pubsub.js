define('lib/pubsub', function () {
"use strict";

var arr_slice = Array.prototype.slice;
var handlers = {};

function pubsub (name) {
    if (!(this instanceof pubsub)) {
        return new pubsub(name);
    }
    else if (typeof name === 'string') {
        this.name = name;
        this.handlers = handlers[name] || (handlers[name] = {});
    }
    else {
        this.handlers = {};
    }
    return this;
};

pubsub.prototype = {
    on: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: true});
        this.sync();
        return this;
    },
    one: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: false});
        this.sync();
        return this;
    },
    off: function (e) {
        e ? (delete this.handlers[e]) : (this.handlers = {});
        this.sync();
        return this;
    },
    trigger: function (e) {
        trigger.apply(this, arr_slice.call(arguments, 0));
        return this;
    },
    destroy: function () {
        this.handlers = null;
        this.sync();
    },
    sync: function () {
        this.name && (handlers[this.name] = this.handlers);
    }
});

function trigger (e) {
    var args = arr_slice.call(arguments, 1);
    function run_handler (h) {
        return h.handler.apply(null, args), h.retain;
    };
    if (this.name) {
        for (var x in handlers) {
            handlers.hasOwnProperty[x] && handlers[x][e] = (handlers[x][e] || []).filter(run_handler);
        }
    }
    else {
        this.handlers[e] = (handlers[e] || []).filter(run_handler);
    }
};

return pubsub;

});
