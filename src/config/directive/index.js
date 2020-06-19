import Vue from 'vue';
import util from '../../assets/js/util';
import validate from '../../assets/js/validate';
import clickoutside from './clickoutside';
import loadmore from './loadmore';

const directive = {
  /**
   * 整数指令
   */
  int: {
    bind(el) {
      function dispatch(el, type) {
        let event = document.createEvent('HTMLEvents');
        event.initEvent(type, true, true);
        el.dispatchEvent(event);
      }
      let input = el.getElementsByTagName('input')[0];
      input.onkeyup = () => {
        if (input.value.length === 1) {
          input.value = input.value.replace(/[^1-9]/g, '');
        } else {
          input.value = input.value.replace(/[^\d]/g, '');
        }
        dispatch(input, 'input');
      };
      input.onblur = () => {
        if (input.value.length === 1) {
          input.value = input.value.replace(/[^1-9]/g, '');
        } else {
          input.value = input.value.replace(/[^\d]/g, '');
        }
        dispatch(input, 'input');
      };
    },
    unbind(el) {
      let input = el.getElementsByTagName('input')[0];
      input.onkeyup = null;
      input.onblur = null;
    }
  },
  /**
   * 浮点数指令
   */
  float: {
    bind(el) {
      function dispatch(el, type) {
        let event = document.createEvent('HTMLEvents');
        event.initEvent(type, true, true);
        el.dispatchEvent(event);
      }
      let input = el.getElementsByTagName('input')[0];
      input.onchange = () => {
        if (!validate.validateFloat(input.value)) {
          input.value = '';
          dispatch(input, 'input');
        }
      };
    },
    unbind(el) {
      let input = el.getElementsByTagName('input')[0];
      input.onchange = null;
    }
  },
  /**
   * 金额指令
   */
  amount: {
    bind(el) {
      function dispatchEvent(el, type) {
        let event = document.createEvent('HTMLEvents');
        event.initEvent(type, true, true);
        el.dispatchEvent(event);
      }
      let input = el.getElementsByTagName('input')[0];
      input.onchange = () => {
        if (!validate.validateAmount(input.value)) {
          input.value = '';
          dispatchEvent(input, 'input');
        }
      };
    },
    unbind(el) {
      let input = el.getElementsByTagName('input')[0];
      input.onchange = null;
    }
  },
  /**
   * 弹出框拖动事件
   */
  draggable: {
    bind(el) {
      let elDialog = el.getElementsByClassName('el-dialog')[0];
      let elDialogHeader = el.getElementsByClassName('el-dialog__header')[0];
      let elDialogTitle = elDialogHeader.firstElementChild || elDialogHeader.firstChild;

      elDialogTitle.style.userSelect = 'none';
      elDialogTitle.style['-ms-user-select'] = 'none';
      elDialogTitle.style['-moz-user-select'] = 'none';
      elDialogTitle.style.cursor = 'default';

      elDialog.offsetX = 0;
      elDialog.offsetY = 0;

      let move = e => {
        elDialog.style.marginLeft = '0px';
        elDialog.style.marginTop = '0px';
        elDialog.style.left = (e.pageX - elDialog.offsetX) + 'px';
        elDialog.style.top = (e.pageY - elDialog.offsetY) + 'px';
      };

      let up = () => {
        removeEventListener('mousemove', move);
        removeEventListener('mouseup', up);
      };

      let down = e => {
        elDialog.offsetX = (e.pageX - elDialog.offsetLeft);
        elDialog.offsetY = (e.pageY - elDialog.offsetTop);
        addEventListener('mousemove', move);
        addEventListener('mouseup', up);
      };

      elDialogHeader.addEventListener('mousedown', down);
    }
  },
  /**
   * element-ui表格滚动
   */
  tableScroll: {
    bind(el, binding) {
      let tableWrapper = el.querySelector('.el-table__body-wrapper');
      //记录滚动的位置
      let scrollPosition = 0;
      tableWrapper.onscroll = event => {
        //当前的滚动位置减去上一次的滚动位置，如果为true则代表向上滚动，false代表向下滚动
        let flagToDirection = tableWrapper.scrollTop - scrollPosition > 0;
        //记录当前的滚动位置
        scrollPosition = tableWrapper.scrollTop;
        //计算滚动临界点
        const LIMIT_BOTTOM = tableWrapper.scrollHeight / 4.2;
        //滚动位置距离底部的位置
        let scrollBottom = tableWrapper.scrollHeight - (tableWrapper.scrollTop + tableWrapper.clientHeight) < LIMIT_BOTTOM;
        //如果向下滚动，并且距离底部只有零界点高度
        if (flagToDirection && scrollBottom) {
          binding.value(flagToDirection, tableWrapper, tableWrapper.scrollHeight / 2, event);
        }
        //如果是向上滚动，并且距离顶部只有零界点高度
        if (!flagToDirection && tableWrapper.scrollTop < LIMIT_BOTTOM) {
          binding.value(flagToDirection, tableWrapper, tableWrapper.scrollHeight / 2, event);
        }
      };
    },
    unbind(el) {
      let tableWrapper = el.querySelector('.el-table__body-wrapper');
      tableWrapper.onscroll = null;
    }
  },
  /**
   * 滚动
   */
  scroll: {
    bind(el, binding) {
      //记录滚动的位置
      let scrollPosition = 0;
      el.onscroll = event => {
        //当前的滚动位置减去上一次的滚动位置，如果为true则代表向上滚动，false代表向下滚动
        let flagToDirection = el.scrollTop - scrollPosition > 0;
        //记录当前的滚动位置
        scrollPosition = el.scrollTop;
        //计算滚动临界点
        const LIMIT_BOTTOM = el.scrollHeight / 4.2;
        //滚动位置距离底部的位置
        let scrollBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < LIMIT_BOTTOM;
        //如果向下滚动，并且距离底部只有零界点高度
        if (flagToDirection && scrollBottom) {
          binding.value(flagToDirection, el, el.scrollHeight / 2, event);
        }
        //如果是向上滚动，并且距离顶部只有零界点高度
        if (!flagToDirection && el.scrollTop < LIMIT_BOTTOM) {
          binding.value(flagToDirection, el, el.scrollHeight / 2, event);
        }
      };
    },
    unbind(el) {
      el.onscroll = null;
    }
  },
  /**
   * 区域放大事件
   */
  amplification: {
    /*
     * el为当前绑定元素
     * bindings为传过来的class类名，用来指定放大区域
     * */
    bind(el, bindings) {
      el.onclick = () => {
        let ref = document.querySelector('.' + bindings.value);
        if (util.isEmpty(ref.style.cssText)) {
          let clientWidth = document.body.clientWidth - 20;
          let clientHeight = document.body.clientHeight - 65;
          ref.style.width = clientWidth + 'px';
          ref.style.height = clientHeight + 'px';
          ref.style.position = 'fixed';
          ref.style.backgroundColor = 'white';
          ref.style.zIndex = 100;
          ref.style.top = 65 + 'px';
          ref.style.left = 10 + 'px';
          ref.style.boxSizing = 'border-box';
        } else {
          ref.style.cssText = '';
        }
      };
    },
    unbind(el) {
      el.onclick = null;
    }
  },
  /**
   * 外部点击事件
   */
  clickoutside,
  /**
   * el-table大数据量加载
   */
  loadmore
};

Object.keys(directive).forEach((key) => {
  Vue.directive(key, directive[key]);
});
