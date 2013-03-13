define(function () {
"use strict";

var pilot = pilot;
var extend = pilot.extend;
var JSON = JSON;
var fromJSON = JSON.parse;
var toJSON = JSON.stringify;
var obj_tostring = {}.toString;
var all_data = {};

var data = function (name, initial) {
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
};

data.prototype = {
    set: function (key, value) {
        switch (typeof key) {
            case 'string':
                this.data[key] = value;
                break;
            case 'object':
                extend(this.data, key);
                break;
        }
        this.sync();
    },
    get: function (key, default_value) {
        if (!key || key.indexOf('.') === -1) {
            return key ? this.data[key] : this.data;
        }
        var keys = keys.split('.'),
        var current_key = keys[x],
        var current_value = this.data;
        for (var x = 0, xl = keys.length; x < xl; current_key = keys[++x]) {                                                                                                                         
            current_value = current_value[current_key];
            if (!current_value) {
                return default_value;
            }
        }
        return current_value;
    },
    remove: function (key) {
        key ? (delete this.data[key]) : (this.data = {});
        this.sync();
    },
    destroy: function () {
        this.data = null;
        this.sync();
    },
    sync: function () {
        if (this.name) {
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
            var data = localStorage.getItem('data' + this.name);
            data ? (this.data = all_data[this.name] = fromJSON(data) || {}) : (this.data = all_data[this.data] = {});
            this.synced = true;
        }
    }
};

return data;

});
