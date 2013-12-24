define(function () {
    // the window.$. can be zepto
    var $ = window.$;
    if (!window.DEBUG) {
        if ($.noConflict) {
            $ = $.noConflict();
        }
        delete window.$;
    }

    return $;
});
