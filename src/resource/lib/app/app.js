define(function (require, exports, module) {
    
    var wx = require('wx'),
        _  = require('lodash'),
        axios = require('axios');

        var sysinfo = {},
        App = {}

    // 注册jssdk
    function init (url, options) {

        if (type(options) == 'function') {
            options = {
                done: options
            };
        }

        options = _.defaults(options, {
            before: function () {},
            done: function (is_complete) { return true; },
            fail: function () {}
        }, options);

        if (options.before() === false) {
            return false;
        }

        axios.post(url, {
            url: location.href
        }).then(function (res) {
            var data = res.data;
            if (data.code != 0) {
                options.fail(data.message, data.data);
                return false;
            }

            App.sysinfo = sysinfo = data.data;

            wx.config(data.data.account.jssdkconfig);

            ready(function (is_ready) {
                if (is_ready === false) {
                    document.querySelector('#loading').remove();
                    return false;
                }
                options.done(function (callback) {
                    if (callback === false) {
                        document.querySelector('#loading').remove();
                        return false;
                    }
                    type(callback) == 'function' && callback();
                    document.querySelector('#loading').remove();
                    document.querySelector('#app').style.display = 'block';
                    document.querySelector('#app').style.visibility = 'visible';
                    document.querySelector('#app').style.opacity = '1';
                });
            });

        }).catch(function (e) {
            console.error(e);
            options.fail(false);
        });
    }

    function type (mixed) {
        if (typeof mixed != 'object') {
            return typeof mixed;
        }
        return Object.prototype.toString.call(mixed).slice(8, -1).toLowerCase();
    }

    function trimMenu () {
        wx.hideAllNonBaseMenuItem();
        wx.showMenuItems({
            menuList: [
                "menuItem:share:appMessage",
                "menuItem:share:timeline",
                "menuItem:share:brand"
            ]
        });
    }

    function ready (callback) {
        // 非微信终端开发时填写以下两句
        callback && callback(true);
        return false;
        // ---
        wx.ready(function () {
            trimMenu();
            callback && callback(true);
        });
        wx.error(function(res){
            callback && callback(false, res);
        });
    }

    function web2app_url (action, gets, hash, addr) {
        var local = sysinfo.siteroot + 'app/index.php';
        var url = addr || local;

        if (action.indexOf('/') != -1) {
            var actions = action.split('/');
            action = actions[0];
            gets = actions[1];
        }

        if (type(gets) == 'string') {
            gets = {
                et: gets
            };
        }
        var params = _.defaults(gets, {
            i: sysinfo.acid,
            c: 'entry',
            do: action,
            m: sysinfo.module.name
        });
        return parseUrl(url, params, hash);
    }

    function parseUrl (url, params, hash) {
        var addr = url || '';
        var p = [];
        for (var i in params) {
            p.push(i + "=" + encodeURI(params[i]));
        }
        addr += "?" + p.join("&");
        if (typeof hash != "undefined") {
            addr += "#" + hash;
        }
        return addr;
    }

    /* **************************************** */
    /* 微信能力 */

    /**
     * 打开扫描功能
     * @param {function} callback 如果只返回扫描内容，在此函数中获取
     * @param {Object} options 配置项，包括text:true|false，type:1|2|0
     */
    function scan (callback, options) {
        
        options = _.defaults(options, {
            text: true, // 是否只返回显示的文字
            type: 2 // 可扫描类型，1一维码 2二维码 0全部类型
        });

        var scanType;
        switch (options.type) {
            case 1: scanType = ['barCode']; break;
            case 2: scanType = ['qrCode']; break;
            case 0: default: scanType = ['qrCode','barCode'];
        }

        wx.ready(function () {
            wx.scanQRCode({
                needResult: options.text == false ? 0 : 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: scanType, // 可以指定扫二维码还是一维码，默认二者都有
                success: function (result) {  // needResult=1时触发
                    if (result.errMsg == 'scanQRCode:ok') {
                        callback && callback(result.resultStr);
                    } else {
                        console.log('扫码识别错误，请重新尝试');
                    }
                }
            });
        });

    }

    /**
     * 调用微擎提供的支付参数进行支付
     * @param {Object} options 配置项，fee|title|sn|done|cancel|fail
     */
    function pay (options) {

        options = _.defaults(options, {
            fee: '',
            title: '',
            sn: '',
            done: function () {},
            cancel: function() {},
            fail: function () {},
        });

        axios.post("index.php?i=" + sysinfo.uniacid + "&j=" + sysinfo.acid + "&c=entry&m=core&do=pay&iswxapp=0", {
            method: 'wechat',
            tid: options.sn,
            title: options.title,
            fee: options.fee,
            module: sysinfo.module.name
        }).then(function (e) {
            if (typeof e == 'string') {
                e = $.parseJSON(e);
            }

            if (e.message.errno != 0) {
                options.fail(e.message)
                return false;
            }
            
            var res = e.message.message;

            wx.chooseWXPay({
                timestamp: res.timeStamp,   // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr : res.nonceStr,    // 支付签名随机串，不长于 32 位
                package  : res.package,     // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                signType : res.signType,    // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign  : res.paySign,     // 支付签名
                success: function (res) {
                    options.done();
                },
                cancel: function () {
                    options.cancel();
                },
                fail: function () {
                    options.fail(false);
                }
            });

        });
    }
    
    var shareMessageCallbackControl = true;
    function shareMessage (options) {

        shareMessageCallbackControl = true;

        options = _.defaults(options, {
            title: '',
            desc: '',
            imgUrl: '',
            link: location.href,
            done: function () {}
        });

        wx.updateAppMessageShareData({ 
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareMessageCallback(options.done, e);
            }
        });
        wx.onMenuShareAppMessage({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareMessageCallback(options.done, e);
            }
        });
    }

    function shareMessageCallback (callback, e) {
        if(shareMessageCallbackControl) {
            callback(e);
        }
        shareMessageCallbackControl = false;
    }

    var shareTimelineCallbackControl = true;
    function shareTimeline (options) {

        shareTimelineCallbackControl = true;

        options = _.defaults(options, {
            title: '',
            desc: '',
            imgUrl: '',
            link: location.href,
            done: function () {}
        });

        wx.updateTimelineShareData({ 
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareTimelineCallback(options.done, e);
            }
        });
        wx.onMenuShareTimeline({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareTimelineCallback(options.done, e);
            }
        });
    }

    function shareTimelineCallback (callback, e) {
        if(shareTimelineCallbackControl) {
            callback(e);
        }
        shareTimelineCallbackControl = false;
    }

    // 封装函数
    exports.init = init;
    exports.ready = ready;
    exports.wx = {
        scan: scan,
        pay: pay,
        shareMessage: shareMessage,
        shareTimeline: shareTimeline
    };
    exports.url = web2app_url;

});