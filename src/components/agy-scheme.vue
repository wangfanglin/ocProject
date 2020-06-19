<!--查询方案组件-->
<template>
  <div class="scheme-wrap">
    <!--选择方案后 显示选择的方案名-->
    <el-popover  v-model="showScheme">
      <div class="dib scheme" slot="reference">
        <span v-if="currentScheme.schmId !== ''">
          <span class="tdl poi">当前方案：{{currentScheme.schmName}}</span>
        </span>
        <el-button type="text" v-else>选择查询方案</el-button>
      </div>
      <!--方案分为三类 个人 单位 系统-->
      <el-tabs v-model="defaultScheme">
        <el-tab-pane :label="'个人 ' + schemeTypeNum('psn')" name="psn">
          <div style="height: 220px; overflow: auto;">
            <div class="fix poi scheme-item" v-for="(item, index) in scheme.psn" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span class="ml5">{{item.schmName}}</span>
              <el-button class="r" type="text" @click.stop="handleRemoveScheme(item)">删除</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="'单位 ' + schemeTypeNum('unit')" name="unit">
          <div style="height: 220px; overflow: auto;">
            <div class="fix poi scheme-item" v-for="(item, index) in scheme.unit" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span class="ml5">{{item.schmName}}</span>
              <el-button class="r" type="text" @click.stop="handleRemoveScheme(item)">删除</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="'系统 ' + schemeTypeNum('sys')" name="sys">
          <div style="height: 220px; overflow: auto;">
            <div class="fix poi scheme-item" v-for="(item, index) in scheme.sys" :key="index" @click="handleSchemeClick(item)">
              <i class="fa fa-circle"></i>
              <span class="ml5">{{item.schmName}}</span>
              <el-button class="r" type="text" @click.stop="handleRemoveScheme(item)">删除</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
  </div>
</template>
<script>
  import {mapGetters} from 'vuex';
  import {GET_GAL_RPT_SCHEME} from '@/store/agy';
  import util from '@/assets/js/util';
  /**
   * 方案范围种类
   */
  const SCHM_SCOPE = {
    PERSONAL: {
      name: '个人',
      code: '1'
    },
    UNIT: {
      name: '单位',
      code: '2'
    },
    SYS: {
      name: '系统',
      code: '3'
    }
  };

  export default {
    props: {
      /**
       * 传递进来的单位账套信息
       * */
      agyAcb: {
        type: Object,
        default() {
          return {
            agyCode: '',
            acbCode: '',
          };
        }
      },
      /**
       * 来源
       * */
      rptType: {
        type: String,
        default: ''
      },
    },
    data(){
      return {
        defaultScheme: 'psn', // 默认选中的方案类别--个人
        setDialog: {  // 设置查询方案弹框
          visible: false,
        },
        currentScheme: { // 当前选中的方案数据
          schmId: '',
          agyCode: '',
          acbCode: '',
          rptType: '',
          schmScope: '',
          schmCode: '',
          schmName: '',
          schmContent: ''
        },
        showScheme: false,// 展示
        SCHM_SCOPE
      }
    },
    computed: {
      ...mapGetters([GET_GAL_RPT_SCHEME]),
      /**
       * 方案列表（从缓存GET_GAL_RPT_SCHEME获取后使用单位以及rptType过滤）
       * */
      scheme() {
        this.currentScheme = {
          schmId: '',
          agyCode: '',
          acbCode: '',
          rptType: '',
          schmScope: '',
          schmCode: '',
          schmName: '',
          schmContent: ''
        };
        let galRptScheme = this.GET_GAL_RPT_SCHEME[this.agyAcb.agyCode];
        if (util.isNotEmpty(galRptScheme)) {
          let {psn, unit, sys} = galRptScheme;
          psn = psn.filter(e => {
            return e.rptType === this.rptType;
          });
          unit = unit.filter(e => {
            return e.rptType === this.rptType;
          });
          sys = sys.filter(e => {
            return e.rptType === this.rptType;
          });
          return {psn, unit, sys};
        } else {
          return {psn: [], unit: [], sys: []};
        }
      },
    },
    methods: {
      /**
       * 各种方案类别对应个数
       */
      schemeTypeNum(type) {
        const length = util.isEmpty(this.scheme[type])
          ? 0
          : this.scheme[type].length;
        return `（${length}）`;
      },
      /**
       * 删除查询方案
       */
      handleRemoveScheme(scheme) {
        this.$confirm('确定删除该查询方案?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.currentScheme.schmId === scheme.schmId) { // 如果删除已经选择的方案需将显示的方案名清除
            for (let key in this.currentScheme) {
              this.currentScheme[key] = '';
            }
          }
            this.$emit('schemeRemove', scheme); // 删除回调
          }).catch(() => {});
      },
      /**
       * 选择某一方案 赋值给显示的方案名
       */
      handleSchemeClick(val) {
        util.copyProperties(this.currentScheme, val);
        this.showScheme = false;
        this.$emit('schemeChange', val);
      },
      /**
       * 清除选择的方案
       */
      clearScheme() {
        this.currentScheme.schmId = '';
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import '~@/assets/style/variables.scss';
  .scheme-item {
    line-height: 40px;
    &:hover {
      background-color: $--select-option-hover-background;
    }
  }
</style>


