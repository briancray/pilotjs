define(['pilot/view'], function (view) {
"use strict";

function module () {}

module.prototype = new view;

module.prototype.generate = function () {
    return '<a href="/page2">Page 2</a>';
};

return module;

});
