import store from '../index';
import { GET_LOGIN_INFO, SET_LOGIN_INFO, SET_CONTEXT_AGY_ACB } from '../login';
import { setGlobalInfo } from './global-service';
import { getMenu } from './system-service';
import util from '../../assets/js/util';
import fetch from '../../config/fetch';

/**
 * 设置用户菜单
 * @param {*} val
 */
function setUserMenu(value) {
  return new Promise((resolve, reject) => {
    let userMenu;
    if (util.isNotEmpty(value)) {
      userMenu = new Array(value.length);
      getMenu().forEach(e => {
        if (value.includes(e.mid)) {
          userMenu.splice(value.indexOf(e.mid), 1, {
            mid: e.mid,
            menuId: e.menuId,
            menuName: e.menuName,
            menuUrl: e.menuUrl,
            menuParam: e.menuParam
          });
        }
      });
    } else {
      userMenu = [];
    }
    fetch
      .post('/pa/mix/userPageCustom/add', {
        userCode: store.getters[GET_LOGIN_INFO].userCode,
        customId: util.generateUUID(),
        customType: 'MENU_CONFIG',
        customContent: JSON.stringify(userMenu),
        pageId: 'INDEX_PAGE'
      })
      .then(res => {
        store.commit(SET_LOGIN_INFO, { userMenu });
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 删除用户菜单
 * @param {*} val
 */
function removeUserMenu(value) {
  return new Promise((resolve, reject) => {
    let userMenu = _.cloneDeep(store.getters[GET_LOGIN_INFO].userMenu);
    if (util.isNotEmpty(userMenu)) {
      let findIndex = userMenu.findIndex(e => {
        return e.mid === value;
      });
      if (findIndex !== -1) {
        userMenu.splice(findIndex, 1);
      }
      fetch
        .post('/pa/mix/userPageCustom/add', {
          userCode: store.getters[GET_LOGIN_INFO].userCode,
          customId: util.generateUUID(),
          customType: 'MENU_CONFIG',
          customContent: JSON.stringify(userMenu),
          pageId: 'INDEX_PAGE'
        })
        .then(res => {
          store.commit(SET_LOGIN_INFO, { userMenu });
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      resolve();
    }
  });
}

/**
 * 更新默认信息中单位账套
 * 更新应用上下文单位账套
 * @param {*} agyInfo
 * @param {*} acbCode
 */
function updateDefaultInfo(agyInfo, acbCode) {
  let acbInfo = agyInfo.acbList.find(e => {
    return e.code === acbCode;
  });
  let agyAcb = {
    agyCode: agyInfo.code,
    agyName: agyInfo.name,
    acbCode: acbInfo.code,
    acbName: acbInfo.name,
    acsCode: acbInfo.acsCode
  };
  store.commit(SET_LOGIN_INFO, agyAcb);
  store.commit(SET_CONTEXT_AGY_ACB, agyAcb);
}

/**
 * 更新默认信息中业务时间
 * 更新应用上下文单位账套
 * @param {*} transDate
 */
function updateDefaultInfoDate(transDate) {
  let { year, month } = util.getDateInfo(transDate);
  store.commit(SET_LOGIN_INFO, {
    fiscal: year,
    fiscalPeriod: month,
    transDate
  });
}

/**
 * 更新登录信息及全局缓存
 */
async function updtaeLoginInfoAndGlobalInfo(transDate) {
  function updateLoginInfo() {
    return new Promise((resolve, reject) => {
      fetch
        .post('/pa/switchOrg', {
          username: store.getters[GET_LOGIN_INFO].userCode,
          transDate
        })
        .then(({ data }) => {
          store.commit(SET_LOGIN_INFO, data);
          store.commit(SET_CONTEXT_AGY_ACB, data);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  await updateLoginInfo();
  await setGlobalInfo();
}

export {
  setUserMenu,
  removeUserMenu,
  updateDefaultInfo,
  updateDefaultInfoDate,
  updtaeLoginInfoAndGlobalInfo
};
