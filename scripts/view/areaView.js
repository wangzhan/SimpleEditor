define(function (require, exports) {
    var Backbone = require('../lib/backbone'),
        _ = require('../lib/underscore'),
        $ = require('../lib/jquery');

    var AreaView = Backbone.View.extend({
        /* -------------------- Backbone Option ----------------------- */
        tagName: 'iframe',

        className: 'area-wrap',

        /** @lends AreaView.prototype */

        /**
         * 编辑区域的 window 对象
         * @type {DOMWindow}
         */
        window: null,

        /**
         * 编辑器 ifrmae 的 head 模板
         * @function
         * @param {Object} [templateData]
         */
        headTemplate: null,

        /**
         * 编辑器 ifrmae 的 body 模板
         * @function
         * @param {Object} [templateData]
         */
        bodyTemplate: null,

        /**
         * @class 编辑区域视图
         * <br/> 维护一个 iframe 元素，作为 iframe 内部事件的代理。
         * @constructs
         */
        initialize: function () {
            this.headTemplate = _.tmpl('editorAreaHead');
            this.bodyTemplate = _.tmpl('editorAreaBody');
            this.render = _.until(this.render.bind(this), function () {
                return this.el && this.el.contentDocument;
            }.bind(this));
        },

        getArticle: function () {
            return this.window.document.querySelector('.editor-area');
        },

        /**
         * 绑定编辑区域的各类事件
         */
        bindArticleEvent: function () {
            var article = this.getArticle();

            [
                'focus',
                'blur',
                'paste',
                'cut'
            ].forEach(function (event) {
                article.addEventListener(event, this.trigger.bind(this, event),
                    false);
            }.bind(this));
        },

        /**
         * 绑定编辑区域的各类事件
         * @private
         */
        bindEvent: function () {
            this.bindArticleEvent();

            [
                'click',
                'dblclick',
                'selectionchange',
                'contextmenu',
                'dragenter',
                'dragend',
                'keydown'
            ].forEach(function (event) {
                this.window.document.addEventListener(event,
                    this.trigger.bind(this, event), false);
            }.bind(this));

            this.trigger('ready');
        },

        /**
         * 渲染编辑区域 iframe 内部结构
         */
        render: function () {
            this.window = this.el.contentWindow;

            var doc = this.window.document;
            doc.querySelector('head').innerHTML = this.headTemplate();
            doc.body.innerHTML = this.bodyTemplate();

            this.bindEvent();
        }
    });

    return AreaView;
});
