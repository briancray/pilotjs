;(function (window, Pilot, undefined) {
"use strict";

Pilot.Model = function (id) {
    var name = id.split('.')[0],
        models = cache.models,
        model = models.loaded[name];
    if (this instanceof Pilot.Model) {
        return this;
    }
    else if (!model) {
        Pilot.Script.inject('modules/' + name + '.js').then(function () {
            var model = Pilot.Model(id);
            model.load && model.load();
        });
        return models.loaded[name] = new Pilot.Model(id);
    }
    return modules.instances[id] || (modules.instances[id] = new model(id));
};

Pilot.Model.prototype = {
    get: function (k) {
        return this.data.get(k);
    },
    set: function (k, v) {
        this.data.set(k, v);
    },
    remove: function (k) {
        this.data.remove(k);
    }
};

Pilot.Model.define = function (name, definition) {
    var model = cache.model.loaded[name] = function (id) {
        this.id = id;
        this.events = Pilot.Pubsub(id);
        this.data = Pilot.Data(id);
        return this;
    };
    model.prototype = Pilot.utils.extend(definition(), Pilot.Model.prototype);
};

})(window, Pilot);
