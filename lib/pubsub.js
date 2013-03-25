define('lib/pubsub', function () {
"use strict";

var arr_slice = Array.prototype.slice;
var handlers = {};

var pubsub = {
    on: function (e, handler) {
        var event_info, event_name, event_namespace;
        if (!e || !handler) {
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        event_name && (handlers[event_name] = handlers[event_name] || []).push({handler: handler, retain: true, namespace: event_namespace});
        return pubsub;
    },
    one: function (e, handler) {
        var event_info, event_name, event_namespace;
        if (!e || !handler) {
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        event_name && (handlers[event_name] = handlers[event_name] || []).push({handler: handler, retain: false, namespace: event_namespace});
        return pubsub;
    },
    off: function (e) {
        var event_info, event_name, event_namespace;
        if (!e) {
            handlers = {};
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        function clear_namespace (h) {
            return h.namespace !== event_namespace;
        }
        if (event_name) {
            if (!event_namespace) {
                handlers[event_name] = null;
            }
            else {
                handlers[event_name] = (handlers[event_name] || []).filter(clear_namespace);
            }
        }
        else {
            for (var x in handlers) {
                handlers.hasOwnProperty(x) && (handlers[x] = (handlers[x] || []).filter(clear_namespace));
            }
        }
        return pubsub;
    },
    trigger: function (event_name) {
        var args;
        if (!e) {
            return pubsub;
        }
        args = arr_slice.call(arguments, 1);
        handlers[event_name] = (handlers[event_name] || []).filter(function (h) {
            return h.handler.apply(null, args), h.retain;
        });
        return pubsub;
    }
};

return pubsub;

});
