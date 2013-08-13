define([], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
var allData = {};

function model () {}

model.prototype = {
    init: function (id, initial) {
        if (typeof id === 'string') {
            this.id = id;
            if (allData[id]) {
                this.synced = true;
                this.data = allData[id];
            }
            else {
                this.synced = false;
                this.data = allData[id] = initial || {};
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
    get: function (key, defaultValue) {
        var keys, currentKey, currentValue;
        if (!key || typeof key !== 'string') {
            return this.data;
        }
        else if (key.indexOf('.') === -1) {
            return this.data[key];
        }
        keys = key.split('.'),
        currentKey = keys[x],
        currentValue = this.data;
        for (var x = 0, xl = keys.length; x < xl; currentKey = keys[++x]) {
            currentValue = currentValue[currentKey];
            if (typeof currentValue === 'undefined') {
                return defaultValue;
            }
        }
        return currentValue;
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
                allData[this.id] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.id);
                delete allData[this.id];
            }
        }
        else {
            data = localStorage.getItem('data' + this.id);
            data ? (this.data = allData[this.id] = fromJSON(data) || {}) : (this.data = allData[this.data] = {});
            this.synced = true;
        }
    }
};

return model;

});
