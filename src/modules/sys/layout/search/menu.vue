<!-- 菜单搜索 -->
<template>
	<div class="search-item-block">
		<!-- 内容区 -->
		<div class="search-item-block-menu">
			<!-- 菜单路径 -->
			<span class="color-text-primary f15 dib mt5">{{value.menuRoute}}</span>
			<!-- 菜单描述 -->
			<div class="color-text-regular f14 mt2" style="text-indent: 20px">
				{{value.menuDescribe}}
			</div>
		</div>
		<!-- 操作区 -->
		<div class="search-item-block-operate">
			<span class="color-primary poi" @click="handleOpenMenu">打开菜单</span>
		</div>
	</div>
</template>
<script>
import { openMenu } from '@/store/service/system-service';

export default {
	props: {
		value: {
			type: Object,
			default() {
				return {};
			}
		},
		close: Function
	},
	methods: {
		/**
		 * 处理菜单打开
		 */
		handleOpenMenu() {
      this.close();
      openMenu(this.value);
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.search-item-block {
	height: 160px;
	.search-item-block-menu {
		height: 135px;
		overflow: auto;
	}
	.search-item-block-operate {
		height: 30px;
		line-height: 30px;
	}
}
</style>
