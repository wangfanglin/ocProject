<!-- 未注册或者试用提示 -->
<template>
	<!-- 容器 -->
	<div class="un-regist-container" v-if="visible">
		<!-- 未注册提示信息 -->
		<div class="un-register-tip" v-if="unRegister">{{GET_APP_INFO.unregisteredMoudleMsg}}</div>
		<!-- 试用版提示信息 -->
		<div class="trial-tip" v-if="isNotEmpty(trialMessage)">{{trialMessage}}</div>
		<i class="el-icon-circle-close poi" @click="visible = false"></i>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_APP_INFO, GET_LICENSE_INFO } from '@/store/system';
import { APP_EDITION } from '@/assets/js/constant';
import util from '@/assets/js/util';

export default {
	data() {
		return {
			visible: false,
			unRegister: false,
			trialMessage: ''
		};
	},
	methods: {
		/**
		 * 判断系统版本
		 */
		doIntercept(currentModule) {
			if (this.GET_APP_INFO.edition === APP_EDITION.FLAGSHIP) {
				let moduleInfo = this.GET_LICENSE_INFO.moduleInfo;
				if (moduleInfo.hasOwnProperty(currentModule)) {
					let version = moduleInfo[currentModule].version;
					this.visible = version !== '旗舰版';
					this.unRegister = version === '未注册';
					this.trialMessage =
						version === '试用版' ? moduleInfo[currentModule].remind : '';
				} else {
					this.visible = false;
					this.unRegister = false;
					this.trialMessage = '';
				}
			}
		},
		isNotEmpty(val) {
			return util.isNotEmpty(val);
		}
	},
	computed: {
		...mapGetters([GET_APP_INFO, GET_LICENSE_INFO])
	}
};
</script>
<style  lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.un-regist-container {
	position: fixed;
	z-index: 1000;
	top: 40px;
	right: 25px;
	.un-register-tip,
	.trial-tip {
		height: 26px;
		font-size: 18px;
		color: $--color-fadb14;
	}
	i {
		color: $--color-fadb14;
		position: absolute;
		right: -17px;
		top: -7px;
	}
}
</style>
