<!-- 登录页 -->
<template>
	<!-- 容器 -->
	<div class="login-container" :class="backgroundImageClass">
		<!-- 标题 -->
		<div class="login-title" :style="{'color': titleColor}">
			{{GET_APP_INFO.productName}}
		</div>
		<!-- 资源下载 -->
		<span class="login-resource" @click="handleDownloadResource">资源下载</span>
		<!-- 主体区域 -->
		<div class="login-main" :class="{'width-300': !checkCaptcha, 'width-320': checkCaptcha}">
			<span class="login-no-license" v-if="GET_LICENSE_INFO.isRegist === SWITCH.ACTIVE"><i class="fa fa-lightbulb-o mr5"></i>{{GET_APP_INFO.unregisteredPtyMsg}}</span>
			<!-- 主体区域头部 -->
			<div class="login-main-head">
				<i class="fa fa-skyatlas f16 ml10" v-if="!mutipleLogin"> 欢迎登录</i>
				<!-- 切换登录类型 -->
				<template v-else>
					<div class="login-main-head-type" :class="{'is-active': loginType === LOGIN_TYPE.PASS_WORD}" @click="handleLoginTypeChange(LOGIN_TYPE.PASS_WORD)">密码登录</div>
					<el-divider direction="vertical"></el-divider>
					<div class="login-main-head-type" :class="{'is-active': loginType === LOGIN_TYPE.CA}" @click="handleLoginTypeChange(LOGIN_TYPE.CA)">CA登录</div>
				</template>
			</div>
			<!-- 主体区域内容 -->
			<keep-alive>
				<component :is="activeComponent" :check-captcha="checkCaptcha" @login-success="handleLoginSuccess"></component>
			</keep-alive>
		</div>
		<!-- 版权信息 -->
		<div class="login-copyright" v-if="isNotEmpty(GET_APP_INFO.copyRight)">
			Copyright <i class="fa fa-copyright "> {{GET_APP_INFO.copyRight}}</i>
		</div>
		<!-- 资源下载 -->
		<v-resource ref="resource" :mutiple-login="mutipleLogin"></v-resource>
		<!-- 修改密码 -->
		<v-modify-password ref="modifyPassword"></v-modify-password>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { GET_APP_INFO, GET_LICENSE_INFO } from '@/store/system';
import vPassword from '@/modules/sys/login/password';
import vCa from '@/modules/sys/login/ca';
import vResource from '@/modules/sys/login/resource';
import vModifyPassword from '@/modules/sys/login/modify-password';
import { getMenu } from '@/store/service/system-service';
import { openMenu } from '@/store/service/system-service';
import fetch from '@/config/fetch';
import { SWITCH } from '@/assets/js/constant';
import util from '@/assets/js/util';

/**
 * 登陆类型（密码，CA证书）
 */
const LOGIN_TYPE = {
	PASS_WORD: 'PASS_WORD',
	CA: 'CA'
};

export default {
	name: 'LOGIN',
	components: {
		vResource,
		vModifyPassword
	},
	data() {
		return {
			loginType: LOGIN_TYPE.PASS_WORD,
			mutipleLogin: false,
			checkCaptcha: false,
			LOGIN_TYPE,
			SWITCH
		};
	},
	methods: {
		/**
		 * 获取配置（是否校验验证码、是否具有多种登录方式）
		 */
		getConfig() {
			fetch
				.get('/pa/sys/ptyInfo')
				.then(({ data }) => {
					this.mutipleLogin = data.caLogin;
					this.checkCaptcha = data.checkCaptcha;
				})
				.catch(err => {
					console.error(err);
					this.$message({
						type: 'error',
						message: err.msg
					});
				});
		},
		/**
		 * 获取跳转url
		 */
		getRedirectUrl(menuList) {
			return new Promise((resolve, reject) => {
				fetch
					.post('/mad/acb/skip', {
						hasMadAcb: getMenu().some(e => {
							return e.menuId === 'MAD_ACB';
						}),
						fiscal: this.GET_LOGIN_INFO.fiscal,
						agyCode: this.GET_CONTEXT_AGY_ACB.agyCode,
						roleCode: this.GET_LOGIN_INFO.roleCode
					})
					.then(({ data }) => {
						return resolve(data);
					})
					.catch(() => {
						return resolve('INDEX');
					});
			});
		},
		/**
		 * 处理改变登录类型
		 */
		handleLoginTypeChange(value) {
			this.loginType = value;
		},
		/**
		 * 处理登录成功
		 * 1、获取登录url
		 * 2、判断当前登录类型，密码登录时需要判断是否需要强制修改密码
		 */
		async handleLoginSuccess(loginInfo) {
			try {
				let menuId = await this.getRedirectUrl(loginInfo.menuList);
				if (this.loginType === LOGIN_TYPE.PASS_WORD) {
					if (loginInfo.isDefaultPwd === SWITCH.ACTIVE) {
						this.$refs.modifyPassword.open(() => {
							this.handleToTargetMenu(menuId);
						});
					} else {
						this.handleToTargetMenu(menuId);
					}
				} else {
					this.handleToTargetMenu(menuId);
				}
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * 处理菜单跳转，判断该菜单是否带有参数，如果带有参数，则先将参数做存储操作
		 */
		handleToTargetMenu(menuId) {
			if (menuId === 'GAL-GUIDE') {
				this.$router.push('/gal-guide');
			} else if (menuId === 'INDEX') {
				this.$router.push('/index');
			} else {
				let findResult = getMenu().find(e => {
					return e.menuId === menuId;
				});
				if (util.isEmpty(findResult)) {
					this.$router.push('/index');
        } else {
          openMenu(findResult);
        }
			}
		},
		/**
		 * 处理资源下载
		 */
		handleDownloadResource() {
			this.$refs.resource.open();
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		}
	},
	computed: {
		...mapGetters([
			GET_LOGIN_INFO,
			GET_CONTEXT_AGY_ACB,
			GET_APP_INFO,
			GET_LICENSE_INFO
		]),
		/**
		 * 背景图片类名
		 */
		backgroundImageClass() {
			return util.isEmpty(this.GET_APP_INFO.loginImage)
				? ''
				: `login-image-${this.GET_APP_INFO.loginImage}`;
		},
		/**
		 * 标题颜色
		 */
		titleColor() {
			return util.isNotEmpty(this.GET_APP_INFO.loginTitleColor)
				? this.GET_APP_INFO.loginTitleColor
				: '#303133';
		},
		/**
		 * 激活的组件
		 */
		activeComponent() {
			return this.loginType === LOGIN_TYPE.PASS_WORD ? vPassword : vCa;
		}
	},
	/**
	 * 页面加载完成
	 * 1、获取登录配置
	 * 2、检测浏览器版本
	 */
	mounted() {
		this.getConfig();
		this.$refs.resource.checkBrowserVision();
	}
};
</script>
<style lang="scss">
.login-image-1 {
	background-image: url('~@/assets/img/login-bg-1.png');
}
.login-image-2 {
	background-image: url('~@/assets/img/login-bg-2.png');
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.login-container {
	width: 100%;
	height: 100vh;
	background-repeat: no-repeat;
	background-position: center 0;
	background-size: cover;
	position: relative;
	.login-title {
		position: absolute;
		top: 7%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 48px;
		letter-spacing: 2px;
	}
	.login-resource {
		position: absolute;
		top: 10px;
		right: 20px;
		font-size: 13px;
		color: $--color-text-primary;
		&:hover {
			cursor: pointer;
			text-decoration: underline;
		}
	}
	.login-main {
		width: 350px;
		position: absolute;
		right: 10%;
		top: 41%;
		transform: translateY(-41%);
		box-sizing: border-box;
		background-color: $--color-white;
		border-radius: $--border-radius-base;
		box-shadow: $--box-shadow-light;
		&.width-300 {
			height: 300px;
		}
		&.width-320 {
			height: 320px;
		}
		.login-no-license {
			font-size: 18px;
			color: $--color-ff3600;
			position: absolute;
			top: -30px;
		}
		.login-main-head {
			height: 50px;
			line-height: 30px;
			padding: 10px;
			box-sizing: border-box;
			.login-main-head-type {
				width: 150px;
				display: inline-block;
				text-align: center;
				font-size: 15px;
				color: $--color-text-regular;
				cursor: pointer;
				&.is-active {
					color: $--color-primary;
				}
			}
		}
	}
	.login-copyright {
		position: absolute;
		bottom: 2%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 13px;
		color: $--color-text-regular;
	}
}
</style>
