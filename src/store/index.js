import Vue from 'vue';
import Vuex from 'vuex';
import login from './login';
import global from './global';
import agy from './agy';
import gal from './gal';
import system from './system';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production', //在非生产环境下，使用严格模式
  modules: {
    login,
    global,
    agy,
    gal,
    system
  }
});
export default store;

/**
 * 全局存储对象
 */
const GLOBAL_STORE = {
  menu: []
};

export { GLOBAL_STORE };
