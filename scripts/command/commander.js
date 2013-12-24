define(function (require, exports) {
    var _ = require('../lib/underscore');

    /**
     * @class 编辑器命令类
     * @name Commander
     */
    var Commander = function (options) {
        this.options = options;
        this.editor = this.options.editor;
        this.commands = {};
    };

    Commander.prototype = {
        /** @lends Commander.prototype */
        /**
         * 执行命令
         * @param {Command} cmd
         * @param {Object} value
         */
        exec: function (cmd, value) {
            if (this.commands[cmd]) {
                return this.commands[cmd](cmd, value);
            } else if (window.DEBUG) {
                window.alert('Commander->commands[' + cmd + '] is undefined');
            }
        },

        /**
         * 添加命令
         * @param {Object} cmd
         * @param {String} cmd.name
         * @param {String} cmd.func
         */
        addCmd: function (cmd) {
            cmd.name.split(',').forEach(_.bind(function (name) {
                this.commands[name.trim()] = _.bind(cmd.func, this);
            }, this));
        },
        
        /**
         * 批量添加命令
         * @param {Array<Cmd} list
         */
        addCmds: function (list) {
            list.forEach(_.bind(function (item) {
                this.addCmd(item);
            }, this));
        }
    };

    /** @lends Commander */
    /**
     * 格式化命令参数，接受一个字符串或一个命令对象，返回一个命令对象
     * @param {String | Object} command
     * @returns {Object}
     */
    Commander.formatCommand = function (command) {
        var cmd = command;
        if (typeof cmd === 'string') {
            cmd = {
                name: cmd
            };
        }

        return cmd;
    };

    return Commander;
});
