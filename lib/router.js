define('lib/router', function () {

var global = window;
var loc = global.location;
var root = loc.protocol + '//' + loc.host + '/';
var history = global.history;
var get_type = pilot.get_type;
var routes;
var parser = {
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    query_parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
};

function route_click (e) {
    var el = e.target;
    var href = el.href;
    var bypass;
    if (el.tagName === 'A' && href && href.indexOf('#') !== 0) {
        bypass = el.getAttribute('data-bypass');
        if (href.slice(0, root.length) === root) {
            if ((bypass && bypass === 'true') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.alKey) {
                return;
            }
            e.preventDefault();
            router.run(href);
            history.pushState(parse(href), null, href);
        }
    }
}

function route_loc () {
    router.run(loc.href);
}

if (history && history.pushState) {
    global.onpopstate = route_loc;
    document.addEventListener('click', route_click);
}

var router = {
    add: function (route) {
        if (get_type(route) === 'array') {
            routes = routes.push.apply(route);
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
            route.callback(route.params, route);
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
