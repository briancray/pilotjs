(function (window, Pilot, undefined) {
"use strict";

Pilot.Widget.Test2 = Pilot.Widget.extend({
    init: function () {
        this._super();
        var module = this;
        module.events.on('foo', function () {
            module.display();
        });
        return this;
    },
    display: function () {
        this.element.innerHTML = '<b>test2</b>';
    }
});

})(window, Pilot);
