<!-- 主页面 -->
<template>
	<!-- 容器 -->
	<div class="bs-container">
		<!-- 顶部菜单 -->
		<div class="bs-header fix">
			<!-- 导航 -->
			<div class="bs-header-nav fix">
				<!-- 左侧 产品名称 -->
				<span class="l f28">{{GET_APP_INFO.productName}}</span>
				<!-- 中部 顶部一级菜单组件 -->
				<v-menu-list></v-menu-list>
				<!-- 右侧 日期、用户功能和license菜单以及放大组件 -->
				<v-person-function @menu-click="handlePersonFunClick"></v-person-function>
			</div>
			<!-- 菜单标签组件 -->
			<v-menu-tab ref="menuTab" @count-down-date="handleCountDownDate"></v-menu-tab>
			<!-- 未注册信息以及试用信息提示 -->
			<v-un-regist-tip ref="unregist"></v-un-regist-tip>
		</div>
		<!-- 页面主体区域 -->
		<div class="bs-main">
			<keep-alive :include="GET_CACHED_VIEW">
				<router-view></router-view>
			</keep-alive>
		</div>
		<!-- 搜索组件 -->
		<v-search></v-search>
		<!-- 个人中心弹出框 -->
		<v-person-center ref="personCenter"></v-person-center>
		<!-- 默认设置弹出框 -->
		<v-default-setting ref="defaultSetting"></v-default-setting>
		<!-- 修改密码弹出框 -->
		<v-modify-password ref="modifyPassword"></v-modify-password>
		<!-- license相关组件 -->
		<v-license ref="license"></v-license>
	</div>
</template>
<script>
import fetch from '@/config/fetch';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { ADD_VIEW, GET_CACHED_VIEW, GET_APP_INFO } from '@/store/system';
import { LOGOUT, GET_LOGIN_INFO } from '@/store/login';
import { getMenu } from '@/store/service/system-service';
import vScreenfull from '@/modules/sys/layout/screenfull';
import vSearch from '@/modules/sys/layout/search/index';
import vLicense from '@/modules/sys/layout/license';
import vPersonFunction from '@/modules/sys/layout/person-function';
import vPersonCenter from '@/modules/sys/layout/person-center';
import vDefaultSetting from '@/modules/sys/layout/default-setting';
import vModifyPassword from '@/modules/sys/layout/modify-password';
import vMenuList from '@/modules/sys/layout/menu-list';
import vMenuTab from '@/modules/sys/layout/menu-tab';
import vUnRegistTip from '@/modules/sys/layout/un-regist-tip';
import util from '@/assets/js/util';
import validate from '@/assets/js/validate';

/**
 * 用户下拉菜单选项
 */
export const USER_DROPDOWN = {
	PERSONAL_CENTER: 'PERSONAL_CENTER',
	DEFAULT_SETTING: 'DEFAULT_SETTING',
	MODIFY_PASSWORD: 'MODIFY_PASSWORD',
	VERSION_UPDATE: 'VERSION_UPDATE',
	REGIST_APPLY: 'REGIST_APPLY',
	ABOUT: 'ABOUT',
	USER_LOGOUT: 'USER_LOGOUT'
};

export default {
	components: {
		vScreenfull,
		vSearch,
		vPersonCenter,
		vDefaultSetting,
		vModifyPassword,
		vMenuList,
		vMenuTab,
		vLicense,
		vPersonFunction,
		vUnRegistTip
	},
	data() {
		return {
			USER_DROPDOWN
		};
	},
	watch: {
		$route() {
			this.handleRouteChange();
		}
	},
	methods: {
		...mapActions([LOGOUT]),
		...mapMutations([ADD_VIEW]),
		/**
		 * 获取标签名称
		 */
		getTagName(path, title) {
			let findResult = getMenu().find(e => {
				return e.menuUrl === path;
			});
			return util.isNotEmpty(findResult) ? findResult.menuName : title;
		},
		/**
		 * 处理路由变化，将页面压入缓存栈
		 * 非旗舰版 1.提示信息为显示状态
		 *         2.未注册 显示未注册信息
		 *         3.试用版 取license对应模块的提示信息remind
		 */
		handleRouteChange() {
			let {
				path,
				name,
				meta: { title, cache },
				query
			} = this.$route;
			if (path !== '/index') {
				this.ADD_VIEW({
					path,
					name,
					title: this.getTagName(path, title),
					cache,
					query,
					changed: false
				});
			}
			this.$refs.unregist.doIntercept(path.split('/')[1]);
		},
		/**
		 * 处理用户功能菜单点击
		 * 1、处理用户点击
		 * 2、打开license关于
		 */
		handlePersonFunClick(val, type) {
			if (type === 'person') {
				this.handlePersonCommand(val);
			} else {
				this.$refs.license.open(val);
			}
		},
		/**
		 * 处理用户下拉菜单点击处理
		 */
		handlePersonCommand(val) {
			if (val === USER_DROPDOWN.PERSONAL_CENTER) {
				this.$refs.personCenter.open();
			} else if (val === USER_DROPDOWN.DEFAULT_SETTING) {
				this.$refs.defaultSetting.open();
			} else if (val === USER_DROPDOWN.MODIFY_PASSWORD) {
				this.$refs.modifyPassword.open();
			} else if (val === USER_DROPDOWN.USER_LOGOUT) {
				this.handleLogout();
			}
		},
		/**
		 * 跨年切换日期
		 * 关闭所有菜单页签
		 */
		handleCountDownDate() {
			this.$refs.menuTab.handleCloseAllView();
		},
		/**
		 * 退出登录
		 */
		handleLogout() {
			this.$confirm('确定要退出当前系统？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.LOGOUT().then(() => {
						window.location.reload();
					});
				})
				.catch(() => {});
		},
		isNotEmpty(val) {
			return util.isNotEmpty(val);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CACHED_VIEW, GET_APP_INFO])
	},
	filters: {
		/**
		 * 处理人名太长导致布局错误
		 * */
		userName(val) {
			return val.length >= 12 ? val.slice(0, 12) + '...' : val;
		}
	},
	mounted() {
		this.handleRouteChange();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.bs-container {
	background-color: $--background-color-base;
	.bs-header {
		z-index: 1000;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		min-width: 1000px;
		background-color: $--color-primary;
		user-select: none;
		.bs-header-nav {
			padding: 0 20px 0 40px;
			height: 35px;
			line-height: 35px;
			color: $--color-white;
		}
	}
	.bs-main {
		margin: 0 auto;
		padding: 65px 40px 10px;
		min-width: 1190px;
	}
}
</style>
