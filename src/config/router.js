import Vue from 'vue';
import VueRouter from 'vue-router';
import { MessageBox } from 'element-ui';
import store from '../store/';
import { LOGOUT, GET_TOKEN } from '../store/login';
import { GET_ASYNC_ROUTER, SET_ASYNC_ROUTER } from '../store/system';
import { GET_AGY_INFO } from '../store/agy';
import { setAgyInfo } from '../store/service/agy-service';
import util from '../assets/js/util';

Vue.use(VueRouter);

/**
 * 基础路由
 */
const constantRouter = [
  {
    path: '/',
    redirect: '/index',
    component: () => import('../modules/sys/layout/index'),
    children: [
      {
        path: 'index',
        name: 'INDEX',
        meta: {
          title: '首页',
          cache: true
        },
        component: () => import('../modules/sys/index/index')
      },
      {
        path: 'report/:key',
        name: 'REPORT',
        meta: {
          title: 'REPORT',
          cache: false
        },
        component: () => import('../modules/sys/report/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'LOGIN',
    component: () => import('../modules/sys/login/index')
  },
  {
    path: '/oauth',
    name: 'OAUTH',
    component: () => import('../modules/sys/oauth/index')
  },
  {
    path: '/open',
    name: 'OPEN',
    component: () => import('../modules/sys/open/index')
  },
  {
    path: '/redirect/:path*',
    name: 'REDIRECT',
    component: () => import('../modules/sys/redirect/index')
  },
  {
    path: '/remind-redirect',
    name: 'REMIND-REDIRECT',
    component: () => import('../modules/sys/remind-redirect/index')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../modules/sys/error/404')
  }
];

/**
 * 异步路由
 */
let asyncRouter = [
  {
    path: '*',
    redirect: '/404'
  }
];

/**
 * 获取异步路由文件
 */
const routerFiles = require.context(
  './../modules/',
  true,
  /\/router\/index.js/
);

/**
 * 加载异步路由
 */
routerFiles.keys().forEach(key => {
  asyncRouter.unshift(...routerFiles(key).default);
});

/**
 * 路由实例
 */
const router = new VueRouter({
  routes: constantRouter
});

/**
 * 路由白名单
 */
const whiteList = ['/login', '/oauth', '/404'];

/**
 * 路由前置钩子函数
 * 1、校验是否存在Token，如果不存在且路由不在白名单里面，则跳转到登录页
 * 2、判断是否存在菜单，如果不存在则重新生成菜单
 * 3、如果不存在菜单，则在生成菜单之后，需要生成挂载异步路由
 * 4、判断是够存在单位级缓存，如果不存在则重新加载单位级缓存
 */
router.beforeEach((to, from, next) => {
  function initAgyInfo(callBack) {
    setAgyInfo()
      .then(() => {
        callBack();
      })
      .catch(err => {
        console.error(err);
        MessageBox.alert('获取单位信息失败，请重新登录！', '提示', {
          confirmButtonText: '确定',
          callback: () => {
            store.dispatch(LOGOUT).then(() => {
              window.location.reload();
            });
          }
        });
      });
  }

  if (util.isNotEmpty(store.getters[GET_TOKEN])) {
    if (util.isNotEmpty(store.getters[GET_ASYNC_ROUTER])) {
      if (util.isNotEmpty(store.getters[GET_AGY_INFO])) {
        next();
      } else {
        initAgyInfo(() => {
          next();
        });
      }
    } else {
      store
        .dispatch(SET_ASYNC_ROUTER, asyncRouter)
        .then(res => {
          router.addRoutes(res);
          if (util.isNotEmpty(store.getters[GET_AGY_INFO])) {
            next({
              ...to,
              replace: true
            });
          } else {
            initAgyInfo(() => {
              next({
                ...to,
                replace: true
              });
            });
          }
        })
        .catch(() => {
          next({
            path: '/login',
            replace: true
          });
        });
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next('/login');
    }
  }
});

export default router;
