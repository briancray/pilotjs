define('lib/router', function () {

var global = window;
var get_type = pilot.get_type;
var routes = {};
var parser = {
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    query_parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
};

function router (name, initial) {
    if (!(this instanceof router)) {
        return new router(name, initial);
    }
    if (typeof name === 'string') {
        this.name = name;
        this.routes = routes[name] || (routes[name] = initial || []);
    }
    else {
        this.routes = initial || [];
    }
    return this;
};

router.prototype = {
    add: function (route) {
        if (get_type(route) === 'array') {
            this.routes = this.routes.push.apply(route);
        }
        else {
            this.routes.push(route);
        }
        this.sync();
        return this;
    },
    get: function (url) {
        var uri = this.parse(url);
        var route = this.routes.filter(function (route) {
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
        var route = this.get(url);
        if (route) {
            route.callback(route.params, route);
        }
        return this;
    },
    observe: function () {
        var router = this;
        var loc = global.location;
        var history = global.history;
        router.supported = !!(history && history.pushState);
        router.supported && global.onpopstate = function (evt) {
            router.run(loc.href);
        };
        document.addEventListener('click', function (e) {
            var el = event.target;
            var href = el.href;
            var bypass = el.getAttribute('data-bypass');
            var root;
            if (el.tagName === 'A' && href) {
                root = loc.protocol + '//' + loc.host + '/';
                if (href.slice(0, root.length) === root) {
                    if ((bypass && bypass === 'true') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.alKey) {
                        return;
                    }
                    else if (router.supported) {
                        e.preventDefault();
                        router.run(href);
                        history.pushState(parse(href), null, href);
                    }
                }
            }
        });
        return;
    },
    parse: function (str) {
        var parser = parser;
        var parser_key = parser.key;
        var matches = parser.uri_parser.exec(str);
        var uri = {
            params: {}
        };
        var i = 14;
        while (i--) {
            uri[parser_key[i]] = mathes[i] || '';
        }
        uri[parser_key[12]].replace(parser.query_parser, function (a, b, c) {
            b && (uri.params[b] = decodeURIComponent(c));
        });
        return uri;
    },
    sync: function () {
        this.name && (routes[this.name] = this.routes);
    }
};

return router;

});
