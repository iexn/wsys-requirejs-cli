define(function (require, exports) {

    var App = require('app');
    var Swiper = require('swiper');

    function init (url, callback) {
        App.init(url, function (done) {
            callback && callback(function (is_complete) {

                var container = document.createElement('div');
                var app_element = document.querySelector('#app');
                container.className    = 'swiper-container swiper-app-container';
                container.style.width  = '100%';
                container.style.height = '100%';
                container.innerHTML = '<div class="swiper-wrapper"><div class="swiper-slide"></div></div>';
                
                app_element.parentElement.insertBefore(container, app_element);
                container.querySelector('.swiper-slide').appendChild(app_element);
                
                new Swiper('.swiper-app-container', {
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