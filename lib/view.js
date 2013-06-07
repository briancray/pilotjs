define(['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arr_foreach = Array.prototype.forEach;
var instances = [];

function view () {}

view.prototype = {
    init: function (el, params) {
        instances.push(this);
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.model = new model().init(this.id);
        this.render();
        view.load(this.el);
        return this;
    },
    render: function () {
        this.el.innerHTML = '';
    },
    destroy: function () {
        this.events.destroy();
    }
};

view.load = function (context, params) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    params = typeof params === 'object' ? params : {};
    var url_params = {};
    window.location.search.slice(1).split('&').forEach(function (param) {
        var key_val = param.split('=');
        url_params[decodeURIComponent(key_val[0])] = decodeURIComponent(key_val.slice(1).join(''));
    });
    params = pilot.extend(url_params, params);
    arr_foreach.call(context.getElementsByClassName('view'), function (el_view) {
        var data_view = el_view.getAttribute('data-view') || '';
        data_view && require([data_view.split('.')[0]], function (view_module) {
            new view_module().init(el_view, params);
        });
    });
};

view.unload = function (context) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    instances = instances.filter(function (instance) {
        if (context.contains(instance.el)) {
            instance.destroy();
            return false;
        }
        return true;
    });
};

return view;

});
