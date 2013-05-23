define([], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
var all_data = {};

function data () {}

data.prototype = {
    init: function (id, initial) {
        if (typeof id === 'string') {
            this.id = id;
            if (all_data[id]) {
                this.synced = true;
                this.data = all_data[id];
            }
            else {
                this.synced = false;
                this.data = all_data[id] = initial || {};
                this.sync();
            }
        }
        else {
            this.data = id || {};
        }
        return this;
    },
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
    },
    sync: function () {
        var data;
        if (!this.id) {
            return;
        }
        else if (this.synced) {
            if (this.data) {
                localStorage.setItem('data.' + this.id, toJSON(this.data));
                all_data[this.id] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.id);
                delete all_data[this.id];
            }
        }
        else {
            data = localStorage.getItem('data' + this.id);
            data ? (this.data = all_data[this.id] = fromJSON(data) || {}) : (this.data = all_data[this.data] = {});
            this.synced = true;
        }
    }
};

return data;

});
