define(function (require) {
    var Editor = require('./scripts/view/editorView');

    var editor = new Editor({
        textarea: '#main',

        panelItems: [
            require('./scripts/toolbar/bold'),
            require('./scripts/toolbar/toggle')
            
        ],

        commands: [
            require('./scripts/command/nativeCommand')
        ],
    });

    editor.render();

    // 暴露
    if (!window.editor) {
        window.editor = editor;
    }
});
