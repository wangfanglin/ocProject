import store from '../index';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '../login';
import { GET_AGY_INFO, SET_AGY_INFO } from '../agy';
import util from '../../assets/js/util';

/**
 * 获取单位信息
 * 用于切换单位后拉去该单位下的缓存
 * @param agyCode
 * @returns {Promise<any>}
 */
function getAgyInfo(agyCode) {
  return new Promise((resolve, reject) => {
    let agyInfo = store.getters[GET_AGY_INFO].find(e => {
      return e.agyInfo.code === agyCode;
    });
    if (util.isNotEmpty(agyInfo)) {
      resolve(agyInfo);
    } else {
      let { fiscal, userCode, roleCode } = store.getters[GET_LOGIN_INFO];
      store
        .dispatch(SET_AGY_INFO, { fiscal, userCode, roleCode, agyCode })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}

/**
 * 设置单位信息
 * 用于强制刷新该单位下缓存
 * @param agyCode
 * @returns {Promise<any>}
 */
function setAgyInfo(agyCode) {
  return new Promise((resolve, reject) => {
    agyCode = util.isNotEmpty(agyCode)
      ? agyCode
      : store.getters[GET_CONTEXT_AGY_ACB].agyCode;
    let { fiscal, userCode, roleCode } = store.getters[GET_LOGIN_INFO];
    store
      .dispatch(SET_AGY_INFO, { fiscal, userCode, roleCode, agyCode })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 新增会计科目
 * @param {*} agyCode
 * @param {*} aco
 */
function addAco(agyCode, aco) {
  let agyInfo = _.cloneDeep(
    store.getters[GET_AGY_INFO].find(e => {
      return e.agyInfo.code === agyCode;
    })
  );
  let sortedIndex = _.sortedIndexBy(agyInfo.mad.ACO, aco, e => {
    return e.acsCode && e.code;
  });
  agyInfo.mad.ACO.splice(sortedIndex, 0, aco);
  store.commit(SET_AGY_INFO, agyInfo);
}

/**
 * 更新会计科目
 * @param {*} agyCode
 * @param {*} aco
 */
function updateAco(agyCode, aco) {
  let agyInfo = _.cloneDeep(
    store.getters[GET_AGY_INFO].find(e => {
      return e.agyInfo.code === agyCode;
    })
  );
  let findIndex = agyInfo.mad.ACO.findIndex(e => {
    return e.id === aco.id;
  });
  agyInfo.mad.ACO.splice(findIndex, 1, aco);
  store.commit(SET_AGY_INFO, agyInfo);
}

/**
 * 删除会计科目
 * @param {*} agyCode
 * @param {*} acoId
 */
function removeAco(agyCode, acoId) {
  let agyInfo = _.cloneDeep(
    store.getters[GET_AGY_INFO].find(e => {
      return e.agyInfo.code === agyCode;
    })
  );
  let findIndex = agyInfo.mad.ACO.findIndex(e => {
    return e.id === acoId;
  });
  agyInfo.mad.ACO.splice(findIndex, 1);
  store.commit(SET_AGY_INFO, agyInfo);
}

export { getAgyInfo, setAgyInfo, addAco, updateAco, removeAco };
