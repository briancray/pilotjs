define(['pilot/view'], function (view) {
"use strict";

function module () {}

module.prototype = new view;

module.prototype.generate = function () {
    return '<div class="view" data-view="views/subview"></div>';
};

return module;

});
