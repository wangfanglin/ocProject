<!-- 全屏按钮 -->
<template>
	<i class="fa fa-arrows-alt " @click="handleClick"></i>
</template>
<script>
import screenfull from 'screenfull';

export default {
	methods: {
		/**
		 * 处理全屏切换
		 */
		handleClick() {
			screenfull.toggle();
		}
	},
	computed: {
		/**
		 * 全屏是否启用
		 */
		screenfullEnabled() {
			return screenfull.enabled;
		}
	}
};
</script>
<style lang="scss" scoped>
</style>
