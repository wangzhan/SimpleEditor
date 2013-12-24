define(function (require, exports) {

    /**
     * CEF API 接口，只做定义，不实现具体逻辑，具体逻辑实现在 C++ 代码中
     * @class CEF API 接口文档类
     * @name CEFApiInterface
     */
    var CEFApiInterface =
        /**
         * @lends CEFApiInterface
         */
        {
            /**
             * 当编辑器加载完毕后，通知客户端，并向客户端传入当客户端需要调用
             * JavaScript 方法时需要的回调函数
             * @param {Function} callback 回调函数
             * @param {HTMLElement} document 编辑区域内部的 document
             */
            Ready: function (callback, document) {
                window.CEFCallback = callback;

                window.console.log('CEFInstance.Ready', document);
            },

            /**
             * 执行由 CEF 提供的纯文本粘贴操作
             */
            PasteAsText: function () {
                window.console.log('CEFInstance.PasteAsText');
            },

            /**
             * 判断剪贴板中是否包含可用内容
             * @returns {Boolean} 剪贴板中是否包含可用内容
             */
            ClipboardAvailable: function () {
                window.console.log('CEFInstance.ClipboardAvailable');
                return true;
            },

            /**
             * 当编辑器内容发生变化时，通知客户端
             */
            OnDocumentChange: function () {
                window.console.log('CEFInstance.OnDocumentChange');
            },

            /**
             * 编辑区域被点击时通知客户端，通知客户端
             */
            OnAreaClick: function () {
                window.console.log('CEFInstance.OnAreaClick');
            },

            /**
             * 使用当前系统的默认浏览器打开指定的地址
             * @param {String} url URL 地址
             */
            OpenLink: function (url) {
                window.console.log('CEFInstance.OpenLink', url);
            },

            /**
             * 打开图片
             * @param {String} path 图片地址
             */
            OpenImage: function (path) {
                window.console.log('CEFInstance.OpenImage', path);
            },

            /**
             * 调用客户端内部的粘贴操作
             */
            Paste: function () {
                window.console.log('CEFInstance.Paste');
                //call the `doPaste` api of Editor, only in browser
                window.CEF.apis.doPaste();
            },

            /**
             * 打开查找对话框在编辑器内查找并高亮指定的关键字
             */
            FindText: function () {
                window.console.log('CEFInstance.FindText');
            },

            /**
             * 调用客户端的打开附件操作
             * @param {String} resId 资源 ID
             * @param {String} distinguish GUID
             */
            OpenAttachment: function (resId, distinguish) {
                window.console.log('CEFInstance.OpenAttachment', resId, distinguish);
            },

            /**
             * 打开保存对话框将传入的 src 中所指的图片文件保存到用户指定的位置
             * @param {String} src 图片在本地的绝对路径
             */
            SaveImage: function (src) {
                window.console.log('CEFInstance.SaveImage', src);
            },

            /**
             * 判断图片是否已保存至客户端
             * @param {String} src 图片源地址
             * @returns {Boolean} 图片是否已保存至客户端
             */
            IsImageSavedToNote: function (src) {
                console.log('CEFInstance.IsImageSavedToNote', src);
                return false;
            },

            /**
             * 弹出一个对话框用于编辑超链接信息，包含一个文字输入框和两个按钮（确
             * 定、取消），会触发 onShowInsertLinkDialogAsync 事件
             * <br>事件回调参数有
             * <br>link: 用户输入的链接内容，如果点击取消则返回 undefined
             * @param {String} content
             * @async
             */
            ShowInsertLinkDialogAsync: function (content) {
                window.console.log('CEFInstance.ShowInsertLinkDialogAsync');
            },

            /**
             * 使 CEF 窗口获得用户焦点
             */
            GetFocus: function () {
                window.console.log('CEFInstance.GetFocus');
            },

            /**
             * 重新载入编辑器
             */
            ReloadEditor: function () {
                window.location.reload();
                window.console.log('CEFInstance.ReloadEditor');
            },

            /**
             * 截图
             * @param {Boolean} isHideWindow 是否截图时隐藏主窗口
             */
            SnapScreen: function (isHideWindow) {
                window.console.log('CEFInstance.SnapScreen', isHideWindow);
            },

            /**
             * 获取是否标出新功能提示
             * @param {String} name 新功能名称, 允许的取值 'insertTodo'
             * @return {Boolean}  返回true/false，若没有返回，默认为true
             *
             */
            GetFeatureHighlightEnable: function (name) {
                window.console.log('CEFInstance.GetFeatureHighlightEnable : ' + name);
                return true;
            },

            /**
             * 设置是否标出新功能提示
             * @param {String} name 新功能名称, 允许的取值 'insertTodo'
             * @param {Boolean}
             */
            SetFeatureHighlightEnable: function (name, isEnabled) {
                window.console.log('CEFInstance.SetFeatureHighlightEnable: ' + name  +
                        ' = ' + isEnabled);
            },

            /**
             *
             */
            AsyncSetText: function (noteId, content) {
                window.console.log('CEFInstance.AsyncSetText noteId: ' + noteId);
                window.console.log('CEFInstance.AsyncSetText content: ' + content);
            },
            /**
             * 当复制后调用该方法
             */
            OnCopy: function () {
                window.console.log('OnCopy');
            },
            /**
             * 记录 Log
             * @param {Number} level
             * @param {String} message
             */
            Log: function (level, message) {
                window.console.log('debug', level, message);
            },

            /**
             * 统计字数右键菜单调用
             */
            ShowNoteCharNum: function () {
                window.console.log('CEFInstance.ShowNoteCharNum');
                return true;
            }
        };

    return CEFApiInterface;
});
