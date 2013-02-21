;(function (window, Pilot, undefined) {
"use strict";

var utils = Pilot.utils,
    extend = utils.extend,
    fromJSON = utils.fromJSON,
    toJSON = utils.toJSON,
    get_type = utils.get_type;

var Data = Pilot.Data = Pilot.extend({
    name: 'Data',
    init: function (id, is_global) {
        this.global = is_global || false;
        this.synced = false;
        this.sync();
    },
    set: function (key, value) {
        switch (get_type(key)) {
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
            x = 0,
            xl = keys.length,
            current_key = keys[x],
            current_value = this.data;
        for (; x < xl; current_key = keys[++x]) {                                                                                                                         
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
        delete Data.instances[this.id]
    },
    sync: function () {
        if (!this.global) {
            return;
        }
        else if (this.synced) {
            localStorage.setItem('data' + this.id, toJSON(this.data));
            Data.data[this.id] = this.data;
        }
        else {
            var data = localStorage.getItem('data' + this.id);
            data ? (this.data = Data.data[this.id] = fromJSON(data) || {}) : (this.data = Data.data[this.data] = {});
            this.synced = true;
        }
    }
});

Data.data = {};

})(window, Pilot);
