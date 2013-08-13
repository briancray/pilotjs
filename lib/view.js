define(['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arrForEach = Array.prototype.forEach;
var instances = [];

function View () {}

View.prototype = {
    init: function (el, params) {
        instances.push(this);
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.settings = new model().init(this.id);
        this.render();
        View.load(this.el, params);
        return this;
    },
    render: function () {
        this.el.innerHTML = '';
    },
    destroy: function () {
        this.events.destroy();
    }
};

View.load = function (context, params) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    params = typeof params === 'object' ? params : {};
    var urlParams = {};
    window.location.search.slice(1).split('&').forEach(function (param) {
        var keyVal = param.split('=');
        urlParams[decodeURIComponent(keyVal[0])] = decodeURIComponent(keyVal.slice(1).join(''));
    });
    params = pilot.extend(urlParams, params);
    arrForEach.call(context.getElementsByClassName('view'), function (elView) {
        var dataView = elView.getAttribute('data-view') || '';
        dataView && require([dataView.split('.')[0]], function (viewModule) {
            new viewModule().init(elView, params);
        });
    });
};

View.unload = function (context) {
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

return View;

});
