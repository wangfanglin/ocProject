import uuidv1 from 'uuid/v1';
import { FILE_TYPE } from './constant';

export default {
  /**
   * 字符串去空格
   * @param value
   * @returns {string}
   */
  trim(value) {
    if (this.isNotEmpty(value)) {
      return value.replace(/[\s\uFEFF\xa0\u3000]/g, '');
    } else {
      return value;
    }
  },

  /**
   * 获取HashCode
   * @param {*} value
   * @returns {string}
   */
  getHashCode: (function() {
    function pad(hash, len) {
      while (hash.length < len) {
        hash = '0' + hash;
      }
      return hash;
    }

    function fold(hash, text) {
      var i;
      var chr;
      var len;
      if (text.length === 0) {
        return hash;
      }
      for (i = 0, len = text.length; i < len; i++) {
        chr = text.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash < 0 ? hash * -2 : hash;
    }

    function foldObject(hash, o, seen) {
      return Object.keys(o)
        .sort()
        .reduce(foldKey, hash);
      function foldKey(hash, key) {
        return foldValue(hash, o[key], key, seen);
      }
    }

    function foldValue(input, value, key, seen) {
      var hash = fold(fold(fold(input, key), toString(value)), typeof value);
      if (value === null) {
        return fold(hash, 'null');
      }
      if (value === undefined) {
        return fold(hash, 'undefined');
      }
      if (typeof value === 'object') {
        if (seen.indexOf(value) !== -1) {
          return fold(hash, '[Circular]' + key);
        }
        seen.push(value);
        return foldObject(hash, value, seen);
      }
      return fold(hash, value.toString());
    }

    function toString(o) {
      return Object.prototype.toString.call(o);
    }
    return value => {
      return pad(foldValue(0, value, '', []).toString(16), 8);
    };
  })(),

  /**
   * 获取字符串字节数
   * @param value
   * @param charset {GBK, UTF-8, UTF-16}
   * @returns {number}
   */
  getByteLength(value, charset = 'UTF-16') {
    if (this.isEmpty(value)) {
      value = value.toString();
      charset = charset.toUpperCase();
      var byteLength = 0;
      if (charset === 'GBK') {
        const reg = /[\u4e00-\u9fa5]/;
        for (let i = 0, len = value.length; i < len; i++) {
          if (!reg.test(value[i])) {
            byteLength += 1;
          } else {
            byteLength += 2;
          }
        }
      } else if (charset === 'UTF-8') {
        for (let i = 0, len = value.length; i < len; i++) {
          let charCode = value.charCodeAt(i);
          if (charCode <= 0x007f) {
            byteLength += 1;
          } else if (charCode <= 0x07ff) {
            byteLength += 2;
          } else if (charCode <= 0xffff) {
            byteLength += 3;
          } else {
            byteLength += 4;
          }
        }
      } else {
        for (let i = 0, len = value.length; i < len; i++) {
          let charCode = value.charCodeAt(i);
          if (charCode <= 0xffff) {
            byteLength += 2;
          } else {
            byteLength += 4;
          }
        }
      }
      return byteLength;
    } else {
      return 0;
    }
  },

  /**
   * 判断是否为空
   * @param value
   * @returns {boolean}
   */
  isEmpty(value) {
    if (typeof value === 'undefined') {
      return true;
    } else if (value === null) {
      return true;
    } else if (typeof value === 'string' && value === '') {
      return true;
    } else if (typeof value === 'number' && isNaN(value)) {
      return true;
    } else if (Array.isArray(value) && value.length === 0) {
      return true;
    } else if (value instanceof Number && isNaN(value)) {
      return true;
    } else if (
      value.toString() === '[object Object]' &&
      Object.keys(value).length === 0
    ) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * 判断是否为不为空
   * @param value
   * @returns {boolean}
   */
  isNotEmpty(value) {
    return !this.isEmpty(value);
  },

  /**
   * 判断一个集合（数组）是否包含另一个集合（数组）的所有元素
   * @param allArray
   * @param subArray
   * @returns {boolean}
   */
  includeAll(allArray, subArray) {
    return subArray.every(e => {
      return allArray.includes(e);
    });
  },

  /**
   * 浮点数比较
   * @param value
   * @param other
   * @returns {boolean}
   */
  floatEqual(value, other) {
    value = Number(value);
    other = Number(other);
    if (isNaN(value) || isNaN(other)) {
      return false;
    } else {
      return Math.abs(value - other) < Number.EPSILON * Math.pow(2, 2);
    }
  },

  /**
   * 复制属性方法
   * @param target
   * @param source
   * @returns {object}
   */
  copyProperties(target, source) {
    if (!target || !source) {
      return target;
    }
    for (let e in target) {
      target[e] = e in source ? source[e] : target[e];
    }
    return target;
  },

  /**
   * 深度冻结对象
   * @param obj
   * @return {object}
   */
  freezeDeep(obj) {
    // 取回定义在obj上的属性名
    let propNames = Object.getOwnPropertyNames(obj);
    // 在冻结自身之前冻结属性
    propNames.forEach(e => {
      let prop = obj[e];
      // 如果prop是个对象，冻结它
      if (typeof prop === 'object' && prop !== null) {
        this.freezeDeep(prop);
      }
    });
    // 冻结自身(no-op if already frozen)
    return Object.freeze(obj);
  },

  /**
   * 获取元素样式
   * @param element
   * @param cssRule
   * @returns {string}
   */
  getStyle(element, cssRule) {
    let strValue = '';
    if (document.defaultView && document.defaultView.getComputedStyle) {
      strValue = document.defaultView
        .getComputedStyle(element, '')
        .getPropertyValue(cssRule);
    } else if (element.currentStyle) {
      cssRule = cssRule.replace(/\-(\w)/g, (match, p1) => {
        return p1.toUpperCase();
      });
      strValue = element.currentStyle[cssRule];
    }
    return strValue;
  },

  /**
   * 添加元素Class
   * @param element
   * @param value
   */
  addClass(element, value) {
    let classList = element.className.split(' ');
    if (classList.indexOf(value) > -1) {
      return;
    }
    classList.push(value);
    element.className = classList.join(' ');
  },

  /**
   * 删除元素Class
   * @param element
   * @param value
   */
  removeClass(element, value) {
    let classList = element.className.split(' ');
    let index = classList.indexOf(value);
    if (index < 0) {
      return;
    }
    classList.splice(index, 1);
    element.className = classList.join(' ');
  },

  /**
   * 替换元素Class
   * @param element
   * @param oldStr
   * @param newStr
   */
  replaceClass(element, oldStr, newStr) {
    element.className = element.className.replace(oldStr, newStr);
  },

  /**
   * 添加事件绑定
   * @param element
   * @param event
   * @param handler
   */
  addEvent: (function() {
    if (document.addEventListener) {
      return (element, event, handler) => {
        element.addEventListener(event, handler, false);
      };
    } else if (document.attachEvent) {
      return (element, event, handler) => {
        element.attachEvent('on' + event, handler);
      };
    } else {
      return (element, event, handler) => {
        element['on' + event] = handler;
      };
    }
  })(),

  /**
   * 移除事件绑定
   * @param element
   * @param event
   * @param handler
   */
  removeEvent: (function() {
    if (document.removeEventListener) {
      return (element, event, handler) => {
        element.removeEventListener(event, handler, false);
      };
    } else if (document.detachEvent) {
      return (element, event, handler) => {
        element.detachEvent('on' + event, handler);
      };
    } else {
      return (element, event, handler) => {
        element['on' + event] = null;
      };
    }
  })(),

  /**
   * 获取Event
   * @param event
   * @returns {object}
   */
  getEvent(event) {
    return event ? event : window.event;
  },

  /**
   * 获取事件来源
   * @param event
   * @returns {object}
   */
  getTarget(event) {
    return event.target || event.srcElement;
  },

  /**
   * 阻止默认行为
   * @param {*} event
   */
  preventDefault(event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  },

  /**
   * 阻止事件传播
   * @param event
   */
  stopPropagation(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  },

  /**
   * 下载文件
   * @param url
   * @param fileName
   */
  download(url, fileName = '') {
    let isChrome = this.getBrowser().versions.chrome;
    if (isChrome) {
      let a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } else {
      window.open(url);
    }
  },

  /**
   * 打开新窗口
   * @param url
   * @param title
   * @param w
   * @param h
   */
  openWindow(url, title, w, h) {
    // Fixes dual-screen position Most browsers       Firefox
    let dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : screen.left;
    let dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : screen.top;

    let width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    let height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

    let left = width / 2 - w / 2 + dualScreenLeft;
    let top = height / 2 - h / 2 + dualScreenTop;
    let newWindow = window.open(
      url,
      title,
      'titlebar=yes, toolbar=yes, menubar=yes, scrollbars=yes, location=yes, directories=yes, status=yes, resizable=yes, width=' +
        w +
        ', height=' +
        h +
        ', top=' +
        top +
        ', left=' +
        left
    );

    // Puts focus on the newWindow
    if (window.focus) {
      newWindow.focus();
    }
  },

  /**
   * 获取一个随机数
   * @param min 最小值
   * @param max 最大值
   * @returns {number}
   */
  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  /**
   * 获取一个随机颜色
   * @param min 最小值
   * @param max 最大值
   * @returns {string}
   */
  getRandomColor(min, max) {
    let r = this.getRandomNum(min, max);
    let g = this.getRandomNum(min, max);
    let b = this.getRandomNum(min, max);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  },

  /**
   * 获取浏览器信息
   * @returns {object}
   */
  getBrowser() {
    let operatingSystem = '';
    let agent = navigator.userAgent.toLowerCase();
    if (/macintosh|mac os x/i.test(agent)) {
      operatingSystem = 'mac';
    } else if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
      operatingSystem = '32';
    } else if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
      operatingSystem = '64';
    }
    return {
      navigator: navigator,
      appVersion: navigator.appVersion,
      userAgent: navigator.userAgent,
      language: (navigator.browserLanguage || navigator.language).toLowerCase(),
      versions: (function() {
        let u = navigator.userAgent;
        return {
          trident: u.includes('Trident'), //IE内核
          presto: u.includes('Presto'), //opera内核
          webKit: u.includes('AppleWebKit'), //苹果、谷歌内核
          gecko: u.includes('Gecko') && !u.includes('KHTML'), //火狐内核
          ie: window.ActiveXObject || 'ActiveXObject' in window, //是否为IE
          edge: u.includes('Edge'), //是否为Edge
          opera: u.includes('Opera'), //是否为Opera
          firefox: u.includes('Firefox'), //是否为Firefox
          safari: u.includes('Safari') && !u.includes('Chrome'), //是否为Safari
          chrome:
            u.includes('Chrome') && u.includes('Safari') && !u.includes('Edge'), //是否为Chrome
          win: u.includes('Win'), //是否为Windows
          mac: u.includes('Mac'), //是否为Mac
          mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //是否为ios终端
          android: u.includes('Android') || u.includes('Adr'), //是否为android终端
          iPhone: u.includes('iPhone'), //是否为iPhone或者QQHD浏览器
          iPad: u.includes('iPad'), //是否为iPad
          webApp: !u.includes('Safari'), //是否为web应用程序，没有头部与底部
          weChat: u.includes('MicroMessenger'), //是否为微信
          alipay: u.includes('AlipayClient'), //是否为支付宝
          weibo: u.includes('Weibo'), //是否为微博
          dingTalk: u.includes('DingTalk'), //是否为钉钉
          qq: u.match(/QQ\//i) === 'QQ/', //是否为QQ
          operatingSystem: operatingSystem // 电脑操作系统 32/64/mac
        };
      })()
    };
  },

  /**
   * 获取日期时间信息
   * @param value
   * @returns {object}
   */
  getDateInfo(value) {
    let date, year, month, week, day, hours, minutes, seconds, time;
    date = this.isNotEmpty(value) ? new Date(value) : new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    month = month > 9 ? month : `0${month}`;
    week = date.getDay();
    day = date.getDate();
    day = day > 9 ? day : `0${day}`;
    hours = date.getHours();
    hours = hours > 9 ? hours : `0${hours}`;
    minutes = date.getMinutes();
    minutes = minutes > 9 ? minutes : `0${minutes}`;
    seconds = date.getSeconds();
    seconds = seconds > 9 ? seconds : `0${seconds}`;
    time = date.getTime();
    return (function() {
      return {
        date: date,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        week: week,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        dateInfo: `${year}-${month}-${day}`,
        timeInfo: `${hours}:${minutes}:${seconds}`,
        dateTimeInfo: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
        time: time
      };
    })();
  },

  /**
   * 获取应用路径
   * @returns {string}
   */
  getBasePath() {
    return (
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '')
    );
  },

  /**
   * 获取文件类型
   * @param fileName
   * @returns {object}
   */
  getFileType(fileName) {
    let suffix = fileName
      .substring(fileName.lastIndexOf('.') + 1)
      .toLocaleLowerCase();
    switch (suffix) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return FILE_TYPE.IMAGE;
      case 'txt':
        return FILE_TYPE.TXT;
      case 'pdf':
        return FILE_TYPE.PDF;
      case 'doc':
      case 'docx':
        return FILE_TYPE.WORD;
      case 'xls':
      case 'xlsx':
        return FILE_TYPE.EXCEL;
      case 'ppt':
      case 'pptx':
        return FILE_TYPE.PPT;
      case 'zip':
        return FILE_TYPE.ZIP;
      case 'rar':
        return FILE_TYPE.RAR;
      default:
        return suffix;
    }
  },

  /**
   * 生成UUID
   * @returns {string}
   */
  generateUUID() {
    return uuidv1().replace(/-/g, '');
  }
};
