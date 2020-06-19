import store from '../store/index';
import {
  GET_LOGIN_INFO,
  GET_CONTEXT_AGY_ACB
} from '../store/login';
import {
  getCache
} from '../store/service/global-service';
import {
  FORM_TYPE,
  DATA_TYPE,
  SWITCH
} from '../assets/js/constant';
import util from '../assets/js/util';
import validate from '../assets/js/validate';
import fetch from '../config/fetch';

/**
 * 动态表单公共方法
 */
export default {
  /**
   * 获取动态表单选项
   */
  getOption({cacheType, cacheKey, url}, params, callback) {
    if (util.isNotEmpty(cacheType) && util.isNotEmpty(cacheKey)) {
      callback(getCache(cacheType, cacheKey));
    } else if (util.isNotEmpty(url)) {
      let {userCode, roleCode, fiscal, fiscalPeriod, transDate} = store.getters[GET_LOGIN_INFO];
      fetch.get(url, {
        params: {
          userCode,
          roleCode,
          agyCode: store.getters[GET_CONTEXT_AGY_ACB].agyCode,
          fiscal,
          fiscalPeriod,
          transDate,
          ...params
        }
      }).then(({
        data
      }) => {
        data = util.isNotEmpty(data) ? data : [];
        callback(data);
      }).catch(() => {
        callback([]);
      });
    } else {
      callback([]);
    }
  },
  /**
   * 获取Placeholder
   */
  getPlaceholder(editor, desc) {
    return editor === FORM_TYPE.INPUT || editor === FORM_TYPE.TEXTAREA ? `输入${desc}` : `选择${desc}`;
  },
  /**
   * 获取表单类型
   */
  getEditor(editor, dataType) {
    if (editor !== FORM_TYPE.INPUT) {
      return editor;
    } else {
      return dataType === DATA_TYPE.DECIMAL ? FORM_TYPE.FORMAT_INPUT : FORM_TYPE.INPUT;
    }
  },
  /**
   * 获取初始化的值
   */
  getInitializeValue(editor, dataType) {
    if (editor === FORM_TYPE.SWITCH) {
      return 0;
    } else if (dataType === DATA_TYPE.ARRAY) {
      return [];
    } else {
      return '';
    }
  },
  /**
   * 数据校验规则（校验字段类型）
   */
  validator({value, callback}, {required, editor, dataType, desc, max}) {
    if (util.isNotEmpty(value)) {
      if (editor !== FORM_TYPE.SWITCH) {
        if (dataType === DATA_TYPE.INT) {
          if (!validate.validateInteger(value)) {
            callback(new Error(`${desc}须为整数`));
          } else {
            if (util.isNotEmpty(max) && Number(value) > Number(max)) {
              callback(new Error(`${desc}最大为${max}`));
            } else {
              callback();
            }
          }
        } else if (dataType === DATA_TYPE.DECIMAL) {
          if (!validate.validateFloat(value)) {
            callback(new Error(`${desc}须为数值`));
          } else {
            if (util.isNotEmpty(max) && Number(value) > Number(max)) {
              callback(new Error(`${desc}最大为${max}`));
            } else {
              callback();
            }
          }
        } else {
          callback();
        }
      } else {
        if (required === SWITCH.ACTIVE && value === SWITCH.INACTIVE) {
          callback(new Error(`${desc}须选是`));
        } else {
          callback();
        }
      }
    } else {
      callback();
    }
  },
  /**
   * 数据校验提示信息
   */
  validatorMsg(editor, desc) {
    return editor === FORM_TYPE.INPUT || editor === FORM_TYPE.TEXTAREA ? `输入${desc}` : `选择${desc}`;
  },
  /**
   * 筛选出可见的字段
   */
  visibilityProperties(val) {
    return val.filter(e => {
      return e.visibility === SWITCH.ACTIVE;
    });
  },
  /**
   * 根据code获取name值
   * 1、当label与value都不为空，需要去查找数据
   * 2、判断value数据类型
   */
  getNameByCode(schema, data, option) {
    let result = {};
    schema.forEach(e => {
      let value = data[e.value];
      if (util.isNotEmpty(e.label) && util.isNotEmpty(value)) {
        if (Array.isArray(value)) {
          let nameList = [];
          value.forEach(item => {
            let findResult = option[e.value].find(element => {
              return item === element.code;
            });
            nameList.push(util.isEmpty(findResult) ? '' : findResult.name);
          });
          result[e.label] = nameList;
        } else {
          let findResult = option[e.value].find(item => {
            return item.code === value;
          });
          result[e.label] = util.isEmpty(findResult) ? '' : findResult.name;
        }
      }
    });
    return result;
  }
};

/**
 * 分发表单校验事件
 */
function dispatchValidateEvent(vm, componentName, eventName, params) {
  let parent = vm.$parent || vm.$root;
  let name = parent.$options.componentName;

  while (parent && (!name || name !== componentName)) {
    parent = parent.$parent;

    if (parent) {
      name = parent.$options.componentName;
    }
  }
  if (parent) {
    parent.$emit.apply(parent, [eventName].concat(params));
  }
}

export {
  dispatchValidateEvent
}
