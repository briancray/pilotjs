(function (window, Pilot, undefined) {
"use strict";

Pilot.Widget.Test = Pilot.Widget.extend({
    init: function () {
        this._super();
        var module = this;
        this.display();
        window.setTimeout(function () {
            Pilot.Pubsub.trigger('foo');
            module.data.set('foo', 'bar');
        }, 1000);
    },
    display: function () {
        this.element.innerHTML = '<b>' + this.data.get('foo') + '</b>';
    }
});

})(window, Pilot);
