<!-- 人员搜索 -->
<template>
	<div class="search-item-block">
		<!-- 内容区 -->
		<div class="search-item-block-employee">
			<!-- 机构 -->
			<div class="color-text-primary f15 mt5">{{value.agyName}}</div>
			<!-- 部门 -->
			<div class="color-text-primary f15 mt5">{{value.departmentName}}</div>
			<!-- 电话 -->
			<div class="color-text-primary f15 mt5">{{value.phone_no}}</div>
		</div>
		<!-- 操作区 -->
		<div class="search-item-block-operate">
			<span class="color-primary poi" :class="{'ml5': index > 0}" v-for="(value, key, index) in value.listUrl" :key="key" @click="handleOpenMenu(value)">{{key}}</span>
		</div>
	</div>
</template>
<script>
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
		handleOpenMenu(value) {
			this.close();
			this.$router.push(value);
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.search-item-block {
	height: 160px;
	.search-item-block-employee {
		height: 135px;
		overflow: auto;
	}
	.search-item-block-operate {
		height: 30px;
		line-height: 30px;
	}
}
</style>
