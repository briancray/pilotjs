;(function (window, undefined) {
"use strict";

// Pilot.Promise is a promise framework
Pilot.Promise = function () {
    if (this instanceof Pilot.Promise) {
        this.handlers = {
            success: [],
            error: [],
            progress: []
        };
        return this;
    }
    return new Pilot.Promise();
};

Pilot.Promise.prototype = {
    status: 'unfulfilled', 
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
        return this.clear();
    },
    error: function () {
        this.status = 'failed';
        this.handlers.error.forEach(function (f) {
            f.apply(null, arguments);
        });
        return this.clear();
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
};

})(window);
