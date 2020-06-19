﻿/*! v4.5.0.4 | pageoffice.js for java | (c) 2016, 2018 Beijing zhuozheng zhiyuan software, Inc.*/
function PO_checkPageOffice() {
    var bodyHtml = document.body.innerHTML;
    if (bodyHtml.indexOf("EC852C85-C2FC-4c86-8D6B-E4E97C92F821") < 0) {
        var poObjectStr = "";
        var explorer = window.navigator.userAgent;
        if (explorer.indexOf("MSIE") >= 0) {
            poObjectStr = "<div style=\"background-color:green;width:1px; height:1px;\">" + "\r\n" + "<object id=\"PageOfficeCtrl1\" height=\"100%\" width=\"100%\" classid=\"clsid:EC852C85-C2FC-4c86-8D6B-E4E97C92F821\">" + "</object></div>"
        } else {
            poObjectStr = "<div style=\"background-color:green;width:1px; height:1px;\">" + "\r\n" + "<object id=\"PageOfficeCtrl1\" height=\"100%\" width=\"100%\" type=\"application/x-pageoffice-plugin\" clsid=\"{EC852C85-C2FC-4c86-8D6B-E4E97C92F821}\">" + "</object></div>"
        }
        jQuery(document.body).append(poObjectStr)
    }
    try {
        var sCap = document.getElementById("PageOfficeCtrl1").Caption;
        if (sCap == null) {
            return false
        } else {
            return true
        }
    } catch(e) {
        return false
    }
}
function po_uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
    i;
    radix = radix || chars.length;
    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8: r]
            }
        }
    }
    return uuid.join('')
}
function po_core_md5(x, len) {
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        a = po_md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = po_md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = po_md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = po_md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = po_md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = po_md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = po_md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = po_md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = po_md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = po_md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = po_md5_ff(c, d, a, b, x[i + 10], 17, -42063);
        b = po_md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = po_md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = po_md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = po_md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = po_md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = po_md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = po_md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = po_md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = po_md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = po_md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = po_md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = po_md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = po_md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = po_md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = po_md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = po_md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = po_md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = po_md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = po_md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = po_md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = po_md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = po_md5_hh(a, b, c, d, x[i + 5], 4, -378558);
        d = po_md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = po_md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = po_md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = po_md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = po_md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = po_md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = po_md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = po_md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = po_md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = po_md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = po_md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = po_md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = po_md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = po_md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = po_md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = po_md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = po_md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = po_md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = po_md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = po_md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = po_md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = po_md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = po_md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = po_md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = po_md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = po_md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = po_md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = po_md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = po_md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = po_md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = po_md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = po_safe_add(a, olda);
        b = po_safe_add(b, oldb);
        c = po_safe_add(c, oldc);
        d = po_safe_add(d, oldd)
    }
    return Array(a, b, c, d)
}
function po_md5_cmn(q, a, b, x, s, t) {
    return po_safe_add(po_bit_rol(po_safe_add(po_safe_add(a, q), po_safe_add(x, t)), s), b)
}
function po_md5_ff(a, b, c, d, x, s, t) {
    return po_md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}
function po_md5_gg(a, b, c, d, x, s, t) {
    return po_md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}
function po_md5_hh(a, b, c, d, x, s, t) {
    return po_md5_cmn(b ^ c ^ d, a, b, x, s, t)
}
function po_md5_ii(a, b, c, d, x, s, t) {
    return po_md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}
function po_safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF)
}
function po_bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
}
function po_str2binl(str) {
    var bin = Array();
    var mask = (1 << 8) - 1;
    for (var i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    return bin
}
function po_binl2hex(binarray) {
    var hex_tab = "0123456789ABCDEF";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF)
    }
    return str
}
function po_hex_md5(s) {
    return po_binl2hex(po_core_md5(po_str2binl(s), s.length * 8))
}
var bPOIsInstalled = false;
var POParent = po_hex_md5(window.location.pathname);
var PO_code = "\150\164\164\160\72\57\57\61\62\67\56\60\56\60\56\61\72\65\67\60\67\60\57";
var PO_code2 = "\150\164\164\160\163\72\57\57\61\62\67\56\60\56\60\56\61\72\65\67\60\67\61\57";
var PO_datas;
var POBrowser = {
    isChromeAndGreaterThan42: function() {
        var e = "42";
        return this.getChromeVersion() >= e ? !0 : !1
    },
    getChromeVersion: function() {
        var e, t = navigator.userAgent.toLowerCase(),
        n = /chrome/,
        o = /safari\/\d{3}\.\d{2}$/,
        i = /chrome\/(\S+)/;
        return n.test(t) && o.test(t) && i.test(t) ? e = RegExp.$1: 0
    },
    isChrome: function() {
        var e = navigator.userAgent.toLowerCase(),
        t = /chrome/;
        return t.test(e) ? !0 : !1
    },
    isEdge: function() {
        var e = navigator.userAgent.toLowerCase(),
        t = /edge/;
        return t.test(e) ? !0 : !1
    },
    isOldIE: function() {
        var e = navigator.userAgent.toLowerCase();
        return /msie/.test(e)
    },
    getBrowserVer: function() {
        var e = navigator.userAgent.toLowerCase();
        return (e.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1]
    },
    isXDR: function() {
        if (POBrowser.isOldIE() && ((parseInt(POBrowser.getBrowserVer(), 10) == 8) || (parseInt(POBrowser.getBrowserVer(), 10) == 9)) && window.XDomainRequest) return true;
        else return false
    },
    checkPOBrowserSate: function() {},
    strToHexCharCode: function(str) {
        if (str === "") return "";
        var hexCharCode = [];
        for (var i = 0; i < str.length; i++) {
            hexCharCode.push((str.charCodeAt(i)).toString(16))
        }
        return hexCharCode.join("").toUpperCase()
    },
    checkSSL: function() {
        var strhref = window.location.href;
        strhref = strhref.toLowerCase();
        if (strhref.substr(0, 8) == "https://") {
            PO_code = PO_code2
        }
        return true
    },
    getRootPath: function() {
        var pathName = document.getElementById('po_js_main').src;
        var index = pathName.indexOf("/pageoffice.js");
        return pathName.substr(0, index)
    },
    isInstalled: function() {
        return bPOIsInstalled
    },
    showInstallDlg: function() {
        if (confirm("您需要安装PageOffice来打开文档。现在立即安装PageOffice吗？\r\n注意：安装完成后，请重新访问当前页面。")) {
            window.location.href = this.getRootPath() + "/posetup.exe"
        }
    },
    findInstall: function(){
      jQuery.ajax({
          url: PO_code + "json.htm?callback=?",
          dataType: "json",
          global: false,
          error: function(XMLHttpRequest, textStatus, errorThrown) {
              if (textStatus == "timeout") {} else {}
          },
          success: function(data, textStatus) {
              if (textStatus == "success" && data) {
                  jQuery.each(data,
                  function(i, value) {
                      if (value.name == "jsonx") {
                          bPOIsInstalled = true;
                          if (POBrowser.isXDR()) setTimeout("POBrowser.callback3()", 300);
                          else setTimeout("POBrowser.callback2()", 300);
                          return false
                      }
                  })
              }
          }
      });
    },
    openWindow: function(url,strURL, strOptions, strArgument) {
        if ((strURL == null) || (strURL == "")) {
            alert("The parameter strURL of openWindow() cannot be null or empty.");
            return
        }
        this.findInstall();
        var that = this;
        setTimeout(function() {
          if (!bPOIsInstalled) {
            that.showInstallDlg();
            return;
          }
        }, 400)
        if (strURL.charAt(0) != '/') {
            var strLower = strURL.toLowerCase();
            if ((strLower.substr(0, 7) == "http://") || (strLower.substr(0, 8) == "https://")) {} else {
                var pathName = window.location.href;
                if (pathName.indexOf("?") > 0) pathName = pathName.substr(0, pathName.indexOf("?"));
                var index = pathName.lastIndexOf("/");
                strURL = pathName.substr(0, index + 1) + strURL
            }
        } else {
            var pathName = window.location.href;
            var index = pathName.indexOf(window.location.pathname);
            strURL = pathName.substr(0, index) + strURL
        }
        jQuery.post(url + "/poserver.zz", {
            Info: "PageOfficeLink",
            pageurl: strURL,
            options: strOptions,
            params: strArgument
        },
        function(data) {
            PO_datas = data.split("\r\n");
            setTimeout("POBrowser.sendUserdata()", 50);
            location.href = PO_datas[0] + POParent;
            jQuery().showPobDlg()
        },
        "text")
    },
    openWindowModeless: function(path,strURL, strOptions, strArgument) {
        if ((strURL == null) || (strURL == "")) {
            alert("The parameter strURL of openWindowModeless() cannot be null or empty.");
            return
        }
        this.findInstall();
        var that = this;
        setTimeout(function(){
          if (!bPOIsInstalled) {
            that.showInstallDlg();
            return;
          }
        }, 400)
        if (strURL.charAt(0) != '/') {
            var strLower = strURL.toLowerCase();
            if ((strLower.substr(0, 7) == "http://") || (strLower.substr(0, 8) == "https://")) {} else {
                var pathName = window.location.href;
                if (pathName.indexOf("?") > 0) pathName = pathName.substr(0, pathName.indexOf("?"));
                var index = pathName.lastIndexOf("/");
                strURL = pathName.substr(0, index + 1) + strURL
            }
        } else {
            var pathName = window.location.href;
            var index = pathName.indexOf(window.location.pathname);
            strURL = pathName.substr(0, index) + strURL
        }
        if (strOptions[strOptions.length - 1] != ';') strOptions = strOptions + ";";
        jQuery.post(path + "/poserver.zz", {
            Info: "PageOfficeLink",
            pageurl: strURL,
            options: strOptions + "IsModal=false;",
            params: strArgument
        },
        function(data) {
            PO_datas = data.split("\r\n");
            var strToken = po_hex_md5(POBrowser.strToHexCharCode(PO_datas[0] + POParent));
            if (POBrowser.isXDR()) {
                var xdr = new XDomainRequest();
                if (xdr) {
                    xdr.onload = function() {
                        var data = xdr.responseText;
                        if (data == "") {
                            setTimeout("POBrowser.sendUserdata()", 50);
                            location.href = PO_datas[0] + POParent
                        } else if (data == "false") {
                            setTimeout("POBrowser.sendUserdata()", 50);
                            location.href = PO_datas[0] + POParent + "|" + strToken
                        }
                    };
                    xdr.onerror = function(e) {};
                    xdr.ontimeout = function() {};
                    xdr.open("POST", PO_code + "checkopened.htm?x=" + po_uuid(8, 16));
                    xdr.send("token=" + strToken)
                } else {}
            } else {
                jQuery.ajax({
                    url: PO_code + "checkopened.htm?x=" + po_uuid(8, 16),
                    data: {
                        "token": strToken
                    },
                    dataType: "text",
                    global: false,
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        if (textStatus == "timeout") {} else {}
                    },
                    success: function(data, textStatus) {
                        if (textStatus == "success") {
                            if (data == "") {
                                setTimeout("POBrowser.sendUserdata()", 50);
                                location.href = PO_datas[0] + POParent
                            } else if (data == "false") {
                                setTimeout("POBrowser.sendUserdata()", 50);
                                location.href = PO_datas[0] + POParent + "|" + strToken
                            }
                        }
                    }
                })
            }
        },
        "text")
    },
    sendUserdata: function() {
        if (POBrowser.isXDR()) {
            var xdr = new XDomainRequest();
            if (xdr) {
                xdr.onload = function() {};
                xdr.onerror = function(e) {};
                xdr.open("POST", PO_code + "userdata.htm?x=" + po_uuid(8, 16));
                xdr.send("parent=" + POParent + "&Info=" + PO_datas[1])
            } else {}
        } else {
            jQuery.post(PO_code + "userdata.htm?x=" + po_uuid(8, 16), {
                parent: POParent,
                Info: PO_datas[1]
            },
            function(data) {},
            "text")
        }
    },
    getArgument: function() {
        try {
            return window.external.UserParams
        } catch(e) {
            alert(e.message + ' Please ensure that you call it in POBrowser.')
        }
    },
    callParentJs: function(strFunc) {
        if ((strFunc == null) || (strFunc == "")) {
            alert("The parameter strFunc of callParentJs() cannot be null or empty.");
            return
        }
        try {
            strFunc = strFunc.replace(/&/g, '');
            var strRet = window.external.CallParentFunc(strFunc, POParent);
            if (strRet == "po_timeout5618_") {
                alert("The " + strFunc + " function is timeout.");
                strRet = ""
            }
            return strRet
        } catch(e) {
            alert(e.message + ' Please ensure that you call it in POBrowser.')
        }
    },
    closeWindow: function() {
        try {
            return window.external.Close()
        } catch(e) {
            alert(e.message + ' Please ensure that you call it in POBrowser.')
        }
    },
    callback2: function() {
        jQuery.ajax({
            url: PO_code + "func2.htm?x=" + po_uuid(8, 16),
            data: {
                "parent": POParent
            },
            dataType: "text",
            timeout: 120000,
            global: false,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == "timeout") {
                    setTimeout("POBrowser.callback2()", 300)
                } else {
                    setTimeout("POBrowser.callback2()", 300)
                }
            },
            success: function(data, textStatus) {
                if ((textStatus == "success") && (data != "null") && (data != "abort")) {
                    var parsedData = jQuery.parseJSON(data);
                    jQuery.post(PO_code + "funcret0.htm?x=" + po_uuid(8, 16), {
                        id: parsedData[0].id
                    },
                    function(data) {
                        var vRet;
                        try {
                            vRet = eval(parsedData[0].name);
                        } catch(e) {
                            alert(e.message)
                        }
                        if (typeof(vRet) != "string") {
                            vRet = "undefined"
                        }
                        jQuery.post(PO_code + "funcret.htm?x=" + po_uuid(8, 16), {
                            id: parsedData[0].id,
                            ret: vRet
                        },
                        function(data) {},
                        "text")
                    },
                    "text")
                }
                if (data != "abort") setTimeout("POBrowser.callback2()", 300)
            }
        })
    },
    callback3: function() {
        var xdr = new XDomainRequest();
        if (xdr) {
            xdr.onload = function() {
                var data = xdr.responseText;
                if ((data != "null") && (data != "abort")) {
                    var parsedData = jQuery.parseJSON(data);
                    var xdr2 = new XDomainRequest();
                    if (xdr2) {
                        xdr2.onload = function() {
                            var vRet;
                            try {
                                vRet = eval(parsedData[0].name)
                            } catch(e) {
                                alert(e.message)
                            }
                            if (typeof(vRet) != "string") {
                                vRet = "undefined"
                            }
                            var xdr3 = new XDomainRequest();
                            if (xdr3) {
                                xdr3.onload = function() {};
                                xdr3.onerror = function() {};
                                xdr3.open("POST", PO_code + "funcret.htm?x=" + po_uuid(8, 16));
                                xdr3.send("id=" + parsedData[0].id + "&ret=" + vRet)
                            } else {}
                        };
                        xdr2.onerror = function() {};
                        xdr2.open("POST", PO_code + "funcret0.htm?x=" + po_uuid(8, 16));
                        xdr2.send("id=" + parsedData[0].id)
                    } else {}
                }
                if (data != "abort") setTimeout("POBrowser.callback3()", 300)
            };
            xdr.onerror = function(e) {};
            xdr.timeout = 120000;
            xdr.ontimeout = function() {
                setTimeout("POBrowser.callback3()", 300)
            };
            xdr.open("POST", PO_code + "func2.htm?x=" + po_uuid(8, 16));
            xdr.send("parent=" + POParent)
        } else {}
    },
    addCssByLink: function(url) {
        var doc = document;
        var link = doc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        var heads = doc.getElementsByTagName("head");
        if (heads.length) heads[0].appendChild(link);
        else doc.documentElement.appendChild(link)
    },
    includeJS: function(path) {
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = path;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(a)
    },
    resumePO: function() {
        jQuery.ajax({
            url: PO_code + "resume.htm?parent=" + POParent + "&callback=?",
            dataType: "json",
            global: false,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == "timeout") {} else {}
            },
            success: function(data, textStatus) {
                if (textStatus == "success" && data) {}
            }
        })
    }
};
var ZDFAPP = {
    openWindow: function(url,strURL, strOptions) {
        if ((strURL == null) || (strURL == "")) {
            alert("The parameter strURL of openWindow() cannot be null or empty.");
            return
        }
        jQuery.post(url + "/poserver.zz", {
            Info: "ZDFAPPLink",
            pageurl: strURL
        },
        function(data) {
            location.href = data
        },
        "text")
    }
};
jQuery(function() {
    jQuery("body").append("<div class=\"pobmodal-overlay\" style=\"display:none;\"><div id=\"pobmodal-dialog\"><h2>提示</h2>当前文档正处于打开状态，请点击<a style='color:red;' href=\"javascript:POBrowser.resumePO();\" > 这里 </a>切换PageOffice窗口继续查看或编辑文档。<div class=\"button-holder\"></br></br><a class=\"button blue\" href=\"javascript:POBrowser.resumePO();\" > 立即切换 PageOffice 窗口</a></div></div></div>");
    var dialogPob = jQuery('#pobmodal-dialog').parent();
    dialogPob.find('.close').click(function() {
        dialogPob.trigger('hide')
    });
    dialogPob.click(function(e) {});
    dialogPob.on('hide',
    function() {
        dialogPob.fadeOut()
    }).on('show',
    function() {
        dialogPob.fadeIn()
    });
    jQuery.fn.showPobDlg = function() {
        dialogPob.trigger('show')
    };
    jQuery.fn.hidePobDlg = function() {
        dialogPob.trigger('hide')
    }
});
POBrowser.addCssByLink(POBrowser.getRootPath() + "/pobstyle.css");
POBrowser.checkSSL();

