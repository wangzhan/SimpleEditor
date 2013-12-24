define(function (require, exports) {
    var Backbone = require('../lib/backbone'),
        _ = require('../lib/underscore');

    /**
     * CEF 通讯类，为 CEF 封装一些编辑器函数
     *
     * @name CEF
     * @class CEF 通讯类
     */
    var CEF = _.extend({}, Backbone.Events, {
        /**
         * 保存编辑器提供的 Api
         * @private
         * @type Object
         */
        apis: {},

        /**
         * 通知 CEF 编辑器初始化完成
         * @param {HTMLElement} document 编辑区域内部的 document
         */
        ready: function (document) {
            this.CEFInstance.Ready(this.execApi.bind(this), document);
        },

        /**
         * 为 CEF 添加一个 api
         * @param {String} api Api 名
         * @param {Function} callback Api 函数
         */
        provide: function (api, callback) {
            this.apis[api] = callback;
        },

        /**
         * 执行一个 Api
         * @param {String} apiName Api 名
         * @param {Array} args Api 参数
         * @return {Object} Api 执行结果
         */
        execApi: function (apiName, args) {
            var ret = null;
            if (DEBUG) {
                ret = this.apis[apiName].apply(null, args);
            } else {
                try {
                    ret = this.apis[apiName].apply(null, args);
                } catch (e) {
                    //do nothing
                }
            }
            return ret;
        },

        /**
         * 异步请求笔记提供的 Api
         * @param {String} method api 名字
         * @param {Array} args 传入 api 的参数
         * @param {Function} callback api 执行完后的回调函数
         */
        asyncCallCEFInstance: function (method, args, callback) {
            var evt = 'on' + method;
            this.unbind(evt); // 取消之前的所有回调

            if (typeof args === 'function') {
                callback = args;
                args = [];
            }
            this.CEFInstance[method].apply(this.CEFInstance, args);

            // 为回调准备接口
            var cb = function () {
                callback.apply(null, arguments);
                this.unbind(evt, cb);
            };
            this.bind(evt, cb, this);
        },

        CEFInstance: window.CEFInstance
    });

    if (DEBUG) {
        CEF.CEFInstance = CEF.CEFInstance || {};
        _.defaults(CEF.CEFInstance, require('./CEFApiInterface'));
    }

    return CEF;
});
