define(function (require, exports) {
    var Backbone = require('../lib/backbone'),
        _ = require('../lib/underscore'),
        $ = require('../lib/jquery');

    var PanelView = Backbone.View.extend({
        /* -------------------- Backbone Option ----------------------- */
        className: 'panel-wrap',

        /** @lends PanelView.prototype */

        /**
         * 编辑器工具栏元素
         * @type HTMLElement
         */
        panel: null,

        /**
         * 模板函数
         * @function
         * @param {Object} [templateData]
         */
        template: _.tmpl('editorPanel'),

        /**
         * 是否显示工具栏
         */
        isShown: true,

        /**
         * @constructs
         * @class
         */
        initialize: function () {
            /**
             * 编辑器工具栏的元素列表
             * @type Array
             */
            this.elemList = [];

            _.bindAll(this);
        },

        /**
         * 给 Panel 增加元素
         * @param {ButtonView|SelectView} button 目标元素
         */
        addItem: function (button) {
            this.elemList.push(button);

            button.bind('command', this.onCommand);
        },

        /**
         * 给 Panel 增加元素
         * @param {Array<ButtonView|SelectView} buttons 目标元素数组
         */
        addItems: function (buttons) {
            buttons.forEach(this.addItem.bind(this));
        },

        /**
         * 自适应按钮宽度
         */
        fitSize: function () {
            if (!this.isShown) {
                return;
            }
        },

        /**
         * 渲染元素
         */
        render: function () {
            this.el.innerHTML = this.template();
            this.panel = this.el.querySelector('.panel');
            this.elemList.forEach(function (item) {
                item.render();
                this.panel.appendChild(item.el);
            }.bind(this));
        },

        /**
         * 通知 Panel 中的各个元素检查自身状态
         * @param {Event} evt 触发检查的事件
         * @function
         */
        checkStatus: _.debounce(function (evt) {
            var statusCache = {};
            this.elemList.forEach(function (elem) {
                elem.checkStatus(statusCache);
            });
        }, 100),

        /**
         * 判断一个按钮是否被隐藏
         * @param {String} buttonName
         * @returns {Boolean}
         */
        isButtonHidden: function (buttonName) {
            if (!buttonName) {
                throw new Error('BUTTON NOT EXISTED');
            }

            var isExisted = this.elemList.some(function (elem) {
                return elem.options.name === buttonName;
            });

            if (!isExisted) {
                throw new Error('BUTTON NOT EXISTED');
            }
        },

        /**
         * 显示工具栏
         */
        show: function () {
            if (this.isShown) {
                return;
            }

            this.el.style.display = 'block';
            this.isShown = true;
        },

        /**
         * 隐藏工具栏
         */
        hide: function () {
            if (!this.isShown) {
                return;
            }

            this.el.style.display = 'none';
            this.isShown = false;
        },

        /**
         * 禁用工具栏
         * @param {Array} without   数组元素是每个命令的name
         */
        disable: function (without) {
            without = without || [];
            this.elemList.forEach(function (elem) {
                if (without.indexOf(elem.name) > -1) {
                    return;
                }
                elem.disable();
            });
        },

        /**
         * 启用工具栏
         */
        enable: function () {
            this.elemList.forEach(function (elem) {
                elem.enable();
            });
        },

        /* -------------------- Event Listener ----------------------- */

        /**
         * command 事件回调函数
         * @event
         * @private
         * @param cmd 目标命令
         * @param {String} cmd.name 目标命令名
         * @param {Object} [cmd.value] 命令参数
         * @param {Function} [cmd.callback] 回调函数
         */
        onCommand: function (cmd) {
            this.trigger('command', cmd);
        },

        /**
         * 控制box-shadow的深浅
         * @param {Boolean} isDeep
         */
        deepenShadow: function (isDeep) {
            var $el = $(this.el),
                klass = 'deep-shadow';
            if (isDeep === true) {
                $el.addClass(klass);
            } else {
                $el.removeClass(klass);
            }
        },

        /**
         * @param {String} name
         * @return {ButtonView|SelectView} @see addItem()
         */
        getItem: function (name) {
            var that = this;
            return _.find(that.elemList, function (obj) {
                if (obj && obj.name === name) {
                    return true;
                }
            });
        }

    });

    return PanelView;
});
