require.config({
    urlArgs: 'v=2019051001',
    baseUrl: window.baseUrl,
    paths: {
        'enter': 'lib/app/enter/swiper',
        'app': 'lib/app/app',
        'wx': 'lib/wx/1.4.0/wx.min',
        'jquery': 'lib/jquery/2.2.4/jquery.min',
        'swiper': 'lib/swiper/4.5.0/swiper.min',
        'lodash': 'lib/lodash/1.8.3/lodash.min',
        'axios': 'lib/axios/0.18.0/axios.min',
    },
    map: {'*':{'css': window.baseUrl + '/lib/require/css.min.js'}},
    shim: {
        'app': {deps:['wx','swiper','axios','lodash']},
        'enter': {deps:['css!lib/bootstrap/3.3.7/bootstrap.min','app','css!index']},
        'swiper': {deps:['css!lib/swiper/4.5.0/swiper.min']}
    }
});

require(['enter','axios'], function (Enter, axios) {
    var init_url = window.init_url;
    Enter.init(init_url, main);

    function main (done, App) {
        console.log(App.url('w7/sysinfo'));
        axios.post(App.url('Index/act')).then(function (res) {
            done();
        }).catch(function () {
            alert('页面读取失败，请重试');
            done(false);
        });
    }
});