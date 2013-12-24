define(function (require, exports) {
    var $ = require('../lib/jquery');
    /**
     * @name DOM
     * @class DOM 工具类
     */
    var DOM = {
        /** @lends DOM */
        /**
         * 判断两个元素是否是祖先与子孙关系
         * @param {HTMLElement} 祖先节点
         * @param {HTMLElement} 子孙节点
         * @returns {Boolean}
         */
        isAncestor: function (parent, child) {
            do {
                child = child.parentNode;
            } while (child && parent && parent !== child);

            return child === parent;
        },

        /**
         * 判断两个节点是否相等或是祖先与子孙关系
         * @param {HTMLElement} 祖先节点
         * @param {HTMLElement} 子孙节点
         * @returns {Boolean}
         */
        isEqualOrAncestor: function (parent, child) {
            return parent === child || DOM.isAncestor(parent, child);
        },

        /**
         * 事件代理
         * @param {HTMLElement} 事件代理元素
         * @param {String} selector 元素选择器
         * @param {String} event 事件名
         * @param {Function} callback 事件回调函数
         */
        delegate: function (element, selector, event, callback) {
            $(element).delegate(selector, event, callback);
        },

        /**
         * 在祖先中查找满足选择器的元素
         * @param {HTMLElement} element 被查找的元素
         * @param {String|HTMLElement} selector 祖先节点需要满足的条件，如果是
         * 字符串选择器，则必须满足该选择器，如果是 HTMLElement，则必须等于该元
         * 素
         * @returns {HTMLElement|null}
         */
        findParent: function (element, selector) {
            var check = null;

            if (typeof selector === 'string') {
                check = function (elem) {
                    return element.webkitMatchesSelector &&
                        element.webkitMatchesSelector(selector);
                };
            } else {
                check = function (elem) {
                    return elem === selector;
                };
            }

            while (element) {
                if (check(element)) {
                    return element;
                }
                element = element.parentNode;
            }

            return null;
        },

        /**
         * 复制元素的 documentFragment
         * @param {HTMLElement} obj 被复制的元素，但不包含该元素
         * @returns {HTMLFragment}
         */
        cloneFragment: function (obj) {
            obj = obj.cloneNode(true);
            var fragment = obj.ownerDocument.createDocumentFragment(),
                child = obj.firstChild,
                sibling = null;

            while (child) {
                sibling = child.nextSibling;
                fragment.appendChild(child);
                child = sibling;
            }

            return fragment;
        },

        /**
         * 获取元素相对于文档左上角的坐标
         * @param {HTMLElement} elem
         * @returns {Offset}
         */
        offset: function (elem) {
            var top = 0;
            var left = 0;

            while (elem.offsetParent) {
                top += elem.offsetTop;
                left += elem.offsetLeft;
                elem = elem.offsetParent;
            }

            return {
                left: left,
                top: top
            };
        },

        /**
         * 获取最近的一个块级祖先
         * @param {HTMLElement} element
         * @return {HTMLElement|null}
         */
        findClosestBlock: function (element) {
            var getStyle = element.ownerDocument.defaultView.getComputedStyle;

            var check = function (element) {
                return getStyle(element).display === 'block';
            };

            while (element) {
                if (check(element)) {
                    return element;
                }
                element = element.parentNode;
            }

            return null;
        },

        scrollBarWidth: null,
        /**
         * 获取滚动条宽度
         */
        getScrollBarWidth: function () {
            if (DOM.scrollBarWidth === null) {
                var elem = document.createElement('div');
                elem.style.position = 'absolute';
                elem.style.width = '100px';
                elem.style.height = '100px';
                elem.style.top = '0px';
                elem.style.left = '0px';
                elem.style.left = '0px';
                elem.style.overflow = 'scroll';
                document.body.appendChild(elem);
                DOM.scrollBarWidth = {
                    horizontal: 100 - elem.clientHeight,
                    vertical: 100 - elem.clientWidth
                };
                document.body.removeChild(elem);
            }

            return DOM.scrollBarWidth;
        }
    };

    return DOM;
});
