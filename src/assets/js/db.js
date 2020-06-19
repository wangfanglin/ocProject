import store from '../../store/index';
import {Tree} from './model';
import util from '@/assets/js/util';

const db = {

  /**
   * 获得单位核算系统启用的要素列表
   * @param agyCode 单位代码
   * @return ['PROJECT','DEPT']
   */
  getAtomsCode(agyCode){
    return ['ACO'].concat(store.getters.GET_AGY[agyCode].acitemTypeList
                          .map(e => {
                            return e.atomCode;
                          })
                          .filter(e => {
                            return e !== 'CASHFLOW' && e !== 'CURRENCY';
                          }));
  },
  /**
   * 获得单位指标系统启用的要素列表
   * @param agyCode 单位代码
   * @return ['PROJECT','DEPT']
   */
  getBudAtomsCode(agyCode){
    return store.getters.GET_AGY[agyCode].budAcitemTypeList.map(e => {
      return e.atomCode;
    });
  },
  /**
   * @param agyCode 单位代码
   * @return 单位启用的要素元信息列表:[{code:'PROJECT',name:'项目',atomCode:'PROJE',codeRule:'4-2-2-2-2-2',isNullAble:0,ordSeq:0},...]
   */
  getAtomsMeta(agyCode){
    if (agyCode === ''){
      return [];
    }
    let acoCodeRule = store.getters.GET_AGY[agyCode]['atomList'].find(item => {
      return item.code === 'ACO';
    }).codeRule;
    return [{field:'ACO',name:'科目',code:'ACO',codeRule: acoCodeRule,isNullAble:0,ordSeq:0}].concat(
      store.getters.GET_AGY[agyCode]['acitemTypeList'].filter(e => {
        return e.atomCode !== 'CURRENCY' && e.atomCode !== 'CASHFLOW';
      }).map(e => {
        return {field:e.code,name:e.name,code:e.atomCode,codeRule:e.codeRule,isNullAble:e.isNullAble,ordSeq:e.ordSeq};
      }));
  },
  /**
   * @param agyCode 单位代码
   * @return 单位指标系统启用的要素元信息列表:[{code:'PROJECT',name:'项目',atomCode:'PROJE',codeRule:'4-2-2-2-2-2',isNullAble:0,ordSeq:0},...]
   */
  getBudAtomsMeta(agyCode){
    if (agyCode === ''){
      return [];
    }
    return store.getters.GET_AGY[agyCode]['budAcitemTypeList'].map(e => {
      return {field:e.code,name:e.name,code:e.atomCode,codeRule:e.codeRule,isNullAble:0,ordSeq:0};
    });
  },
  /**
   * 返回指定要素的元信息
   * @param agyCode 单位代码
   * @param atomCode 要素代码
   * @return {code:'PROJECT',name:'项目',field:'PROJECT',codeRule:'4-2-2-2-2-2-2'}
   */
  getAtomMeta(agyCode,atomCode){
    if (agyCode === ''){
      return {};
    }
    return this.getAtomsMeta(agyCode).find(item => {
      return item.code === atomCode;
    });
  },
  /**
   * 返回指定预算要素的元信息
   * @param agyCode 单位代码
   * @param atomCode 要素代码
   * @return {code:'PROJECT',name:'项目',field:'PROJECT',codeRule:'4-2-2-2-2-2-2',isNullAble:0,ordSeq:0}
   */
  getBudAtomMeta(agyCode,atomCode){
    if (agyCode === ''){
      return {};
    }
    return this.getBudAtomsMeta(agyCode).find(item => {
      return item.code === atomCode;
    });
  },
  /**
   * 根据单位代码和要素代码，返回要素值列表
   * @param agyCode 单位代码
   * @param atomCode 要素代码
   * @return 返回要素值列表
   */
  getAtomValList(agyCode,atomCode,acbCode){
    let r = store.getters.GET_MAD[agyCode][atomCode];
    if (atomCode === 'ACO'){
      return this.getAcoValList(agyCode,acbCode);
    }
    return r;
  },
  /**
   * 根据单位代码和要素代码，返回要素值的级次
   * @param agyCode 单位代码
   * @param atomCode 要素代码
   * @param acbCode 帐套代码
   * @return 返回要素值的级次对象
   */
  getAtomLevelMap(agyCode, atomCode, acbCode) {
    let atom = store.getters.GET_MAD[agyCode][atomCode];
    // console.log('111',atom);
    if (atomCode === 'ACO') {
      let group = _.groupBy(atom, e => {
        return e.acbCode;
      });
      return Tree.getNodeLever(Tree.getTree(group[acbCode]));
    } else {
      if (util.isNotEmpty(atom)) {
        return Tree.getNodeLever(Tree.getTree(atom));
      } else {
        return {};
      }
    }
  },
  /**
   * 根据单位代码和帐套代码，返回单位帐套的科目列表
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @param kmtx 科目体系，不传时是所有科目
   * @return 返回单位帐套的科目列表
   */
  getAcoValList(agyCode,acbCode,kmtx){
    if (agyCode === ''){
      return [];
    }
    let list = store.getters.GET_MAD[agyCode]['ACO'];
    return list.filter(item => {
      return item.acbCode === acbCode && (!kmtx || item.acaCode === kmtx);
    });
  },

  /**
   * 根据单位代码和帐套代码，返回简化版的的科目列表,科目属性只包含id、code、name、pcode这几个属性
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @param kmtx 科目体系，不传时是所有科目
   * @return 返回单位帐套的科目列表
   */
  getSimpleAcoList(agyCode,acbCode,kmtx){
    return this.getAcoValList(agyCode,acbCode,kmtx).map(
      item => {
        return _.pick(item,['code','name','pcode']);
      }
    );
  },
  /**
   * 获取科目对象
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @param acoCode 科目代码
   * @return 返回单位帐套的科目对象
   */
  getAco(agyCode,acbCode,acoCode){
    let list = this.getAcoValList(agyCode,acbCode);
    return _.find(list,item => {
      return item.code === acoCode;
    });
  },
  /**
   * 返回指定要素的元信息及值列表
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @param atomCode 要素代码
   * @return 指定要素的元信息及值列表{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...]}
   */
  getAtom(agyCode,acbCode,atomCode){
    let meta = this.getAtomMeta(agyCode,atomCode);
    if (!meta){
      console.log(atomCode + ' meta is undefined.');
    }
    meta.list = this.getAtomValList(agyCode,atomCode,acbCode);
    meta.levels = this.getAtomLevelMap(agyCode,atomCode,acbCode);
    return meta;
  },

  /**
   * 返回指定预算要素的元信息及值列表
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @param atomCode 要素代码
   * @return 指定要素的元信息及值列表{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...],levels:{...}}
   */
  getBudAtom(agyCode, atomCode, acbCode){
    let meta = this.getBudAtomMeta(agyCode,atomCode);
    meta.list = this.getAtomValList(agyCode, atomCode, acbCode);
    meta.levels = this.getAtomLevelMap(agyCode, atomCode, acbCode);
    return meta;
  },

  /**
   * 返回核算系统所有启用要素的元信息及值列表
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @return [{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...],levels:{...}},...]
   */
  getAtoms(agyCode,acbCode){
    return this.getAtomsCode(agyCode).map(atomCode => {
      return this.getAtom(agyCode,acbCode,atomCode);
    });
  },

  /**
   * 返回预算系统所有启用要素的元信息及值列表
   * @param agyCode 单位代码
   * @return [{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...]},...]
   */
  getBudAtoms(agyCode, acbCode){
    return this.getBudAtomsCode(agyCode).map(atomCode => {
      return this.getBudAtom(agyCode, atomCode, acbCode);
    });
  },

  /**
   * 返回核算系统所有启用要素的元信息及值对象
   * @param agyCode 单位代码
   * @param acbCode 帐套代码
   * @return {'PROJECT':{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...]},...}
   */
  getAtomsMap(agyCode,acbCode){
    return this.getAtomsCode(agyCode).reduce((r,atomCode)=> {
      r[atomCode] = this.getAtom(agyCode,acbCode,atomCode);
      return r;
    },{});
  },

  /**
   * 返回预算系统所有启用要素的元信息及值对象
   * @param agyCode 单位代码
   * @return {'PROJECT':{code:'PROJECT',name:'项目',field:'project',codeRule:'4-2-2-2-2-',list:[...]},...}
  */
  getBudAtomsMap(agyCode){
    return this.getBudAtomsCode(agyCode).reduce((r,atomCode)=> {
      r[atomCode] = this.getBudAtom(agyCode,atomCode);
      return r;
    },{});
  },

  /**
   * 返回科目体系元信息
   */
  getAcs(acsCode){
    return store.getters.GET_ACS.find(item => {
      return item.code === acsCode;
    });
  }

};
export {db};
