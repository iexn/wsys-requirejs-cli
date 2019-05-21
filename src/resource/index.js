require.config({
    urlArgs: 'v=2019051001',
    baseUrl: window.libUrl,
    paths: {
        'enter': 'app/enter/swiper',
        'app': 'app/app',
        'axios': 'axios/0.18.0/axios.min',
        'jquery': 'jquery/2.2.4/jquery.min',
        'lodash': 'lodash/1.8.3/lodash.min',
        'swiper': 'swiper/4.5.0/swiper.min',
        'wx': 'wx/1.4.0/wx.min',
    },
    map: {'*':{'css': window.libUrl + '/require/css.min.js'}},
    shim: {
        'app': {deps:['wx','swiper','axios','lodash']},
        'enter': {deps:['css!bootstrap/3.3.7/bootstrap.min','app']},
        'swiper': {deps:['css!swiper/4.5.0/swiper.min']}
    }
});

require(['enter','axios'], function (Enter, axios) {
    var init_url = window.init_url;
    Enter.init(init_url, main);

    function main (done, App) {
        axios.post(App.url('Index/act')).then(function (res) {
            done();
        }).catch(function () {
            alert('页面读取失败，请重试');
            done(false);
        });
    }
});