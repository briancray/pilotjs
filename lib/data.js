define([], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
var all_data = {};

function data (name, initial) {
    if (!(this instanceof data)) {
        return new data(name, initial);
    }
    else if (typeof name === 'string') {
        this.name = name;
        if (all_data[name]) {
            this.synced = true;
            this.data = all_data[name];
        }
        else {
            this.synced = false;
            this.data = all_data[name] = initial || {};
            this.sync();
        }
    }
    else {
        this.data = name || {};
    }
    return this;
};

data.prototype = {
    set: function (key, value) {
        if (typeof key === 'string') {
            this.data[key] = value;
        }
        else {
            extend(this.data, key);
        }
        this.sync();
        return this;
    },
    get: function (key, default_value) {
        var keys, current_key, current_value;
        if (!key || typeof key !== 'string') {
            return this.data;
        }
        else if (key.indexOf('.') === -1) {
            return this.data[key];
        }
        keys = key.split('.'),
        current_key = keys[x],
        current_value = this.data;
        for (var x = 0, xl = keys.length; x < xl; current_key = keys[++x]) {                                                                                                                         
            current_value = current_value[current_key];
            if (typeof current_value === 'undefined') {
                return default_value;
            }
        }
        return current_value;
    },
    remove: function (key) {
        key && typeof key === 'string' ? (delete this.data[key]) : (this.data = {});
        this.sync();
        return this;
    },
    destroy: function () {
        this.data = null;
        this.sync();
        this = null;
    },
    sync: function () {
        var data;
        if (!this.name) {
            return;
        }
        else if (this.synced) {
            if (this.data) {
                localStorage.setItem('data.' + this.name, toJSON(this.data));
                all_data[this.name] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.name);
                delete all_data[this.name];
            }
        }
        else {
            data = localStorage.getItem('data' + this.name);
            data ? (this.data = all_data[this.name] = fromJSON(data) || {}) : (this.data = all_data[this.data] = {});
            this.synced = true;
        }
    }
};

return data;

});
