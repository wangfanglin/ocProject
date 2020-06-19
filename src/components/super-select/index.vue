<template>
<div class="super-select w160" :style="{'min-width':inputWidth + 'px'}" v-clickoutside="handleInputClickoutside">

  <div class="edit" ref="mEdit" :class="{'is-disable': readOnly}">
    <input type="text" class="filter"

           v-model.trim="filterText"
           :placeholder="placeholder"
           @focus="filterFocus()"
           @blur="filterBlur()"
           @input="filterTextInput()"
           :disabled="readOnly"
           :class="{pr45: clearableAndMore(), pr25: clearableOrMore(), 'is-disable': readOnly}">
    <div class="right-action">
      <span v-if="moreValues()" class="more-value"
            @click.stop="showValues()">共{{this.currentValue.length}}项</span> <!--
       --><i v-if="canClear()" class="fa fa-times poi" style="width:20px" @click.stop="clear()"></i>
    </div>
  </div>

  <div class="tree content"
       :class="{top100:!topShow,bt100:topShow}"
       :style="{'min-width':treeWidth + '%','top':treeTop,'bottom':treeBottom}"
       v-show="canShowTree()">
    <el-tree ref="tree"
             empty-text="无数据"
             :data="treeData"
             :props="{label: props.label, children: props.children}"
             :style="{'maxHeight':treeHeight + 'px'}"
             :node-key="props.id"
             :default-expand-all="true"
             :check-strictly="!notStrictly"
             :expand-on-click-node="!multiple"
             :show-checkbox="multiple"
             @node-click="handleNodeClick"
             @check-change="multiSelect"
             :filter-node-method="filterNode"
             :render-content="renderContent">
    </el-tree>
    <div class="option-bar">
      <select v-model="isTree" class="bd_none bgt gp" @click="optionClick">
        <option :value="true">逐级展开至</option>
        <option :value="false">仅显示</option>
      </select>
      <select v-model="level" class="bd_none bgt gp" @click="optionClick">
        <option :value="0">末级</option>
        <option :value="1">一级</option>
        <option :value="2" v-if="maxLevel > 1">二级</option>
        <option :value="3" v-if="maxLevel > 2">三级</option>
        <option :value="4" v-if="maxLevel > 3">四级</option>
        <option :value="5" v-if="maxLevel > 4">五级</option>
        <option :value="6" v-if="maxLevel > 5">六级</option>
        <option :value="7" v-if="maxLevel > 6">七级</option>
        <option :value="8" v-if="maxLevel > 7">八级</option>
        <option :value="9" v-if="maxLevel > 8">九级</option>
      </select>
      <el-checkbox v-model="notStrictly" :key="Math.random()" class="h30 lh30" v-if="canShowStrictly" @change="optionClick"> 上下级节点联动 </el-checkbox>
      <el-button size="mini" type="success" plain @click="selectAll()" v-if="multiple">{{allSelect}}</el-button>
      <el-button size="mini" plain @click="confirm()" v-if="multiple && needConfirm">确定</el-button>
    </div>
  </div>
  <div class="selected content" :class="{top100:!topShow,bt100:topShow}" v-if="canShowValue()">
    <ul>
      <li v-for="(item, index) in currentValue" :key="index">
        <span>{{ item.code + ' ' + item.name }}</span>
        <div @click="delSeletedItem(item)"><i class="fa fa-times-circle-o"></i></div>
      </li>
    </ul>
  </div>
</div>
</template>

<script src='./super-select.js'></script>
<style lang="scss" src='./super-select.scss' scoped> </style>
