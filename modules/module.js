controller.define('module', function (window, undefined) {
"use strict";

controller.data('module', {
});

var module = function () {
    if (!(this instanceof module)) {
        return new module();
    }
    return this;
};

module.prototype = {
};

return module;

})(window);
