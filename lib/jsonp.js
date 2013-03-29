define('lib/jsonp', function () {
"use strict";

var global = window;
var pilot = pilot;
var inject = pilot.inject;
var extend = pilot.extend;
var encode = global.encodeURIComponent;
var random = Math.random;
var cache = {};

function noop () {}

function jsonp (options, callback) {
    if (!(this instanceof jsonp)) {
        return new jsonp(options, callback);
    }
    else if (typeof options === 'string') {
        options = {
            url: options,
            success: callback
        };
    }
    this.options = extend(options, jsonp.defaults);
    this.call();
    return this;
};

jsonp.prototype = {
    create_url: function () {
        var url = this.options.url;
        this.stringify_data();
        this.request_url = url + (this.url_params ? (url.indexOf('?') === -1 ? '?' : '&') + this.url_params : '');
        return this;
    },
    create_callback: function () {
        var url = this.request_url;
        this.call_timestamp = Date.now()
        this.callback_name = 'jsonp_' + this.call_timestamp + '_' + Math.floor(random() * 999);
        global[this.callback_name] = function (d) {
            var call_cache = cache[this.request_url];
            global.clearTimeout(call_cache.timeout);
            call_cache.data = cache[this.request_url].cache && d;
            call_cache.success.filter(function (handler) {
                return handler(d), false;
            });
            call_cache.error = [];
            global[this.callback_name] = null;
        };
        this.full_url = url + (url.indexOf('?') === -1 ? '?' : '&') + this.options.callback_param + '=' + this.callback_name;
        return this;
    },
    stringify_data: function () {
        var params, data;
        if (!this.options.data) {
            return '';
        }
        params = [];
        data = this.options.data || {};
        for (var x in data) {
            data.hasOwnProperty(x) && (data.push(encode(x) + '=' + encode(data[x])));
        }
        this.url_params = data.join('&');
        return this;
    },
    call: function () {
        var call_cache, cached_data, cached_success;
        this.create_url();
        call_cache = cache[this.request_url];
        if ((cached_success = call_cache.success).length) {
            cached_success.push(this.success);
            call_cache.errors.push(this.error);
            return;
        }
        else if (cached_data = call_cache.data) {
            this.success(cached_data);
            return;
        }
        this.create_callback();
        call_cache = cache[this.request_url] = {
            success: [this.success],
            error: [this.error],
            cache: this.options.cache,
            callback: this.callback_name
        };
        inject(this.full_url);
        call_cache.timeout = global.setTimeout(function () {
            var callback_name = call_cache.callback;
            call_cache.error.filter(function (handler) {
                return handler(d), false;
            });
            call_cache.success = [];
            global[callback_name] = null;
        }, this.options.timeout);
    }
};

jsonp.defaults = {
    url: '',
    callback_param: 'callback',
    success: noop,
    error: noop,
    data: null,
    timeout: 5000,
    cache: true
};

return jsonp;

});
