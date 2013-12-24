define(function (require, exports) {
    var ButtonView = require('../view/buttonView');

    var ToggleButtonView = ButtonView.extend({
        isReadOnly: false,

        onClick: function (evt) {
            this.clickAction(evt);
        }
    });

    return new ToggleButtonView({
        name: 'toggle',
        label: '切换',
        

        clickAction: function () {
            this.isReadOnly = !this.isReadOnly;
            window.editor.setReadOnly(this.isReadOnly);
        }
    });
});
