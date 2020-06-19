import { SESSION_STORAGE } from './service/storage-service';
import { STORAGE_KEY } from '../assets/js/constant';
import { Tree } from '../assets/js/model';
import util from '../assets/js/util';
import fetch from '../config/fetch';

/**
 * 获取全局数据
 * @type {string}
 */
const GET_GLOBAL_INFO = 'GET_GLOBAL_INFO';
/**
 * 设置全局数据
 * @type {string}
 */
const SET_GLOBAL_INFO = 'SET_GLOBAL_INFO';
/**
 * 获取单位性质
 * @type {string}
 */
const GET_AGY_TYPE = 'GET_AGY_TYPE';
/**
 * 设置单位性质
 * @type {string}
 */
const SET_AGY_TYPE = 'SET_AGY_TYPE';
/**
 * 获取单位及账套
 * @type {string}
 */
const GET_AGY_ACB = 'GET_AGY_ACB';
/**
 * 设置单位及账套
 * @type {string}
 */
const SET_AGY_ACB = 'SET_AGY_ACB';
/**
 * 设置单位及账套
 * @type {string}
 */
const UPDATE_AGY_ACB = 'UPDATE_AGY_ACB';
/**
 * 获取单位树
 * @type {string}
 */
const GET_AGY_TREE = 'GET_AGY_TREE';
/**
 * 获取单位账套树
 * @type {string}
 */
const GET_AGY_ACB_TREE = 'GET_AGY_ACB_TREE';
/**
 * 获取科目体系
 * @type {string}
 */
const GET_ACS = 'GET_ACS';
/**
 * 设置科目体系
 * @type {string}
 */
const SET_ACS = 'SET_ACS';
/**
 * 获取币种
 * @type {string}
 */
const GET_CURRENCY = 'GET_CURRENCY';
/**
 * 设置币种
 * @type {string}
 */
const SET_CURRENCY = 'SET_CURRENCY';

export {
  GET_GLOBAL_INFO,
  SET_GLOBAL_INFO,
  GET_AGY_TYPE,
  GET_AGY_ACB,
  SET_AGY_ACB,
  UPDATE_AGY_ACB,
  GET_AGY_TREE,
  GET_AGY_ACB_TREE,
  GET_ACS,
  SET_ACS,
  GET_CURRENCY
};

export default {
  state: {
    agyType: SESSION_STORAGE.get(STORAGE_KEY.AGY_TYPE) || [],
    agyAcb: SESSION_STORAGE.get(STORAGE_KEY.AGY_ACB) || [],
    acs: SESSION_STORAGE.get(STORAGE_KEY.ACS) || [],
    currency: SESSION_STORAGE.get(STORAGE_KEY.CURRENCY) || []
  },
  getters: {
    [GET_GLOBAL_INFO]: state => {
      return state;
    },
    [GET_AGY_TYPE]: state => {
      return state.agyType;
    },
    [GET_AGY_ACB]: state => {
      return state.agyAcb;
    },
    [GET_AGY_TREE]: state => {
      return Tree.getTree(state.agyAcb);
    },
    [GET_AGY_ACB_TREE]: state => {
      let agyAcb = _.cloneDeep(state.agyAcb);
      let pcode = agyAcb.map(e => {
        return e.pcode;
      });
      agyAcb.forEach(e => {
        if (pcode.includes(e.code)) {
          delete e.acbList;
        } else {
          e.children = e.acbList.map(item => {
            let result = {
              agyCode: e.code,
              pcode: e.code,
              ...item
            };
            delete result.agyTypeCode;
            return result;
          });
          delete e.acbList;
        }
      });
      return Tree.getTree(agyAcb);
    },
    [GET_ACS]: state => {
      return state.acs;
    },
    [GET_CURRENCY]: state => {
      return state.currency;
    }
  },
  mutations: {
    [SET_AGY_TYPE](state, agyType) {
      state.agyType = agyType;
      SESSION_STORAGE.set(STORAGE_KEY.AGY_TYPE, agyType);
    },
    [SET_AGY_ACB](state, agyAcb) {
      state.agyAcb = agyAcb;
      SESSION_STORAGE.set(STORAGE_KEY.AGY_ACB, agyAcb);
    },
    [UPDATE_AGY_ACB](state, agyAcb) {
      for (let e of state.agyAcb) {
        if (e.code === agyAcb.code) {
          util.copyProperties(e, agyAcb);
          break;
        }
      }
      SESSION_STORAGE.set(STORAGE_KEY.AGY_ACB, state.agyAcb);
    },
    [SET_ACS](state, acs) {
      state.acs = acs;
      SESSION_STORAGE.set(STORAGE_KEY.ACS, acs);
    },
    [SET_CURRENCY](state, currency) {
      state.currency = currency;
      SESSION_STORAGE.set(STORAGE_KEY.CURRENCY, currency);
    }
  },
  actions: {
    [SET_GLOBAL_INFO]({ commit }, params) {
      return new Promise((resolve, reject) => {
        fetch
          .get('/mad/user/globalInfo', { params })
          .then(({ data }) => {
            commit(SET_AGY_TYPE, data.agyTypeList);
            commit(SET_AGY_ACB, data.agyList);
            commit(SET_ACS, data.acsList);
            commit(SET_CURRENCY, data.currencyList);
            SESSION_STORAGE.set(STORAGE_KEY.ENUMERATE, data.valsetList);
            SESSION_STORAGE.set(
              STORAGE_KEY.SYS_ACITEM_TYPE,
              data.acitemTypeList
            );
            SESSION_STORAGE.set(STORAGE_KEY.BUD_TYPE, data.budTypeList);
            SESSION_STORAGE.set(STORAGE_KEY.ACE, data.aceList);
            SESSION_STORAGE.set(STORAGE_KEY.EXCHANGE_RATE, data.exrateList);
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  }
};
