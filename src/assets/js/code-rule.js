import util from '@/assets/js/util';

export default {

  /**
   * 根据编码规则，计算每一级的长度
   * 输入的是:'3-2-2-2-2-2-2',返回的是一个函数
   */
  levelFn(codeRule) {
    if (_.isNull(codeRule)){
      return (code) => {
        return 0;
      };
    }
    let lengthArray = this.leveLengths(codeRule);
    return (code) => {
      return lengthArray.indexOf(code.length) + 1;
    };
  },


  /**
   * 给定编码规则，返回一个各级代码总长度的数组，例如，编码规则为'4-2-2-2',则返回[4,6,8,8]
   * @param codeRule 编码规则
   */
  leveLengths(codeRule){
    if (util.isEmpty(codeRule)){
      return [];
    }
    let l = codeRule;
    let r = [];
    let i = 0;
    r.push(parseInt(l.substr(0, 1)));
    let idx = l.indexOf('-');
    while (idx >= 0) {
      r.push(r[i] + parseInt(l.substr(idx + 1, 1)));
      i++;
      l = l.substring(idx + 2);
      idx = l.indexOf('-');
    }
    return r;
  },

  /**
   * 给定代码，判断当前是第几级,从0开始
   * @param codeRule 编码规则
   * @param code 代码
   * @return 指定代码的级次
   */
  getCodeLevel(codeRule,code){
    if (util.isEmpty(codeRule) || util.isEmpty(code)){
      return -1;
    }
    return this.leveLengths(codeRule).indexOf(code.length);
  },

  /**
   * 给定编码规则和级次，返回指定级那一段的长度，例如，参数为:'4-2-2-2',2,返回2
   * @param codeRule 编码规则
   * @param level 指定级次
   */
  getLevelLength(codeRule,level){
    return parseInt(codeRule.substr(level * 2, 1));
  },

  /**
   * 给定编码规则和和代码，返回最后一级代码
   */
  getLastCode(codeRule,code){
    let level = this.getCodeLevel(codeRule,code);
    if (level < 0){
      return undefined;
    }else{
      let len = this.getLevelLength(codeRule,level);
      return code.substr(-len,len);
    }
  },

  /**
   * 返回给定代码的上级代码（去掉最后一级）
   */
  getParentCode(codeRule,code){
    let level = this.getCodeLevel(codeRule,code);
    let len = this.getLevelLength(codeRule,level);
    return code.substring(0,code.length - len);
  }

};
