import axios from 'axios';
import {MessageBox} from 'element-ui';
import store from '../store/';
import {LOGOUT, GET_TOKEN, SET_TOKEN} from '../store/login';
import {CONTEXT_PATH} from '../assets/js/constant';
import util from '../assets/js/util';

axios.defaults.baseURL = CONTEXT_PATH;
axios.defaults.timeout = 100000;

axios.interceptors.request.use(config => {
  config.headers['Authorization'] = store.getters[GET_TOKEN];
  if (config.method === 'get') {
    config.params = {hash: Math.random(), ...config.params};
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(({data, data: {code}, headers: {authorization = ''}}) => {
  if (util.isNotEmpty(authorization)) {
    store.commit(SET_TOKEN, authorization);
  }
  if (code === '200') {
    return data;
  } else {
    if (code === '408') {
      MessageBox.alert('登录超时，请重新登录！', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          store.dispatch(LOGOUT).then(() => {
            window.location.reload();
          });
        }
      });
    }
    if (code === '500' && util.isEmpty(data.msg)) {
      data.msg = '系统出错了，请联系服务人员！';
    }
    return Promise.reject(data);
  }
}, error => {
  console.error(error);
  return Promise.reject({code: '500', data: null, msg: '请求超时！'});
});

export default axios;
