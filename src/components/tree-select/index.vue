<template>
<div class="input-tree" :style="{'min-width': width}"
     >
  
  <div class="edit" ref="mEdit"
       :class="{'is-disable': readOnly}"
       :style="containerClass"
       @mouseover="setMouseOver()"
       @mouseout="setMouseOut()"
       >
    <input type="text"
           class="ell"
           ref="treeSelectInput"
           v-model.trim="currentValue"
           :placeholder="placeholder"
           @focus="inputFocus($event)"
           @blur="inputBlur()"
           @input="textInput()"
           @keydown.down.prevent="inputKeyDown()"
           @keydown.up.prevent="inputKeyUp()"
           @keydown.enter.prevent="inputKeyEnter($event)"
           @keydown.tab.prevent="inputKeyEnter($event)"
           @keydown.right="expandNode($event, currentNodeIndex)"
           @keydown.left="closeNode($event, currentNodeIndex)"
           @click="inputClick()"
           :disabled="readOnly"
           :style="inputClass"
           :class="{'is-disable': readOnly}">
    <div class="right-clear poi w20">
      <i v-if="!readOnly" class="fa fa-times db" @click.stop="clear()"></i>
      <i v-if="!readOnly && !openList" class="fa fa-chevron-left db" @click.stop="open()"></i>
      <i v-if="!readOnly && openList" class="fa fa-chevron-down db" @click.stop="open()"></i>
    </div>
    <transition name="el-fade-in-linear">
      <div class="full-view" v-if="isShowFullView()"> {{ currentValue }} </div>
    </transition>
  </div>

  <div class="select-panel"
       @click="clickSelectPanel"
       v-clickoutside="clickPanelOutSide"
       v-if="openList">

    <!--左侧导航面板-->
    <div class="nav" v-if="dynamicNavList && dynamicNavList.length > 0">
      <ul class="nav-box">
        <li v-for="(item,idx) in dynamicNavList"
            :key="idx"
            class="nav-node"
            @click="navTo(item.code)">
          <div class="node-caption">{{item.name}}</div>
          <div class="node-code">{{item.code}}</div>
        </li>
      </ul>
    </div>
    <!--左侧导航面板-end-->

    <!--树面板-->
    <ul class="list" :style="{height:listHeight + 'px', marginLeft:mgnLeft + 'px'}" v-scroll="listScroll">
      <li
        v-for="(item,idx) in pageList"
        @click="nodeClick(item.index,$event)"
        @mouseover="setMouseOverIndex(item.index)"
        @mouseout="setMouseOutIndex()"
        :key="idx"
        class="tl"
        :class="{current: isCurrentIndex(item.index),msover:isMouseOverIndex(item.index)}"
        :style="nodeStyle(item.index)">
        <i class="el-icon-caret-bottom" v-if="openStatus[item.index] && levelAndChildrenInfo[item.index].hasChildren"></i>
        <i class="el-icon-caret-right" v-if="!openStatus[item.index] && levelAndChildrenInfo[item.index].hasChildren"></i>
        <i class="el-icon-caret-right gt" v-if="!levelAndChildrenInfo[item.index].hasChildren"></i>
        <span>
          {{item.data[props.id]}} &nbsp; {{item.data[props.label]}}
        </span>
        <div
          class="comment-label"
          v-show="isMouseOverIndex(item.index)"
          @mouseover="showComment(item.index)"
          @mouseout="hideComment()">
          说明
        </div>
      </li>
    </ul>
    <transition name="el-fade-in-linear">
      <div class="comment" v-show="isShowAtomComment" @mouseover="atomCommentMouseover()" @mouseout="atomCommentMouseout()">
        <div class="comment-title">说明</div>
        <div class="comment-content" v-html="atomComment" v-if="atomCommentLoaded"></div>
        <div v-else class="aco-loading"><i class="el-icon-loading"></i></div>
      </div>
    </transition>
    <!--选择树面板-end-->

    <!--底部按钮面板-->
    <div class="add-bar" v-if="hasNew || hasSelect || hasSetting">
      <div @click="add" v-if="hasNew" class="add-btn"><i class="fa fa-plus"></i>&nbsp;新增</div>
      <div @click="addBySelect" v-if="hasSelect" class="add-btn"><i class="fa fa-hand-lizard-o"></i>&nbsp;选用</div>
      <div @click="setting" class="setting-btn" v-if="hasSetting" title="点击设置对应辅助核算">
        <i class="el-icon-setting"></i>
      </div>
    </div>
    <!--底部按钮面板-end-->
  </div>
</div>
</template>

<script src='./tree-select.js'> </script>
<style lang="scss" src='./tree-select.scss' scoped> </style>
