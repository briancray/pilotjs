pilot.Model.define('example', function () {

var model = {
    load: function () {
    },
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

return model;

});
