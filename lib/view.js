define(['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arr_foreach = Array.prototype.forEach;

function view () {}

view.prototype = {
    init: function (el, params) {
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
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
    init_subviews: function () {
        var module = this;
        pilot.render(module.el, module.params);
    },
    destroy: function () {
        this.events.destroy();
    }
};

return view;

});
