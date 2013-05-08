define(['pilot/view'], function (view) {
"use strict";

function module () {}

module.prototype = new view;

module.prototype.generate = function () {
    return '<a href="/">Page 1</a>';
};

return module;

});
