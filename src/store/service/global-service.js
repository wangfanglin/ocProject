import store from '../index';
import {
  GET_LOGIN_INFO,
  SET_LOGIN_INFO,
  GET_CONTEXT_AGY_ACB,
  SET_CONTEXT_AGY_ACB
} from '../login';
import { GET_GLOBAL_INFO, SET_GLOBAL_INFO, UPDATE_AGY_ACB } from '../global';
import { GET_MAD } from '../agy';
import { SESSION_STORAGE } from './storage-service';
import { STORAGE_KEY } from '../../assets/js/constant';
import util from '../../assets/js/util';
import fetch from '../../config/fetch';

/**
 * 设置全局信息
 */
function setGlobalInfo() {
  return new Promise((resolve, reject) => {
    let { fiscal, userCode, roleCode } = store.getters[GET_LOGIN_INFO];
    store
      .dispatch(SET_GLOBAL_INFO, { fiscal, userCode, roleCode })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 更新单位账套
 */
function updateAgyAcb() {
  /**
   * 设置默认单位账套
   */
  function setDefaultAgyAcb() {
    return new Promise((resolve, reject) => {
      fetch
        .get('/pa/user/getBusinessInfo', {
          params: {
            userCode: store.getters[GET_LOGIN_INFO].userCode
          }
        })
        .then(({ data }) => {
          store.commit(SET_LOGIN_INFO, {
            agyCode: data.agyCode,
            agyName: data.agyName,
            acbCode: data.acbCode,
            acbName: data.acbName,
            acsCode: data.acsCode
          });
          store.commit(SET_CONTEXT_AGY_ACB, data);
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  return new Promise((resolve, reject) => {
    Promise.all([setGlobalInfo(), setDefaultAgyAcb()])
      .then(res => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 更新单位名称
 */
function updateAgyName(agyCode, agyName, agyTypeCode) {
  store.commit(SET_LOGIN_INFO, { agyName });
  store.commit(SET_CONTEXT_AGY_ACB, { agyName });
  store.commit(UPDATE_AGY_ACB, { code: agyCode, name: agyName, agyTypeCode });
}

/**
 * 获取枚举
 * @param type
 */
function getEnumerate(type) {
  return util.isEmpty(type)
    ? SESSION_STORAGE.get(STORAGE_KEY.ENUMERATE)
    : SESSION_STORAGE.get(STORAGE_KEY.ENUMERATE).filter(e => {
        return e.type === type;
      });
}

/**
 * 获取缓存
 */
function getCache(type, key) {
  try {
    /**
     * 缓存种类
     *  GLOBAL：全局缓存，
     *  AGY： 单位级缓存，
     *  ENUMERATE：枚举（值集）
     */
    const CACHE_TYPE = {
      GLOBAL: 'global',
      AGY: 'agy',
      ENUMERATE: 'enumerate'
    };
    if (util.isEmpty(type)) {
      return [];
    } else {
      let result;
      switch (type) {
        case CACHE_TYPE.GLOBAL:
          result = store.getters[GET_GLOBAL_INFO][key];
          break;
        case CACHE_TYPE.AGY:
          let mad =
            store.getters[GET_MAD][store.getters[GET_CONTEXT_AGY_ACB].agyCode];
          if (util.isNotEmpty(mad)) {
            result = mad[key];
          } else {
            result = [];
          }
          break;
        default:
          result = getEnumerate(key);
      }
      return util.isNotEmpty(result) ? result : [];
    }
  } catch (err) {
    return [];
  }
}

/**
 * 获取系统级的辅助核算项数据
 */
function getSysAcitemType() {
  return SESSION_STORAGE.get(STORAGE_KEY.SYS_ACITEM_TYPE);
}

/**
 * 获取预算类型
 */
function getBudType() {
  return SESSION_STORAGE.get(STORAGE_KEY.BUD_TYPE);
}

/**
 * 获取会计要素
 */
function getAce() {
  return SESSION_STORAGE.get(STORAGE_KEY.ACE);
}

/**
 * 获取汇率
 */
function getExchangeRate() {
  return SESSION_STORAGE.get(STORAGE_KEY.EXCHANGE_RATE);
}

export {
  setGlobalInfo,
  updateAgyAcb,
  updateAgyName,
  getEnumerate,
  getCache,
  getSysAcitemType,
  getBudType,
  getAce,
  getExchangeRate
};
