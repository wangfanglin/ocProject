import Vue from 'vue';
import { getMenu } from './service/system-service';
import util from '../assets/js/util';
import fetch from '../config/fetch';

/**
 * 获取产品信息
 * @type {string}
 */
const GET_APP_INFO = 'GET_APP_INFO';
/**
 * 设置产品信息
 * @type {string}
 */
const SET_APP_INFO = 'SET_APP_INFO';
/**
 * 获取license信息
 * @type {string}
 */
const GET_LICENSE_INFO = 'GET_LICENSE_INFO';
/**
 * 设置license信息
 * @type {string}
 */
const SET_LICENSE_INFO = 'SET_LICENSE_INFO';
/**
 * 获取异步路由
 * @type {string}
 */
const GET_ASYNC_ROUTER = 'GET_ASYNC_ROUTER';
/**
 * 设置异步路由
 * @type {string}
 */
const SET_ASYNC_ROUTER = 'SET_ASYNC_ROUTER';
/**
 * 获取视图
 * @type {string}
 */
const GET_VIEW = 'GET_VIEW';
/**
 * 添加视图
 * @type {string}
 */
const ADD_VIEW = 'ADD_VIEW';
/**
 * 更新视图
 * @type {string}
 */
const UPDATE_VIEW = 'UPDATE_VIEW';
/**
 * 删除视图
 * @type {string}
 */
const REMOVE_VIEW = 'REMOVE_VIEW';
/**
 * 删除其他视图
 * @type {string}
 */
const REMOVE_OTHER_VIEW = 'REMOVE_OTHER_VIEW';
/**
 * 删除所有视图
 * @type {string}
 */
const REMOVE_ALL_VIEW = 'REMOVE_ALL_VIEW';
/**
 * 获取缓存的视图
 * @type {string}
 */
const GET_CACHED_VIEW = 'GET_CACHED_VIEW';

function hasPermission(meta, name, key) {
  if (util.isEmpty(meta) || util.isEmpty(name)) {
    return true;
  } else {
    if (!meta.auth || key.includes(name)) {
      return true;
    } else {
      return false;
    }
  }
}

function filterAsyncRouter(asyncRouter, key) {
  return asyncRouter.filter(e => {
    let { name, meta } = e;
    if (hasPermission(meta, name, key)) {
      if (util.isNotEmpty(e.children)) {
        e.children = filterAsyncRouter(e.children, key);
      }
      return true;
    } else {
      return false;
    }
  });
}

export {
  GET_APP_INFO,
  SET_APP_INFO,
  GET_LICENSE_INFO,
  SET_LICENSE_INFO,
  GET_ASYNC_ROUTER,
  SET_ASYNC_ROUTER,
  GET_VIEW,
  ADD_VIEW,
  UPDATE_VIEW,
  REMOVE_VIEW,
  REMOVE_OTHER_VIEW,
  REMOVE_ALL_VIEW,
  GET_CACHED_VIEW
};

export default {
  state: {
    appInfo: {
      productName: '',
      loginImage: '',
      loginTitleColor: '',
      edition: '',
      copyRight: '',
      unregisteredPtyMsg: '',
      unregisteredMoudleMsg: '',
      pwdLevel: ''
    },
    licenseInfo: {
      isRegist: 0,
      moduleInfo: {}
    },
    asyncRouter: [],
    view: [],
    cachedView: []
  },
  getters: {
    [GET_APP_INFO]: state => {
      return state.appInfo;
    },
    [GET_LICENSE_INFO]: state => {
      return state.licenseInfo;
    },
    [GET_ASYNC_ROUTER]: state => {
      return state.asyncRouter;
    },
    [GET_VIEW]: state => {
      return state.view;
    },
    [GET_CACHED_VIEW]: state => {
      return ['INDEX'].concat(state.cachedView);
    }
  },
  mutations: {
    [SET_APP_INFO](state, appInfo) {
      util.copyProperties(state.appInfo, appInfo);
    },
    [SET_LICENSE_INFO](state, licenseInfo) {
      state.licenseInfo.isRegist = licenseInfo._isRegist;
      Vue.set(
        state.licenseInfo,
        'moduleInfo',
        licenseInfo.licenseModuleInfoMap
      );
    },
    [SET_ASYNC_ROUTER](state, asyncRouter) {
      state.asyncRouter = asyncRouter;
    },
    [ADD_VIEW](state, view) {
      let findResult = state.view.find(e => {
        return e.path === view.path;
      });
      if (util.isEmpty(findResult)) {
        state.view.push(view);
        if (view.cache === true) {
          state.cachedView.push(view.name);
        }
      } else {
        findResult.query = view.query;
      }
    },
    [UPDATE_VIEW](state, view) {
      let findResult = state.view.find(e => {
        return e.path === view.path;
      });
      if (findResult) {
        if ('title' in view) {
          findResult.title = view.title;
        }
        if ('changed' in view) {
          findResult.changed = view.changed;
        }
      }
    },
    [REMOVE_VIEW](state, view) {
      let findViewIndex = state.view.findIndex(e => {
        return e.path === view.path;
      });
      if (findViewIndex !== -1) {
        state.view.splice(findViewIndex, 1);
      }
      let findCachedViewIndex = state.cachedView.findIndex(e => {
        return e === view.name;
      });
      if (findCachedViewIndex !== -1) {
        state.cachedView.splice(findCachedViewIndex, 1);
      }
    },
    [REMOVE_OTHER_VIEW](state, view) {
      let findViewIndex = state.view.findIndex(e => {
        return e.path === view.path;
      });
      if (findViewIndex !== -1) {
        state.view = state.view.slice(findViewIndex, findViewIndex + 1);
      }
      let findCachedViewIndex = state.cachedView.findIndex(e => {
        return e === view.name;
      });
      if (findCachedViewIndex !== -1) {
        state.cachedView = state.cachedView.slice(
          findCachedViewIndex,
          findCachedViewIndex + 1
        );
      }
    },
    [REMOVE_ALL_VIEW](state) {
      state.view = [];
      state.cachedView = [];
    }
  },
  actions: {
    /**
     * 设置产品信息（产品名称、版权信息、版本信息、产品未注册提示、模块为注册提示）
     */
    [SET_APP_INFO]({ commit }) {
      return new Promise((resolve, reject) => {
        fetch
          .get('/pa/sys/getAppInfo')
          .then(({ data }) => {
            commit(SET_APP_INFO, data);
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * 设置license信息
     */
    [SET_LICENSE_INFO]({ commit, getters }) {
      return new Promise((resolve, reject) => {
        fetch
          .get('/pa/licenseApp/statusVo')
          .then(({ data }) => {
            commit(SET_LICENSE_INFO, data);
            resolve(getters[GET_LICENSE_INFO]);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * 设置异步路由（根据用户权限筛选路由）
     */
    [SET_ASYNC_ROUTER]({ commit, getters }, asyncRouter) {
      return new Promise(resolve => {
        let menuIdList = getMenu().map(e => {
          return e.menuId;
        });
        commit(SET_ASYNC_ROUTER, filterAsyncRouter(asyncRouter, menuIdList));
        resolve(getters[GET_ASYNC_ROUTER]);
      });
    },
    /**
     * 删除视图
     */
    [REMOVE_VIEW]({ commit, getters }, view) {
      return new Promise(resolve => {
        commit(REMOVE_VIEW, view);
        resolve(getters[GET_VIEW]);
      });
    },
    /**
     * 删除其他视图
     */
    [REMOVE_OTHER_VIEW]({ commit, getters }, view) {
      return new Promise(resolve => {
        commit(REMOVE_OTHER_VIEW, view);
        resolve(getters[GET_VIEW]);
      });
    },
    /**
     * 删除所有视图
     */
    [REMOVE_ALL_VIEW]({ commit, getters }) {
      return new Promise(resolve => {
        commit(REMOVE_ALL_VIEW);
        resolve(getters[GET_VIEW]);
      });
    }
  }
};
