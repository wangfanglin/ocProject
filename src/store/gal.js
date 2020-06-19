import router from '../config/router.js';

/**
 * 获取凭证路由Map
 */
const GET_VOU_ROUTER_MAP = 'GET_VOU_ROUTER_MAP';
/**
 * 设置凭证路由Map
 */
const SET_VOU_ROUTER_MAP = 'SET_VOU_ROUTER_MAP';
/**
 * 打开凭证
 */
const OPEN_VOU = 'OPEN_VOU';

export { GET_VOU_ROUTER_MAP, SET_VOU_ROUTER_MAP, OPEN_VOU };

export default {
  state: {
    vouRouterMap: {
      'gal-vou0': false,
      'gal-vou1': false,
      'gal-vou2': false,
      'gal-vou3': false,
      'gal-vou4': false,
      'gal-vou5': false,
      'gal-vou6': false,
      'gal-vou7': false,
      'gal-vou8': false,
      'gal-vou9': false,
      'gal-vou10': false,
      'gal-vou11': false,
      'gal-vou12': false,
      'gal-vou13': false,
      'gal-vou14': false,
      'gal-vou15': false,
      'gal-vou16': false,
      'gal-vou17': false,
      'gal-vou18': false,
      'gal-vou19': false,
      'gal-vou20': false
    }
  },
  getters: {
    [GET_VOU_ROUTER_MAP]: state => {
      return _.cloneDeep(state.vouRouterMap);
    }
  },
  mutations: {
    [SET_VOU_ROUTER_MAP](state, routerMap) {
      state.vouRouterMap = routerMap;
    },
    /**
     * 打开一个凭证窗口
     */
    [OPEN_VOU](state) {
      let seqs = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20'
      ];
      let routerMap = state.vouRouterMap;
      let idx = seqs.findIndex(suffix => {
        return !routerMap['gal-vou' + suffix];
      });
      let vouRouter = 'gal-vou';
      if (idx >= 0) {
        vouRouter = `${vouRouter}${seqs[idx]}`;
      }
      routerMap[vouRouter] = true;
      router.push(`/gal/${vouRouter}`);
    }
  }
};
