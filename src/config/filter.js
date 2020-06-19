import Vue from 'vue';
import { format } from 'date-fns';
import util from '../assets/js/util';

const filter = {
  /**
   * 人名币大写转换
   * @param {*} value
   */
  formatRMB(value) {
    if (util.isEmpty(value)) {
      return '';
    }
    value = value.toString();
    let head = '';
    if (value.startsWith('-')) {
      head = '负';
      value = value.substr(1);
    }
    if (value.match(/[^,.\d]/) !== null) {
      console.error('输入包含非法字符!');
      return '';
    }
    if (
      value.match(
        /^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/
      ) === null
    ) {
      console.error('输入有误!');
      return '';
    }

    const MAXIMUM_NUMBER = 99999999999.99;
    value = value.replace(/,/g, '');
    value = value.replace(/^0+/, '');
    if (Number(value) > MAXIMUM_NUMBER) {
      console.error('数额太大，转换金额上限小于1千亿!');
      return '';
    }

    const CN_ZERO = '零';
    const CN_ONE = '壹';
    const CN_TWO = '贰';
    const CN_THREE = '叁';
    const CN_FOUR = '肆';
    const CN_FIVE = '伍';
    const CN_SIX = '陆';
    const CN_SEVEN = '柒';
    const CN_EIGHT = '捌';
    const CN_NINE = '玖';
    const CN_TEN = '拾';
    const CN_HUNDRED = '佰';
    const CN_THOUSAND = '仟';
    const CN_TEN_THOUSAND = '万';
    const CN_HUNDRED_MILLION = '亿';
    const CN_SYMBOL = '';
    const CN_DOLLAR = '元';
    const CN_TEN_CENT = '角';
    const CN_CENT = '分';
    const CN_INTEGER = '整';

    let integral;
    let decimal;
    let outputCharacters;
    let parts;
    let digits, radices, bigRadices, decimals;
    let zeroCount;
    let i, p, d;
    let quotient, modulus;

    parts = value.split('.');
    if (parts.length > 1) {
      integral = parts[0];
      decimal = parts[1];
      decimal = decimal.substr(0, 2);
    } else {
      integral = parts[0];
      decimal = '';
    }
    digits = new Array(
      CN_ZERO,
      CN_ONE,
      CN_TWO,
      CN_THREE,
      CN_FOUR,
      CN_FIVE,
      CN_SIX,
      CN_SEVEN,
      CN_EIGHT,
      CN_NINE
    );
    radices = new Array('', CN_TEN, CN_HUNDRED, CN_THOUSAND);
    bigRadices = new Array('', CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
    decimals = new Array(CN_TEN_CENT, CN_CENT);
    outputCharacters = '';
    if (Number(integral) > 0) {
      zeroCount = 0;
      for (i = 0; i < integral.length; i++) {
        p = integral.length - i - 1;
        d = integral.substr(i, 1);
        quotient = p / 4;
        modulus = p % 4;
        if (d == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            outputCharacters += digits[0];
          }
          zeroCount = 0;
          outputCharacters += digits[Number(d)] + radices[modulus];
        }
        if (modulus == 0 && zeroCount < 4) {
          outputCharacters += bigRadices[quotient];
        }
      }
      outputCharacters += CN_DOLLAR;
    }
    if (decimal != '') {
      for (i = 0; i < decimal.length; i++) {
        d = decimal.substr(i, 1);
        if (d != '0') {
          outputCharacters += digits[Number(d)] + decimals[i];
        }
      }
    }
    if (outputCharacters == '') {
      outputCharacters = CN_ZERO + CN_DOLLAR;
    }
    if (decimal == '') {
      outputCharacters += CN_INTEGER;
    }
    outputCharacters = head + CN_SYMBOL + outputCharacters;
    return outputCharacters;
  },
  /**
   * 千分位转换
   * @param {*} value（要格式化的值）
   * @param {*} decimals（保留几位小数，默认2位）
   * @param {*} decPoint（小数点符号，默认.）
   * @param {*} thousandsSep（千分位符号，默认,）
   * @param {*} roundtag（舍入参数，'ceil'向上取，'floor'向下取，'round'四舍五入，默认round）
   */
  formatCurrency(value, decimals, decPoint, thousandsSep, roundtag) {
    if (util.isNotEmpty(value)) {
      value = (value + '').replace(/[^0-9+-Ee.]/g, '');
      roundtag = roundtag || 'round';
      let n = !isFinite(+value) ? 0 : +value,
        prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
        dec = typeof decPoint === 'undefined' ? '.' : decPoint,
        sep = typeof thousandsSep === 'undefined' ? ',' : thousandsSep,
        s = '',
        toFixedFix = (n, prec) => {
          let k = Math.pow(10, prec);
          return (
            '' +
            parseFloat(
              Math[roundtag](parseFloat((n * k).toFixed(prec * 2))).toFixed(
                prec * 2
              )
            ) /
              k
          );
        };
      s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
      const re = /(-?\d+)(\d{3})/;
      while (re.test(s[0])) {
        s[0] = s[0].replace(re, '$1' + sep + '$2');
      }

      if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
      }
      return s.join(dec);
    } else {
      return '';
    }
  },
  /**
   * 时间日期格式化
   */
  formatDate(value, valueFormat = 'YYYY-MM-DD') {
    return util.isEmpty(value) ? '' : format(value, valueFormat);
  },
  /**
   * 百分比转换
   * @param {*} value
   */
  percent(value) {
    if (util.isNotEmpty(value)) {
      let result = Math.abs(value) * 100;
      return result.toFixed(2) + '%';
    } else {
      return '';
    }
  },
  /**
   * 保留小数位数（返回字符串）
   * @param {*} value
   * @param {*} digits
   */
  toFixed(value, digits = 2) {
    if (util.isNotEmpty(value)) {
      return Number.parseFloat(value).toFixed(digits);
    } else {
      return '';
    }
  },
  /**
   * 保留小数位数（返回浮点数）
   * @param {*} value
   * @param {*} digits
   */
  toFixedFloat(value, digits = 2) {
    if (util.isNotEmpty(value)) {
      return Number.parseFloat(Number.parseFloat(value).toFixed(digits));
    } else {
      return Number.parseFloat(0);
    }
  }
};

Object.keys(filter).forEach(key => {
  Vue.filter(key, filter[key]);
});

export default filter;
