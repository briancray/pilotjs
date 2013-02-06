pilot.modules.define('test', function () {
"use strict";

return {
    load: function () {
        var module = this;
        this.display();
        window.setTimeout(function () {
            module.events.trigger('foo');
        }, 1000);
    },
    display: function () {
        this.element.innerHTML = '<b>test</b>';
    }
};

});
