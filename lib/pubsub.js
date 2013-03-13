define(function () {
"use strict";

var pilot = pilot;
var arr = [];
var arr_slice = arr.slice;
var handlers = {};

var pubsub = function (name) {
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
        trigger.apply(this, arguments);
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

var trigger = function (e) {
    var args = arr_slice.call(arguments, 1);
    var run_handler = function (h) {
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
