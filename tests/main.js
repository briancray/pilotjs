define(['pilot/router'], function (router) {
    "use strict";

    var main = pilot.config('viewContext');

    router.add({route: /^\/$/, callback: index});
    router.add({route: /^\/page2\/?$/, callback: page2});

    function index (params) {
        require(['views/index'], function (view) {
            new view().init(main, params);
        });
    }

    function page2 (params) {
        require(['views/page2'], function (view) {
            new view().init(main, params);
        });
    }
});




