define(['pilot/pubsub'], function (pubsub) {

var global = window;
var loc = global.location;
var root = loc.protocol + '//' + loc.host + '/';
var root_len = root.length;
var history = global.history;
var get_type = pilot.get_type;
var routes = [];
var parser = {
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    query_parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
};
var events = pubsub();

if (history && history.pushState) {
    global.onpopstate = function () {
        router.run(loc.href);
    };
    document.addEventListener('click', function (e) {
        var el = e.target;
        var href = el.href;
        var bypass;
        if (href && href.indexOf('#') !== 0 && href.slice(0, root_len) === root) {
            bypass = el.getAttribute('data-bypass');
            if ((bypass && bypass === 'true') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }
            e.preventDefault();
            router.run(href);
            history.pushState(parse(href), null, href);
        }
    });
}

var router = {
    add: function (route) {
        if (get_type(route) === 'Array') {
            routes.push.apply(routes, route);
        }
        else {
            routes.push(route);
        }
        return router;
    },
    get: function (url) {
        var uri = router.parse(url);
        var route = routes.filter(function (route) {
            return route.route && route.route.test(uri.path);
        })[0];
        var matches;
        if (route) {
            route.params = uri.params;
            matches = uri.path.match(route.route).slice(1);
            if (matches && matches.length && route.matches.length) {
                matches.forEach(function (match) {
                    route.params[route.matches[match]] = decodeURIComponent(matches[match]);
                });
            }
        }
        return route;
    },
    run: function (url) {
        var route = router.get(url);
        if (route) {
            events.trigger('unload', route.params);
            route.callback(route.params);
            events.trigger('load', route.params);
        }
        return router;
    },
    parse: function (str) {
        var parser_key = parser.key;
        var matches = parser.uri_parser.exec(str);
        var uri = {
            params: {}
        };
        var i = 14;
        while (i--) {
            uri[parser_key[i]] = matches[i] || '';
        }
        uri[parser_key[12]].replace(parser.query_parser, function (a, b, c) {
            b && (uri.params[b] = decodeURIComponent(c));
        });
        return uri;
    }
};

return router;

});
