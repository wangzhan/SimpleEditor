define(function (require, exports) {
    var Backbone = require('../lib/backbone'),
        _ = require('../lib/underscore'),
        USER_AGENT = require('../util/userAgent'),
        DOM = require('../util/dom');
        AreaView = require('./areaView'),
        PanelView = require('./panelView'),
        Commander = require('../command/commander'),
        CEF = require('../util/cef');

    var EditorView = Backbone.View.extend({
        /* Backbone View Options */
        tagName: 'section',

        className: 'wrap',

        defaults: {
            panelItems: [],
            commands: [],
        },

        /** @lends EditorView.prototype */

        /**
         * 编辑器对应的 textarea 输入框
         * @type HTMLTextareaElement
         */
        textarea: null,

        /**
         * 工具栏对象
         * @type PanelView
         */
        panel: null,

        /**
         * 命令处理对象
         * @type Commander
         */
        commander: null,

        /**
         * 输入区域对象
         * @type AreaView
         */
        area: null,

        /**
         * 编辑区域的 DOM 元素
         * @type HTMLElement
         */
        article: null,

        /**
         * ready 事件的回调函数
         * @type Array
         */
        readyCallback: null,

        /**
         * 是否只读模式
         * @type Boolean
         */
        isReadOnly: false,

        /**
         * 编辑区域选择区
         */
        selection: null,

        /**
         * 编辑区域 iframe 的 document 对象
         * @type Document
         */
        document: null,

        /**
         * 是否监视内容变化
         * @type Boolean
         */
        _isMonitorChange: false,

        /**
         * @class 编辑器视图
         * @constructs
         * @param {Object} options
         * @param {String|HTMLElement} options.textarea
         * @param {Boolean} [options.showStatus=false] 是否显示状态栏
         * @param {Array} options.panelItems 工具栏项
         * @param {Array} options.commands 命令
         */
        initialize: function () {
            var that = this;

            _.defaults(that.options, that.defaults);

            if (typeof that.options.textarea === 'string') {
                that.textarea = document.querySelector(that.options.textarea);
            } else {
                that.textarea = that.options.textarea;
            }

            that.readyCallback = [];

            // 避免频繁 change 触发的性能问题
            that.onAreaChange = _.debounce(that.onAreaChange, 25);
            that.onResize = _.debounce(that.onResize.bind(that), 25);

            /* -------------------- init areaview ----------------------- */
            that.area = new AreaView();
            that.area.bind('command', that.onCommand, that);
            that.area.bind('ready', that.onAreaReady, that);
            that.area.bind('paste', that.onAreaPaste, that);
            that.area.bind('click', that.onAreaClick, that);
            that.area.bind('dblclick', that.onAreaDblClick, that);
            that.area.bind('selectionchange', that.onSelectionChange, that);

            /* -------------------- init panelview ----------------------- */
            that.panel = new PanelView();
            that.panel.addItems(that.options.panelItems);
            that.panel.bind('command', that.onCommand, that);

            /* -------------------- init commander ----------------------- */
            that.commander = new Commander({
                editor: that
            });
            that.commander.addCmds(that.options.commands);

            /* -------------------- bind event ----------------------- */
            window.addEventListener('resize', that.onResize, false);

            document.addEventListener('selectstart', function (evt) {
                /*
                 * 禁止外层 document 中的选中事件，防止选中工具栏上的元素
                 * 通过判断 this.document
                 * (编辑区域的 ownerDocument) 和 window.document
                 * 来判断编辑区域是否是直接挂在 document.body
                 * 下还是在一个独立的 iframe 中
                 */
                if (that.document === document) {
                    return;
                }

                evt.preventDefault();
            }.bind(that), false);

            document.addEventListener('mouseup',
                that.onDocumentMouseup.bind(that), false);

            //控制阴影切换
            that.area.bind('focus', function () {
                that.panel.deepenShadow(true);
            });
            that.area.bind('blur', function () {
                that.panel.deepenShadow(false);
            });
        },

        /** @lends EditorView.prototype */
        /**
         * 获取编辑器内容
         * @private
         * @param {Object} options
         * @param {Boolean} [options.ignoreFilter=false] 是否不处理 getFilter
         * @returns {HTMLFragmentElement}
         */
        _getDOM: function (options) {
            options = options || {};
            var fragment = DOM.cloneFragment(this.article);
            return fragment;
        },

        /**
         * 获取编辑器内容
         * @param {Object} options
         * @param {Boolean} [options.ignoreFilter=false]
         * @returns {String}
         */
        getContent: function (options) {
            var fragment = this._getDOM(options),
                div,
                ret;
            div = fragment.ownerDocument.createElement('div');
            div.appendChild(fragment);

            ret = div.innerHTML;
            //chrome innerHTML的img标签没有闭合, 使之闭合
            ret = ret.replace(/(<img [^>]*)>/ig, function (all, $one) {
                //如果<img />已闭合
                if ($one.charAt($one.length - 1) === '/') {
                    return $one + '>';
                } else {
                    return $one + ' />';
                }
            });
            return ret;
        },

        /**
         * 加载器载入完成后的事件注册
         */
        ready: function (callback) {
            this.readyCallback.push(callback);
        },

        /* -------------------- History ----------------------- */

        /**
         * 设置只读模式
         * @param {Boolean} isReadOnly
         */
        setReadOnly: function (isReadOnly) {
            var that = this,
                article = that.article;
            isReadOnly = !!isReadOnly;
            that.isReadOnly = isReadOnly;
            that.article.setAttribute('contenteditable',
                    isReadOnly ? 'false' : 'true');

            if (isReadOnly) {
                that.panel.disable();
            } else {
                that.panel.enable();
            }
        },

        /* -------------------- 文档修改相关函数 ----------------------- */
        /**
         * 静默去执行一些函数，不会触发文档修改的事件
         * @param {Function} func 目标函数
         */
        silentDo: function (func) {
            var that = this,
                isMonitor = that._isMonitorChange === true;
            //增加判断是为了支持 silentDo 嵌套
            if (isMonitor) {
                that.stopMonitorChange();
            }
            func();
            if (isMonitor) {
                that.startMonitorChange();
            }
        },

        /**
         * 监控文档修改事件
         */
        startMonitorChange: function () {
            this._isMonitorChange = true;
        },

        /**
         * 停止监控文档修改事件
         */
        stopMonitorChange: function () {
            this._isMonitorChange = false;
        },

        /**
         * 清除历史记录
         * @param isKeepContent 是否保留编辑内容
         */
        resetUndoHistory: function (isKeepContent) {
            var newElem = this.article.cloneNode(isKeepContent);
            this.article.parentNode.replaceChild(newElem, this.article);
            this.article = newElem;
            this.area.bindArticleEvent();
        },

        /* -------------------- 编辑器光标相关方法 ----------------------- */
        /**
         * create range for the nearby of point and make the range as the
         * selection
         * @private
         * @param {Object} position
         * @param {Integer} position.clientX
         * @param {Integer} clientY
         * @return {Boolean} return true if ok
         */
        selectNearby: function (position) {
            /*jslint eqeq:true*/
            if (!position || position.clientX == null) {
                return;
            }
            var that = this,
                focusOk,
                maxClientX = position.clientX,
                clientY = position.clientY,
                focusPos = function (y) {
                    var TRY_LIMIT = 5,
                        counter = TRY_LIMIT,
                        success,
                        x;
                    for (counter; counter > 0; counter--) {
                        x = maxClientX * counter / TRY_LIMIT;
                        success = that.selectPosition(x, y);
                        if (success) {
                            return success;
                        }
                    }
                    return false;
                };
            //
            focusOk = focusPos(clientY);
            if (focusOk) {
                return true;
            }
            return focusPos(clientY + 6);
        },

        /**
         * 将光标位置置于最后一行中最接近于点击事件的点上
         * @param {Object} offset
         * @param {Number} offset.clientX
         * @param {Number} offset.clientY
         */
        focusArticleLastLine: function (offset) {
            var that = this,
                bottom,
                article = that.article;

            offset = offset || {
                clientX: 0
            };
            
            bottom = DOM.offset(article).top + article.clientHeight;
            that.selectPosition({
                clientX: offset.clientX,
                clientY: bottom - 1
            });
        },

        /**
         * 选取某个编辑器内的节点
         * @param {HTMLElement} node
         * @param {Object} options
         * @param {Boolean} [options.collapsed=false]
         * @param {Boolean} [options.collapseToStart=false]
         */
        selectNode: function (node, options) {
            options = options || {};
            this.range.selectNode(node);
            if (options.collapsed) {
                this.range.collapse(options.collapseToStart);
            }
            this.selectRange(this.range);
        },

        /**
         * 选取某个编辑器内节点的所有子节点
         * @param {HTMLElement} node
         * @param {Object} options
         * @param {Boolean} [options.collapsed=false]
         * @param {Boolean} [options.collapseToStart=false]
         */
        selectNodeContents: function (node, options) {
            options = options || {};
            this.range.selectNodeContents(node);
            if (options.collapsed) {
                this.range.collapse(options.collapseToStart);
            }
            this.selectRange(this.range);
        },

        /**
         * 设置编辑区的选区
         * @param {Range} range
         */
        selectRange: function (range) {
            if (this.range !== range) {
                this.range.detach();
                this.range = range;
            }
            this.selection.removeAllRanges();
            this.selection.addRange(range);
        },

        /**
         * 将光标置于给定的坐标
         * @param {Object} position
         * @param {Number} position.clientX
         * @param {Number} position.clientY
         * @return {Boolean} 是否成功设置光标
         */
        selectPosition: function (position) {
            var range = this.document.caretRangeFromPoint(position.clientX,
                position.clientY);

            if (range !== null) {
                this.selectRange(range);
                return true;
            }
            return false;
        },

        /**
         * 获取目前用户选区，为空时则返回 null
         * @returns {Range}
         */
        getRange: function () {
            if (this.selection.rangeCount > 0) {
                var range = this.selection.getRangeAt(0);
                if (range.startContainer.tagName === 'BODY') {
                    return null;
                }
                return range;
            }
            return null;
        },

        /* -------------------- Util function ----------------------- */
        /**
         * 获取编辑区域内元素元素相对于整个编辑器的绝对坐标
         * @param {HTMLElement} elem
         * @returns {Object} offset
         */
        getOffsetInArticle: function (elem) {
            var $ = require('../lib/jquery');
            var offset = $(elem).offset();

            if (elem.ownerDocument === this.document) {
                var baseOffset = $(this.area.el).offset();
                offset.left += baseOffset.left;
                offset.top += baseOffset.top;
            }

            return offset;
        },

        /**
         * 返回编辑区域可视部分的大小
         * @return {Object} rect
         */
        getArticleVisibleRect: function () {
            var $ = require('../lib/jquery');
            var offset = $(this.area.el).offset();
            var width = this.area.el.offsetWidth;
            var height = this.area.el.offsetHeight;

            return {
                top: offset.top,
                left: offset.left,
                width: width,
                height: height,
                bottom: offset.top + height,
                right: offset.left + width
            };
        },

        /* -------------------- Event Listener ----------------------- */
        /**
         * command 事件回调函数
         * @event
         * @private
         * @param {Object} cmd 目标命令
         * @param {String} cmd.name 目标命令名
         * @param {Object} [cmd.value] 命令参数
         * @param {Function} [cmd.callback] 回调函数
         * @returns {Object} 命令返回结果
         */
        onCommand: function (cmd) {
            var that = this;
            if (that.isReadOnly) {
                return;
            }
            var ret = that.commander.exec(cmd.name, cmd.value);

            if (cmd.callback) {
                cmd.callback(ret);
            }

            return ret;
        },

        /* -------------------- Area 相关的事件回调 ----------------------- */
        /**
         * 粘贴事件回调函数
         * @event
         * @private
         */
        onAreaPaste: function (evt) {
            var that = this;
            //不能立即执行，因为paste的内容可能还没有append到DOM树中
            _.defer(function () {
                var article = that.article,
                    img = new Image();

                //手动触发DOMSubtreeModified
                article.appendChild(img);
                article.removeChild(img);
            }, 25);
        },

        /* -------------------- 其他全局事件绑定 ----------------------- */
        render: function () {
            var that = this;
            [that.panel, that.area].forEach(function (item) {
                if (item && item.render) {
                    item.render();
                    that.el.appendChild(item.el);
                }
            });

            that.textarea.parentNode.insertBefore(that.el, that.textarea);
            that.textarea.style.display = 'none';

            that.fitSize();
        },

        /**
         * 调整编辑器大小
         */
        fitSize: function () {
            var that = this,
                el = that.el,
                rect = {
                    width: el.parentNode.offsetWidth,
                    height: el.parentNode.offsetHeight
                };

            rect.height = rect.height - (el.offsetHeight - el.clientHeight);
            if (that.panel) {
                rect.height -= that.panel.el.offsetHeight;
            }

            // that.area.el.style.height = rect.height -
            //     (that.area.el.offsetHeight - that.area.el.clientHeight) + 'px';
            if (that.panel) {
                that.panel.fitSize();
            }
        },

        /**
         * 使焦点置于编辑区域内
         */
        focusArticle: function (position) {
            var that = this;
            if (that.isReadOnly === true) {
                return;
            }

            var activeEl,
                setPosOk = false,
                child,
                options = {
                    collapsed: true,
                    collapseToStart: false
                },
                hasPos = position && position.clientX != null;

            if (USER_AGENT.CHROME) {
                activeEl = document.activeElement;

                // 重置焦点
                if (activeEl !== that.area.el ||
                        that.document.activeElement !== that.article) {
                    that.area.window.focus();
                    if (hasPos) {
                        setPosOk = that.selectNearby(position);
                    }
                }
            } else {
                that.area.window.focus();
                if (hasPos) {
                    setPosOk = that.selectNearby(position);
                }
            }

            if (setPosOk) {
                return;
            }

            if (that.getRange()) { // 如果光标已经在编辑区域内则不需要做处理
                return;
            }
            //如果有最后一次编辑区域，滚回最后编辑的Range
            if (that.lastSelection) {
                that.area.window.focus();
                that.selectRange(that.lastSelection);
            }
            // focus to last line
            if (!that.getRange()) {
                if (position && position.clientY != null &&
                        position.clientX != null) {
                    that.area.window.focus();
                    setPosOk = that.selectNearby(position);
                    if (setPosOk) {
                        return;
                    }
                }

                child = that.article.lastChild;
                if (child === null) {
                    child = '<div><br/></div>';
                    that.article.insertAdjacentHTML('beforeEnd', child);
                    child = that.article.lastChild;
                }

                //滚动至底部
                if (child.firstChild) {
                    that.selectNodeContents(child, options);
                } else {
                    that.selectNode(child, options);
                }
            }
        },

        /**
         * 设置编辑器内容
         * @override
         * @param {String} html
         * @param {Object} options
         * @param {Boolean} [options.ignoreFilter=false]
         */
        setContent: function (html, options) {
            if (html === null) {
                return;
            }
            if (html === '' || html === '<br>' || html === '<br/>') {
                html = '<div><br/></div>';
            }
            that.article.innerHTML = html;
        },

        /* -------------------- Event Listener ----------------------- */
        /**
         * 编辑区域初始化完成时的回调函数
         * <br/>通过 CEFInstance 的 Ready 接口通知 CEF 初始化完成，并提供
         * {@link ClientEditorApi} 中定义的接口
         * @see ClientEditorApi
         * @event
         */
        onAreaReady: function () {
            var that = this;

            that.document = that.area.window.document;
            that.selection = that.area.window.getSelection();
            that.article = that.area.getArticle();
            that.range = that.document.createRange();
            that.setReadOnly(false);

            if (USER_AGENT.CHROME) {
                that.focusArticle();
            }

            that.startMonitorChange();
            _.invoke(that.readyCallback, 'call');
        },

        /**
         * 编辑区域发生修改时的回调函数
         * @event
         */
        onAreaChange: function () {
            var that = this;
            if (that.panel && that.panel.checkStatus) {
                that.panel.checkStatus();
            }
        },

        /**
         * 编辑区域被点击时的回调函数
         * @event
         * @param {Event} evt
         */
        onAreaClick: function (evt) {

            var that = this,
                oldIsReadOnly = that.isReadOnly,
                target = evt.target,
                tag = target.tagName,
                closeCall,
                parent,
                textInput,
                $textInput;

            if (tag === 'HTML' || tag === 'BODY') {
                that.focusArticleLastLine(evt);
            }

            link = DOM.findParent(target, 'a[href]');
            if (link) {
                evt.preventDefault();
            }

            if (oldIsReadOnly) {
                return;
            }

            // hack 做法， 真正解决需要C开发来处理
            window.setTimeout(function () {
                that.focusArticle();
            }, 10);
        },

        /**
         * 编辑区域双击事件回调函数
         * @event
         * @param {Event} evt
         */
        onAreaDblClick: function (evt) {

        },

        /**
         * 编辑区域选择发生改变时的回调函数
         * @event
         * @private
         */
        onSelectionChange: function (evt) {
            var that = this,
                range;
            if (that.panel) {
                that.panel.checkStatus(evt);
            }

            range = that.getRange();
            if (range) {
                that.lastSelection = range;
            }
        },

        /**
         * 工具栏被点击后的事件回调
         * @private
         * @event
         */
        onDocumentMouseup: function () {
            this.focusArticle();
        },

        /**
         * 调整界面大小时的回调函数
         * @private
         * @event
         */
        onResize: function () {
            this.fitSize();
        },

        notifyOnCopy: function () {

        }
    });

    return EditorView;
});
