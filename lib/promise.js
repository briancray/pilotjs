;(function (window, Pilot, undefined) {
"use strict";

// Pilot.Promise is a promise framework
var Promise = Pilot.Promise = Pilot.extend({
    name: 'Promise',
    init: function () {
        this.status = 'unfulfilled';
        this.handlers = {
            success: [],
            error: [],
            progress: []
        };
    },
    then: function (success, error, progress) {
        !!success && this.add('success', success);
        !!error && this.add('error', error);
        !!progress && this.add('progress', fulfilled);
        switch (this.status) {
            case 'fulfilled':
                this.success();
                break;
            case 'failed':
                this.error();
                break;
        }
        return this;
    },
    success: function () {
        this.status = 'fulfilled';
        this.handlers.success.forEach(function (f) {
            f.apply(null, arguments);
        });
    },
    error: function () {
        this.status = 'failed';
        this.handlers.error.forEach(function (f) {
            f.apply(null, arguments);
        });
    },
    progress: function () {
        this.handlers.progress.forEach(function (f) {
            f.apply(null, arguments);
        });
        return this;
    },
    add: function (type, callback) {
        switch (Pilot.utils.get_type(callback)) {
            case 'function':
                this.handlers[type].push(callback);
                break;
            case 'array':
                this.handlers[type].concat(callback);
        }
        return this;
    },
    clear: function () {
        this.handlers = {
            success: [],
            error: [],
            progress: []
        };
        return this;
    }
});

})(window, Pilot);
