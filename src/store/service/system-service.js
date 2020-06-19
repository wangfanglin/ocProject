import store from '../index';
import { GLOBAL_STORE } from '../index';
import { GET_MENU_LIST } from '../agy';
import { GET_VIEW, REMOVE_VIEW } from '../system';
import { GET_LOGIN_INFO, GET_TOKEN } from '../login';
import { SESSION_STORAGE } from './storage-service';
import { STORAGE_KEY, SWITCH } from '../../assets/js/constant';
import validate from '../../assets/js/validate';
import util from '../../assets/js/util';
import router from '../../config/router';

/**
 * 打开菜单
 * 1、判断是否为路由菜单
 * 2、判断是否为URL菜单
 */
function openMenu({menuUrl, menuParam, sfBlank}) {
  if (validate.validateRouter(menuUrl)) {
    if (util.isEmpty(menuParam)) {
      if (sfBlank === SWITCH.INACTIVE) {
        router.push(menuUrl);
      } else {
        util.openWindow(`/#${menuUrl}`);
      }
    } else {
      if (sfBlank === SWITCH.INACTIVE) {
        setViewParams(menuUrl, menuParam);
        router.push(menuUrl);
      } else {
        let url = `/#/open?url=${encodeURIComponent(menuUrl)}&queryKey=${menuUrl}&param=${menuParam}`;
        util.openWindow(url);
      }
    }
  }
  if (validate.validateUrl(menuUrl)) {
    let hasQuestionMark = menuUrl.match(/\?/) !== null;
    let url = `${menuUrl}${hasQuestionMark ? '&' : '?'}token=${store.getters[GET_TOKEN]}&uuid=${store.getters[GET_LOGIN_INFO].uuid}`;
    if (util.isNotEmpty(menuParam)) {
      url = url.concat(menuParam);
    }
    util.openWindow(url);
  }
}

/**
 * 获取菜单
 */
function getMenu() {
  if (util.isEmpty(GLOBAL_STORE.menu)) {
    GLOBAL_STORE.menu = SESSION_STORAGE.get(STORAGE_KEY.MENU);
  }
  return GLOBAL_STORE.menu;
}

/**
 * 判断是否存在视图
 * @param path
 */
function hasView(path) {
  return store.getters[GET_VIEW].some(e => {
    return e.path === path;
  });
}

/**
 * 关闭当前视图
 * @param {*} view
 */
function closeView(view) {
  store.dispatch(REMOVE_VIEW, view).then(res => {
    let lastView = res.slice(-1)[0];
    if (util.isNotEmpty(lastView)) {
      router.push({
        path: lastView.path,
        query: lastView.query
      });
    } else {
      router.push('/index');
    }
  });
}

/**
 * 获取视图参数
 */
function getViewParams(key) {
  return SESSION_STORAGE.get(`${STORAGE_KEY.VIEW_PARAMS}-${key}`);
}

/**
 * 设置视图参数
 */
function setViewParams(key, value) {
  SESSION_STORAGE.set(`${STORAGE_KEY.VIEW_PARAMS}-${key}`, value);
}

/**
 * 删除视图参数
 */
function removeViewParams(key) {
  SESSION_STORAGE.remove(`${STORAGE_KEY.VIEW_PARAMS}-${key}`);
}

/**
 * 判断菜单是否有权限
 */
function hasPermission(path) {
  let findResult = getMenu().find(e => {
    return path.includes(e.menuUrl);
  });
  return util.isNotEmpty(findResult);
}

/**
 * 按钮是否注册，判断按钮权限
 */
function isRegister(routeName, agyCode, key) {
  if (util.isEmpty(store.getters[GET_MENU_LIST][agyCode])) {
    let currentMenu = getMenu().find(e => {
      return e.menuId === routeName;
    });
    return util.isEmpty(currentMenu)
      ? false
      : currentMenu.resList.some(e => {
          return e.resourceCode === key;
        });
  } else {
    let currentMenu = store.getters[GET_MENU_LIST][agyCode].find(e => {
      return e.menuId === routeName;
    });
    return util.isEmpty(currentMenu)
      ? false
      : currentMenu.resList.some(e => {
          return e.resourceCode === key;
        });
  }
}

export {
  openMenu,
  getMenu,
  hasView,
  closeView,
  getViewParams,
  setViewParams,
  removeViewParams,
  hasPermission,
  isRegister
};
