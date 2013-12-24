define(function (require, exports) {
    var Backbone = require('../lib/backbone'),
        $ = require('../lib/jquery'),
        _ = require('../lib/underscore'),
        DOM = require('../util/dom');

    var ButtonView = Backbone.View.extend({
        /* -------------------- Backbone Option ----------------------- */
        tagName: 'div',

        className: 'button-wrap',

        /** @lends ButtonView.prototype */

        /**
         * enable 状态
         * @type Boolean
         */
        isEnable: true,
        /**
         * 高亮 状态
         * @type Boolean
         */
        isHighlight: false,

        /**
         * Templating function
         * @function
         * @param {Object} [templateData]
         */
        template: _.tmpl('editorButton'),

        /**
         * @constructs
         * @param {Object} options
         * @param {String} options.name
         * @param {String} options.label
         * @param {String|Object} options.command
         * @param {Object} [options.tmplData]
         * @param {Boolean} [options.isNoActive=false]
         * @param {String|Object} [options.deactiveCommand=options.command]
         * @param {String|Object} [options.queryCommand]
         * @param {Function} [options.clickAction]
         * @param {Function} [options.statusCallback]
         * @param {Function} [options.afterRender]
         */
        initialize: function () {
            /**
             * Data for rendering template
             * @type Object
             * @default {}
             */
            this.tmplData = this.options.tmplData || {};

            /**
             * Button name for identifying
             * @type String
             */
            this.name = this.options.name;

            /**
             * If isNoActive is true, this button will not change status to
             * activate
             * @type Boolean
             */
            this.isNoActive = Boolean(this.options.isNoActive);

            /**
             * Command to be executed on {@link this.clickAction}
             * @type String|Object
             */
            this.command = this.options.command;

            /**
             * Command to be executed on {@link this.clickAction} when
             * this.isActivate is true
             * @type String|Object
             */
            this.deactiveCommand = this.options.deactiveCommand || this.command;

            /**
             * Command to be executed on {@link this.checkStatus}
             * @type String|Object
             */
            this.queryCommand = this.options.queryCommand;

            /**
            * After render action
            * @type Function
            * @default null
            */
            this.afterRender = this.options.afterRender || null;

            this.tmplData.className = 'button-' + this.name;
            this.tmplData.label = this.options.label;

            if (this.options.clickAction && this.options.clickAction.apply) {
                this.clickAction = this.options.clickAction;
            }

            if (this.options.statusCallback) {
                /**
                 * Callback function of checkStatus
                 * @type Function
                 */
                this.statusCallback = this.options.statusCallback;
            }

            _.bindAll(this);
        },

        /**
         * Render element
         */
        render: function () {
            this.el.classList.add('button-wrap-' + this.name);
            this.el.innerHTML = this.template(this.tmplData);
            DOM.delegate(this.el, '.button', 'click', this.onClick.bind(this));

            if (this.afterRender) {
                this.afterRender();
            }
        },

        /**
         * Enable button
         */
        enable: function () {
            this.isEnable = true;
            this.el.classList.remove('disabled');
            $('button', this.el).removeClass('disabled');
        },

        /**
         * Disable button
         */
        disable: function () {
            this.isEnable = false;
            this.el.classList.add('disabled');
            $('button', this.el).addClass('disabled');
        },

        /**
         * Toggle button enable/disable status
         */
        toggle: function () {
            if (this.enable) {
                this.disable();
            } else {
                this.enable();
            }
        },

        /**
         * Activate button
         */
        activate: function () {
            this.isActivate = true;
            this.el.classList.add('button-active');
        },

        /**
         * Deactivate button
         */
        deactivate: function () {
            this.isActivate = false;
            this.el.classList.remove('button-active');
        },

        /**
         * check button active/deactive/enable/disable status
         */
        checkStatus: function (cache) {
            var that = this,
                queryCmd = that.queryCommand;
            //console.log(cache);
            if (!queryCmd) {
                return;
            }
            if (!_.isArray(queryCmd)) {
                queryCmd = [queryCmd];
            }
            _.each(queryCmd, function (cmd) {
                if (typeof cmd === 'string') {
                    cmd = {
                        name: cmd
                    };
                }

                if (cache[cmd.name] !== undefined) {
                    that.statusCallback(cache[cmd.name]);
                } else {
                    cmd.callback = function (ret) {
                        cache[cmd.name] = ret;
                        that.statusCallback(ret);
                    }.bind(that);
                    that.trigger('command', cmd);
                }
            });

        },

        /**
         * user click action
         * @param {Event} evt
         */
        clickAction: function (evt) {
            var cmd = this.isActivate ? this.deactiveCommand : this.command;
            if (typeof cmd === 'string') {
                cmd = {
                    name: this.command
                };
            }

            this.trigger('command', cmd);

            if (!this.isNoActive) {
                if (this.isActivate) {
                    this.deactivate();
                } else {
                    this.activate();
                }
            }
        },

        /* -------------------- Event Listener ----------------------- */

        /**
         * Event listener for click event
         * @event
         * @private
         */
        onClick: function (evt) {
            if (this.isEnable) {
                this.clickAction(evt);
            }
        },

        /**
         * 高亮功能
         *
         */
        highlight: function () {
            var that = this;
            that.isHighlight = true;
            $('button', that.el).addClass('highlight');
        },
        
        /**
         * 取消高亮功能
         *
         */
        unHighlight: function () {
            var that = this;
            $('button', that.el).removeClass('highlight');
            that.isHighlight = false;
        }
    });

    return ButtonView;
});
