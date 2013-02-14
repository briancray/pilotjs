;(function (window, undefined) {
"use strict";

var Pilot = {
    start: function () {
        document.addEventListener('DOMContentLoaded', function () {
            Pilot.inject('lib.js');
        });
    },
        
    inject: function (file) {
        var p = Pilot.Promise ? Pilot.Promise() : {success: function () {}},
            scripts = Pilot.inject.scripts || (Pilot.inject.scripts = {});
        if (scripts[file]) {
            if (scripts[file] === 1) {
                return p;
            }
            else {
                p.success();
                return p;
            }
        }
        var script = document.createElement('script'),
            when_ready = function () {
                scripts[file] = 2;
                p.success();
            };
        scripts[file] = 1;
        script.type = 'text/javascript';
        if (script.readyState) {
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

window.Pilot = Pilot;

})(window);
