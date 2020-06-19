import util from '../assets/js/util';
import fetch from '../config/fetch';

/**
 * 获取单位数据
 * @type {string}
 */
const GET_AGY = 'GET_AGY';
/**
 * 获取单位信息
 * @type {string}
 */
const GET_AGY_INFO = 'GET_AGY_INFO';
/**
 * 设置单位信息
 * @type {string}
 */
const SET_AGY_INFO = 'SET_AGY_INFO';
/**
 * 获取辅助核算类型
 * @type {string}
 */
const GET_ACITEM_TYPE = 'GET_ACITEM_TYPE';
/**
 * 获取要素类别
 * @type {string}
 */
const GET_ATOM = 'GET_ATOM';
/**
 * 获取辅助核算数据
 * @type {string}
 */
const GET_MAD = 'GET_MAD';
/**
 * 获取会计科目
 * @type {string}
 */
const GET_ACO = 'GET_ACO';
/**
 * 获取凭证类型
 * @type {string}
 */
const GET_VOU_TYPE = 'GET_VOU_TYPE';
/**
 * 获取账务选项
 * @type {string}
 */
const GET_GAL_OPT = 'GET_GAL_OPT';
/**
 * 获取账表查询方案
 * @type {string}
 */
const GET_GAL_RPT_SCHEME = 'GET_GAL_RPT_SCHEME';
/**
 * 获取菜单列表
 * @type {string}
 */
const GET_MENU_LIST = 'GET_MENU_LIST';
/**
 * 获取指标要素
 * @type {string}
 */
const GET_BUD_ATOM_LIST = 'GET_BUD_ATOM_LIST';

export {
  GET_AGY,
  GET_AGY_INFO,
  SET_AGY_INFO,
  GET_ACITEM_TYPE,
  GET_ATOM,
  GET_MAD,
  GET_ACO,
  GET_VOU_TYPE,
  GET_GAL_OPT,
  GET_GAL_RPT_SCHEME,
  GET_MENU_LIST,
  GET_BUD_ATOM_LIST
};

export default {
  state: [],
  getters: {
    [GET_AGY]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e;
      }
      return result;
    },
    [GET_AGY_INFO]: state => {
      return state;
    },
    [GET_ACITEM_TYPE]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.acitemTypeList;
      }
      return result;
    },
    [GET_ATOM]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.atomList;
      }
      return result;
    },
    [GET_MAD]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.mad;
      }
      return result;
    },
    [GET_ACO]: state => {
      let result = {};
      for (let e of state) {
        if (util.isNotEmpty(e.mad) && util.isNotEmpty(e.mad.ACO)) {
          result[e.agyInfo.code] = e.mad.ACO;
        } else {
          result[e.agyInfo.code] = [];
        }
      }
      return result;
    },
    [GET_VOU_TYPE]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.vouTypeList;
      }
      return result;
    },
    [GET_GAL_OPT]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.galOptList;
      }
      return result;
    },
    [GET_GAL_RPT_SCHEME]: state => {
      let result = {};
      for (let e of state) {
        if (util.isNotEmpty(e.agyInfo)) {
          result[e.agyInfo.code] = e.galRptScheme;
        } else {
          continue;
        }
      }
      return result;
    },
    [GET_MENU_LIST]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.menuList;
      }
      return result;
    },
    [GET_BUD_ATOM_LIST]: state => {
      let result = {};
      for (let e of state) {
        result[e.agyInfo.code] = e.budAcitemTypeList;
      }
      return result;
    }
  },
  mutations: {
    [SET_AGY_INFO](state, agyInfo) {
      let findIndex = state.findIndex(e => {
        return e.agyInfo.code === agyInfo.agyInfo.code;
      });
      if (findIndex === -1) {
        state.push(agyInfo);
      } else {
        state.splice(findIndex, 1, agyInfo);
      }
    }
  },
  actions: {
    [SET_AGY_INFO]({ commit }, params) {
      return new Promise((resolve, reject) => {
        fetch
          .get('/mad/user/agylInfo', {
            params
          })
          .then(({ data }) => {
            if (util.isNotEmpty(data.agyInfo)) {
              commit(SET_AGY_INFO, data);
            }
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  }
};
