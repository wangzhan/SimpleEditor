define(function (require, exports) {
    var ButtonView = require('../view/ButtonView');

    return new ButtonView({
        name: 'bold',
        label: '粗体',
        command: {
            name: 'nativeCommand',
            value: 'bold'
        },
        
        //queryCommand: 'queryStyle',
        statusCallback: function (ret) {
            var isBold = ret.fontWeight === 'bold';
            if (!isBold) {
                var editor = window.editor,
                    range = editor.getRange(),
                    win = editor.area.window;
                if (range) {
                    var start = range.startContainer,
                        end = range.endContainer;
                    if (start && end) {
                        start = start.nodeType === 3 ? start.parentNode : start;
                        end = end.nodeType === 3 ? end.parentNode : end;
                        if (start.nodeType === 1 && end.nodeType === 1) {
                            start = win.getComputedStyle(start).fontWeight;
                            end = win.getComputedStyle(end).fontWeight;
                            isBold = (start === 'bold') && (end === 'bold');
                        }
                    }
                }
            }
            if (isBold) {
                this.activate();
            } else {
                this.deactivate();
            }
        }
    });
});
