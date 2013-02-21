;(function (window, Pilot, undefined) {
"use strict";

var JSON = window.JSON,
    obj_tostr = {}.toString,
    arr_slice = [].slice;

Pilot.utils = {
    // get the real type of an object in lowercase
    get_type: function (o) {
        return obj_tostr.call(o).replace('[object ', '').slice(0, -1).toLowerCase();
    },

    // make a date pretty
    format_date: function (d, format) {
    },

    // show a date relative to now (unless more than 2 days old, then just make it pretty
    format_date_relative: function (d) {
        d = d instanceof Date ? d : new Date(d);
        var delta = ~~((Date.now() - d.getTime()) / 1000),
            minute = 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;

        return delta < 30 ? 'Just now' :
            delta < minute ? delta + ' seconds ago' :
            delta < 2 * minute ? 'A minute ago' :
            delta < hour ? delta + ' minutes ago' :
            delta < hour * 2 ? 'An hour ago' :
            delta < day ? delta + ' hours ago' :
            delta < day * 2 ? 'Yesterday' :
            Pilot.utils.format_date(d);
    },

    // shorten a number -- 1000 becomes 1k, 1000000 becomes 1m, etc.
    trim_number: function (n, precision) {
        n = +n;
        var len = Math.floor((n.length - 1) / 3),
            trim_until = n.length - len * 3,
            trimmed1 = n.slice(0, trim_until),
            trimmed2 = precision ? n.slice(trim_until, trim_until + precision) : '',
            size = ['', 'k', 'm', 'b', 't'][len],
            trimmed = trimmed1 + (trimmed2.length ? '.' + trimmed2 : '') + size;
        return size.length ? trimmed : ''+n;
    },

    // trim a string and append an ellipsis
    trim_string: function (s, len) {
        len = len || 60;
        if (len >= str.length) {
            return str;
        }
        len = str.indexOf(' ', len);
        return str.slice(0, len) + '&hellip;';
    },

    // trim the middle of a url out
    trim_url: function (url, len) {
        str = str.replace(/^https?:\/\/(?:www\.)?/, '');
        len = len || 60;
        if (len >= str.length) {
            return str;
        }
        var locations = [],
            last = str.indexOf('/'),
            m = ['', ''];
        while (last > 0) {
            locations.push(last);
            last = str.indexOf('/', last + 1);
        }
        if (str.charAt(str.length - 1) == '/') {
            locations.pop();
        }
        if (locations.length <= 1) {
            return str;
        }
        m[1] = str.slice(locations.pop());
        m[0] = str.slice(0, locations.pop() + 1);
        while (m.join('').length > len && locations.length > 1) {
            m[0] = str.slice(0, locations.pop() + 1);
        }
        return m.join('&hellip;');
    },

    // add commas to a long number
    format_number: function (n) {
        n = +n;
        return n != n ? '0' :
            (''+Math.round(n)).split('').reverse().join('').match(/.{1,3}/g).join().split('').reverse().join('');
    },

    // create a simple hash from a string
    hash: function (s) { 
        for (var h = 0, x = 0, xl = s.length; x < xl; x++) { 
            h = (h << 5) - h + s.charCodeAt(x);
            h &= h;
        }
        return h;
    },

    // decodes HTML entities
    decode_entities: function (s) {
        return s.replace(/&#(\d+);?/g, function(a, c) {
            return String.fromCharCode(c)
        });
    },

    // encodes non-word characters into their HTML entity equivalent
    encode_entities: function (s) {
        return s.replace(/(\W)/g, function(c, p, i) {
            return '&#' + s.charCodeAt(i) + ';';
        });
    },

    // add a shallow copy of one object to another, retaining the original properties
    extend: function (t, s) {
        for (var x in s) {
            s.hasOwnProperty(x) && (t[x] = s[x]);
        }
        return t;
    },

    // make something into json
    toJSON: function (v) {
        return JSON.stringify(v);
    },

    // parse json into a native form
    fromJSON: function (v) {
        return JSON.parse(v);
    },

    memoize: function (fn, context) {
        return function () {
            var args = arr_slice.call(arguments),
                hash = '',
                x = args.length,
                current = null;
            fn.memoize = context || fn.memoize || {};
            while (x--) {
                current = args[x];
                hash = hash + (current === Object(current)) ?
                    JSON.stringify(current) :
                    current;
            }
            return (fn.memoize.hasOwnProperty(hash)) ?
                fn.memoize[hash] :
                fn.memoize[hash] = fn.apply(this , args);
        };
    },

    // changes foo to Foo
    capitalize: function (s) {
        return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
    }
};

})(window, Pilot);
