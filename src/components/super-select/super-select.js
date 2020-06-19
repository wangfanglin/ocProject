import util from '@/assets/js/util';
import { Tree } from '@/assets/js/model';

export default {
  props: {
    listData: {
      type: Array,
      default() {
        return [];
      }
    },
    levels: {
      type: Object,
      default() {
        return {};
      }
    },
    allNode: true,
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    clearable: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    needConfirm: {
      type: Boolean,
      default: false
    },
    inputWidth: {
      type: Number,
      default: 250
      //可以通过这个参数来控制当前组件的宽度min-width
    },
    treeWidth: {
      type: Number,
      default: 100
      //可以通过这个参数来控制当前组件拉下树的宽度min-width
    },
    treeTop: {
      type: String,
      default: '100%'
      //控制下拉树的位置top:auto,top:100%,一般这两个参数
    },
    treeBottom: {
      type: String,
      default: 'auto'
      //控制下拉树的位置bottom:auto,bottom:100%,一般这两个参数
    },
    setCheckedHasChild: {
      type: Boolean,
      default: true
      //初始化的时候赋值父级选中，是否子级也选中，默认选中，false不选中
    },
    valueConsistsOf: {
      type: String,
      default: 'LEAF_PRIORITY'
      //"ALL" - 结果集中包含所有选中和半选中节点
      //"SELECTED" -结果集中包含所有选中的节点
      //"BRANCH_PRIORITY" - 如果中间分支节点被选中，则结果集中不会包含其子节点
      //"LEAF_PRIORITY" - 如果中间分支节点和叶子节点都被选中，则所有中间分支节点不会包含在结果集中，结果集只包含叶子节点
      //"LEAF_ONLY" - 结果集中只包含叶子节点
      //"ANY" - 单选模式下，返回任意选中节点
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    showCode: {
      type: String,
      default: 'codeName'
      //codeName:显示code + name
      //idName:显示id + name
      //code:显示code
      //name:显示name
    },
    inputShow: {
      type: String,
      default: 'name'
      //name:显示名称
      //code:显示编码
      //codeName:显示code + name
    },
    treeHeight: {
      type: Number,
      default: 300
      //树的高度
    },
    inputFocusMethod: {
      type: Boolean,
      default: false
      //输入框聚焦是否发送事件
    },
    props: {
      default() {
        return {
          id: 'code',
          label: 'name',
          pid: 'pcode',
          children: 'children',
          icon: 'icon',
          disabled: 'disabled'
        };
      }
    }
  },
  data() {
    return {
      isTree: true,
      level: 0,
      notStrictly: this.setCheckedHasChild,
      allSelect: '全选',
      currentValue: [],
      filterText: '',
      showContent: 'none', //三个值，'none'：不显示下拉面板；'selectedList':显示已选择值列表；'tree':下拉树
      topShow: false, //下拉框显示在上面还是下面,true：上面；false:下面
      multiSelect: () => {},
      blockDispatchEvent: false, //阻断循环触发
      blockCheckChangeEvent: false
    };
  },
  watch: {
    value: {
      handler(val, oldVal) {
        if (this.blockDispatchEvent) {
          this.blockDispatchEvent = false;
          return;
        }
        if (!_.isEqual(this.getKeys(val), this.getKeys(oldVal))) {
          const valueKeys = this.getKeys(this.value);
          const currentKeys = this.getKeys(this.currentValue);
          if (valueKeys.length === currentKeys.length) {
            const isExist = valueKeys.every(e => {
              return currentKeys.includes(e);
            });
            if (!isExist) {
              this.handleValue();
            }
          } else {
            this.handleValue();
          }
        }
      },
      deep: true
    },
    listData: {
      handler(n, o) {
        if (!_.isEqual(n, o)) {
          this.handleValue();
        }
      },
      deep: true
    },
    firstItem(val) {
      if (val) {
        if (this.inputShow === 'code') {
          //只显示编码的情况
          this.filterText = val['code'];
        } else if (this.inputShow === 'codeName') {
          //显示编码+名称
          this.filterText = val['code'] + val[this.props.label];
        } else if (this.inputShow === 'name') {
          //显示名称
          this.filterText = val[this.props.label];
        }
      } else {
        this.filterText = '';
      }
    },
    showContent(val) {
      if (val !== 'none') {
        let rect = this.$refs.mEdit.getBoundingClientRect();
        let windowHeight =
          window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom + 300 > windowHeight) {
          this.topShow = true;
        } else {
          this.topShow = false;
        }
      }
    },
    isTree(val) {
      this.$emit('isTreeChanged', val);
    },
    level(val) {
      this.$emit('levelChanged', val);
    }
  },
  methods: {
    getKeys(value) {
      return value.map(e => {
        return e[this.props.id];
      });
    },

    clearableAndMore() {
      return this.moreValues() && !this.readOnly;
    },

    clearableOrMore() {
      return (
        (this.currentValue.length === 1 && !this.readOnly) ||
        (this.moreValues() && this.readOnly)
      );
    },
    /**
     * 是否有多个值
     */
    moreValues() {
      return this.currentValue.length > 1 && !this.readOnly; //禁用时不显示
    },
    /**
     * 是否可以显示清除全部的图标
     */
    canClear() {
      return this.hasValue() && this.clearable && !this.readOnly; //禁用时不显示
    },
    /**
     * input框获得焦点
     */
    filterFocus() {
      this.showContent = 'tree';
      if (this.inputFocusMethod) {
        this.$emit('getData');
      }
    },
    /**
     * input 框失去焦点
     */
    filterBlur() {
      this.blockInputBlur = false;
      this.$emit('blur');
      /*_.delay(() => {
        if (!this.blockInputBlur){
          this.showContent = 'none';
        }
      },300);*/
    },
    /**
     * 是否有选中的值
     */
    hasValue() {
      return this.currentValue.length > 0;
    },
    /**
     * 是否显示选中值
     */
    canShowValue() {
      return this.moreValues() && this.showContent === 'selectedList';
    },
    /**
     * 是否显示树
     */
    canShowTree() {
      return this.showContent === 'tree';
    },

    /**
     * 清空选中值
     */
    clear() {
      if (!this.hasValue()) {
        return;
      }
      this.allSelect = '全选';
      this.filterText = '';
      this.currentValue = [];
      this.$refs.tree.setCheckedKeys([]);
      this.dispatchEvent();
    },
    /**
     * 删除已选择项
     */
    delSeletedItem(data) {
      this.$refs.tree.setChecked(data, false, this.notStrictly);
      this.currentValue = this.getCheckedData(this.valueConsistsOf);
      this.dispatchEvent(this.currentValue);
    },

    /**
     * 点击确定按钮
     */
    confirm() {
      this.$emit('confirm');
    },

    /**
     * 值发生变化时，触发对外的通知事件
     */
    dispatchEvent() {
      this.blockDispatchEvent = true;
      const result = _.cloneDeep(this.currentValue);
      this.$emit('input', result);
      this.$emit('change', result);
      this.$emit('selected', _.cloneDeep(this.getCheckedData('SELECTED')));
    },
    /**
     * 点击显示已选择内容事件
     */
    showValues() {
      this.blockInputBlur = true;
      this.showContent = 'selectedList';
    },

    filterTextInput() {
      this.$refs.tree.filter(this.filterText);
    },

    handleInputClickoutside() {
      this.showContent = 'none';
    },
    /**
     * 点击节点文本事件
     */
    handleNodeClick(data, node) {
      this.blockInputBlur = true;
      if (this.multiple) {
        this.$refs.tree.setChecked(node, !node.checked, this.notStrictly);
        return;
      }
      if (node.childNodes.length === 0 || this.valueConsistsOf === 'ANY') {
        this.$refs.tree.setCheckedKeys([]);
        this.$refs.tree.setChecked(node, !node.checked, false);
        this.showContent = 'none';
        this.currentValue = [data];
        this.dispatchEvent();
      }
    },
    optionClick() {
      this.blockInputBlur = true;
    },
    /**
     * 节点checked变化事件
     */
    handleCheckedChange() {
      if (!this.multiple || this.blockCheckChangeEvent) {
        return;
      }
      this.blockInputBlur = true;
      this.currentValue = this.getCheckedData(this.valueConsistsOf);
      this.dispatchEvent();
    },

    selectAll() {
      if (this.allSelect === '全选') {
        this.$refs.tree.root.childNodes.forEach(node => {
          this.$refs.tree.setChecked(node.key, true, true);
        });
        this.allSelect = '全不选';
      } else {
        this.$refs.tree.setCheckedKeys([]);
        this.allSelect = '全选';
      }
    },

    /**
     * 根据Tree上已选择节点，计算currentValue
     */
    getCheckedData(pValueConsistsOf) {
      let that = this;
      function getNodeChecked(node, valueConsistsOf) {
        function getChildrenChecked(pnode, vConsistsOf) {
          if (pnode.childNodes.length > 0) {
            let result = [];
            pnode.childNodes.forEach(e => {
              result = result.concat(getNodeChecked(e, vConsistsOf));
            });
            return result;
          }
          return [];
        }

        function isAllChildrenChecked(node) {
          return node.childNodes.every(child => {
            return child.checked;
          });
        }

        function collectNode(node) {
          let cn = _.cloneDeep(node.data);
          cn.isLeaf = node.childNodes.length === 0;
          cn[that.props.children] = undefined;
          return cn;
        }

        let result = [];
        if (node.checked) {
          if (valueConsistsOf === 'ALL' || valueConsistsOf === 'SELECTED') {
            result = [collectNode(node)].concat(
              getChildrenChecked(node, valueConsistsOf)
            );
          } else if (valueConsistsOf === 'BRANCH_PRIORITY') {
            result.push(collectNode(node));
          } else if (valueConsistsOf === 'LEAF_ONLY') {
            if (node.childNodes.length === 0) {
              result.push(collectNode(node));
            } else {
              result = getChildrenChecked(node, valueConsistsOf);
            }
          } else if (valueConsistsOf === 'LEAF_PRIORITY') {
            if (node.childNodes.length === 0) {
              result.push(collectNode(node));
            } else if (!isAllChildrenChecked(node)) {
              result.push(collectNode(node));
            } else {
              result = getChildrenChecked(node, valueConsistsOf);
            }
          }
        } else if (node.indeterminate && valueConsistsOf === 'ALL') {
          result = [collectNode(node)].concat(
            getChildrenChecked(node, valueConsistsOf)
          );
        } else {
          result = getChildrenChecked(node, valueConsistsOf);
        }
        return result;
      } //end getNodeChecked()

      if (this.multiple && this.$refs.tree) {
        return getNodeChecked(this.$refs.tree.root, pValueConsistsOf);
      }
      if (!this.$refs.tree) {
        return [];
      }
      let nodes = this.$refs.tree.getCheckedNodes(this.setCheckedHasChild);
      return nodes.length > 0 ? nodes : [];
    },
    /**
     * 将传入的value值转换成对象存到currentValue对象中，并设置tree的选中状态
     */
    handleValue() {
      if (this.$refs.tree) {
        this.blockCheckChangeEvent = true;
        if (this.setCheckedHasChild) {
          this.$refs.tree.setCheckedKeys(this.getKeys(this.value));
        } else {
          if (util.isEmpty(this.value)) {
            this.$refs.tree.setCheckedKeys([]);
          } else {
            this.$refs.tree.setCheckedKeys([]);
            this.getKeys(this.value).forEach(e => {
              this.$refs.tree.setChecked(e, true, false);
            });
          }
        }
        let valueConsistsOf = this.valueConsistsOf;
        _.delay(() => {
          this.blockCheckChangeEvent = false;
          this.currentValue = this.getCheckedData(valueConsistsOf);
        }, 200);
      }
    },
    filterNode(value, data) {
      if (util.isEmpty(value)) {
        return true;
      } else {
        return (
          data[this.props.id].includes(value) ||
          data[this.props.label].includes(value)
        );
      }
    },

    renderContent(h, { node, data }) {
      const className = node.checked ? 'dib color-primary' : 'dib';
      let value;
      if (this.showCode === 'codeName') {
        value = `${data['code']}  ${data[this.props.label]}`;
      } else if (this.showCode === 'idName') {
        value = `${data['id']}  ${data[this.props.label]}`;
      } else if (this.showCode === 'code') {
        `${data['code']}`;
      } else if (this.showCode === 'name') {
        value = `${data[this.props.label]}`;
      }
      return h('span', { attrs: { class: className } }, [
        h('span', null, value)
      ]);
    },

    createTree(listData, toLevel) {
      let temp = _.cloneDeep(listData).filter(e => {
        return this.levels[e[this.props.id]] + 1 <= toLevel;
      });
      return Tree.getTree(temp, this.props);
    },

    /**
     * 获得树形结构的所有叶子节点
     */
    getLeaf(tree) {
      return _.reduce(
        tree,
        function leaf(r, node) {
          if (!node.children || node.children.length === 0) {
            r.push(node);
            return r;
          }
          _.forEach(node.children, child => {
            leaf(r, child);
          });
          return r;
        },
        []
      );
    }
  },
  computed: {
    treeData() {
      if (this.maxLevel === 0) {
        return [];
      }
      let toLevel = this.level === 0 ? this.maxLevel : this.level;
      let tree = this.createTree(this.listData, toLevel);
      if (this.isTree) {
        //逐级展开至指定级次
        return tree;
      } else {
        //仅显示指定级次
        return this.getLeaf(tree);
      }
    },

    /**
     * 计算数据集列表最大级次
     */
    maxLevel() {
      let max = _.reduce(
        Object.values(this.levels),
        (r, e) => {
          if (e > r) {
            return e;
          } else {
            return r;
          }
        },
        -1
      );
      return max + 1;
    },

    canShowStrictly() {
      return this.isTree && this.valueConsistsOf !== 'LEAF_ONLY';
    },

    firstItem() {
      if (!this.currentValue || this.currentValue.length === 0) {
        return undefined;
      } else {
        return this.currentValue[0];
      }
    }
  },
  mounted() {
    this.multiSelect = _.debounce(this.handleCheckedChange, 70);
    this.handleValue();
  }
};
