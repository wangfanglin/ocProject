<template>
<div>
  <div class="fix">
    <div class="dib text-tit">
      <span class="dib mb5">报表名称</span>
    </div>
    <el-input size="small" style="width:300px" class="dib ml30" v-model="schm.schmName"></el-input>

    <div class="dib scheme" v-if="hasTemplates">
      <div class="select-template"> 选择模板 </div>
      <el-tabs class="templates-list" v-model="activeTemplates">
        <el-tab-pane :label="'个人'" name="psn">
          <div class="template-panel">
            <div class="fix poi row" v-for="(item, index) in templates.psn" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span class="ml5">
                {{item.schmName}}
              </span>
              <div class="r gp" @click.stop="removeTemplate(item)">删除</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="'单位'" name="unit">
          <div class="template-panel">
            <div class="fix poi row" v-for="(item, index) in templates.unit" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span class="ml5">
                {{item.schmName}}
              </span>
              <div class="r gp" @click.stop="removeTemplate(item)">删除</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="'系统'" name="sys">
          <div class="template-panel">
            <div class="fix poi row" v-for="(item, index) in templates.sys" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span>
                {{item.schmName}}
              </span>
              <div class="r gp" @click.stop="removeTemplate(item)">删除</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <div class="mt5 rpt-style">
    <div class="text-tit fix mt5 dib">
      <span class="dib mr30">报表样式</span>
    </div>
    <el-radio class="pct15" v-model="schm.style" :label="'stripe'">条纹式</el-radio>
    <el-radio class="pct15" v-model="schm.style" :label="'line'">框线式</el-radio>
    <el-color-picker
      size="mini"
      v-model="schm.selectedColor"
      :predefine="mainColors">
</el-color-picker>
  </div>
  <div class="mt5">
    <div class="text-tit g3 dib">
      <span class="dib mr30">显示金额</span>
    </div>
    <el-radio class="pct15" v-model="schm.amtOrder" :label="'default'">默认顺序</el-radio>
    <el-radio class="pct15" v-model="schm.amtOrder" :label="'custom'">手动排序</el-radio>
  </div>
  <div>
    <el-checkbox-group v-model="schm.listAmts" :min="1">
      <el-badge v-for="(item,index) in options.amts"
                :key="index"
                class="pct33 pt5" :class="{pct100:index === 0}"
                :value="amtIndex(item.code,'rowAtomSeq')"
                :hidden="!isAmtSelected(item.code,'rowAtomSeq') || schm.amtOrder === 'default'">
        <el-checkbox :label="item.code">{{item.name}}</el-checkbox>
      </el-badge>
    </el-checkbox-group>
  </div>
  <slot name="otherAmt"></slot>
  <el-tabs class="mt5 atom-tabs">
    <el-tab-pane label="行分组">
      <div class="dib pr10 pt5 pct100 bsb rel"
           v-for="(item, index) in atoms"
           :key="index">
        <el-badge :value="atomIndex(item.code,'rowAtomSeq')"
                  :hidden="!schm.rowConfig[item.code]['selected']">
          <el-checkbox v-model="schm.rowConfig[item.code]['selected']"
                       @change="rowConfigChange(item.code)"
                       :key="Math.random()"
                       class="h30 lh30"
                       :class="{selectedAtom:schm.colConfig[item.code]['selected']}">
            {{item.name}}
          </el-checkbox>
        </el-badge>
        <div class="abs dib ml40"
             v-if="schm.rowConfig[item.code]['selected'] && item.code === 'PERD'">
          <el-input-number v-model="schm.fromPERD" :min="1" size="small" style="width:100px;" :max="12"></el-input-number>
          至
          <el-input-number v-model="schm.toPERD" :min="1" size="small" style="width:100px" :max="12"></el-input-number>
        </div>
        <div class="abs dib" style="right:0;"
             v-if="schm.rowConfig[item.code]['selected'] && item.code !== 'PERD'">
          <v-super-select
            v-if="!options.emptyAsAll"
            :list-data="atomMap[item.code].list"
                          :levels="atomMap[item.code].levels"
                          :key="index"
                          v-model="schm.atomValues[item.code]"
                          @isTreeChanged="e => setAtomIsTree(e,schm.rowConfig[item.code])"
                          @levelChanged="e => setAtomLevel(e,schm.rowConfig[item.code])"
                          @selected="e => setSelectedAtoms(e,item.code)"
                          :multiple="true"
                          :value-consists-of="options.valueConsistsOf"
                          class="tl">
          </v-super-select>
          <el-checkbox v-model="schm.rowConfig[item.code].nameOnly" class="h30 lh30"> 仅显示名称 </el-checkbox>
          <el-checkbox v-model="schm.rowConfig[item.code].isSum" class="h30 lh30"> 汇总</el-checkbox>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="列分组">
      <div class="dib pr10 pt5 pct100 bsb rel"
           v-for="(item, index) in colAtoms" :key="index">
        <el-badge :value="atomIndex(item.code,'colAtomSeq')"
                  :hidden="!schm.colConfig[item.code]['selected']">
          <el-checkbox v-model="schm.colConfig[item.code]['selected']"
                       @change="colConfigChange(item.code)"
                       :key="Math.random()"
                       class="h30 lh30"
                       :class="{selectedAtom:schm.rowConfig[item.code]['selected']}">
            {{item.name}}
          </el-checkbox>
        </el-badge>
        <div class="abs dib ml40"
             v-if="schm.colConfig[item.code]['selected'] && item.code === 'PERD'">
          <el-input-number v-model="schm.fromPERD" :min="1" size="small" style="width:100px;" :max="12"></el-input-number>
          至
          <el-input-number v-model="schm.toPERD" :min="1" size="small" style="width:100px" :max="12"></el-input-number>
        </div>
        <div class="abs dib" style="right:0;"
             v-if="schm.colConfig[item.code]['selected'] && item.code !== 'PERD'">
          <v-super-select :list-data="atomMap[item.code].list"
                          :levels="atomMap[item.code].levels"
                          :key="index"
                          v-model="schm.atomValues[item.code]"
                          @isTreeChanged="e => setAtomIsTree(e,schm.colConfig[item.code])"
                          @levelChanged="e => setAtomLevel(e,schm.colConfig[item.code])"
                          @selected="e => setSelectedAtoms(e,item.code)"
                          :multiple="true"
                          :value-consists-of="'ALL'"
                          class="tl">
          </v-super-select>
          <el-checkbox v-model="schm.colConfig[item.code].nameOnly" class="h30 lh30"> 仅显示名称 </el-checkbox>
          <el-checkbox v-model="schm.colConfig[item.code].isSum" class="h30 lh30"> 汇总</el-checkbox>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="条件" v-if="!options.noConditionGroup">
      <div class="dib pr10 pt5 pct100 bsb" v-for="(item, index) in conditionAtoms" :key="index">
        <el-checkbox v-model="schm.cdtnConfig[item.code]['selected']"
                     :key="Math.random()"
                     class="pct30 h30 lh30">
          {{item.name}}
        </el-checkbox>
        <div class="dib ml50"
             v-if="schm.cdtnConfig[item.code]['selected'] && item.code !== 'PERD'">
          <v-super-select :list-data="atomMap[item.code].list"
                          :levels="atomMap[item.code].levels"
                          :key="index"
                          v-model="schm.atomValues[item.code]"
                          @selected="e => setSelectedAtoms(e,item.code)"
                          :multiple="true"
                          :value-consists-of="'ALL'"
                          class="tl">
          </v-super-select>
        </div>
        <div class="dib ml50"
             v-if="item.code === 'PERD' && schm.cdtnConfig[item.code]['selected']">
          <el-input-number v-model="schm.fromPERD" :min="1" size="small" style="width:100px;" :max="12"></el-input-number>
          至
          <el-input-number v-model="schm.toPERD" :min="1" size="small" style="width:100px" :max="12"></el-input-number>
        </div>
      </div>
      <slot name="otherConditions"></slot>
    </el-tab-pane>
  </el-tabs>
  <div class="fix mt30">
    <div class="l pr20" v-if="canSaveScheme()">
      <el-dropdown split-button size="small" type="default" @click="saveScheme('1')">
        保存方案（私有）
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click="saveScheme('2')">保存方案（单位共享）</el-dropdown-item>
          <el-dropdown-item @click="saveScheme('3')">保存方案（全局共享）</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="tc">
      <el-button type="primary" size="small" @click="getTableData()">查&nbsp;&nbsp;&nbsp;&nbsp;询</el-button>
    </div>
  </div>
</div>
</template>
<script src='./cross-table.js'></script>
<style lang="scss" src='./cross-table.scss' scoped> </style>
