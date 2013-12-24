define(function (require) {
    var _ = window._;
    var $ = require('./jquery');
    
    /**
     * @param {String} id
     * @param {Boolean} 是否trim结果, 默认为true
     */
    _.tmpl = function (id, trim) {
        /*jslint devel: true*/
        var elem = document.getElementById(id + 'Tmpl');
        var html = '';

        if (elem) {
            html = elem.innerHTML;
            if (trim !== false) {
                html = $.trim(html);
            }
        } else {
            if (DEBUG) {
                console.warn('Cannot find template element', id);
            }
        }

        return _.template(html);
    };

    _.until = function (func, cond, interval) {
        interval = interval || 10;

        var wrappedFunc = _.debounce(function () {
            if (cond()) {
                func.apply(null, arguments);
            } else {
                wrappedFunc.apply(null, arguments);
            }
        }, interval);

        return wrappedFunc;
    };

    if (window.DEBUG) {
        return _;
    }
    return _.noConflict();

});
