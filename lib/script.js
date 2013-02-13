;(function (window, Pilot, undefined) {
"use strict";

var cache = {
    scripts: {},
},
INJECTING = 1,
INJECTED = 2;

Pilot.Script = {
    inject: function (file) {
        var p = Pilot.Promise(),
            scripts = cache.scripts;
        if (scripts[file] && scripts[file] === INJECTING) {
            return p;
        }
        else if (scripts[file] && scripts[file] === INJECTED) {
            p.success();
            return p;
        }
        var script = document.createElement('script'),
            when_ready = function () {
                scripts[file] = INJECTED;
                p.success();
            };
        scripts[file] = INJECTING;
        script.type = 'text/javascript';
        script.async = true;
        if (script.readyState) { // IE
            script.onreadystatechange = function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    when_ready();
                }
            };
        }
        else { // Others
            script.onload = when_ready;
        }
        script.src = file;
        document.head.appendChild(script);
        return p;
    }
};

})(window, Pilot);
