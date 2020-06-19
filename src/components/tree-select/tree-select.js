import util from '@/assets/js/util';
import fontAdapter from '@/assets/js/font-adapter';
import match from '@/assets/js/match';

export default {
  props: {
    listData: {
      type: Array,
      default() {
        return [];
      }
    },
    navList: {
      type: Array,
      default() {
        return [];
      }
    },
    value: {
      type: String,
      default() {
        return '';
      }
    },
    selfOrChild: {
      //只能在自己及其子节点中间选择,应用场景：生成的凭证，没选到叶子节点，只能在当前节点下选择叶子节点
      type: Boolean,
      default() {
        return false;
      }
    },
    hasNew: {
      //是否有增加新值的按钮
      type: Boolean,
      default() {
        return false;
      }
    },
    hasSelect: {
      //是否有增加新值的按钮
      type: Boolean,
      default() {
        return false;
      }
    },
    hasComment: {
      //是否有说明
      type: Boolean,
      default() {
        return false;
      }
    },
    hasSetting: {
      type: Boolean,
      default() {
        return false;
      }
    },
    name: {
      //要素名称，用以显示在下面的增加按钮，可以不传
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '250px'
      //可以通过这个参数来控制当前组件的宽度min-width
    },
    inputClass: {
      type: Object,
      default: {
        fontSize: '1em'
      }
    },
    containerClass: {
      type: Object,
      default: {
        height: '34px',
        lineHeight: '34px'
      }
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: Number,
      default: 350
    },
    type: {
      //要素代码
      type: String,
      default: ''
    },
    isNullable: {
      //是否可以为空值,不选择值的时候，打回车也直接跳走
      type: Boolean,
      default: false
    },
    fns: {
      //读取条目说明的函数
      type: Object,
      default: undefined
    },
    props: {
      default() {
        return {
          id: 'code',
          label: 'name',
          pid: 'pcode',
          uuid: 'id',
          children: 'children'
        };
      }
    }
  },
  data() {
    return {
      originValue: '', //记录组件刚创建时传进来的值,用于当selfOrChild为true时，限制选择当数据集
      currentValue: '',
      clickInput: false, //是否点击了输入框
      clickPanel: false, //是否点击了下拉列表区域
      clickOutside: false, //是否点击了下拉列表之外的区域
      clickClear: false, //是否点击了清除按钮
      clickOpen: false, //是否点击了清除按钮
      openList: false, //是否显示下拉列表

      mouseOverIndex: -1, //鼠标划过某个节点时，记录索引号，用于显示"说明"
      mouseOverInput: false, //鼠标划过输入框
      nodeHeight: 30, //每个节点的高度
      /**
       * 根据输入框里的值，返回筛选之后的列表
       * 规则：
       * 1、输入数字，表示通过代码查找，所有节点都要显示，不筛选;
       * 2、输入其它字符，通过名称筛选，并保持上级节点和直接下级节点
       */
      activeList: [], //根据输入框里的内容筛选之后的列表
      openStatus: [], //记录因输入值和节点点击引起的节点展开或折叠状态数据[true,false,false...],顺序跟activeList的要素一致
      currentNodeIndex: -1, //记录当前节点索引，此索引序号为基于activeList的索引号

      isShowAtomComment: false, //是否显示科目及辅助核算项的说明框
      showAtomSetIntervel: null, //定时器 用来延迟修改辅助说明框
      atomCommentLoaded: false, //说明是否加载完成
      atomComment: '', //说明框的内容

      pageSize: 30, //每页显示的条目数
      pageIndex: 0, //加载到第几页的数据到pageList
      pageLimit: 4, //总共显示页数
      pageMap: [], //pageList里存的是哪些页数据
      pageList: [], //当前渲染的列表[{data:item,index:3},...]

      initialized: false //是否已经初始化(计算fullNameList,freshFilter等);
    };
  },
  watch: {
    value: {
      handler(val) {
        this.currentValue = val;
      }
    },

    /**
     * 输入框里的值发生变化时，重新筛选列表，设置currentNodeIndex,openStatus
     */
    currentValue(val) {
      if (!this.initialized) {
        return;
      }
      if (val === '') {
        this.dispatchEvent();
      }
      this.refreshList(this.dataList, this.currentValue, true);
    },

    /**
     * 监听数据变化后更新列表
     */
    listData(n, o) {
      if (n !== o && this.initialized) {
        this.refreshList(this.dataList, this.currentValue, false);
      }
    },

    openList(v) {
      if (v && !this.initialized) {
        this.initialized = true;
        this.refreshList(this.dataList, this.currentValue, false);
      }
      this.openListPanel();
    }
  },

  methods: {
    /**
     * input框获得焦点
     */
    inputFocus(event) {
      this.$nextTick(() => {
        if (!this.hasValue()) {
          this.openList = true;
        }
        this.$emit('focus', this.currentValue);
        event.target.select();
      });
    },
    /**
     * input 框失去焦点
     */
    inputBlur() {
      _.delay(() => {
        if (this.clickClear) {
          this.clickClear = false;
          this.clickOutside = false;
          this.openList = false;
          return;
        }
        if (this.clickOpen) {
          this.clickOutside = false;
          this.clickOpen = false;
          return;
        }
        if (this.clickPanel) {
          return;
        }
        //点击到组件之外,此时clickOutside可能为true（下拉列表已展开），也可能为false（下拉列表未展开）
        this.openList = false;
        this.currentValue = this.value;
        this.$emit('blur', this.currentValue);
      }, 300);
    },
    /**
     * 清空选中值
     */
    clear() {
      this.clickClear = true;
      this.currentValue = '';
      this.openList = true;
      this.setInputFocus();
      if (this.hasValue()) {
        this.dispatchEvent();
      }
    },
    /**
     * 鼠标点击展开下拉列表
     */
    open() {
      this.openList = !this.openList;
      this.setInputFocus();
      this.clickOpen = true;
    },

    /**
     * 点击选择面板事件
     */
    clickSelectPanel() {
      this.clickPanel = true;
    },
    /**
     * 点击选择面板外部事件
     */
    clickPanelOutSide() {
      _.delay(() => {
        if (this.clickClear) {
          this.openList = false;
          return;
        }
        if (this.clickInput) {
          this.clickInput = false;
          return;
        }
        this.clickOutside = true;
        this.openList = false;
        this.$emit('blur', this.currentValue);
      }, 100);
    },
    /**
     * 给组件输入框设置焦点
     */
    setFocus(isExpandList, couldBeNull) {
      this.setInputFocus();
      this.openList = isExpandList;
      // _.delay(() => {
      //   if (couldBeNull){
      //     this.currentNodeIndex = -1;
      //   }
      // },100);
    },

    setInputFocus() {
      this.$refs.treeSelectInput.focus();
    },

    /**
     * 输入框的input事件
     */
    textInput() {
      this.openList = true;
    },

    openListPanel() {
      this.$nextTick(() => {
        if (this.openList) {
          this.keepInView();
        }
      });
    },

    inputClick() {
      this.clickInput = true;
      this.openList = !this.hasValue();
    },

    /**
     * 是否有选中的值
     */
    hasValue() {
      return this.currentValue.length > 0;
    },

    /**
     * 判断是否在hint里显示文字全部内容
     */
    isShowFullView() {
      return (
        this.mouseOverInput &&
        fontAdapter.isOverflow('.edit input', this.currentValue)
      );
    },

    /**
     * 当鼠标划过的时候，记录下位置，用于判断是否文字太长显示不下，用hint显示完整内容
     */
    setMouseOver() {
      this.mouseOverInput = true;
    },

    /**
     * 当鼠标划过的时候，记录下位置，用于判断是否文字太长现象不下，用hint显示完整内容
     */
    setMouseOut() {
      this.mouseOverInput = false;
    },

    /**
     * 值发生变化时，触发对外的通知事件
     */
    dispatchEvent() {
      this.$emit('input', this.currentValue);
      this.$emit('clear', this.currentValue);
    },
    /**
     * 输入框的keydown.down事件
     */
    inputKeyDown() {
      if (!this.openList) {
        this.openList = true;
        return;
      }
      let currentDispIndex = this.getDispIndex(this.currentNodeIndex);
      if (currentDispIndex < this.dispIndexList.length - 1) {
        this.currentNodeIndex = this.dispIndexList[currentDispIndex + 1];
        let isOverflow = false;
        let pageNo = this.getPageNo(this.currentNodeIndex);
        if (pageNo === this.pageMap[this.pageMap.length - 1]) {
          isOverflow = this.pageMap.length >= this.pageLimit;
          this.pageDown();
        }
        if (isOverflow) {
          this.keepInBottom();
        } else {
          this.keepInView();
        }
      }
    },

    /**
     * 确保当前条目可见
     */
    keepInBottom() {
      this.$nextTick(() => {
        let $ul = $('ul.list');
        let divHeight = $ul.height();
        let contentHeight =
          this.getIndexInPageList(this.currentNodeIndex) * this.nodeHeight;
        $ul
          .finish()
          .animate(
            { scrollTop: contentHeight - divHeight + this.nodeHeight },
            200
          );
      });
    },
    /**
     * 计算是第几个显示要素
     */
    getDispIndex(nodeActiveIndex) {
      return this.dispIndexList.indexOf(nodeActiveIndex);
    },

    /**
     * 输入框的keydown.up事件
     */
    inputKeyUp() {
      if (this.currentNodeIndex <= 0) {
        return;
      }
      let currentDispIndex = this.getDispIndex(this.currentNodeIndex);
      if (currentDispIndex > 0) {
        this.currentNodeIndex = this.dispIndexList[currentDispIndex - 1];
        let pageNo = this.getPageNo(this.currentNodeIndex);
        if (pageNo === this.pageMap[0]) {
          this.pageUp();
        }
        this.keepInView();
      }
    },

    /**
     * 获取节点在pageList中的索引
     */
    getIndexInPageList(nodeActiveIndex) {
      return _.findIndex(this.pageList, item => {
        return item.index === nodeActiveIndex;
      });
    },
    /**
     * 计算当前节点在显示列表的第几页
     */
    getPageNo(nodeActiveIndex) {
      let dispIndex = this.getDispIndex(nodeActiveIndex);
      return Math.ceil((dispIndex + 1) / this.pageSize);
    },
    /**
     * 显示列表发生变化后，需要重置分页列表
     */
    resetPageList() {
      this.pageIndex = 0;
      this.pageList = [];
      this.pageMap = [];
      if (this.currentNodeIndex < 0 && !this.isNullable) {
        return;
      }
      let pageNo =
        this.currentNodeIndex === -1
          ? 1
          : this.getPageNo(this.currentNodeIndex);
      this.pageIndex = pageNo;
      if (pageNo > 1) {
        this.pageList = this.pageList.concat(this.getPageData(pageNo - 1));
        this.pageMap.push(pageNo - 1);
      }
      let pageData = this.getPageData(pageNo === 0 ? 1 : pageNo);
      this.pageList = this.pageList.concat(pageData);
      this.pageMap.push(pageNo);
      if (this.pageCount > this.pageNo) {
        this.pageList = this.pageList.concat(this.pageNo + 1);
        this.pageMap.push(pageNo + 1);
        this.pageIndex = pageNo + 1;
      }
    },

    /**
     * 筛选数据之后，确保当前要素在可视区
     */
    resetView() {
      this.$nextTick(() => {
        let $ul = $('ul.list');
        let divHeight = $ul.height();
        let scrollHeight = $ul.scrollTop();
        let contentHeight =
          this.getIndexInPageList(this.currentNodeIndex) * this.nodeHeight;
        $ul.finish().animate({ scrollTop: contentHeight }, 200);
      });
    },

    /**
     * 确保当前条目可见
     * @param top 是否放在第一行
     */
    keepInView(top) {
      if (!this.openList) {
        return;
      }
      this.$nextTick(() => {
        let $ul = $('ul.list');
        let divHeight = $ul.height();
        let scrollHeight = $ul.scrollTop();
        let contentHeight =
          this.getIndexInPageList(this.currentNodeIndex) * this.nodeHeight;
        if (top || contentHeight < scrollHeight + this.nodeHeight) {
          //这种情况是元素被隐藏在滚动框的上方
          $ul.finish().animate({ scrollTop: contentHeight }, 200);
        } else if (contentHeight > divHeight + scrollHeight - this.nodeHeight) {
          //元素被隐藏在滚动框下方
          $ul
            .finish()
            .animate(
              { scrollTop: contentHeight - divHeight + this.nodeHeight },
              200
            );
        }
      });
    },
    /**
     * 输入框的keydown.enter事件
     */
    inputKeyEnter(ev) {
      if (
        !this.initialized ||
        (this.currentNodeIndex === -1 &&
          (this.levelAndChildrenInfo.length === 0 || this.isNullable))
      ) {
        this.$emit('enter');
      }
      if (this.currentNodeIndex === -1) {
        return;
      }
      this.nodeClick(this.currentNodeIndex, ev);
    },

    /**
     * 输入框的keydown.right事件、展开节点
     */
    expandNode(ev, idx) {
      if (!this.openList || util.isEmpty(idx) || idx === -1) {
        return;
      }
      if (this.levelAndChildrenInfo[idx].hasChildren) {
        ev.preventDefault();
      }
      this.$set(this.openStatus, idx, true);
      this.reloadPageTail();
      let pageNo = this.getPageNo(this.currentNodeIndex);
      if (this.pageMap[this.pageMap.length - 1] === pageNo) {
        this.pageDown();
      }
      this.scrollAfterExpand();
    },

    /**
     * 把当前页补齐
     */
    reloadPageTail() {
      let pageNo = this.getPageNo(this.currentNodeIndex);
      let indexInPageList = this.getIndexInPageList(this.currentNodeIndex);
      let indexInDispList = this.getDispIndex(this.currentNodeIndex);
      let deleted = this.pageList.splice(indexInPageList + 1);
      let fullSize = this.pageSize - ((indexInPageList + 1) % this.pageSize);
      let newTailList = this.dispList.slice(
        indexInDispList + 1,
        fullSize + indexInDispList + 1
      );
      this.pageList = this.pageList.concat(newTailList);
      let currentPageIndex = _.indexOf(this.pageMap, pageNo);
      let finished = false;
      for (
        let i = currentPageIndex + 1;
        !finished && i < this.pageMap.length;
        i++
      ) {
        if (this.pageMap[i] > this.pageCount) {
          this.pageIndex = this.pageMap[i - 1];
          this.pageMap.splice(i);
          finished = true;
        } else {
          this.pageList = this.pageList.concat(
            this.getPageData(this.pageMap[i])
          );
        }
      }
    },
    /**
     * 展开节点后滚动节点到合适位置
     */
    scrollAfterExpand() {
      let currentDispIndex = this.getIndexInPageList(this.currentNodeIndex);
      let childrenNum = this.getDispChildrenLength();
      let $ul = $('ul.list');
      let divHeight = $ul.height();
      let scrollHeight = $ul.scrollTop(); //scrollHeight ===0 可能是没有取到值
      let contentTop = currentDispIndex * this.nodeHeight;
      let contentBottom = contentTop + (childrenNum + 1) * this.nodeHeight;
      if (scrollHeight > 0 && contentBottom > divHeight + scrollHeight) {
        //最后一个子元素被隐藏在滚动框下方
        let maxScroll =
          contentTop > contentBottom - divHeight
            ? contentBottom - divHeight
            : contentTop;
        $ul.finish().animate({ scrollTop: maxScroll });
      }
    },

    /**
     * 给定条目数，计算需要的高度
     */
    getHeight(num) {
      return num * this.nodeHeight;
    },

    /**
     * 计算当前节点有多少个子节点需要展开显示
     */
    getDispChildrenLength() {
      if (this.currentNodeIndex === -1) {
        return 0;
      }
      let currentDispIndex = this.getDispIndex(this.currentNodeIndex);
      let node = this.levelAndChildrenInfo[this.currentNodeIndex];
      if (!node.hasChildren || !this.openStatus[this.currentNodeIndex]) {
        return 0;
      }
      let finished = false;
      return this.levelAndChildrenInfo.reduce((r, item, index) => {
        if (index <= this.currentNodeIndex || finished) {
          return r;
        }
        if (item.level === node.level + 1) {
          return r + 1;
        } else {
          finished = true;
          return r;
        }
      }, 0);
    },

    calcPageCount(itemCount) {
      return Math.ceil(itemCount / this.pageSize);
    },
    /**
     * 输入框的keydown.left事件、关闭节点
     */
    closeNode(ev, idx) {
      if (!this.openList || util.isEmpty(idx) || idx === -1) {
        return;
      }
      if (this.levelAndChildrenInfo[idx].hasChildren && this.openList) {
        ev.preventDefault();
      }
      this.$set(this.openStatus, idx, false);
      //把所有子节点都要折叠
      let childrenRange = this.getChildrenRange(this.activeList, idx);
      if (childrenRange) {
        for (let i = childrenRange.from; i <= childrenRange.to; i++) {
          this.openStatus[i] = false;
        }
      }
      this.reloadPageTail();
    },

    /**
     * 点击节点事件
     */
    nodeClick(idx, ev) {
      //如果是末级节点，直接返回要素
      if (!this.levelAndChildrenInfo[idx].hasChildren) {
        //此处可能会出错,idx不是一个有效值，致使levelAndChildrenInfo
        this.openList = false;
        if (ev) {
          ev.stopPropagation();
        }
        this.$emit('select', this.activeList[idx]);
        return;
      }
      this.currentNodeIndex = idx;
      this.clickOutside = false;
      if (this.openStatus[idx]) {
        this.closeNode(ev, idx);
      } else {
        this.expandNode(ev, idx);
      }
    },

    /**
     * 点击增加按钮事件
     */
    add() {
      this.$emit('add');
    },
    /**
     * 点击选用按钮事件
     */
    addBySelect() {
      this.$emit('addBySelect');
    },
    /**
     * 点击设置图标事件
     */
    setting() {
      this.$emit('setting');
    },
    /**
     * 点击导航的事件
     */
    navTo(navCode) {
      this.refreshList(this.dataList, navCode, true, true);
    },

    /**
     * 只保留当前节点及其子节点
     */
    getSelfOrChildList(list, value) {
      let code = this.getCode(value);
      if (util.isEmpty(code)) {
        return list;
      }
      let pIndex = _.findIndex(list, item => {
        return match.isMatch(item, code);
      });
      if (pIndex < 0) {
        return [];
      }
      let id = this.props.id;
      let pid = this.props.pid;
      let result = [];
      let parents = [];
      result.push(list[pIndex]);
      parents.push(list[pIndex]);
      pIndex++;
      while (parents.length > 0 && pIndex < list.length - 1) {
        parent = parents[parents.length - 1];
        if (list[pIndex][pid] === parent[id]) {
          result.push(list[pIndex]);
          parents.push(list[pIndex]);
          pIndex++;
        } else {
          parents.pop();
        }
      }
      return result;
    },

    /**
     * 刷新选择列表
     */
    refreshList(list, val, viewAtTop, onlyMatchCode) {
      this.filterList(list, val, onlyMatchCode);
      this.resetPageList();
      // this.resetView();
      this.keepInView(viewAtTop);
    },
    /**
     * 根据值，计算筛选列表,设置openStatus和currentNodeIndex
     * 如果输入的是代码，则保留全部列表；如果输入的是文字，则筛选包含文字的节点及其父子节点
     */
    filterList(list, val, onlyMatchCode) {
      if (!val || val === '') {
        //设置openStatus所有节点都不展开
        this.openStatus = _.fill(Array(list.length), false);
        this.activeList = list;
        this.initOpenStatus();
        this.initCurrentNodeIndex();
        return;
      }
      //记录所有匹配的项
      let ra = _.fill(Array(list.length), false);
      //记录所有匹配项的直接子节点
      let raChildren = _.fill(Array(list.length), false);
      //记录所有匹配项的父节点
      let raParents = _.fill(Array(list.length), false);
      //简写
      let id = this.props.id;
      let pid = this.props.pid;

      //标记每一个匹配项，记录在ra数组里,先按代码匹配，没有匹配上再按代码名称匹配
      let matched = false;
      _.forEach(list, (item, index) => {
        let matchItem = {};
        matchItem[this.props.id] = item[this.props.id];
        matchItem['name'] = this.fullNameMap[item[this.props.id]];
        ra[index] = match.isMatch(
          matchItem,
          val,
          { id: 'code', name: 'name' },
          true
        );
        if (ra[index]) {
          matched = true;
        }
      });
      if (!onlyMatchCode && !matched) {
        _.forEach(list, (item, index) => {
          let matchItem = {};
          matchItem[this.props.id] = item[this.props.id];
          matchItem['name'] = this.fullNameMap[item[this.props.id]];
          ra[index] = match.isMatch(
            matchItem,
            val,
            { id: 'code', name: 'name' },
            false
          );
        });
      }

      //标记每个匹配上的节点的子节点
      ra.forEach((v, index) => {
        if (!v) {
          return;
        }
        let childrenRange = this.getChildrenRange(list, index);
        if (childrenRange) {
          for (let i = childrenRange.from; i <= childrenRange.to; i++) {
            raChildren[i] = true;
          }
        }
      });

      /* 标记每个匹配上的节点的上级节点 */

      //工具：给一串节点，返回这些节点的父节点
      function getParentNodes(plist, nodes, id, pid) {
        let parentCodes = nodes
          .map(item => {
            return item[pid];
          })
          .filter(code => {
            return !util.isEmpty(code);
          });
        return plist.reduce((result, item) => {
          let code = item[id];
          if (parentCodes.includes(code) && !result.includes(item)) {
            result.push(item);
          }
          return result;
        }, []);
      }
      //工具：给一串节点，返回这些节点的代码列表
      function getCodes(nodes, id) {
        return nodes.map(item => {
          return item[id];
        });
      }
      //计算匹配的节点列表
      let currentNodes = list.reduce((r, item, index) => {
        if (ra[index]) {
          r.push(item);
        }
        return r;
      }, []);
      //parentCodes 存放所有计算出来的父节点代码
      let allParentCodes = [];
      //循环查找父节点代码，并存放到parentCodes
      let currentParentNodes = getParentNodes(list, currentNodes, id, pid);
      while (currentParentNodes.length > 0) {
        allParentCodes = allParentCodes.concat(
          getCodes(currentParentNodes, id)
        );
        currentParentNodes = getParentNodes(list, currentParentNodes, id, pid);
      }
      list.forEach((item, index) => {
        raParents[index] = allParentCodes.includes(item[id]);
      });

      //计算第一个匹配节点的索引号
      let firstMatchIndex = ra.indexOf(true);

      if (this.isCodeOnly(val, list)) {
        this.activeList = list;
        this.currentNodeIndex = firstMatchIndex;
        this.openStatus = _.fill(Array(list.length), false);
        for (let i = 0; i < this.currentNodeIndex; i++) {
          this.openStatus[i] = raParents[i];
        }
        this.openStatus[this.currentNodeIndex] = true;
      } else {
        this.activeList = list.filter((item, index) => {
          return ra[index] || raChildren[index] || raParents[index];
        });
        this.currentNodeIndex = raParents.reduce((sum, p, index) => {
          if (p && index < firstMatchIndex) {
            sum = sum + 1;
          }
          return sum;
        }, 0);
        //设置openStatus:第一个匹配节点的父节点都要展开
        this.openStatus = list.reduce((r, item, index) => {
          if (!ra[index] && !raChildren[index] && !raParents[index]) {
            return r;
          }
          if (index < firstMatchIndex && raParents[index]) {
            r.push(true);
          } else if (index === firstMatchIndex) {
            r.push(true);
          } else {
            r.push(false);
          }
          return r;
        }, []);
      }
    },
    /**
     * 当没有任何筛选条件时，确定展开哪些节点
     */
    initOpenStatus() {
      let maxLines = this.getMaxDispLines();
      let lastDispNodes = this.getDispList();
      let nextOpenIndex = this.getNextCouldOpenNode(-1);
      while (nextOpenIndex >= 0 && lastDispNodes.length < maxLines) {
        this.openStatus[nextOpenIndex] = true;
        let newDispNodes = this.getDispList();
        if (util.includeAll(lastDispNodes, lastDispNodes)) {
          if (newDispNodes.length < maxLines) {
            nextOpenIndex = this.getNextCouldOpenNode(nextOpenIndex);
            lastDispNodes = this.getDispList();
          } else {
            nextOpenIndex = -1;
          }
        } else {
          this.openStatus[nextOpenIndex] = false;
          nextOpenIndex = -1;
        }
      }
    },

    /**
     * 计算下拉列表最多可以显示多少节点
     */
    getMaxDispLines() {
      return parseInt(this.maxHeight / this.nodeHeight);
    },
    /**
     * 计算下一个可以展开的节点
     */
    getNextCouldOpenNode(currentOpenIndex) {
      if (this.levelAndChildrenInfo.length === 0) {
        return -1;
      }
      let level = this.levelAndChildrenInfo[
        currentOpenIndex === -1 ? 0 : currentOpenIndex
      ].level;
      let nextOpenIndex = _.findIndex(
        this.levelAndChildrenInfo,
        (item, index) => {
          return (
            index > currentOpenIndex && item.level === level && item.hasChildren
          );
        }
      );
      if (nextOpenIndex === -1) {
        nextOpenIndex = _.findIndex(
          this.levelAndChildrenInfo,
          (item, index) => {
            return item.level === level + 1 && item.hasChildren;
          }
        );
      }
      return nextOpenIndex;
    },
    /**
     * 计算所有显示节点中，可以显示在下拉框中的节点
     */
    getNodesInBox(dispIndexList, maxLines) {
      return _.take(dispIndexList, maxLines);
    },

    initCurrentNodeIndex() {
      if (this.levelAndChildrenInfo.length === 0 || this.isNullable) {
        return;
      }
      let result = 0;
      let currentNodeLevel = this.levelAndChildrenInfo[0].level;
      for (
        let i = 1, stop = false;
        i < this.dispIndexList.length && !stop;
        i++
      ) {
        if (
          this.levelAndChildrenInfo[this.dispIndexList[i]].level >
          currentNodeLevel
        ) {
          currentNodeLevel = this.levelAndChildrenInfo[this.dispIndexList[i]]
            .level;
          result = this.dispIndexList[i];
        } else {
          stop = true;
        }
      }
      this.currentNodeIndex = result;
    },
    /**
     * 判断是代码还是其它（代码和名称或名称）
     */
    isCodeOnly(val, list) {
      if (!_.isNaN(Number(this.getCode(val)))) {
        return true;
      }
      return _.some(list, item => {
        return item[this.props.id].startsWith(this.getCode(val));
      });
    },
    /**
     * 是否代码空格名称这种格式的值，这种格式的值只看代码
     */
    getCode(val) {
      let idx = val.indexOf(' ');
      if (idx > 0) {
        return val.substr(0, idx);
      }
      return val;
    },
    /**
     * 给定一个列表和指定节点索引，返回所有子节点范围{from:3,to:8},如果没有下级节点，则返回undefined
     */
    getChildrenRange(list, idx) {
      let parentItems = [list[idx]];
      let toIndex = -1;
      _.forEach(list, (item, index) => {
        if (index <= idx || toIndex > 0) {
          return;
        }
        let parent = parentItems[parentItems.length - 1];
        while (parent && parent[this.props.id] !== item[this.props.pid]) {
          parentItems.pop();
          if (parentItems.length > 0) {
            parent = parentItems[parentItems.length - 1];
          } else {
            parent = undefined;
          }
        }
        if (parent) {
          parentItems.push(item);
        } else {
          toIndex = index - 1;
        }
      });
      if (toIndex > 0) {
        return { from: idx + 1, to: toIndex };
      } else {
        return undefined;
      }
    },

    getDispList2() {
      let result = [];
      let topNodeIndexes = this.levelAndChildrenInfo.reduce(
        (r, item, index) => {
          if (item.level === 0) {
            r.push(index);
          }
          return r;
        },
        []
      );
      topNodeIndexes.forEach(idx => {
        result = result.concat(this.getOpenIndexes(this.activeList, idx));
      });
      return result;
    },
    /**
     * 计算要显示当节点列表
     */
    getIsDispList() {
      let result = [];
      let dispParents = []; //存放需要显示的父节点堆栈
      let parents = []; //存放父节点代码的堆栈
      let parent = undefined;
      let levelAndChildrenInfo = this.levelAndChildrenInfo;
      this.activeList.forEach((node, index) => {
        while (parent && parent.code !== node[this.props.pid]) {
          parents.pop();
          parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        }
        if (parent) {
          //找到了父节点
          let dispParentIndex = dispParents.findIndex(item => {
            return item[this.props.id] === parent[this.props.id];
          });
          if (dispParentIndex >= 0) {
            dispParents.splice(dispParentIndex + 1);

            result.push(true);
            if (
              levelAndChildrenInfo[index].hasChildren &&
              this.openStatus[index]
            ) {
              dispParents.push(node);
            }
          } else {
            result.push(false);
          }
        } else {
          result.push(true);
          if (
            levelAndChildrenInfo[index].hasChildren &&
            this.openStatus[index]
          ) {
            dispParents.push(node);
          }
        }

        if (levelAndChildrenInfo[index].hasChildren) {
          parents.push(node);
          parent = node;
        }
      });
      return result;
    },
    /**
     * 计算要显示当节点列表
     */
    getDispList() {
      let result = [];
      let dispParents = []; //存放需要显示的父节点堆栈
      let parents = []; //存放父节点代码的堆栈
      let parent = undefined;
      let levelAndChildrenInfo = this.levelAndChildrenInfo;
      this.activeList.forEach((node, index) => {
        while (parent && parent.code !== node[this.props.pid]) {
          parents.pop();
          parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        }
        if (parent) {
          //找到了父节点
          let dispParentIndex = dispParents.findIndex(item => {
            return item[this.props.id] === parent[this.props.id];
          });
          if (dispParentIndex >= 0) {
            dispParents.splice(dispParentIndex + 1);

            result.push(index);
            if (
              levelAndChildrenInfo[index].hasChildren &&
              this.openStatus[index]
            ) {
              dispParents.push(node);
            }
          }
        } else {
          result.push(index);
          if (
            levelAndChildrenInfo[index].hasChildren &&
            this.openStatus[index]
          ) {
            dispParents.push(node);
          }
        }

        if (levelAndChildrenInfo[index].hasChildren) {
          parents.push(node);
          parent = node;
        }
      });
      return result;
    },
    /**
     * 给定一个列表和指定节点索引，返回自身及所有展开的下级节点索引
     */
    getOpenIndexes(list, index) {
      let result = [];
      result.push(index);
      if (
        this.openStatus[index] &&
        this.levelAndChildrenInfo[index].hasChildren
      ) {
        let sonIndexes = this.getSonIndexes(list, index);
        sonIndexes.forEach(idx => {
          result = result.concat(this.getOpenIndexes(list, idx));
        });
      }
      return result;
    },
    /**
     * 给定一个列表和指定节点索引，返回直接下级节点的索引集合[2,5,8],如果没有，则返回[]
     */
    getSonIndexes(list, idx) {
      let result = [];
      for (let i = idx + 1; i < list.length; i++) {
        if (list[i][this.props.pid] === list[idx][this.props.id]) {
          result.push(i);
        }
      }
      return result;
    },
    /**
     * 计算列表中每个节点的级次及是否有子节点，返回数组:[{level:0,hasChildren:true},{level:1,hasChildren:false},...]
     */
    getLevelAndChildrenInfo(list) {
      let result = [];
      let parents = []; //存放父节点代码的堆栈
      let parent = undefined;
      list.forEach((node, index) => {
        if (parent) {
          if (node[this.props.pid] === parent.code) {
            parent.hasChildren = true;
          } else {
            parent.hasChildren = false;
            //向上寻找当前节点的父节点
            while (parent && parent.code !== node[this.props.pid]) {
              parents.pop();
              parent =
                parents.length > 0 ? parents[parents.length - 1] : undefined;
            }
          }
        }
        let currentItem = { level: parents.length, code: node[this.props.id] };
        parents.push(currentItem);
        result.push(currentItem);
        parent = currentItem;
      });
      if (parent) {
        parent.hasChildren = false;
      }
      return result;
    },

    /**
     * 是否顶级节点
     */
    isTopNode(item) {
      return util.isEmpty(item[this.props.pid]);
    },

    /**
     * 鼠标划过某个节点时的mouseOver事件
     */
    setMouseOverIndex(index) {
      this.mouseOverIndex = index;
    },

    /**
     * 鼠标移出某个节点时的mouseOut事件
     */
    setMouseOutIndex() {
      this.mouseOverIndex = -1;
    },
    /**
     * 指定节点是否是鼠标划过的节点
     */
    isMouseOverIndex(index) {
      return this.fns && index === this.mouseOverIndex;
    },

    /**
     * 是否当前节点
     */
    isCurrentIndex(index) {
      return index === this.currentNodeIndex;
    },

    nodeStyle(index) {
      let level = this.levelAndChildrenInfo[index].level;
      return {
        paddingLeft: level * 20 + 'px',
        height: this.nodeHeight + 'px',
        lineHeight: this.nodeHeight + 'px'
      };
    },

    /**
     * 指定节点索引（相对于activeList）,计算显示索引号
     */
    dispIndex(index) {
      return this.dispIndexList.indexOf(index);
    },
    /**
     * 显示要素说明
     */
    showComment(index) {
      if (!this.fns) {
        return;
      }
      clearInterval(this.showAtomSetIntervel);
      this.isShowAtomComment = true;
      if (index < 0) {
        this.atomCommentLoaded = true;
        this.atomComment = '';
      }
      let code = this.activeList[index][this.props.id];
      let id = this.activeList[index][this.props.uuid];
      this.fetchComment(this.type, code, id);
    },
    /**
     * 隐藏科目说明
     * */
    hideComment() {
      if (!this.fns) {
        return;
      }
      this.showAtomSetIntervel = setInterval(() => {
        this.isShowAtomComment = false;
        this.atomCommentLoaded = false;
      }, 100);
    },
    /**
     * 移入右侧使其保留
     * */
    atomCommentMouseover() {
      if (!this.fns) {
        return;
      }
      clearInterval(this.showAtomSetIntervel);
    },
    /**
     * 移出右侧使其消失
     * */
    atomCommentMouseout() {
      if (!this.fns) {
        return;
      }
      this.showAtomSetIntervel = setInterval(() => {
        this.isShowAtomComment = false;
        this.atomCommentLoaded = false;
      }, 100);
    },
    /**
     * 从服务器取回指定要素的说明
     */
    fetchComment(type, code, uuid) {
      if (!code) {
        this.atomCommentLoaded = true;
        this.atomComment = '';
      }
      this.atomCommentLoaded = false;
      this.fns
        .getComment(type, code, uuid)
        .then(({ data }) => {
          this.atomCommentLoaded = true;
          this.atomComment = data;
        })
        .catch(({ msg }) => {
          this.atomCommentLoaded = true;
          this.atomComment = msg;
          this.$message.error({
            message: msg
          });
        });
    },

    /**
     * 获取指定页的数据
     */
    getPageData(pageIndex) {
      return this.dispList.slice(
        this.pageSize * (pageIndex - 1),
        this.pageSize * pageIndex
      );
    },
    /**
     * 是否还能往下翻页
     */
    canPageDown() {
      return this.pageIndex < this.pageCount;
    },
    /**
     * 往下翻一页,把后一页数据放入页面缓冲区,返回放入缓冲区的记录数
     */
    pageDown() {
      if (!this.canPageDown()) {
        return;
      }
      if (this.pageMap.length >= this.pageLimit) {
        this.pageMap.shift();
        this.pageList.splice(0, this.pageSize);
      }
      this.pageIndex++;
      this.pageMap.push(this.pageIndex);
      this.pageList = this.pageList.concat(this.getPageData(this.pageIndex));
    },
    /**
     * 是否需要往上翻页，把上一页数据放入页面缓冲区
     */
    canPageUp() {
      return this.pageMap[0] > 1;
    },
    /**
     * 获取最后一页数据的记录数
     */
    getLastPageSize() {
      let lastPageSize = this.pageSize;
      //如果当前为最后一页，则取余数，如果不整除，取余，否则取页码
      if (this.pageIndex === this.pageCount) {
        let ys = this.dispList.length % this.pageSize;
        if (ys !== 0) {
          lastPageSize = ys;
        }
      }
      return lastPageSize;
    },
    /**
     * 往上翻一页
     */
    pageUp() {
      if (!this.canPageUp()) {
        return;
      }
      this.pageMap.pop();
      this.pageMap.unshift(this.pageMap[0] - 1);
      this.pageIndex--; //减少页码
      this.pageList.splice(-this.getLastPageSize()); //删除最后一页数据
      this.pageList = this.getPageData(this.pageMap[0]).concat(this.pageList); //加载前一页数据
    },
    /**
     * 处理列表滚动
     * @param: param为滚动方向，true代表向下滚动 false代表向上滚动
     * @param: el 滚动DOM
     * @param: middlePosition 滚动列表的中间位置
     */
    listScroll(param, el, middlePosition) {
      if (param) {
        if (this.canPageDown()) {
          this.pageDown();
          el.scrollTop = middlePosition; //回滚到中间位置
        }
      } else {
        if (this.canPageUp()) {
          this.pageUp();
          el.scrollTop = middlePosition;
        }
      }
    }
  },

  computed: {
    /**
     * 计算下拉框的高度
     */
    listHeight() {
      if (!this.initialized) {
        return 0;
      }
      let navDivHeight = this.dynamicNavList.length * 50 + 20;
      let listDivHeight = this.dispIndexList.length * this.nodeHeight;
      let divHeight =
        navDivHeight > listDivHeight ? navDivHeight : listDivHeight;
      return divHeight > this.maxHeight ? this.maxHeight : divHeight;
    },

    /**
     * 计算下拉框的左边栏宽度
     */
    mgnLeft() {
      if (!this.initialized) {
        return 0;
      }
      return this.dynamicNavList && this.dynamicNavList.length > 0 ? 80 : 0;
    },

    /**
     * 返回需要显示的节点列表，格式为[{level:0(级次，从0开始),hasChildren:true(是否有子节点)}],
     */
    levelAndChildrenInfo() {
      if (!this.initialized) {
        return [];
      }
      return this.getLevelAndChildrenInfo(this.activeList);
    },

    /**
     * 当前显示的节点索引列表[2,5,8...]
     * 影响显示列表的因素有输入框里的值，点击后节点是否展开
     */
    dispIndexList() {
      if (!this.initialized) {
        return [];
      }
      return this.getDispList();
    },
    /**
     * 与activeList一一对应的记录节点是否显示的列表
     */
    isDispList() {
      if (!this.initialized) {
        return [];
      }
      return this.getIsDispList();
    },

    /**
     * 计算当前显示节点的页数
     */
    pageCount() {
      return this.calcPageCount(this.dispList.length);
    },
    /**
     * 显示节点及其在activeList里的索引号列表
     */
    dispList() {
      if (!this.initialized) {
        return [];
      }
      let dlist = this.isDispList;
      return this.activeList.reduce((r, item, idx) => {
        if (dlist[idx]) {
          r.push({ data: item, index: idx });
        }
        return r;
      }, []);
    },
    /**
     * 根据输入框里的值，计算出来的导航列表
     */
    dynamicNavList() {
      if (!this.initialized) {
        return [];
      }
      if (!this.navList || this.navList.length === 0) {
        return [];
      }
      let validateNavCtgs = this.activeList.reduce((r, item) => {
        let ctg = item[this.props.id].substr(0, 1);
        if (!r.includes(ctg)) {
          r.push(ctg);
        }
        return r;
      }, []);
      return this.navList.filter(item => {
        return validateNavCtgs.includes(item.code);
      });
    },
    /**
     * 对列表数据初始化，将父节点名称拼装到子节点名称前
     */
    dataList() {
      if (!this.initialized) {
        return [];
      }
      let result = this.listData;
      if (this.selfOrChild) {
        result = this.getSelfOrChildList(dataList, this.originValue);
      }
      return result;
    },

    /**
     * 列表每个节点的全称
     */
    fullNameMap() {
      if (!this.initialized) {
        return [];
      }
      let result = {};
      let parents = []; //存放父节点的堆栈
      let parent = undefined;
      this.dataList.forEach((node, index) => {
        parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        while (parent && parent[this.props.id] !== node[this.props.pid]) {
          parents.pop();
          parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        }
        result[node[this.props.id]] = parent
          ? result[parent[this.props.id]] + node.name
          : node.name;
        parents.push(node);
      });
      return result;
    }
  },

  mounted() {
    this.currentValue = this.value;
    this.originValue = this.value;
  }
};
