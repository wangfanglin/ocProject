<template>
	<router-view></router-view>
</template>
<script>
import { mapActions } from 'vuex';
import { SET_APP_INFO, SET_LICENSE_INFO } from '@/store/system';
import { APP_EDITION, SWITCH } from '@/assets/js/constant';

export default {
	methods: {
		...mapActions([SET_APP_INFO, SET_LICENSE_INFO]),
		/**
		 * 初始化产品和license信息
		 * 1.获取产品信息
		 * 2.旗舰版 获取license信息
		 *          未注册 title添加未注册字样
		 */
		async initApp() {
			try {
				let appInfo = await this.SET_APP_INFO();
				document.title = appInfo.productName;
				if (appInfo.edition === APP_EDITION.FLAGSHIP) {
					let licenseInfo = await this.SET_LICENSE_INFO();
					if (licenseInfo.isRegist === SWITCH.ACTIVE) {
						document.title = `（未注册）${appInfo.productName}`;
					}
				}
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		}
	},
	mounted() {
		this.initApp();
	}
};
</script>
<style scoped>
</style>
