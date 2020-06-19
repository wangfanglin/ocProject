<template>
  <!-- 超级搜索组件 -->
  <div class="super-search" v-if="visible">
    <div class="super-search-wrap" v-clickoutside="handleClose">
      <i class="el-icon-close poi super-search-wrap-close" @click="handleClose"></i>
      <!-- 输入框组件 -->
      <el-input ref="input" class="super-search-wrap-input" size="large" prefix-icon="el-icon-search" placeholder="输入关键字" v-model.trim="value"></el-input>
      <!-- 内容展示区域 -->
      <div class="super-search-wrap-content">
        <!-- 内容展示区项目 -->
        <div class="super-search-wrap-content-item" v-for="(e, i) in content" :key="i">
          <!-- 项目标题部分 -->
          <div class="super-search-wrap-content-item-title fix">
            <span class="f18 b">{{e.title}}</span>
            <el-tag class="r" size="medium">{{blockTitle(e.searchType)}}</el-tag>
          </div>
          <!-- 内容展示区项目块 -->
          <v-menu :value="e" :close="handleClose" v-if="e.searchType === SEARCH_TYPE.menu.key"></v-menu>
          <v-employee :value="e" :close="handleClose" v-if="e.searchType === SEARCH_TYPE.employee.key"></v-employee>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import vMenu from '@/modules/sys/layout/search/menu';
import vEmployee from '@/modules/sys/layout/search/employee';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

/**
 * 查询类型
 */
const SEARCH_TYPE = {
  menu: {
    key: 'menu',
    value: '菜单'
  },
  employee: {
    key: 'employee',
    value: '人员'
  }
};

export default {
  components: {
    vMenu,
    vEmployee
  },
  data() {
    return {
      visible: false,
      value: '',
      content: [],
      SEARCH_TYPE
    };
  },
  created() {
    this.debouncedGetContent = _.debounce(this.getContent, 350);
  },
  watch: {
    value(value) {
      this.debouncedGetContent();
    }
  },
  methods: {
    /**
     * 获取内容
     */
    getContent() {
      if (util.isEmpty(this.value)) {
        this.content = [];
      } else {
        fetch
          .get('/es/searchAll', {
            params: {
              content: this.value,
              roles: this.roles.join(),
              agyCode: this.GET_CONTEXT_AGY_ACB.agyCode
            }
          })
          .then(({ data }) => {
            this.content = data;
          })
          .catch(({ msg }) => {
            this.$message({
              type: 'error',
              message: msg
            });
          });
      }
    },
    /**
     * 处理键盘时间监听
     */
    handleKeyUp() {
      if (event.key === 'F2') {
        this.visible = !this.visible;
        if (this.visible === true) {
          setTimeout(() => {
            this.$refs.input.focus();
          }, 0);
        }
      } else if (event.key === 'Escape') {
        this.visible = false;
      }
    },
    /**
     * 处理关闭
     */
    handleClose() {
      this.value = '';
      this.content = [];
      this.visible = false;
    },
    /**
     * 块的类型
     */
    blockTitle(searchType) {
      return SEARCH_TYPE[searchType].value;
    }
  },
  computed: {
    ...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB]),
    /**
     * 登录人角色集合
     */
    roles() {
      return this.GET_LOGIN_INFO.assetRoles.map(e => {
        return e.roleCode;
      });
    }
  },
  mounted() {
    util.addEvent(document, 'keydown', this.handleKeyUp);
  },
  beforeDestroy() {
    util.removeEvent(document, 'keydown', this.handleKeyUp);
  }
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.super-search {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5000;
  .super-search-wrap {
    position: relative;
    display: inline-block;
    min-width: 1000px;
    width: 95%;
    min-height: 700px;
    height: 90%;
    margin-top: 50px;
    z-index: 5001;
    background: $--color-white;
    border-radius: $--border-radius-base;
    .super-search-wrap-close {
      position: absolute;
      top: 25px;
      right: 15px;
      font-size: 28px;
    }
    .super-search-wrap-input {
      width: 60%;
      margin-top: 20px;
      /deep/ .el-input__inner {
        height: 50px;
      }
    }
    .super-search-wrap-content {
      display: inline-block;
      width: 98%;
      height: calc(100% - 100px);
      margin-top: 10px;
      overflow: auto;
      border: $--border-base;
      border-radius: $--border-radius-base;
      .super-search-wrap-content-item {
        position: relative;
        width: 360px;
        height: 210px;
        margin: 15px 0 15px 25px;
        padding: 10px 10px 5px 10px;
        border: $--border-base;
        border-radius: $--border-radius-base;
        box-sizing: border-box;
        float: left;
        text-align: left;
        &:hover {
          box-shadow: $--box-shadow-base;
        }
        .super-search-wrap-content-item-title {
          height: 30px;
          line-height: 30px;
        }
      }
    }
  }
}
</style>
