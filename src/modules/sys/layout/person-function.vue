<template>
	<div class="fix">
		<!-- 用户功能和license菜单 -->
		<div class="user-menu poi wh r">
			<!-- 操作区域 -->
			<span class="user-operate">
				<el-tooltip placement="bottom" effect="light" popper-class="user-operate-popper">
					<div slot="content">
						<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.PERSONAL_CENTER, 'person')">
							<i class="el-icon-user f14 color-text-primary"> 个人中心</i>
						</div>
						<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.DEFAULT_SETTING, 'person')">
							<i class="el-icon-setting f14 color-text-primary"> 默认设置</i>
						</div>
						<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.MODIFY_PASSWORD, 'person')">
							<i class="el-icon-lock f14 color-text-primary"> 修改密码</i>
						</div>
						<el-divider class="app-header-divider"></el-divider>
						<!-- 旗舰版license菜单 mini版暂时没有 -->
						<div v-if="GET_APP_INFO.edition === APP_EDITION.FLAGSHIP">
							<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.VERSION_UPDATE, 'license')">
								<i class="el-icon-document f14 color-text-primary"> 更新说明</i>
							</div>
							<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.REGIST_APPLY, 'license')" v-if="registerVisible">
								<i class="el-icon-edit-outline f14 color-text-primary"> 申请注册</i>
							</div>
							<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.ABOUT, 'license')">
								<i class="el-icon-warning-outline f14 color-text-primary"> 关于</i>
							</div>
							<el-divider class="app-header-divider"></el-divider>
						</div>
						<div class="user-operate-block poi" @click="handleMenuClick(USER_DROPDOWN.USER_LOGOUT,'person')">
							<i class="el-icon-switch-button f14 color-text-primary"> 退出登录</i>
						</div>
					</div>
					<span>
						{{GET_LOGIN_INFO.userName | userName}}
						<span class="drop-arrow"></span>
					</span>
				</el-tooltip>
			</span>
			<span class='ml5'>
				<v-screenfull></v-screenfull>
			</span>
		</div>
		<!-- 业务日期切换 -->
		<div class="yw-date mr5 r">
			<el-date-picker size="mini" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" :clearable="false" :picker-options="pickerOptions" :editable="false" v-model="transDate" @change="handleDateChange" style="width: 100%;">
			</el-date-picker>
		</div>
	</div>
</template>
<script>
import util from '@/assets/js/util';
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import { GET_APP_INFO } from '@/store/system';
import vScreenfull from '@/modules/sys/layout/screenfull';
import {
	updateDefaultInfoDate,
	updtaeLoginInfoAndGlobalInfo
} from '@/store/service/login-service';
import { APP_EDITION } from '@/assets/js/constant';
import { getMenu } from '@/store/service/system-service';

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
		vScreenfull
	},
	data() {
		return {
			pickerOptions: {
				disabledDate(time) {
					return time.getTime() > Date.now();
				}
			},
			transDate: '',
			USER_DROPDOWN,
			APP_EDITION
		};
	},
	created() {
		this.transDate = this.GET_LOGIN_INFO.transDate;
	},
	methods: {
		/**
		 * 处理用户下拉菜单点击
		 */
		handleMenuClick(val, type) {
			this.$emit('menu-click', val, type);
		},
		/**
		 * 选择日期change事件
		 * 改变后判断年度有无变化
		 * 1、无变化：修改默认信息中时间信息
		 * 2、有变化非本年度：重新获取单位账套信息及该年度的默认信息
		 *                   触发事件让父组件关闭菜单标签页
		 */
		handleDateChange(val) {
			let currentTransDateYear = util.getDateInfo(val).year;
			if (currentTransDateYear === this.GET_LOGIN_INFO.fiscal) {
				updateDefaultInfoDate(val);
			} else {
				this.$confirm(
					'切换业务时间跨年，将重新载入页面获取系统数据！',
					'提示',
					{
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}
				)
					.then(() => {
						this.$loading();
						updtaeLoginInfoAndGlobalInfo(this.transDate)
							.then(() => {
								this.$emit('count-down-date');
								window.location.reload();
							})
							.catch(({ msg }) => {
								this.$loadingClose();
								this.$message({
									type: 'error',
									message: msg
								});
								this.transDate = this.GET_LOGIN_INFO.transDate;
							});
					})
					.catch(() => {
						this.transDate = this.GET_LOGIN_INFO.transDate;
					});
			}
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_APP_INFO]),
		/**
		 * 注册申请是否显示（判断是否有加密注册的权限）
		 */
		registerVisible() {
			let findResult = getMenu().find(e => e.menuId === 'PA_LICENSE');
			return util.isNotEmpty(findResult);
		}
	},
	filters: {
		/**
		 * 处理人名太长导致布局错误
		 * */
		userName(val) {
			return val.length >= 12 ? val.slice(0, 12) + '...' : val;
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.user-operate {
	margin-right: 10px;
	.drop-arrow {
		display: inline-block;
		width: 0px;
		height: 0px;
		border-color: $--color-ffffff transparent;
		border-width: 0 0 6px 6px;
		border-style: solid;
	}
}
.user-operate-popper {
	border: none !important;
	box-shadow: $--box-shadow-base;
	.user-operate-block {
		height: 40px;
		line-height: 40px;
		padding: 2px 10px;
		&:hover {
			background-color: $--select-option-hover-background;
		}
	}
	.el-divider {
		margin: 0;
	}
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.user-menu {
	line-height: 35px;
}
.yw-date {
	width: 80px;
	/deep/ input {
		padding: 0;
		border: 0;
		color: #fff;
		background: transparent;
		cursor: pointer;
	}
	/deep/ .el-input__prefix {
		display: none;
	}
	/deep/ .el-input .el-input__inner:hover {
		border: none;
	}
}
</style>
