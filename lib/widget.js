;(function (window, Pilot, undefined) {
"use strict";

var arr = [],
    arr_slice = arr.slice,
    arr_filter = arr.filter,
    arr_forEach = arr.forEach,
    extend = Pilot.utils.extend,
    widget_elements = document.getElementsByClassName('widget');

var Widget = Pilot.Widget = Pilot.extend({
    init: function () {
        this.element = this.get_element();
        this.events = Pilot.Pubsub('.module.' + this.id, true);
        this.data = Pilot.Data('.module.' + this.id, true);
    },
    get_element: function () {
        var widget = this;
        return arr_filter.call(widget_elements, function (element) {
            return element.getAttribute('data-widget') === widget.id;
        })[0];
    },
    destroy: function () {
        this.events.destroy();
        this.data.destroy();
        delete Widget.instances[this.id];
    }
});

Widget.type = 'widget';

Widget.render = function () {
    var active_widgets = {},
        instances = Widget.instances;
    arr_forEach.call(widget_elements, function (element) {
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
