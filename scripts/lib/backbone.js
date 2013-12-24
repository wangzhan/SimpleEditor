define(function () {
    if (window.DEBUG) {
        return Backbone;
    }
    return Backbone.noConflict();
});
