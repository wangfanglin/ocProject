import Vue from 'vue';
import store from './store/';
import app from './app';
import router from './config/router';
import './config/directive/';
import './config/config';
import './config/filter';
import './config/plugin';
import './components/';
import './assets/style/index.scss';
import '@babel/polyfill';

new Vue({
  router,
  store,
  render: h => h(app)
}).$mount('#app');
