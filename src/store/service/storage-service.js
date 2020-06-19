import util from '../../assets/js/util';

const LOCAL_STORAGE = {
  /**
   * 获取数据
   */
  get(key) {
    let result = localStorage.getItem(key);
    return util.isNotEmpty(result) ? JSON.parse(result) : result;
  },
  /**
   * 设置数据
   */
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  /**
   * 删除数据
   */
  remove(key) {
    localStorage.removeItem(key);
  },
  /**
   * 清空数据
   */
  clear() {
    localStorage.clear();
  }
};

const SESSION_STORAGE = {
  /**
   * 获取数据
   */
  get(key) {
    let result = sessionStorage.getItem(key);
    return util.isNotEmpty(result) ? JSON.parse(result) : result;
  },
  /**
   * 设置数据
   */
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  /**
   * 删除数据
   */
  remove(key) {
    sessionStorage.removeItem(key);
  },
  /**
   * 清空数据
   */
  clear() {
    sessionStorage.clear();
  }
};

export { LOCAL_STORAGE, SESSION_STORAGE };
