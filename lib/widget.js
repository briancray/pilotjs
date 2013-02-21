;(function (window, Pilot, undefined) {
"use strict";

var arr_slice = [].slice,
    extend = Pilot.utils.extend;

var Widget = Pilot.Widget = Pilot.extend({
    init: function () {
        this.element = this.get_element();
        this.events = Pilot.Pubsub('.module.' + this.id, true);
        this.data = Pilot.Data('.module.' + this.id, true);
    },
    queue: function (method) {
        if (typeof this.method === 'function') {
            this.method.apply(this, arr_slice.call(arguments, 1));
        }
        else {
            (this.command_queue || (this.command_queue = [])).push(arr_slice.call(arguments));
        }
    },
    get_element: function () {
        var widget = this,
            widget_elements = document.getElementsByClassName('widget');
        return Array.prototype.filter.call(widget_elements, function (element) {
            return element.getAttribute('data-widget') === widget.id;
        })[0];
    },
    destroy: function () {
        this.events.destroy();
        delete Widget.instances[this.id];
    }
});

Widget.type = 'widget';

Widget.render = function () {
    var widget_elements = arr_slice.call(document.getElementsByClassName('widget')),
        active_widgets = {},
        instances = Widget.instances;
    widget_elements.forEach(function (element) {
        var id = element.getAttribute('data-widget');
        active_widgets[id] = Widget(id);
    });
    for (var id in instances) {
        if (!active_widgets[id]) {
            instances[id].unload && instances[id].unload();
            instances[id].destroy();
        }
    }
    Pilot.Pubsub.trigger('refresh');
};

})(window, Pilot);
