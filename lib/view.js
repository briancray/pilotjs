define(['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arr_foreach = Array.prototype.forEach;

function view () {}

view.prototype = {
    init: function (el, params) {
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        this.id = this.id.indexOf('!') !== -1 ? this.id.split('!')[0] : this.id;
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.model = new model().init(this.id);
        this.app_events();
        this.dom_events();
        this.render();
        return this;
    },
    app_events: function () {
    },
    dom_events: function () {
    },
    render: function () {
        this.el.innerHTML = this.generate();
        this.init_subviews();
    },
    generate: function () {
        return '';
    },
    init_subviews: function (subviews) {
        var module = this;
        arr_foreach.call(module.el.getElementsByClassName('view'), function (el_view) {
            var data_view = el_view.getAttribute('data-view') || '';
            if (data_view) {
                data_view = data_view.indexOf('!') !== -1 ? data_view.split('!')[1] : data_view;
                require([data_view], function (view_module) {
                    new view_module().init(el_view, module.params);
                });
            }
        });
    },
    destroy: function () {
        this.events.destroy();
    }
};

return view;

});
