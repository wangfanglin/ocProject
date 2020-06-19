<template>
  <div class="error-container">
    <!-- 左侧文字 -->
    <div class="error-left">
      <span class="error-left-title">404</span>
      <span class="f24 color-text-regular">抱歉，你访问的页面不存在</span>
      <el-button size="small" type="primary" @click="toIndex" style="width: 200px;">返回首页</el-button>
    </div>
    <!-- 右侧图片 -->
    <img :src="error404" alt="">
  </div>
</template>

<script>
import error404 from '@/assets/img/error-404.svg';

export default {
  data() {
    return {
      error404
    };
  },
  methods: {
    toIndex() {
      this.$router.replace('/index');
    }
  }
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.error-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  .error-left {
    width: 350px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .error-left-title {
      font-size: 70px;
      font-weight: bold;
      color: $--color-text-primary
    }
  }

}
</style>
