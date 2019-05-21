({
    appDir: './src',
    baseUrl: 'resource',
    dir: './dist',
    modules: [
        {
            name: 'index'
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        'enter': 'lib/app/enter/swiper',
        'app': 'empty:',
        'wx': 'lib/wx/1.4.0/wx.min',
        'jquery': 'lib/jquery/2.2.4/jquery.min',
        'swiper': 'lib/swiper/4.5.0/swiper.min',
        'lodash': 'lib/lodash/1.8.3/lodash.min',
        'axios': 'lib/axios/0.18.0/axios.min'
    },
    map: {'*':{'css':'lib/require/css.min'}},
    shim: {
        'app': {deps:['wx','swiper','axios','lodash']},
        'enter': {deps:['css!lib/bootstrap/3.3.7/bootstrap.min','app']},
        'swiper': {deps:['css!lib/swiper/4.5.0/swiper.min']}
    }
})