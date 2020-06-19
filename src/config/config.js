import Vue from 'vue';
Vue.config.productionTip = false;

if (process.env.NODE_ENV === 'production') {
  Vue.config.errorHandler = (err, vm, info) => {
    console.error(err, info);
  };
}
