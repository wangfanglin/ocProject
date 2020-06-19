export default {
  /**
   * 校验文件大小
   * @param val
   */
  validateFileSize(val, size = 10) {
    return val < size * 1024 * 1024;
  },

  /**
   * 校验图片类型
   * @param val
   * @returns {boolean}
   */
  validateImageType(val) {
    return val === 'image/png' || val === 'image/jpeg' || val === 'image/gif';
  },

  /**
   * 校验登录名是否合法
   * @param val
   * @returns {boolean}
   */
  validateUsername(val) {
    const reg = /^[a-zA-Z0-9\u4e00-\u9fa5_-]{2,30}$/;
    return reg.test(val);
  },
  /**
   * 校验支付密码是否合法
   * @returns {boolean}
   */
  validatePayPassword(val) {
    const reg = /^[\w\s~!@%#$^*+='?\-\\/(){}\[\],.\|《》、，。！{}·#￥……*（）——:：“”？【】；‘’`_;\"]{6,20}$/;
    return reg.test(val);
  },
  /**
   * 校验登录密码是否合法
   * 字母数字必须同时存在
   * @returns {boolean}
   */
  validatePassword(val) {
    const reg = /^(?=.*[A-Za-z])(?=.*\d)[\w\s~!@%#$^*+='&?\-\\/(){}\[\],.\|《》、，。！{}·#￥……*（）——:：“”？【】；‘’`_;\"]{6,20}$/;
    return reg.test(val);
  },
  /**
   * 校验登录密码是否合法
   * 纯数字 6 - 20位
   * @returns {boolean}
   */
  validateNumberPassword(val) {
    const reg = /^(\d{6,20})$/;
    return reg.test(val);
  },
  /**
   * 校验电话是否合法（包括手机号）
   * @param val
   * @returns {boolean}
   */
  validatePhone(val) {
    const reg = /^(1\d{10}|[0-9-—]{7,20})$/;
    return reg.test(val);
  },

  /**
   * 校验手机号是否合法
   * @param {*} val
   */
  validateMobile(val) {
    const reg = /^1\d{10}$/;
    return reg.test(val);
  },

  /**
   * 校验邮箱是否合法
   * @param {*} val
   */
  validateEmail(val) {
    const reg = /^[A-Za-z0-9\u4e00-\u9fa5\._-]+@[\.a-zA-Z0-9_-]+$/;
    return reg.test(val);
  },

  /**
   * 校验银行户名是否合法
   * @param {*} val
   */
  validateBankName(val) {
    const reg = /^[\u4e00-\u9fa5]{1,35}$/;
    return reg.test(val);
  },

  /**
   * 校验银行账号是否合法
   * @param {*} val
   */
  validateBankAccount(val) {
    const reg = /^\d{8,30}$/;
    return reg.test(val);
  },
  /**
   * 校验中文名是否合法
   * @param {*} val
   */
  validateChineseName(val) {
    const reg = /^[\u4E00-\u9FA5]+(·[\u4E00-\u9FA5]+)*$/;
    return reg.test(val);
  },
  /**
   * 校验英文名是否合法
   * @param {*} val
   */
  validateEnglishName(val) {
    const reg = /^[A-Za-z\s]+([A-Za-z]+)*$/;
    return reg.test(val);
  },

  /**
   * 校验身份证号码是否合法
   * @param {*} val
   */
  validateIdCode(val) {
    const reg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    return reg.test(val);
  },

  /**
   * 校验URL是否合法
   * @param {*} val
   */
  validateUrl(val) {
    const reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
    return reg.test(val);
  },

  /**
   * 校验ip地址是否合法
   * @param {*} val
   */
  validateIp(val) {
    const reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-5][0-5])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
    return reg.test(val);
  },

  /**
   * 校验MAC地址是否合法
   * @param {*} val
   */
  validateMac(val) {
    const reg = /[0-9a-fA-F]{2}(-[0-9a-fA-F]{2}){5}/;
    return reg.test(val);
  },

  /**
   * 校验路由是否合法
   * @param {*} val
   */
  validateRouter(val) {
    const reg = /^\/+/;
    return reg.test(val);
  },

  /**
   * 校验金额是否合法
   * @param val
   * @param decimal 小数位数，默认两位
   */
  validateAmount(val, decimal = 2) {
    let exp = `^-?[0-9]{1,15}(\.[0-9]{1,${decimal}})?$`;
    let reg = new RegExp(exp);
    return reg.test(val);
  },

  /**
   * 校验整数是否合法
   * @param {*} val
   */
  validateInteger(val) {
    const reg = /^-?[0-9]\d*$/;
    return reg.test(val);
  },

  /**
   * 校验浮点数是否合法
   * @param {*} val
   */
  validateFloat(val) {
    const reg = /^(-?\d+)(\.\d+)?$/;
    return reg.test(val);
  },
  /**
   * 校验发票代码
   * @param {*} val
   */
  validateInvoiceCode(val) {
    const reg = /^\d{12}$|^\d{10}$/;
    return reg.test(val);
  },
  /**
   * 校验发票号码
   * @param {*} val
   */
  validateInvoiceNumber(val) {
    const reg = /^\d{8}$/;
    return reg.test(val);
  }
};
