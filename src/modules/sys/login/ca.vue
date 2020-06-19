<!-- CA登录 -->
<template>
	<!-- 容器 -->
	<div class="ca-container">
		<el-form ref="form" id="caForm" size="medium" :model="form" :rules="formRules" label-width="0">
			<!-- 用户 -->
			<el-form-item label="" prop="userListCa">
				<!-- 用户列表 -->
				<div class="ca-user-list">
					<i class="el-icon-user el-input__icon"></i>
					<select id="UserListCa" name="UserListCa" @change="handleUserListCaChange">
					</select>
				</div>
			</el-form-item>
			<!-- 密码 -->
			<el-form-item label="" prop="password">
				<el-input ref="password" type="password" v-model.trim="form.password" placeholder="输入密码" autocomplete="on" :show-password="true">
					<i slot="prefix" class="el-icon-lock el-input__icon"></i>
				</el-input>
			</el-form-item>
			<!-- 隐藏表单 -->
			<input id="UserSignedData" name="UserSignedData" v-show="false">
			<input id="UserCert" name="UserCert" v-show="false">
			<input id="ContainerName" name="ContainerName" v-show="false">
			<input id="strRandom" name="strRandom" v-show="false">
			<!-- 登录按钮 -->
			<el-button class="pct100" type="primary" size="medium" :loading="loading" @click.prevent="handleLogin" style="margin-top: 10px;">登录</el-button>
		</el-form>
	</div>
</template>
<script>
import $ from 'jquery';
import { mapActions } from 'vuex';
import { CA_LOGIN } from '@/store/login';
import { init, destroy, SetUserCertList, Login } from '@/assets/js/ca';
import fetch from '@/config/fetch';
import util from '@/assets/js/util';

export default {
	props: {},
	data() {
		return {
			loading: false,
			form: {
				userListCa: '',
				password: ''
			},
			formRules: {
				userListCa: [
					{ required: true, message: '请插入UKey', trigger: 'blur' }
				],
				password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
			}
		};
	},
	methods: {
		...mapActions([CA_LOGIN]),
		/**
		 * 获取配置
		 */
		getConfig() {
			fetch
				.get('/pa/ca_login_param')
				.then(({ data }) => {
					let { strSignedData, strRandom, strServerCert } = data;
					SetUserCertList(
						'UserListCa',
						1,
						strSignedData,
						strRandom,
						strServerCert
					);
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
		 * 处理登录
		 * 1、校验表单
		 * 2、调用CA登录
		 * 3、构建参数
		 * 4、登录系统
		 */
		async handleLogin() {
			try {
				this.form.userListCa = $('#UserListCa').val();
				let valid = await this.validateForm();
				if (!valid) {
					return false;
				}
				this.loading = true;
				Login('caForm', this.form.userListCa, this.form.password);
				let params = await this.buildParams();
				let loginInfo = await this.CA_LOGIN(params);
				this.$emit('login-success', loginInfo);
			} catch (err) {
				console.error(err);
				let errMsg = util.isNotEmpty(err.msg)
					? err.msg
					: '登录异常，请稍后重试！';
				this.$message({
					type: 'error',
					message: errMsg
				});
			} finally {
				this.loading = false;
			}
		},
		/**
		 * 处理用户下拉框选择
		 */
		handleUserListCaChange() {
			this.form.userListCa = $('#UserListCa').val();
			this.$refs.form.validateField('userListCa');
		},
		/**
		 * 校验表单
		 */
		validateForm() {
			return new Promise(resolve => {
				this.$refs.form.validate(valid => {
					if (valid) {
						return resolve(true);
					} else {
						return resolve(false);
					}
				});
			});
		},
		/**
		 * 构建参数
		 */
		buildParams() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					let result = {
						userSignedData: $('#UserSignedData').val(),
						userCert: $('#UserCert').val(),
						containerName: $('#ContainerName').val(),
						strRandom: $('#strRandom').val()
					};
					let validate = Object.values(result).every(e => util.isNotEmpty(e));
					if (validate) {
						return resolve(result);
					} else {
						return reject({ msg: 'CA登录失败！' });
					}
				}, 500);
			});
		}
	},
	mounted() {
		init();
		this.getConfig();
	},
	beforeDestroy() {
		destroy();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.ca-container {
	padding: 20px;
	.ca-user-list {
		width: 100%;
		height: 36px;
		line-height: 36px;
		padding-left: 30px;
		border: 1px solid $--color-c0c4cc;
		border-radius: $--input-border-radius;
		outline: none;
		box-sizing: border-box;
		position: relative;
		&:hover {
			border-color: $--color-909399;
		}
		.el-input__icon {
			line-height: 36px;
			position: absolute;
			left: 4px;
			color: $--color-c0c4cc;
		}
		#UserListCa {
			width: 100%;
			height: 34px;
			line-height: 34px;
			vertical-align: top;
			outline: 0;
			background-color: $--color-white;
			border: none;
			font-size: inherit;
			/* --火狐、谷歌清除--*/
			appearance: none;
			-moz-appearance: none;
			-webkit-appearance: none;
			/* ie清除 */
			&::-ms-expand {
				display: none;
			}
			option::-ms-expand {
				display: none;
			}
			option {
				-moz-appearance: none; //Firefox
				-webkit-appearance: none; //Safari 和 Chrome
				appearance: none;
			}
			option:hover {
				color: $--color-white;
				background-color: $--color-white;
			}
		}
	}
}
</style>
