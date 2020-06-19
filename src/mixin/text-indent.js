import {mapGetters} from 'vuex';
import {GET_ACS} from '../store/global';
import {GET_ATOM} from '../store/agy';
import util from '../assets/js/util';

/**
 * 表格名称按级次缩进
 * DOTO(使用此混合一定要注意
 * 1：页面上要有 this.query.agyAcb.acsCode
 * 2：页面上要有 this.ATOM_CODE.code
 * 3：单位agyCode是this.query.agy.madCode
 * )
 */
const textIndent = {
  methods: {
    //获取缩进的空格数
    getTextIndent(code){
      let index = this.currCodeRuleIndent.indexOf(code.length);
      if (index === -1) {
        return 0;
      } else {
        return index;
      }
    }
  },
  computed: {
    ...mapGetters([GET_ACS, GET_ATOM]),
    currCodeRule() {//当前的编码规则
      let that = this;
      if (this.ATOM_CODE.code === 'INITBAL') {
        let currentData = _.cloneDeep(this.GET_ACS);
        let dataMain = currentData.find(item => {
          return item.code === that.query.agyAcb.acsCode;
        });
        return dataMain.codeRule
      } else {
        let allAtom = util.isEmpty(_.cloneDeep(this.GET_ATOM)[this.query.agy.madCode])?[]:_.cloneDeep(this.GET_ATOM)[this.query.agy.madCode];
        let curAtom = allAtom.find(item => {
          return item.code === that.ATOM_CODE.code
        });
        return  util.isEmpty(curAtom)?'':curAtom.codeRule;   //curAtom.codeRule
      }
    },
    currCodeRuleIndent() {//根据编码规则缩进控制的数组
      let currRule = util.isNotEmpty(this.currCodeRule) ? this.currCodeRule.split("-") : [];
      let currArr = [];
      let zero = 0;
      currRule.forEach(function (item) {
        zero += parseInt(item);
        currArr.push(zero);
      });
      return currArr;
    }
  }
};

export {
  textIndent
};
