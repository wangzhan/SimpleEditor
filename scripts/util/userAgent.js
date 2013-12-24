define(function (require, exports) {
    var ua = window.navigator.userAgent;

    var retObj =  {
        MOBILE: /Mobile/.test(ua),
        IPHONE: /iPhone/.test(ua),
        IPAD: /iPad/.test(ua),
        CHROME: /Chrome/.test(ua),
        IOS_5: / OS 5/.test(ua),
        IOS_6: / OS 6/.test(ua),
        //是否是retina屏幕
        RETINA: window.devicePixelRatio >= 2
    };

    retObj.IOS = retObj.IPHONE || retObj.IPAD;

    return retObj;
});
