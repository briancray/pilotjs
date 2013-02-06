pilot.modules.define('test2', function () {
"use strict";

return {
    load: function () {
        var module = this;
        module.display();
        module.data.set('foo', 'bar');
    },
    display: function () {
        this.element.innerHTML = '<b>test2</b>';
    }
};

});
