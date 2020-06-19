<template>
  <div class="tree-input" v-clickoutside="handleClickoutside">
    <el-popover ref="popover" placement="bottom-start" trigger="manual" v-model="contentVisible">
      <!-- 组件内容区域 -->
      <div class="tree-input-content" :id="`${activeId}`">
        <i class="fa fa-times-circle content-close" @click="handleContentVisibleChange(false)"></i>
        <!-- 组件tree区域 -->
        <el-tree ref="tree" empty-text="暂无数据" :data="treeData" :node-key="props.id" :props="props" :show-checkbox="currentMultiple" :check-strictly="strictly" :default-expand-all="expand" :expand-on-click-node="expandOnClickNode" @node-click="handleNodeClick" @check="handleCheck" @check-change="handleCheckChange" :filter-node-method="filterNode" v-show="contentDisplay === CONTENT_DISPLAY.TREE">
          <span slot-scope="{ node, data }">
            <span :class="{'color-primary': isChecked(data[props.id]), 'color-text-secondary': data[props.disabled] === SWITCH.ACTIVE || (leaf && isNotEmpty(data[props.children]))}">{{displayValue(data)}}</span>
          </span>
        </el-tree>
        <!-- 组件已选择值区域 -->
        <div class="content-checked" v-if="contentDisplay === CONTENT_DISPLAY.CHECKED_VALUE && isNotEmpty(currentData)">
          <div class="content-checked-option" v-for="e in currentData" :key="e[props.id]">
            <span>{{displayValue(e)}}</span>
            <div @click="handleRemove(e[props.id])">
              <i class="fa fa-times-circle-o color-danger poi"></i>
            </div>
          </div>
        </div>
        <!-- 组件内容操作区 -->
        <div class="content-toolbal fix" v-if="showToolbal === true">
          <!-- 级次操作--只有leaf为false的情况下才可以修改 -->
          <template v-if="leaf === false">
            <span class="f12 color-primary">显示级次:</span>
            <select class="bd_none bgt color-primary" v-model="treeLevel">
              <option :value="0">末级</option>
              <option :value="1">一级</option>
              <option :value="2" v-if="treeMaxLevel > 1">二级</option>
              <option :value="3" v-if="treeMaxLevel > 2">三级</option>
              <option :value="4" v-if="treeMaxLevel > 3">四级</option>
              <option :value="5" v-if="treeMaxLevel > 4">五级</option>
              <option :value="6" v-if="treeMaxLevel > 5">六级</option>
              <option :value="7" v-if="treeMaxLevel > 6">七级</option>
              <option :value="8" v-if="treeMaxLevel > 7">八级</option>
              <option :value="9" v-if="treeMaxLevel > 8">九级</option>
            </select>
          </template>
          <div class="r">
            <!-- 是否可以更改多选状态 -->
            <template v-if="changeMultiple">
              <span class="f12 color-primary">多选:</span>
              <input type="checkbox" v-model="currentMultiple" @change="handleCurrentMultipleChange">
            </template>
            <!-- 全选按钮，只有在多选状态下且不能改变多选状态的时候，才显示 -->
            <el-button size="mini" @click="handleCheckAll" v-if="currentMultiple === true && !changeMultiple">全选</el-button>
          </div>
        </div>
        <!-- 内容区底部插槽 -->
        <slot name="content-footer"></slot>
      </div>
      <!-- 组件input区域 -->
      <div slot="reference" class="tree-input-editor" :class="{'is-disable': disabled, 'pr45': currentData.length > 1}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
        <input ref="input" :class="{'is-disable': disabled}" type="text" v-model.trim="editorValue" :placeholder="placeholder" :disabled="disabled" @focus="handleFocus" @input="handleInput" @blur="handleBlur" @keyup.enter="handleKeyupEnter">
        <div class="tree-input-action">
          <span class="f12 link-primary" @click="handleChangeContentDisplay" v-if="currentData.length > 1">共{{currentData.length}}项</span>
          <i class="fa fa-times-circle poi color-text-secondary" @click="handleClear" v-if="[currentMultiple, clearable].includes(true) && isNotEmpty(currentData) && clearVisible === true"></i>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script>
import $ from 'jquery';
import PinyinMatch from 'pinyin-match';
import { Tree } from '@/assets/js/model';
import { SWITCH } from '@/assets/js/constant';
import util from '@/assets/js/util';
import { dispatchValidateEvent } from '@/mixin/form';

/**
 * 数据类型
 * ARRAY：数组
 * TREE：树
 */
export const DATA_TYPE = {
  ARRAY: 'ARRAY',
  TREE: 'TREE'
};
/**
 * 数据显示类型
 *  CODE：显示code
 *  NAME：显示name
 *  CODE_NAME：显示code+name
 */
const DISPLAY = {
  CODE: 'CODE',
  NAME: 'NAME',
  CODE_NAME: 'CODE_NAME'
};
/**
 * 结果集中包含的值
 *  CHECKED：结果集中包含所有选中节点
 *  HALF_CHECKED：结果集中包含所有半选中节点
 *  ALL：结果集中包含所有选中节点和半选中节点
 */
const VALUE_CONSISTS = {
  CHECKED: 'CHECKED',
  HALF_CHECKED: 'HALF_CHECKED',
  ALL: 'ALL'
};
/**
 * 组件显示区类型（树、当前选中的值）
 */
const CONTENT_DISPLAY = {
  TREE: 'TREE',
  CHECKED_VALUE: 'CHECKED_VALUE'
};
/**
 * 过滤集中包含的值
 *  SELF：节点本身
 *  CHILDREN：子节点
 */
const FILTER_CONSISTS = {
  SELF: 'SELF',
  CHILDREN: 'CHILDREN'
};

export default {
  props: {
    /**
     * 数据
     */
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * 数据类型
     */
    dataType: {
      type: String,
      default: DATA_TYPE.ARRAY,
      validator(value) {
        return Object.values(DATA_TYPE).includes(value);
      }
    },
    /**
     * 绑定的值
     */
    value: {
      type: [String, Number, Array],
      default() {
        return [];
      }
    },
    /**
     * 结果级中包含的值
     */
    valueConsists: {
      type: String,
      default: VALUE_CONSISTS.CHECKED,
      validator(value) {
        return Object.values(VALUE_CONSISTS).includes(value);
      }
    },
    /**
     * 是否默认展开
     */
    expand: {
      type: Boolean,
      default: false
    },
    /**
     * 是否在点击节点的时候展开或者收缩节点
     */
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    /**
     * 组件多选
     */
    multiple: {
      type: Boolean,
      default: true
    },
    /**
     * 更改多选状态
     */
    changeMultiple: {
      type: Boolean,
      default: false
    },
    /**
     * 在多选模式下，是否严格的遵循父子不互相关联
     */
    strictly: {
      type: Boolean,
      default: false
    },
    /**
     * 在单选模式下, 是否可清空组件
     */
    clearable: {
      type: Boolean,
      default: true
    },
    /**
     * 在单选模式下, 是否只能选择叶子节点
     */
    leaf: {
      type: Boolean,
      default: false
    },
    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * placeholder
     */
    placeholder: {
      type: String,
      default: ''
    },
    /**
     * 数据显示类型
     */
    display: {
      type: String,
      default: DISPLAY.CODE_NAME,
      validator(value) {
        return Object.values(DISPLAY).includes(value);
      }
    },
    /**
     * 过滤集中包含的值
     */
    filterConsists: {
      type: String,
      default: FILTER_CONSISTS.SELF,
      validator(value) {
        return Object.values(FILTER_CONSISTS).includes(value);
      }
    },
    /**
     * 是否显示工具栏（如果是单选，需要leaf为false）
     */
    showToolbal: {
      type: Boolean,
      default: false
    },
    /**
     * 默认的树展示级次
     */
    defaultTreeLevel: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0;
      }
    },
    /**
     * 树展示级次增量值
     */
    treeLevelIncrement: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0;
      }
    },
    /**
     * 展示数据树形结构
     */
    props: {
      type: Object,
      default() {
        return {
          id: 'code',
          label: 'name',
          pid: 'pcode',
          children: 'children',
          disabled: 'disabled',
          display: 'display'
        };
      }
    }
  },
  data() {
    return {
      activeId: new Date().getTime(),
      dataList: [],
      treeDataLevel: {},
      currentValue: [],
      editorValue: '',
      treeLevel: 0,
      currentMultiple: this.multiple,
      clearVisible: false,
      contentVisible: false,
      checkedAll: false,
      contentDisplay: CONTENT_DISPLAY.TREE,
      CONTENT_DISPLAY,
      SWITCH
    };
  },
  created() {
    this.treeLevel = this.defaultTreeLevel;
    this.debouncedHandleTreeFilter = _.debounce(this.handleTreeFilter, 350);
  },
  watch: {
    /**
     * 展示数据监听
     * 1、设置展示数据集合
     * 2、设置组件的值
     */
    data: {
      handler() {
        this.setDataList();
        // hack方法，确保tree展示数据填充完毕之后，再设置当前组件的值
        setTimeout(() => {
          this.setCurrentValue(this.value);
        }, 0);
      },
      deep: true
    },
    /**
     * 绑定的值的监听
     * 1、设置组件的值
     */
    value: {
      handler(value) {
        this.setCurrentValue(value);
      },
      deep: true
    },
    /**
     * 组件当前值的监听
     * 1、如果当前组件的值与绑定的值相同，则终止操作
     * 2、触发input
     */
    currentValue: {
      handler() {
        let currentValue = this.getCurrentValue();
        if (_.isEqual(currentValue, this.value)) {
          return;
        }
        this.dispatch(
          'input',
          this.currentMultiple
            ? _.cloneDeep(currentValue)
            : util.isNotEmpty(currentValue)
            ? currentValue[0]
            : ''
        );
      },
      deep: true
    },
    /**
     * 当前组件的第一个值的完整对象监听
     * 1、设置当前组件输入框的值
     */
    firstCurrentData(value) {
      this.editorValue = util.isNotEmpty(value) ? this.displayValue(value) : '';
    },
    /**
     * 树展示级次监听
     * 1、清空组件的值
     * 2、触发级次变化事件
     */
    treeLevel(value) {
      this.setCurrentValue([]);
      this.dispatch('tree-level-change', value);
    },
    /**
     * 组件多选监听
     */
    multiple(value) {
      this.setCurrentMultiple(value);
    }
  },
  methods: {
    /**
     * 设置展示数据集合
     * 1、判断过滤集中包含的值的类型
     *    1、如果过滤时只包含节点本身，则直接渲染树组件数据
     *    2、如果过滤时只包含子节点，则需要构建数据（生成节点全称数据）
     * 2、生成展示数据节点级次
     * 3、重置treeLevel
     */
    setDataList() {
      let dataList = this.dataType === DATA_TYPE.ARRAY ? this.data : Tree.getArray(this.data, this.props);
      if (this.filterConsists === FILTER_CONSISTS.CHILDREN) {
        dataList = this.generateNodeFullInfo(dataList);
      }
      if (this.leaf === false) {
        let treeData = this.dataType === DATA_TYPE.ARRAY ? Tree.getTree(this.data, this.props) : this.data;
        this.$set(this.$data, 'treeDataLevel', Tree.getNodeLever(treeData, this.props));
        this.treeLevel = this.defaultTreeLevel;
      }
      this.dataList = dataList;
    },
    /**
     * 获取组件当前的值（根据valueConsists属性分别返回不同的值）
     */
    getCurrentValue() {
      let result = [];
      let tree = this.$refs.tree;
      if (this.valueConsists === VALUE_CONSISTS.CHECKED) {
        result = this.currentValue;
      } else if (this.valueConsists === VALUE_CONSISTS.HALF_CHECKED) {
        result = tree ? tree.getHalfCheckedKeys() : [];
      } else {
        let halfCheckedKeys = tree ? tree.getHalfCheckedKeys() : [];
        result = [...halfCheckedKeys, ...this.currentValue];
      }
      return result;
    },
    /**
     * 设置组件当前的值
     */
    setCurrentValue(value) {
      value = Array.isArray(value) ? value : util.isEmpty(value) ? [] : [value];
      let currentValue = this.getCurrentValue();
      if (_.isEqual(value, currentValue)) {
        return;
      }
      if (this.currentMultiple) {
        let tree = this.$refs.tree;
        if (tree) {
          this.$refs.tree.setCheckedKeys(value);
          // hack方法，处理默认不展开，设置值不在第一层时，无法触发树组件handleCheckChange事件的处理
          if (this.expand === false) {
            this.handleCheckChange();
          }
        }
      } else {
        this.currentValue = _.cloneDeep(value);
      }
    },
    /**
     * 设置当前组件的多选状态
     * 1、判断当前的多选状态
     *    1、如果是多选，则清空组件的值
     *    2、如果是单选，则设置当前组件值为空
     * 2、触发change事件
     * 3、设置当前组件的多选状态
     */
    setCurrentMultiple(value) {
      if (this.currentMultiple) {
        this.$refs.tree.setCheckedKeys([]);
        if (this.expand === false) {
          this.handleCheckChange();
        }
      } else {
        this.currentValue = [];
      }
      this.dispatchChange();
      this.currentMultiple = value;
    },
    /**
     * 处理获取焦点事件
     * 1、显示组件选择区域
     * 2、让当前输入框的值选中
     * 3、触发focus事件
     * 4、处理定位
     */
    handleFocus(event) {
      this.$nextTick(() => {
        event.target.select();
        this.dispatch('focus', event);
        this.contentDisplay = CONTENT_DISPLAY.TREE;
        this.handleContentVisibleChange(true);
        setTimeout(() => {
          this.handleLocation();
        }, 0);
      });
    },
    /**
     * 处理input事件
     * 1、触发树组件数据过滤
     * 2、显示内容区
     * 3、更新Popper状态
     */
    handleInput() {
      this.debouncedHandleTreeFilter(this.editorValue);
      this.handleContentVisibleChange(true);
      setTimeout(() => {
        this.$refs.popover.updatePopper();
      }, 0);
    },
    /**
     * 处理失去焦点事件
     */
    handleBlur(event) {
      this.dispatch('blur', event);
      dispatchValidateEvent(this, 'ElFormItem', 'el.form.blur', [
        this.getCurrentValue()
      ]);
    },
    /**
     * 处理树组件过滤
     */
    handleTreeFilter(value) {
      if (util.isNotEmpty(this.$refs.tree)) {
        this.$refs.tree.filter(value);
      }
    },
    /**
     * 处理节点点击，判断组件是单选还是多选
     *  1、如果是多选，则判断是选中状态还是未选中状态，然后设置树组件多选框选中状态
     *  2、如果是单选，则设置当前组件的值
     *  3、触发node-click事件
     *  3、触发change事件
     */
    handleNodeClick(data, node) {
      let nodeKey = data[this.props.id],
        isDisable = data[this.props.disabled];
      if (isDisable === SWITCH.ACTIVE) {
        return;
      }
      if (this.currentMultiple) {
        this.$refs.tree.setChecked(nodeKey, !node.checked, !this.strictly);
      } else {
        if (this.leaf && !node.isLeaf) {
          return;
        }
        this.currentValue = [nodeKey];
        this.handleContentVisibleChange(false);
      }
      this.dispatch('node-click', data);
      this.dispatchChange();
    },
    /**
     * 处理keyupEnter事件
     * 1、根据输入框，查找当前过滤后的数据
     * 2、如果过滤后的数据只有一条，则需要做数据填充
     * 3、触发chaneg事件
     */
    handleKeyupEnter() {
      if (util.isEmpty(this.editorValue)) {
        this.handleContentVisibleChange(!this.contentVisible);
        return;
      }
      let hasNum = this.editorValue.match(/\d+/g) !== null;
      let filterResult = Tree.getArray(this.treeData, this.props);
      filterResult = filterResult.filter(e => {
        let temp = `${e[this.props.id]} ${e[this.props.label]}`;
        if (hasNum) {
          return (
            temp.startsWith(this.editorValue) &&
            (temp.includes(this.editorValue) ||
              PinyinMatch.match(temp, this.editorValue))
          );
        } else {
          return (
            temp.includes(this.editorValue) ||
            PinyinMatch.match(temp, this.editorValue)
          );
        }
      });
      if (filterResult.length === 1) {
        let nodeKey = filterResult[0][this.props.id];
        if (this.currentMultiple) {
          this.$refs.tree.setChecked(nodeKey, true, !this.strictly);
        } else {
          this.currentValue = [nodeKey];
        }
        this.dispatchChange();
      }
      this.handleContentVisibleChange(!this.contentVisible);
    },
    /**
     * 处理当前多选状态变化
     * 1、获取旧的多选状态
     *    1、如果是多选，则清空组件的值
     *    2、如果是单选，则设置当前组件值为空
     * 3、触发change事件
     * 4、触发multiple-change事件
     */
    handleCurrentMultipleChange() {
      let oldMultiple = !this.currentMultiple;
      if (oldMultiple) {
        this.$refs.tree.setCheckedKeys([]);
        if (this.expand === false) {
          this.handleCheckChange();
        }
      } else {
        this.currentValue = [];
      }
      this.dispatchChange();
      this.dispatch('multiple-change', this.currentMultiple);
    },
    /**
     * 处理全选
     * 1、选择全部的值
     * 2、触发change事件
     */
    handleCheckAll() {
      this.checkedAll = !this.checkedAll;
      if (this.checkedAll) {
        let dataList = Tree.getArray(this.treeData, this.props);
        this.$refs.tree.setCheckedKeys(
          dataList.map(e => {
            return e[this.props.id];
          })
        );
      } else {
        this.$refs.tree.setCheckedKeys([]);
      }
      this.dispatchChange();
    },
    /**
     * 处理多选框被点击事件
     * 1、触发change事件
     */
    handleCheck() {
      this.dispatchChange();
    },
    /**
     * 处理节点选中状态变化
     */
    handleCheckChange() {
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      if (_.isEqual(this.currentValue, checkedKeys)) {
        return;
      }
      this.currentValue = checkedKeys;
    },
    /**
     * 处理组件清空选中的值，判断组件是单选还是多选
     *  1、如果是多选，则清空组件的值
     *  2、如果是单选，则设置当前组件值为空
     *  3、触发clear事件
     *  4、触发change事件
     *  5、处理弹出框关闭
     */
    handleClear() {
      if (this.currentMultiple) {
        this.$refs.tree.setCheckedKeys([]);
        // hack方法，处理默认不展开，设置值不在第一层时，无法触发树组件handleCheckChange事件的处理
        if (this.expand === false) {
          this.handleCheckChange();
        }
      } else {
        this.currentValue = [];
      }
      this.dispatch('clear');
      this.dispatchChange();
      if (this.contentVisible === true) {
        this.handleContentVisibleChange(false);
      }
    },
    /**
     * 处理删除选中的值
     *  1、触发change事件
     */
    handleRemove(nodeKey) {
      if (this.currentMultiple) {
        this.$refs.tree.setChecked(nodeKey, false, !this.strictly);
        // hack方法，处理默认不展开，设置值不在第一层时，无法触发树组件handleCheckChange事件的处理
        if (this.expand === false) {
          this.handleCheckChange();
        }
      } else {
        this.currentValue = [];
      }
      this.dispatchChange();
    },
    /**
     * 处理切换显示区显示类型
     */
    handleChangeContentDisplay() {
      this.contentDisplay =
        this.contentDisplay === CONTENT_DISPLAY.TREE
          ? CONTENT_DISPLAY.CHECKED_VALUE
          : CONTENT_DISPLAY.TREE;
      this.handleContentVisibleChange(true);
    },
    /**
     * 触发组件外点击事件
     */
    handleClickoutside(value) {
      let targetId = value.path.reduce((collect, e) => {
        return (collect += e.id);
      }, '');
      if (targetId.includes(this.activeId)) {
        return;
      }
      this.handleContentVisibleChange(false);
    },
    /**
     * 处理内容区显示隐藏
     * 1、如果为内容区关闭
     *    1、恢复输入框的值
     *    2、重置树组件过滤
     * 2、更改内容区显示状态
     * 3、触发事件
     */
    handleContentVisibleChange(value) {
      if (value === false) {
        setTimeout(() => {
          this.editorValue = util.isNotEmpty(this.firstCurrentData)
            ? this.displayValue(this.firstCurrentData)
            : '';
          if (util.isNotEmpty(this.$refs.tree)) {
            this.debouncedHandleTreeFilter();
          }
        }, 350);
      }
      this.contentVisible = value;
      this.dispatch('visible-change', value);
    },
    /**
     * 处理定位
     */
    handleLocation() {
      let $tree = $(this.$refs['tree'].$el);
      let $elOffset = $tree.find('.color-primary').offset();
      if ($elOffset) {
        let elOffsetTop = $elOffset.top;
        let popoverOffsetTop = $('#' + this.activeId).offset().top;
        $tree.finish().animate({scrollTop: elOffsetTop - popoverOffsetTop},1);
      }
    },
    /**
     * 生成节点全称信息数据
     * 1、深度克隆数据，并根据code进行数据排序
     * 2、采用堆栈的形式，为节点注入fullInfo属性
     */
    generateNodeFullInfo(data) {
      data = _.sortBy(_.cloneDeep(data), this.props.id);
      let result = [];
      let parents = [];
      let parent = undefined;
      data.forEach(e => {
        parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        while (parent && parent[this.props.id] !== e[this.props.pid]) {
          parents.pop();
          parent = parents.length > 0 ? parents[parents.length - 1] : undefined;
        }
        if (parent) {
          if (!e.fullInfo) {
            e.fullInfo = [{
              id: e[this.props.id],
              label: e[this.props.label]
            }];
          }
          e.fullInfo = parent.fullInfo.concat(e.fullInfo);
        } else {
          e.fullInfo = [{
            id: e[this.props.id],
            label: e[this.props.label]
          }];
        }
        result.push(e);
        parents.push(e);
      });
      return result;
    },
    /**
     * 触发事件
     */
    dispatch(event, ...value) {
      this.$emit(event, ...value);
    },
    /**
     * 触发change事件
     * 1、判断是否允许多选（单选返回字符串，多选返回数组）
     */
    dispatchChange() {
      // hack方法，确保先触发input事件之后再触发change事件
      setTimeout(() => {
        let currentValue = this.getCurrentValue();
        let currentData = _.cloneDeep(this.currentData);
        this.dispatch(
          'change',
          this.currentMultiple
            ? _.cloneDeep(currentValue)
            : util.isNotEmpty(currentValue)
            ? currentValue[0]
            : '',
          this.currentMultiple
            ? currentData
            : util.isNotEmpty(currentData)
            ? currentData[0]
            : null
        );
        dispatchValidateEvent(this, 'ElFormItem', 'el.form.change', [
          currentValue
        ]);
      }, 0);
    },
    /**
     * 组件显示的值
     */
    displayValue(value) {
      let display = util.isNotEmpty(value[this.props.display])
        ? value[this.props.display]
        : this.display;
      if (display === DISPLAY.CODE) {
        return value[this.props.id];
      } else if (display === DISPLAY.NAME) {
        return value[this.props.label];
      } else {
        return `${value[this.props.id]} ${value[this.props.label]}`;
      }
    },
    /**
     * 树组件节点筛选方法
     * 1、判断是否含有数字
     * 2、判断过滤属性包含的值类型
     * 3、如果只包含节点本身
     *    1、如果输入的值含有数字
     *      1、如果以输入的值开头，则返回true
     *      2、如果不以输入的值开头，则判断label中是否包含输入的值
     *    2、如果输入的值不包含数字，则判断code + label是否包含输入的值
     * 4、如果包含子节点
     *    1、如果输入的值含有数字，则循环fullInfo
     *      1、如果以输入的值开头，则返回true
     *      2、如果不以输入的值开头，则判断label中是否包含输入的值
     *    2、如果输入的值不包含数字，则循环fullInfo，判断code + label是否包含输入的值
     */
    filterNode(value, data) {
      if (util.isEmpty(value)) {
        return true;
      } else {
        value = String(value).toUpperCase();
        let code = String(data[this.props.id]).toUpperCase();
        let label = String(data[this.props.label]).toUpperCase();
        let temp = `${code} ${label}`;
        let hasNum = value.match(/\d+/g) !== null;
        if (this.filterConsists === FILTER_CONSISTS.SELF) {
          if (hasNum) {
            if (temp.startsWith(value)) {
              return true;
            } else {
              return label.includes(value) || PinyinMatch.match(label, value);
            }
          } else {
            return temp.includes(value) || PinyinMatch.match(temp, value);
          }
        } else {
          if (hasNum) {
            return data.fullInfo.some(e => {
              let fullCode = String(e.id).toUpperCase();
              let fullLabel = String(e.label).toUpperCase();
              let fullTemp = `${fullCode} ${fullLabel}`;
              if (fullTemp.startsWith(value)) {
                return true;
              } else {
                return fullLabel.includes(value) || PinyinMatch.match(fullLabel, value);
              }
            });
          } else {
            return data.fullInfo.some(e => {
              let fullTemp = `${e.id} ${e.label}`.toUpperCase();
              return fullTemp.includes(value) || PinyinMatch.match(fullTemp, value);
            });
          }
        }
      }
    },
    /**
     * 清空当前组件的值
     */
    clear() {
      this.handleClear();
    },
    /**
     * 使组件获得焦点
     */
    focus() {
      this.$refs.input.focus();
      return true;
    },
    /**
     * 节点是否选中
     */
    isChecked(value) {
      return this.currentValue.includes(value);
    },
    isNotEmpty(value) {
      return util.isNotEmpty(value);
    }
  },
  computed: {
    /**
     * 树形展示数据
     */
    treeData() {
      let dataList =
        this.treeLevel === 0
          ? this.dataList
          : this.dataList.filter(e => {
              return (
                this.treeDataLevel[e[this.props.id]] + 1 <=
                this.treeLevel + this.treeLevelIncrement
              );
            });
      return Tree.getTree(dataList, this.props);
    },
    /**
     * 展示数据最大的级次
     */
    treeMaxLevel() {
      return (
        Object.values(this.treeDataLevel).reduce((res, e) => {
          return e > res ? e : res;
        }, -1) + 1
      );
    },
    /**
     * 组件当前值的完整对象数据
     */
    currentData() {
      let currentValue = this.getCurrentValue();
      if (util.isEmpty(currentValue)) {
        return [];
      } else {
        return this.dataList.filter(e => {
          return currentValue.includes(e[this.props.id]);
        });
      }
    },
    /**
     * 组件当前第一个值的完整对象数据
     */
    firstCurrentData() {
      return util.isNotEmpty(this.currentData) ? this.currentData[0] : null;
    }
  },
  mounted() {
    if (util.isNotEmpty(this.data)) {
      this.setDataList();
      // hack方法，确保tree展示数据填充完毕之后，再设置当前组件的值
      setTimeout(() => {
        this.setCurrentValue(this.value);
      }, 0);
    }
  }
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.tree-input-content {
  min-width: 215px;
  .content-close {
    color: $--color-text-placeholder;
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 1;
    font-size: 17px;
    cursor: pointer;
    &:hover {
      color: $--color-text-regular;
    }
  }
  .el-tree {
    max-height: 250px;
    width: 100%;
    overflow: auto;
  }
  .content-checked {
    padding: 6px 0;
    overflow-y: auto;
    overflow-x: hidden;
    list-style: none;
    box-sizing: border-box;
    max-height: 300px;
    .content-checked-option {
      position: relative;
      background-color: $--color-white;
      padding: 0 40px 0 10px;
      white-space: no-wrap;
      height: 28px;
      line-height: 28px;
      box-sizing: border-box;
      color: $--color-606626;
      &:hover {
        background-color: $--background-color-base;
      }
      div {
        position: absolute;
        top: 0;
        right: 5px;
        font-size: 1.2em;
      }
    }
  }
  .content-toolbal {
    border-top: $--border-base;
    padding-top: 5px;
    height: 30px;
    line-height: 30px;
  }
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';

.tree-input {
  display: inline-block;
  min-width: 240px;
  position: relative;
  .tree-input-editor {
    height: 32px;
    line-height: 30px;
    position: relative;
    padding: 0 15px 0 10px;
    background-color: $--color-white;
    border: 1px solid $--color-c0c4cc;
    border-radius: $--input-border-radius;
    outline: none;
    box-sizing: border-box;
    &:hover {
      border: 1px solid $--color-909399;
    }
    &.pr45 {
      padding-right: 45px;
    }
    &.is-disable {
      background-color: $--input-disabled-fill;
    }
    input {
      width: 100%;
      height: 30px;
      line-height: 30px;
      font-size: $--font-size-small;
      padding: 0;
      border: none;
      color: $--input-color;
      background-color: transparent;
      outline: none;
      overflow: hidden;
      &.is-disable {
        color: $--input-disabled-color;
        cursor: not-allowed;
      }
      &::-webkit-input-placeholder {
        /* WebKit browsers */
        color: $--color-text-placeholder;
        font-size: $--font-size-small;
      }
      &:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        color: $--color-text-placeholder;
        font-size: $--font-size-small;
      }
      &::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        color: $--color-text-placeholder;
        font-size: $--font-size-small;
      }
      &:-ms-input-placeholder {
        /* Internet Explorer 10+ */
        color: $--color-text-placeholder;
        font-size: $--font-size-small;
      }
    }
    .tree-input-action {
      position: absolute;
      right: 2px;
      top: 0;
    }
  }
}
</style>
