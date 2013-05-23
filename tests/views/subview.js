define('views/subview', ['pilot/view', 'subview2'], function (view, subview2) {
"use strict";

function module () {}

module.prototype = new view;

module.prototype.generate = function () {
    return subview2.generate();
};

return module;

});

define('subview2', function (view) {
"use strict";

function module () {}

module.generate = function () {
    return '<a href="/">Page 1</a>';
};

return module;

});
