import PinyinMatch from 'pinyin-match';

export default {
  /**
   * 要素对象是否匹配传进来的值
   * 匹配：名称里包含，或者助记码里包含
   */
  isMatchName(name,val){
    return name && PinyinMatch.match(name,val) ? true : false;
  },
  /**
   * 要素对象是否匹配传进来的值
   * 匹配：代码开头匹配、名称里包含
   */
  isMatch(item,pval,props = {id:'code',name:'fullName'},onlyMatchCode){
    if (!item[props.id]){
      return false;
    }
    let val = pval.trim().toLowerCase();
    let spaceIndex = val.indexOf(' ');
    if (spaceIndex > 0){//已经用空格分隔开代码和名称，只看代码是否匹配
      let valCode = val.substr(0,spaceIndex);
      return item[props.id].toLowerCase().indexOf(valCode) >= 0;
    }

    //匹配代码
    let idx = -1;
    let finished = false;
    while (!finished && idx < val.length - 1){
      if (item[props.id].charAt(idx + 1).toLowerCase() === val.charAt(idx + 1)){
        idx++;
      }else{
        finished = true;
      }
    }
    if (idx === val.length - 1){
      return true;//代码匹配成功，返回
    }else if (onlyMatchCode){
      return false;
    }
    //前面部分当代码，后面部分当名称
    return this.isMatchName(item[props.name],val.substr(idx + 1).trim());
  }

};
