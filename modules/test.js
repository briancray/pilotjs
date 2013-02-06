pilot.modules.define('test', function () {
"use strict";

return {
    load: function () {
        var module = this;
        this.display();
    },
    display: function () {
        this.element.innerHTML = '<b>test</b>';
    }
};

});
