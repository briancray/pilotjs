;(function (window, undefined) {
"use strict";

var cache = {
    synced: false,
    data: {},
    instances: {}
};

// Pilot.Data is an arbitrary data set
Pilot.Data = function (id, is_private) {
    if (this instanceof Pilot.Data) {
        this.is_private = is_private;
        this.data = !is_private ? (cache.data[id] = cache.data[id] || {}) : {};
        this.id = id;
        return this;
    }
    return cache.instances[id] || (cache.instances[id] = new Pilot.Data(id));
};

Pilot.Data.prototype = {
    set: function (k, v) {
        switch (Pilot.utils.get_type(k)) {
            case 'string':
                this.data[k] = v;
                break;
            case 'object':
                Pilot.utils.extend(this.data[x], k[x]);
                break;
        }
        !this.is_private && Pilot.Data.sync();
    },
    get: function (k) {
        return k ? this.data[k] : this.data;
    },
    remove: function (k) {
        k ? (delete this.data[k], delete cache.data[this.id][k]) : (this.data = cache.data[this.id] = {});
        !this.is_private && Pilot.Data.sync();
    },
    destroy: function () {
        if (!this.is_private) {
            delete cache.data[this.id];
            Pilot.Data.sync();
        }
        delete cache.instances[this.id];
    }
};

Pilot.Data.sync = function () {
    if (!cache.synced) {
        var data = localStorage.getItem('data');
        data ? (cache.data = Pilot.utils.fromJSON(data) || {}) : (cache.data = {});
        cache.synced = true;
    }
    else {
        localStorage.setItem('data', Pilot.utils.toJSON(cache.data));
    }
};

Pilot.Data.sync();

})(window);
