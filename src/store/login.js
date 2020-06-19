import { setGlobalInfo } from './service/global-service';
import { setAgyInfo } from './service/agy-service';
import { LOCAL_STORAGE, SESSION_STORAGE } from './service/storage-service';
import { GET_AGY_ACB } from './global';
import util from '../assets/js/util';
import { STORAGE_KEY } from '../assets/js/constant';
import fetch from '../config/fetch';

/**
 * 登录
 * @type {string}
 */
const LOGIN = 'LOGIN';
/**
 * 登出
 * @type {string}
 */
const LOGOUT = 'LOGOUT';
/**
 * Token登录
 * @type {string}
 */
const TOKEN_LOGIN = 'TOKEN_LOGIN';
/**
 * CA登陆
 * @type {string}
 */
const CA_LOGIN = 'CA_LOGIN';
/**
 * 获取Token
 * @type {string}
 */
const GET_TOKEN = 'GET_TOKEN';
/**
 * 设置Token
 * @type {string}
 */
const SET_TOKEN = 'SET_TOKEN';
/**
 * 获取登录信息
 * @type {string}
 */
const GET_LOGIN_INFO = 'GET_LOGIN_INFO';
/**
 * 设置登录信息
 * @type {string}
 */
const SET_LOGIN_INFO = 'SET_LOGIN_INFO';
/**
 * 获取应用上下文单位账套
 * @type {string}
 */
const GET_CONTEXT_AGY_ACB = 'GET_CONTEXT_AGY_ACB';
/**
 * 设置应用上下文单位账套
 * @type {string}
 */
const SET_CONTEXT_AGY_ACB = 'SET_CONTEXT_AGY_ACB';

export {
  LOGIN,
  LOGOUT,
  CA_LOGIN,
  TOKEN_LOGIN,
  GET_TOKEN,
  SET_TOKEN,
  GET_LOGIN_INFO,
  SET_LOGIN_INFO,
  GET_CONTEXT_AGY_ACB,
  SET_CONTEXT_AGY_ACB
};

export default {
  state: {
    token: SESSION_STORAGE.get(STORAGE_KEY.TOKEN) || '',
    loginInfo: SESSION_STORAGE.get(STORAGE_KEY.LOGIN_INFO) || {
      fiscalPeriod: '',
      roleCode: '',
      roleName: '',
      fiscal: '',
      transDate: '',
      userCode: '',
      userName: '',
      agyCode: '',
      agyName: '',
      acbCode: '',
      acbName: '',
      acsCode: '',
      sysDate: '',
      userMenu: [],
      assetRoles: [],
      productVersion: '',
      uuid: ''
    },
    contextAgyAcb: SESSION_STORAGE.get(STORAGE_KEY.CONTEXT_AGY_ACB) || {
      agyCode: '',
      agyName: '',
      acbCode: '',
      acbName: '',
      acsCode: ''
    }
  },
  getters: {
    [GET_TOKEN]: state => {
      return state.token;
    },
    [GET_LOGIN_INFO]: state => {
      return state.loginInfo;
    },
    [GET_CONTEXT_AGY_ACB]: state => {
      return state.contextAgyAcb;
    }
  },
  mutations: {
    [LOGOUT](state) {
      state.token = '';
      state.loginInfo = {
        userCode: '',
        userName: '',
        orgCode: '',
        orgName: '',
        roleCode: '',
        roleName: '',
        agyCode: '',
        agyName: '',
        acbCode: '',
        acbName: '',
        acsCode: '',
        fiscal: '',
        fiscalPeriod: '',
        transDate: '',
        sysDate: '',
        userMenu: [],
        assetRoles: [],
        productVersion: '',
        uuid: ''
      };
      SESSION_STORAGE.remove(STORAGE_KEY.TOKEN);
      SESSION_STORAGE.remove(STORAGE_KEY.LOGIN_INFO);
      SESSION_STORAGE.remove(STORAGE_KEY.CONTEXT_AGY_ACB);
      SESSION_STORAGE.remove(STORAGE_KEY.MENU);
    },
    [SET_TOKEN](state, token) {
      state.token = token;
      SESSION_STORAGE.set(STORAGE_KEY.TOKEN, token);
    },
    [SET_LOGIN_INFO](state, loginInfo) {
      util.copyProperties(state.loginInfo, loginInfo);
      SESSION_STORAGE.set(STORAGE_KEY.LOGIN_INFO, state.loginInfo);
    },
    [SET_CONTEXT_AGY_ACB](state, contextAgyAcb) {
      util.copyProperties(state.contextAgyAcb, contextAgyAcb);
      SESSION_STORAGE.set(STORAGE_KEY.CONTEXT_AGY_ACB, state.contextAgyAcb);
    }
  },
  actions: {
    /**
     * 登录
     */
    [LOGIN]({ commit }, params) {
      return new Promise((resolve, reject) => {
        fetch
          .post('/pa/login', params)
          .then(({ data }) => {
            commit(SET_TOKEN, data.token);
            commit(SET_LOGIN_INFO, data);
            commit(SET_CONTEXT_AGY_ACB, data);
            SESSION_STORAGE.set(STORAGE_KEY.MENU, data.menuList);
            LOCAL_STORAGE.set(STORAGE_KEY.USER_CODE, data.userCode);
            Promise.all([setGlobalInfo(), setAgyInfo()])
              .then(() => {
                resolve(data);
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * 登出
     */
    [LOGOUT]({ commit }) {
      return new Promise(resolve => {
        commit(LOGOUT);
        resolve();
      });
    },
    /**
     * Token登录
     */
    [TOKEN_LOGIN]({ commit }, params) {
      return new Promise((resolve, reject) => {
        fetch
          .post('/pa/tokenLogin', params)
          .then(({ data }) => {
            commit(SET_TOKEN, data.token);
            commit(SET_LOGIN_INFO, data);
            commit(SET_CONTEXT_AGY_ACB, data);
            SESSION_STORAGE.set(STORAGE_KEY.MENU, data.menuList);
            Promise.all([setGlobalInfo(), setAgyInfo()])
              .then(() => {
                resolve(data);
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * CA登录
     */
    [CA_LOGIN]({ commit }, params) {
      return new Promise((resolve, reject) => {
        fetch
          .post('/pa/ca_login', params)
          .then(({ data }) => {
            commit(SET_TOKEN, data.token);
            commit(SET_LOGIN_INFO, data);
            commit(SET_CONTEXT_AGY_ACB, data);
            SESSION_STORAGE.set(STORAGE_KEY.MENU, data.menuList);
            LOCAL_STORAGE.set(STORAGE_KEY.USER_CODE, data.userCode);
            Promise.all([setGlobalInfo(), setAgyInfo()])
              .then(() => {
                resolve(data);
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * 设置上下文单位账套信息
     * 1、判断账套是否为空
     * 2、如果为空，则存入当前单位的第一条账套数据为当前账套信息
     */
    [SET_CONTEXT_AGY_ACB]({ commit, getters }, agyAcb) {
      if (util.isNotEmpty(agyAcb.acbCode)) {
        commit(SET_CONTEXT_AGY_ACB, {
          agyCode: agyAcb.agyCode,
          agyName: agyAcb.agyName,
          acbCode: agyAcb.acbCode,
          acbName: agyAcb.acbName,
          acsCode: agyAcb.acsCode
        });
      } else {
        let currentAgyAcb = getters[GET_AGY_ACB].find(e => {
          return e.code === agyAcb.agyCode;
        });
        if (
          util.isNotEmpty(currentAgyAcb) &&
          util.isNotEmpty(currentAgyAcb.acbList)
        ) {
          commit(SET_CONTEXT_AGY_ACB, {
            agyCode: agyAcb.agyCode,
            agyName: agyAcb.agyName,
            acbCode: currentAgyAcb.acbList[0].code,
            acbName: currentAgyAcb.acbList[0].name,
            acsCode: currentAgyAcb.acbList[0].acsCode
          });
        } else {
          commit(SET_CONTEXT_AGY_ACB, {
            agyCode: agyAcb.agyCode,
            agyName: agyAcb.agyName,
            acbCode: '',
            acbName: '',
            acsCode: ''
          });
        }
      }
    }
  }
};
