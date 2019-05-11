define(function (require, exports) {

    var App = require('app');
    var Swiper = require('swiper');

    function init (url, callback) {
        App.init(url, function (done) {
            callback && callback(function (is_complete) {
                new Swiper('.app', {
                    direction: 'vertical',
                    slidesPerView: 'auto',
                    freeMode: true,
                    mousewheel: true,
                });
                done(is_complete);
            }, App);
        });
    }

    exports.init = init;

});