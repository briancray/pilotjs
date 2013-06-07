define(['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arr_foreach = Array.prototype.forEach;
var instances = [];

function view () {}

view.prototype = {
    init: function (el, params) {
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        instances.push(this);
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.model = new model().init(this.id);
        this.app_events();
        this.dom_events();
        this.render();
        this.init_subviews();
        return this;
    },
    app_events: function () {
    },
    dom_events: function () {
    },
    init_subviews: function () {
        pilot.render(this.el, this.params);
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
