define(function (require, exports) {
    return {
        'name': 'nativeCommand',
        
        /**
         * @method
         * @param {String} cmd 当前执行的命令名称
         * @param {Command} value 需要执行的命令
         */
        'func': function (cmd, value) {
            this.editor.document.execCommand(value.name || value, false,
                value.value);
        }
    };
});
