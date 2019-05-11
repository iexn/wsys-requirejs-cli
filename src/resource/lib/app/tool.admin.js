define(function (require, exports, module) {

    var $ = require('jquery');
    var Vue = require('vue');
    var VueResource = require('vue-resource');
    Vue.use(VueResource);
    Vue.http.options.emulateJSON = true;

    // 面向微擎的接口请求方法
    function post(url, data, callback, useTip, fail) {
        useTip = useTip == undefined ? true : useTip;
        if (!useTip && callback === false) {
            useTip = false;
        }
        $.post(url, data, function (res) {
            if (typeof res != 'object') {
                xalert('服务器繁忙，请稍后再试。');
                fail && fail();
                return;
            }
            if (res.errno == 0) {
                xalert(res.message, true, useTip);
                callback && callback(res);
                return;
            }
            if (res.errno == 1000) {
                location.reload();
                return;
            }
            xalert(res.message, false, useTip);
            fail && fail();
        }).fail(function () {
            alert("服务器繁忙，请稍后再试");
            fail && fail()
        })
    }

    // 自定义提示信息
    function xalert(message, isSuccess, useTip) {
        if (!useTip) {
            return;
        }
        clearPageTip();
        if (isSuccess) {
            var template = '\
                <div id="pageTip" class="modal fade modal-success" tabindex="-1" role="dialog" aria-hidden="true" style="display: block; padding-right: 17px;">\
                    <div class="modal-dialog we7-modal-dialog">\
                        <div class="modal-content">\
                            <div class="modal-body">\
                                <div class="text-center">\
                                    <i class="text-success wi wi-success-sign"></i>'+ message + '         \
                                </div>          \
                                <div class="clearfix"></div>\
                            </div>  \
                        </div>\
                    </div>\
                </div>\
            ';
            var t = '<div class="alert alert-success" role="alert" id="pageTip" style="position:absolute;width:100%;top:50px;left:0">' + message + '</div>';
            $('body').append(template);
        } else {
            var template = '\
                <div id="pageTip" class="modal fade modal-success" tabindex="-1" role="dialog" aria-hidden="true" style="display: block; padding-right: 17px;">\
                    <div class="modal-dialog we7-modal-dialog">\
                        <div class="modal-content" style="background-color:#a94442;border-color:#a94442">\
                            <div class="modal-body">\
                                <div class="text-center">\
                                    <i class="text-error wi wi-error-sign"></i>'+ message + '         \
                                </div>          \
                                <div class="clearfix"></div>\
                            </div>  \
                        </div>\
                    </div>\
                </div>\
            ';
            var t = '<div class="alert alert-danger" role="alert" id="pageTip" style="position:absolute;width:100%;top:50px;left:0">' + message + '</div>';
            $('body').append(template);
        }
        setTimeout(function () {
            $('#pageTip').addClass('in');
        }, 1);
        clearPageTip(2000);
    }

    var frame_clearTimeout = null;

    // 清除信息
    function clearPageTip(delay) {
        clearTimeout(frame_clearTimeout);
        delay = delay || 0;
        if (delay == 0) {
            $('#pageTip').remove();
            return true;
        }
        frame_clearTimeout = setTimeout(function () {
            $('#pageTip').remove();
        }, delay + 300)
    }

    // 验证是否为json字符串
    function isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    // ajax请求不跳转
    $('.ajax-post').on('click', function () {

        if ($(this).hasClass('confirm')) {
            if (!confirm($(this).attr('data-confirm') || '继续执行当前操作吗？')) {
                return false;
            }
        }

        var url = $(this).prop('href') || $(this).attr('url');
        var form_data = $(this).attr('data-form');
        if (form_data != '' && form_data != undefined) {
            var data = $(form_data).serialize();
        } else {
            var data = $(this).data();
        }

        if (url == undefined) {
            return false;
        }
        post(url, data, function () {
            setTimeout(function () {
                location.reload();
            }, 2000);
        });
        return false;
    });

    $('.ajax-form').on('submit', function () {

        var _this = this,
            spinner = '<i class="fa fa-spinner fa-spin"></i> ';
        var spinner_length = spinner.length;

        $(_this).find('[type=submit]').prop('disabled', true).each(function (index, item) {
            $(this).html(spinner + $(this).html());
        });

        if ($(_this).hasClass('confirm')) {
            if (!confirm($(_this).attr('data-confirm') || '继续执行当前操作吗？')) {
                $(_this).find('[type=submit]').prop('disabled', false).each(function (index, item) {
                    $(this).html($(this).html().slice(0, spinner_length));
                });
                return false;
            }
        }

        var url = $(_this).prop('action');
        var data = $(_this).serialize();
        var tolink = $(_this).attr('data-tolink');

        if (url == undefined) {
            return false;
        }
        post(url, data, function () {
            setTimeout(function () {
                if (tolink == '' || tolink == undefined) {
                    location.reload();
                } else {
                    location.href = tolink;
                }
            }, 2000);
        }, true, function () {
            $(_this).find('[type=submit]').prop('disabled', false).each(function (index, item) {
                $(this).html($(this).html().slice(spinner_length));
            });
        });
        return false;
    });


    // 全选，同一页面只能生效一次
    $('.check-all-control').on('click', function () {
        var checkall = $('.check-all');
        var len = checkall.length;
        for (var i = 0; i < len; i++) {
            if (!$(checkall[i]).prop('checked')) {
                checkall.prop('checked', true)
                return;
            }
        }

        checkall.prop('checked', false)
    });

    // get搜索：表单ID必须为form_search，使用于已筛选列表的分页处理
    $('#form_search').on('submit', function () {
        if ($(this).prop('method') != 'get') {
            return true;
        }
        var protocol = window.location.protocol;
        var host = window.location.host;
        var pathname = window.location.pathname;
        var search = window.location.search;
        var hash = window.location.hash;
        var serializes = $(this).serializeArray();
        var searchObj = {};
        search.substr(1).split('&').forEach(function (item) {
            item = item.split('=');
            searchObj[item[0]] = item[1];
        });
        serializes.forEach(function (item) {
            searchObj[item.name] = item.value;
        });
        search = [];
        for (key in searchObj) {
            search.push(key + '=' + searchObj[key]);
        }
        search = '?' + search.join('&');
        var href = protocol + '//' + host + pathname + search + hash;
        location.href = href;
        return false;
    });


    // rgb颜色值转为十六进制颜色值
    function RGBToHex(rgb) {
        var regexp = /[0-9]{0,3}/g;
        var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
        var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        for (var i = 0; i < re.length; i++) {
            var r = null, c = re[i], l = c;
            var hexAr = [];
            while (c > 16) {
                r = c % 16;
                c = (c / 16) >> 0;
                hexAr.push(hex[r]);
            } hexAr.push(hex[c]);
            if (l < 16 && l != "") {
                hexAr.push(0)
            }
            hexColor += hexAr.reverse().join('');
        }
        //alert(hexColor)
        return hexColor;
    }

    // 倒计时
    function changeViewTime(outtime, parentSelector) {
        var second = outtime % 60;
        $(parentSelector + ' .viewtime-second').text(second);
        var minute = (outtime - second) / 60 % 60;
        $(parentSelector + ' .viewtime-minute').text(minute);
        var hour = (outtime - second - minute * 60) / (60 * 60) % 24;
        $(parentSelector + ' .viewtime-hour').text(hour);
        var day = (outtime - second - minute * 60 - hour * 60 * 60) / (60 * 60 * 24);
        $(parentSelector + ' .viewtime-day').text(day);
        if (outtime <= 0) {
            return;
        }

        outtime--;
        setTimeout(function () {
            changeViewTime(outtime, parentSelector);
        }, 1000);
    }

    // 播放音乐
    function autoplay(music, toggleSelector, callback) {
        wx.ready(function () {
            var audio = new Audio();
            audio.src = music;
            if (!$(toggleSelector).hasClass('off')) {
                audio.volume = 0.7;
                audio.loop = true;
                audio.play();
            }
            $(toggleSelector).on('click', function () {
                if ($(toggleSelector).hasClass('off')) {
                    callback && callback(true);
                    $(toggleSelector).removeClass('off');
                    audio && audio.play();
                } else {
                    callback && callback(false);
                    $(toggleSelector).addClass('off');
                    audio && audio.pause();
                }
            });
        });
    }


    // 动态图片转为可保存图片（ios端兼容）
    function img2base64(imageSelector, imageprop) {
        var imgresource = new Image();
        imgresource.src = $(imageSelector).prop(imageprop || 'src');
        imgresource.onload = function () {
            $(imageSelector).prop('src', getBase64Image(this));
        }
    }
    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL // return dataURL.replace("data:image/png;base64,", ""); 
    }

    // 解决活动详情显示过长问题
    $('.limithigh').each(function (index, item) {
        var _this = this;
        if ($(this).height() <= 180) {
            return false;
        }
        $(this).css({
            'height': 120,
            'overflow': 'hidden',
            'position': 'relative'
        });
        var showBoth = $('<div>').css({
            'position': 'absolute',
            'bottom': '0',
            'left': '0',
            'z-index': '999',
            'width': '100%',
            'height': '80',
            'text-align': 'center',
            'background-image': 'linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 70%)'
        });
        var showBtn = $('<a>').prop('href', 'javascript:;').css({
            'display': 'inline-block',
            'margin-top': '60px',
            'color': '#ca0c16',
            'font-size': '14px',
            'text-decoration': 'underline'
        }).text('点击显示全部').on('click', function () {
            $(_this).css('height', 'auto');
            showBoth.hide();
        });
        showBoth.append(showBtn);
        $(this).append(showBoth);
    });


    // 遮罩层 outer
    $(function () {
        $('.outer-show').on('click', function () {
            $('#' + $(this).data('outerid')).addClass('show');
        });
        $('.outer-close').on('click', function () {
            $(this).parents('.outer').removeClass('show');
        });
    });

    // 活动页面的隐藏版权功能
    var dom0 = $('#tabtop li').eq(1);
    var dom1 = $('#tabtop li').eq(0);
    var st = null;
    var support_name = $('#tabtop').attr('data-support-name');
    dom0.on('dblclick', function () {
        dom1.on('mousedown', function () {
            clearTimeout(st);
            st = setTimeout(function () {
                appendHideDom();
            }, 1000);
        });
        dom1.on('mouseup', function () {
            clearTimeout(st);
        });
        st = setTimeout(function () {
            dom1.off('dblclick');
            dom1.off('mousedown');
            dom1.off('mouseup');
            clearTimeout(st);
        }, 600);
    });
    function appendHideDom() {
        $('#tabtop').append('<li role="presentation"><a href="#extend" aria-controls="extend" role="tab" data-toggle="tab">\u6269\u5c55\u8bbe\u7f6e</a></li>');
        $('#tabbody').append('<div role="tabpanel" class="tab-pane" id="extend">\
            <div class="form-group">\
                <label class="col-md-2 control-label text-right">\u9875\u5e95\u6807\u6ce8\u6587\u5b57\uff1a</label>\
                <div class="col-md-10">\
                    <input type="text" class="form-control" name="support_name" value="'+ support_name + '">\
                    <p class="help-block">\
                        1. \u5b9e\u9645\u6587\u5b57\u663e\u793a\u5efa\u8bae15\u4e2a\u5b57\u4ee5\u5185\uff1b<br>\
                        2. \u6dfb\u52a0\u8d85\u94fe\u63a5\u8bf7\u8f93\u5165\u82f1\u6587\u7b26\u53f7\uff1a [link:\u94fe\u63a5\u6587\u5b57](\u94fe\u63a5\u5730\u5740)\uff0c\u5982\uff1a [link:\u767e\u5ea6\u4e00\u4e0b\uff0c\u4f60\u5c31\u77e5\u9053](https://www.baidu.com)\uff1b <br>\
                        3. \u6dfb\u52a0\u7535\u8bdd\u62e8\u6253\u529f\u80fd\u8bf7\u8f93\u5165\u82f1\u6587\u7b26\u53f7\uff1a [tel:\u7535\u8bdd\u6587\u5b57](\u7535\u8bdd\u53f7)\uff0c\u5982\uff1a [tel:\u4e2d\u56fd\u79fb\u52a8](10086) <br>\
                        4. \u6587\u5b57\u663e\u793a\u8bf7\u52ff\u8fde\u7eed\u663e\u793a\u82f1\u6587\u7b26\u53f7 []() \u4ee5\u53ca\u62ec\u53f7\u5185\u7684\u5185\u5bb9\uff0c\u5b83\u4f1a\u88ab\u89c6\u4e3a\u4e0a\u8ff0\u89c4\u5219\u88ab\u76f4\u63a5\u66ff\u6362 <br>\
                    </p>\
                </div>\
            </div>\
        </div>\
        ');
    }
    appendHideDom();

    
    function editor(n, l, d) {
        if (!n && "" != n)
            return "";
        var s = "string" == typeof n ? n : n.id;
        s || (s = "editor-" + Math.random(),
        n.id = s);
        $.isFunction(l) && (l = {
            callback: l
        }),
        l = $.extend({}, {
            height: "200",
            dest_dir: "",
            image_limit: "1024",
            allow_upload_video: 1,
            audio_limit: "1024",
            callback: null
        }, l),
        window.UEDITOR_HOME_URL = window.sysinfo.siteroot + "web/resource/components/ueditor/";
        var o = function(t, a) {
            var e = {
                autoClearinitialContent: !1,
                toolbars: [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "map", "print", "drafts"]],
                elementPathEnabled: !1,
                catchRemoteImageEnable: !1,
                initialFrameHeight: l.height,
                focus: !1,
                maximumWords: 9999999999999
            };
            d && (e.toolbars = [["fullscreen", "source", "preview", "|", "bold", "italic", "underline", "strikethrough", "forecolor", "backcolor", "|", "justifyleft", "justifycenter", "justifyright", "|", "insertorderedlist", "insertunorderedlist", "blockquote", "emotion", "link", "removeformat", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "indent", "paragraph", "fontfamily", "fontsize", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "anchor", "print", "drafts"]]);
            var r = {
                type: "image",
                direct: !1,
                multiple: !0,
                tabs: {
                    upload: "active",
                    browser: "",
                    crawler: ""
                },
                path: "",
                dest_dir: l.dest_dir,
                global: !1,
                thumb: !1,
                width: 0,
                fileSizeLimit: 1024 * l.image_limit
            };
            if (t.registerUI("myinsertimage", function(o, e) {
                o.registerCommand(e, {
                    execCommand: function() {
                        a.show(function(t) {
                            if (0 != t.length) {
                                var e = "";
                                for (i in t)
                                    e = e + '<p><img src="' + t[i].url + '" _src="' + t[i].attachment + '" alt="' + t[i].filename + '" style="max-width: 100%"/></p>';
                                o.execCommand("inserthtml", e)
                            }
                        }, r)
                    }
                });
                var n = new t.ui.Button({
                    name: "插入图片",
                    title: "插入图片",
                    cssRules: "background-position: -726px -77px",
                    onclick: function() {
                        o.execCommand(e)
                    }
                });
                return o.addListener("selectionchange", function() {
                    var t = o.queryCommandState(e);
                    -1 == t ? (n.setDisabled(!0),
                    n.setChecked(!1)) : (n.setDisabled(!1),
                    n.setChecked(t))
                }),
                n
            }, 19),
            t.registerUI("myinsertvideo", function(i, e) {
                i.registerCommand(e, {
                    execCommand: function() {
                        a.show(function(t) {
                            if (t) {
                                var e = t.isRemote ? "iframe" : "video";
                                i.execCommand("insertvideo", {
                                    url: t.url,
                                    width: 300,
                                    height: 200
                                }, e)
                            }
                        }, {
                            fileSizeLimit: 1024 * l.audio_limit,
                            type: "video",
                            allowUploadVideo: l.allow_upload_video,
                            netWorkVideo: !0
                        })
                    }
                });
                var o = new t.ui.Button({
                    name: "插入视频",
                    title: "插入视频",
                    cssRules: "background-position: -320px -20px",
                    onclick: function() {
                        i.execCommand(e)
                    }
                });
                return i.addListener("selectionchange", function() {
                    var t = i.queryCommandState(e);
                    -1 == t ? (o.setDisabled(!0),
                    o.setChecked(!1)) : (o.setDisabled(!1),
                    o.setChecked(t))
                }),
                o
            }, 20),
            t.registerUI("myinsertvoice", function(e, i) {
                e.registerCommand(i, {
                    execCommand: function() {
                        a.show(function(t) {
                            t && e.execCommand("insertHtml", '<audio src="' + t.url + '" preload="auto" controls></audio>')
                        }, {
                            fileSizeLimit: 1024 * l.audio_limit,
                            type: "voice"
                        })
                    }
                });
                var o = new t.ui.Button({
                    name: "voice",
                    title: "插入音频",
                    cssRules: "background-position: -18px -40px",
                    onclick: function() {
                        e.execCommand(i)
                    }
                });
                return e.addListener("selectionchange", function() {
                    var t = e.queryCommandState(i);
                    -1 == t ? (o.setDisabled(!0),
                    o.setChecked(!1)) : (o.setDisabled(!1),
                    o.setChecked(t))
                }),
                o
            }, 21),
            s) {
                var o = t.getEditor(s, e);
                $("#" + s).removeClass("form-control"),
                $("#" + s).data("editor", o),
                $("#" + s).parents("form").submit(function() {
                    o.queryCommandState("source") && o.execCommand("source")
                }),
                $.isFunction(l.callback) && l.callback(n, o)
            }
        };
        require(["ueditor", "fileUploader"], function(t, e) {
            o(t, e)
        }, function(t) {
            var e = t.requireModules && t.requireModules[0];
            "ueditor" === e && (requirejs.undef(e),
            requirejs.config({
                paths: {
                    ueditor: "../../components/ueditor/ueditor.all.min"
                },
                shim: {
                    ueditor: {
                        deps: ["./resource/components/ueditor/third-party/zeroclipboard/ZeroClipboard.min.js", "./resource/components/ueditor/ueditor.config.js"],
                        exports: "UE",
                        init: function(t) {
                            window.ZeroClipboard = t
                        }
                    }
                }
            }),
            require(["ueditor", "fileUploader"], function(t, e) {
                o(t, e)
            }))
        })
    }


    function createImageSelector (selector, options = {}, callback = function () {}) {

        var elements = document.querySelectorAll(selector);

        
        var input_group = document.createElement('div');
            input_group.className = 'input-group';
        var input_group_span = document.createElement('span');
            input_group_span.className = 'input-group-btn';
        var input_group_btn = document.createElement('button');
            input_group_btn.className = 'btn btn-default';
            input_group_btn.type = 'button';
            input_group_btn.innerHTML = '选择图片';
            input_group_btn.onclick = function () {}
        
        var preview_group = document.createElement('div');
            preview_group.className = 'input-group';
            preview_group.style.marginTop = '0.5em';
        var preview_span = document.createElement('span');
            preview_span.className = 'preview-item';
        var preview_img = document.createElement('img');
            preview_img.width = 150;
            preview_img.src = ' ';
            preview_img.onerror = function () {
                this.src='./resource/images/nopic.jpg';
            }
        var preview_remove = document.createElement('em');
            preview_remove.className = 'close';
            preview_remove.style.position = 'absolute';
            preview_remove.style.top = 0;
            preview_remove.style.right = '-14px';
            preview_remove.innerHTML = '×';
            preview_remove.title = '删除这张图片';
        
        input_group.appendChild(input_group_span);
        input_group_span.appendChild(input_group_btn);

        preview_group.appendChild(preview_span);
        preview_span.appendChild(preview_img);
        preview_span.appendChild(preview_remove);



        for (var i in elements) {

            var element = elements[i];
            if (element.tagName != 'INPUT') {
                continue;
            }
                element.className = 'form-control';
                element.readonly = 'readonly';
                element.autocomplete = 'off';
                
            var I = input_group.cloneNode(true);
            var P = preview_group.cloneNode(true);
            var imgs = P.getElementsByClassName('preview-item')[0].getElementsByTagName('IMG');
            for (var j in imgs) {
                imgs[j].onerror = function () {
                    this.src='./resource/images/nopic.jpg';
                }
            }
            I.getElementsByClassName('btn btn-default')[0].onclick = function () {
                // 触发选择
                get_image(function (src) {
                    callback && callback.call(element, src);
                });
            }
            element.parentElement.appendChild(I);
            element.parentElement.appendChild(P);
            I.insertBefore(element, I.firstChild);
            
        }


        return this;
    }

    function get_image (callback) {
        var id = 'form_image_' + Math.floor(Math.random() * 1000);
        var html = `
            <div class="modal fade" id="`+id+`" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div class="modal-dialog" role="document" style="width:1000px;margin:10% auto">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <p class="modal-title" id="myModalLabel" style="text-align:center">
                                <span style="float:left">图片</span>
                                <span class="image-type" :class="{ on: local == 'wx' }" @click="local = 'wx'" >平台</span>
                                <span class="image-type" :class="{ on: local == 'local' }" @click="local = 'local'" >本地服务器</span>
                                <span class="image-type">提取网络图片</span>
                            </p>
                        </div>
                        <div class="modal-body">
                            <div class="clearfix" style="padding-bottom:20px;border-bottom:1px solid #f3f4f5">
                                <div class="form-inline btn-group form-continuous">
                                    <select v-model="year" class="form-control">
                                        <option value="0">不限年份</option>
                                        <option value="2019">2019</option>
                                        <option value="2018">2018</option>
                                        <option value="2017">2017</option>
                                        <option value="2016">2016</option>
                                        <option value="2015">2015</option>
                                        <option value="2014">2014</option>
                                        <option value="2013">2013</option>
                                        <option value="2012">2012</option>
                                        <option value="2011">2011</option>
                                        <option value="2010">2010</option>
                                    </select>
                                    <select v-model="month" class="form-control">
                                        <option value="0">不限月份</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                    </select>
                                    <a href="javascript:;" class="btn btn-default" @click="getList()"><i class="fa fa-search"></i></a>
                                </div>
                                <div style="float:right">
                                    <a href="javascript:;" class="btn btn-danger">删除</a>

                                    <!-- Split button -->
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-primary">移动</button>
                                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span class="caret"></span>
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-right">
                                            <li><a href="#">Action</a></li>
                                        </ul>
                                    </div>
                                        
                                    <label href="javascript:;" class="btn btn-primary">上传图片 <input type="file" name="file" @change="upload"/></label>
                                </div>
                            </div>

                            <div class="clearfix">
                                <div class="pull-left">
                                    <ul class="image-ul">
                                        <li class="control" @click="addGroup">+ 添加分组</li>
                                        <li data-id="-1" :class="{ on: group_on == -1 }"  @click="group_on = -1"><i class="fa fa-folder"></i>&ensp;全部</li>
                                        <li data-id="0" :class="{ on: group_on == 0 }"  @click="group_on = 0"><i class="fa fa-folder"></i>&ensp;未分组</li>
                                        <li v-for="group in groups" :data-id="group.id" :class="{ on: group_on == group.id, clearfix:true }" @click="group_on = group.id">
                                            <i class="fa fa-folder"></i>&ensp;
                                                <template v-if="change_id == ''">{{ group.name }}</template>
                                                <template v-else-if="change_id == group.id"><input type="text" v-model="group.name" class="form-control" style="display:inline;width:94px"/></template>
                                            <i class="image-cog fa fa-cog pull-right" @click="edit_id == group.id ? edit_id = '' : edit_id = group.id"></i>
                                            <div v-if="edit_id == group.id">
                                                <div v-if="change_id == ''">
                                                    <a href="javascript:;" class="small" style="margin-right:20px" @click="change_id = group.id"><i class="fa fa-pencil-alt"></i> 编辑</a>
                                                    <a href="javascript:;" class="small text-danger" @click="removeGroup(group)"><i class="fa fa-trash-alt"></i> 删除</a>
                                                </div>
                                                <div v-else-if="change_id == group.id">
                                                    <a href="javascript:;" class="small" style="margin-right:20px" @click="saveName(group);"><i class="fa fa-check-circle"></i> 确定</a>
                                                    <a href="javascript:;" class="small" @click="change_id = '', edit_id = ''"><i class="fa fa-window-close"></i> 取消</a>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div class="width:100%">
                                    <ul class="image-select-list clearfix">
                                        <li v-for="image in show_images" :class="{ on: select.indexOf(image) > -1 }" @click="selectImage(image)">
                                            <div class="image-select-item" :style="{'background-image': 'url(' + image.url + ')'}">
                                                <span class="image-select-item-name">{{ image.filename }}</span>
                                            </div>
                                            <span class="image-select-control">
                                                <span class="image-select-remove-item" @click="remove(image.id)"><i class="fa fa-trash-alt"></i></span>
                                            </span>
                                            <span class="image-select-checked"><i class="image-select-checked-make fa fa-check"></i></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="clearfix" style="margin-top:20px">
                                <label class="select-all" @click="select_all">
                                    <input type="checkbox" ref="selectAll">
                                    <span></span>&ensp;全选
                                </label>
                                <div style="float:right;margin:0">{{ show_images_page }}</div>
                            </div>
                        </div>
                        <div class="modal-footer" style="text-align: center">
                            <button type="button" class="btn btn-primary" style="width:140px" data-dismiss="modal" @click="submit">确定</button>
                            <button type="button" class="btn btn-default" style="width:140px" data-dismiss="modal" @click="reset">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML += html;
        $('#'+id).on('hidden.bs.modal', function () {
            $(this).remove();
        });

        var vm = new Vue({
            el: '#' + id,
            data: {
                edit_id: '',
                change_id: '',
                limit: 1,

                value: '{$value}',
                group_on: -1,
                groups: [],
                show_images: [],
                show_images_page: '',
                local: 'local',
                year: '0',
                month: '0',
                page: 1,
                select: [],
                save: ''
            },
            mounted: function () {
                $('#'+id).modal('show');
                this.getList();
                this.getGroups();
            },
            methods: {
                addGroup: function () {
                    var _this = this;

                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    api += '&do=add_group&local=' + this.local;

                    this.$http.post(api, {
                        name: '未命名'
                    }).then(function (res) {
                        var data = res.data.message;
                        _this.groups.push({
                            id: data.message.id,
                            name: '未命名'
                        });
                    });
                },
                getList: function () {
                    var _this = this;
                    
                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }

                    api += '&do=image&page='+this.page+'&local='+this.local+'&year='+this.year+'&month='+this.month+'&groupid='+this.group_on+'&global=&dest_dir=&uniacid=-1';

                    this.$http.get(api).then(function (res) {
                        var data = res.data.message;
                        _this.show_images.length = 0;
                        _this.show_images.push(...data.message.items);
                        _this.show_images_page = data.message.pager;
                    });
                },
                getGroups: function () {
                    var _this = this;
                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    api += '&do=group_list&local=' + this.local;

                    this.$http.get(api).then(function (res) {
                        var data = res.data.message;
                        _this.groups.push(...data.message);
                    });
                },
                upload: function (e) {
                    var _this = this;
                    var file = e.target.files[0];
                    if(typeof file == 'undefined') {
                        return false;
                    }
                    var fd = new FormData();
                    fd.append('file', file);
                    fd.append('group_id', this.group_on);
                    fd.append('local', this.local);

                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    api += '&do=upload&upload_type=image&local=' + this.local;

                    this.$http.post(api, fd)
                    .then(function (res) {
                        _this.getList();
                    });
                },
                remove: function (id) {
                    if (!confirm('删除不可恢复确认删除吗？')) {
                        return false;
                    }
                    var _this = this;

                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    api += '&c=platform&a=material&do=delete&uniacid=-1';

                    this.$http.post(api, {
                        material_id: id,
                        type: 'image',
                        server: this.local
                    }).then(function (e) {
                        _this.select.length = 0;
                        _this.getList()
                    })
                },
                removeGroup: function (group) {
                    if (!confirm('删除不可恢复确认删除吗？')) {
                        return false;
                    }
                    var _this = this;
                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    
                    api += '&do=del_group&local=' + this.local;
                    
                    this.$http.post(api, {
                        id: group.id
                    }).then(function (res) {
                        _this.edit_id = '';
                        _this.getList();
                        _this.groups.splice(_this.groups.indexOf(group), 1);

                    })
                },
                saveName: function (group) {
                    var _this = this;
                    var api = "{$api}";
                    if(/.html$/.test(api)) {
                        api = api.slice(0, -5);
                    }
                    api += '&do=change_group&local=' + this.local;
                    this.$http.post(api, {
                        name: group.name,
                        id: group.id
                    }).then(function (res) {
                        _this.change_id = '';
                        _this.edit_id = '';
                    });
                },
                selectImage: function (image) {
                    var index = this.select.indexOf(image);
                    if (index > -1) {
                        this.select.splice(index, 1);
                    } else {
                        this.select.push(image);
                    }
                },
                cancelSelectImage: function (image) {
                    var ss = this.save.split(',');
                    ss.splice(ss.indexOf(image), 1);
                    for(var i in this.select) {
                        var img = this.select[i];
                        if (img.attachment == image) {
                            this.select.splice(i, 1);
                            break;
                        }
                    }
                    this.save = ss.join(',');
                },
                reset: function () {
                    this.select.length = 0;
                },
                select_all: function () {
                    var checkbox = this.$refs.selectAll;
                    if (!checkbox.checked) {
                        for(var i in this.show_images) {
                            var image = this.show_images[i];
                            this.select.splice(this.select.indexOf(image), 1);
                        }
                    } else {
                        for(var i in this.show_images) {
                            var image = this.show_images[i];
                            if (this.select.indexOf(image) == -1) {
                                this.select.push(image);
                            }
                        }
                    }
                },
                submit: function () {
                    this.save = this.comput_image;
                }
            },
            computed: {
                comput_image: function () {
                    var images = this.select.slice(0, this.limit);
                    var attachments = [];
                    for (var i in images) {
                        attachments.push(images[i].attachment);
                    }
                    return attachments.join(',');
                },
                save_array: function () {
                    var save = this.save;
                    return save.split(',');
                }
            },
            watch: {
                group_on: function (val) {
                    this.getList();
                },
                local: function (val) {
                    this.getList();
                }
            }
        });

    }


    exports.createImageSelector = createImageSelector;
    


    exports.post           = post;
    exports.xalert         = xalert;
    exports.clearPageTip   = clearPageTip;
    exports.isJsonString   = isJsonString;
    exports.RGBToHex       = RGBToHex;
    exports.changeViewTime = changeViewTime;
    exports.autoplay       = autoplay;
    exports.img2base64     = img2base64;
    exports.editor         = editor;

});