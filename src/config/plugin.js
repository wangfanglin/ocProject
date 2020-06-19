import Vue from 'vue';
import ElementUI from 'element-ui';
import VCharts from 'v-charts';
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline';
import { Observable } from '../assets/js/model';

Vue.use(ElementUI);
Vue.use(VCharts);
Vue.component('Timeline', Timeline);
Vue.component('TimelineTitle', TimelineTitle);
Vue.component('TimelineItem', TimelineItem);

Vue.use({
  install(Vue) {
    let loading;
    Object.defineProperty(Vue.prototype, '$loading', {
      value(text = '加载中....') {
        loading = ElementUI.Loading.service({
          fullscreen: true,
          lock: false,
          text: text,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)',
          customClass: 'f28'
        });
      }
    });
    Object.defineProperty(Vue.prototype, '$loadingClose', {
      value() {
        loading && (loading.close());
      }
    });
  }
});

Vue.use({
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$observable', {
      value: new Observable()
    });
  }
});
