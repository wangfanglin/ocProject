export default {
  componentUpdated(el, binding, vnode, oldVnode) {
    vnode.context.el = el;
    // 设置默认溢出显示数量
    let spillDataNum = 20;
    // 设置隐藏函数
    let timeout = false;
    let setRowDisableNone = function(topNum, showRowNum, binding) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        binding.value.call(null, topNum, topNum + showRowNum + spillDataNum);
      });
    };
    setTimeout(() => {
      const dataSize = vnode.data.attrs['data-size'];
      const oldDataSize = oldVnode.data.attrs['data-size'];
      const tableHeight = vnode.data.attrs['table-height'];
      const fixRight = vnode.data.attrs['fix-right'];
      const tableSummary = vnode.data.attrs['table-summary'];
      const isReLoad = vnode.data.attrs['is-reload'];
      if (dataSize === oldDataSize) {
        if (typeof isReLoad == 'undefined') {
          return;
        } else {
          if (!isReLoad) {
            return;
          }
        }
      };
      if(dataSize < 60){
        binding.value.call(null, 0, dataSize);
        let curSelectTbody = el.querySelector('.el-table__body-wrapper').querySelector('table tbody');
        if (curSelectTbody.querySelector('.loadmoreTableContent')) {
          curSelectTbody.removeChild(curSelectTbody.querySelector('.loadmoreTableContent'));
          curSelectTbody.setAttribute(
            'style',
            `transform: translateY(${0}px)`
          );
        };

        //解决操作列抖动的问题--开始--↓
        let tableTitleHeight = el.querySelector('.el-table__header-wrapper').clientHeight;
        let summaryHeight = 0;
        if(tableSummary){//是否有底部的合计行
          summaryHeight = el.querySelector('.el-table__footer-wrapper').clientHeight - 1;
        };
        el.querySelector('.el-table__body-wrapper').setAttribute(
          'style',
          `height: ${tableHeight - tableTitleHeight - 2 - summaryHeight}px;`
        );
        if(el.querySelector('.el-table__fixed-right-patch')){
          el.querySelector('.el-table__fixed-right-patch').setAttribute(
            'style',
            `height: ${tableTitleHeight}px;`
          );
        }
        //解决操作列抖动的问题--开始--↑

        if(el.querySelector('.el-table__fixed')){
          let cFixedTbody = el.querySelector('.el-table__fixed').querySelector('table tbody');
          if (cFixedTbody.querySelector('.loadmoreTableFixedContent')) {
            cFixedTbody.removeChild(cFixedTbody.querySelector('.loadmoreTableFixedContent'));
            cFixedTbody.setAttribute(
              'style',
              `transform: translateY(${0}px)`
            );
          };

          //解决操作列抖动的问题--开始--↓
          el.querySelector('.el-table__fixed').setAttribute(
            'style',
            `height: ${tableHeight - 20 - summaryHeight}px;`
          );
          el.querySelector('.el-table__fixed').querySelector('.el-table__fixed-body-wrapper').setAttribute(
            'style',
            `height: ${tableHeight - tableTitleHeight - 20 - summaryHeight}px;top:${tableTitleHeight}px;`
          );
          //解决操作列抖动的问题--开始--↑
        };
        if(el.querySelector('.el-table__fixed-right')){
          let cFixedRightTbody = el.querySelector('.el-table__fixed-right').querySelector('table tbody');
          if (cFixedRightTbody.querySelector('.loadmoreTableFixedRightContent')) {
            cFixedRightTbody.removeChild(cFixedRightTbody.querySelector('.loadmoreTableFixedRightContent'));
            cFixedRightTbody.setAttribute(
              'style',
              `transform: translateY(${0}px)`
            );
          };

          //解决操作列抖动的问题--开始--↓
          if(fixRight){
            el.querySelector('.el-table__fixed-right').setAttribute(
              'style',
              `height: ${tableHeight - 20 - summaryHeight}px;right:${18}px;width:${fixRight}px`
            );
          }else{
            el.querySelector('.el-table__fixed-right').setAttribute(
              'style',
              `height: ${tableHeight - 20 - summaryHeight}px;right:${18}px;`
            );
          }
          el.querySelector('.el-table__fixed-right').querySelector('.el-table__fixed-body-wrapper').setAttribute(
            'style',
            `height: ${tableHeight - tableTitleHeight - 20 - summaryHeight}px;top:${tableTitleHeight}px;`
          );
          //解决操作列抖动的问题--开始--↑
        };
        return false;
      }else{
        let cSelectWrap = el.querySelector('.el-table__body-wrapper');
        let cSelectRow = cSelectWrap.querySelector('table tr');
        let cShowRowNum = Math.round((cSelectWrap.clientHeight + 10) / cSelectRow.clientHeight);
        binding.value.call(null, 0, cShowRowNum + spillDataNum);
      };
      const selectWrap = el.querySelector('.el-table__body-wrapper');
      if (selectWrap) {
        const tableTitleHeight = el.querySelector('.el-table__header-wrapper').clientHeight;
        //解决操作列抖动的问题--开始--↓
        let summaryHeight = 0;
        if(tableSummary){//是否有底部的合计行
          summaryHeight = el.querySelector('.el-table__footer-wrapper').clientHeight - 1;
        };
        el.querySelector('.el-table__body-wrapper').setAttribute(
          'style',
          `height: ${tableHeight - tableTitleHeight - 2 - summaryHeight}px;`
        );
        if(el.querySelector('.el-table__fixed-right-patch')){
          el.querySelector('.el-table__fixed-right-patch').setAttribute(
            'style',
            `height: ${tableTitleHeight}px;`
          );
        }
        //解决操作列抖动的问题--开始--↑

        const selectTbody = selectWrap.querySelector('table tbody');

        const selectRow = selectWrap.querySelector('table tr');
        if (!selectRow) {
          return;
        }
        const rowHeight = selectRow.clientHeight;
        let showRowNum = Math.round((selectWrap.clientHeight + 10) / rowHeight);

        const createElementTR1 = document.createElement('tr');
        createElementTR1.className = 'loadmoreTableContent';
        let createElementTRHeight1 =
          (dataSize - showRowNum - spillDataNum) * rowHeight;
        createElementTR1.setAttribute(
          'style',
          `height: ${createElementTRHeight1}px;`
        );
        if (!selectTbody.querySelector('.loadmoreTableContent')) {
          selectTbody.appendChild(createElementTR1);
        } else {
          selectTbody.removeChild(
            selectTbody.querySelector('.loadmoreTableContent')
          );
          selectTbody.appendChild(createElementTR1);
        }

        let fixedTbody,
          fixedRightTbody,
          createElementTR2,
          createElementTRHeight2,
          createElementTR3,
          createElementTRHeight3;
        if (el.querySelector('.el-table__fixed')) {
          //解决操作列抖动的问题--开始--↓
          el.querySelector('.el-table__fixed').setAttribute(
            'style',
            `height: ${tableHeight - 20 - summaryHeight}px;`
          );
          el.querySelector('.el-table__fixed').querySelector('.el-table__fixed-body-wrapper').setAttribute(
            'style',
            `height: ${tableHeight - tableTitleHeight - 20 - summaryHeight}px;top:${tableTitleHeight}px;`
          );
          //解决操作列抖动的问题--开始--↑

          fixedTbody = el
            .querySelector('.el-table__fixed')
            .querySelector('table tbody');
          createElementTR2 = document.createElement('tr');
          createElementTR2.className = 'loadmoreTableFixedContent';
          createElementTRHeight2 =
            (dataSize - showRowNum - spillDataNum) * rowHeight;
          createElementTR2.setAttribute(
            'style',
            `height: ${createElementTRHeight2}px;`
          );
          if (!fixedTbody.querySelector('.loadmoreTableFixedContent')) {
            fixedTbody.appendChild(createElementTR2);
          } else {
            fixedTbody.removeChild(
              fixedTbody.querySelector('.loadmoreTableFixedContent')
            );
            fixedTbody.appendChild(createElementTR2);
          }
        }

        if (el.querySelector('.el-table__fixed-right')) {
          //解决操作列抖动的问题--开始--↓
          if(fixRight){
            el.querySelector('.el-table__fixed-right').setAttribute(
              'style',
              `height: ${tableHeight - 20 - summaryHeight}px;right:${18}px;width:${fixRight}px`
            );
          }else{
            el.querySelector('.el-table__fixed-right').setAttribute(
              'style',
              `height: ${tableHeight - 20 - summaryHeight}px;right:${18}px;`
            );
          }
          el.querySelector('.el-table__fixed-right').querySelector('.el-table__fixed-body-wrapper').setAttribute(
            'style',
            `height: ${tableHeight - tableTitleHeight - 20 - summaryHeight}px;top:${tableTitleHeight}px;`
          );
          //解决操作列抖动的问题--开始--↑

          fixedRightTbody = el
            .querySelector('.el-table__fixed-right')
            .querySelector('table tbody');
          createElementTR3 = document.createElement('tr');
          createElementTR3.className = 'loadmoreTableFixedRightContent';
          createElementTRHeight3 =
            (dataSize - showRowNum - spillDataNum) * rowHeight;
          createElementTR3.setAttribute(
            'style',
            `height: ${createElementTRHeight3}px;`
          );
          if (!fixedRightTbody.querySelector('.loadmoreTableFixedRightContent')) {
            fixedRightTbody.appendChild(createElementTR3);
          } else {
            fixedRightTbody.removeChild(
              fixedRightTbody.querySelector('.loadmoreTableFixedRightContent')
            );
            fixedRightTbody.appendChild(createElementTR3);
          }
        }

        // 监听滚动后事件
        selectWrap.addEventListener('scroll', function() {
          let topPx = this.scrollTop - spillDataNum * rowHeight;
          vnode.context.scrollTop = this.scrollTop;
          let topNum = Math.round(topPx / rowHeight);
          let minTopNum = dataSize - spillDataNum - showRowNum;
          if (topNum > minTopNum) {
            topNum = minTopNum;
          }
          if (topNum < 0) {
            topNum = 0;
            topPx = 0;
          }
          selectTbody.setAttribute(
            'style',
            `transform: translateY(${topPx}px)`
          );
          createElementTR1.setAttribute(
            'style',
            `height: ${
              createElementTRHeight1 - topPx > 0
                ? createElementTRHeight1 - topPx
                : 0
            }px;`
          );

          if (el.querySelector('.el-table__fixed')) {
            fixedTbody.setAttribute(
              'style',
              `transform: translateY(${topPx}px)`
            );
            createElementTR2.setAttribute(
              'style',
              `height: ${
                createElementTRHeight2 - topPx > 0
                  ? createElementTRHeight2 - topPx
                  : 0
              }px;`
            );
          }

          if (el.querySelector('.el-table__fixed-right')) {
            fixedRightTbody.setAttribute(
              'style',
              `transform: translateY(${topPx}px)`
            );
            createElementTR3.setAttribute(
              'style',
              `height: ${
                createElementTRHeight3 - topPx > 0
                  ? createElementTRHeight3 - topPx
                  : 0
              }px;`
            );
          }

          setRowDisableNone(topNum, showRowNum, binding);
        });
      }
    },500);
  },
  unbind(el, binding, vnode) {
    const selectWrap1 = el.querySelector('.el-table__body-wrapper');
    selectWrap1.removeEventListener('scroll', null);
  }
};
