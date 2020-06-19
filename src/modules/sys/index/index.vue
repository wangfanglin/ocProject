<!-- 门户首页 -->
<template>
	<!-- 容器 -->
	<component ref="component" :is="activeComponent"></component>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import vIndex from '@/modules/sys/index/components/index';
import vAdminIndex from '@/modules/sys/index/components/admin-index';

export default {
	name: 'INDEX',
	data() {
		return {
			open: false
		};
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.handleBeforeRouteEnter();
		});
	},
	methods: {
		/**
		 * 处理路由进入
		 * 1、如果页面打开过，并且不为管理员页面，需要更新数据
		 */
		handleBeforeRouteEnter() {
			if (this.open && this.GET_LOGIN_INFO.roleCode !== 'admin') {
				this.$refs.component.updtaePanelValue();
			}
			this.open = true;
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO]),
		/**
		 * 当前激活的组件
		 */
		activeComponent() {
			return this.GET_LOGIN_INFO.roleCode !== 'admin' ? vIndex : vAdminIndex;
		}
	}
};
</script>
