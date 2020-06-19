<!-- 密码登录 -->
<template>
	<!-- 容器 -->
	<div class="password-container">
		<el-form ref="form" size="medium" :model="form" :rules="formRules" label-width="0">
			<!-- 用户名 -->
			<el-form-item label="" prop="username">
				<el-input ref="username" v-model.trim="form.username" placeholder="输入用户名（2-30位字符）" autocomplete="on" :maxlength="30" @focus="handleFocus" @keyup.enter.native="handleKeyupEnter('password')">
					<i slot="prefix" class="el-icon-user el-input__icon"></i>
				</el-input>
			</el-form-item>
			<!-- 密码 -->
			<el-form-item label="" prop="password">
				<el-input ref="password" type="password" v-model.trim="form.password" placeholder="输入密码（6-20位字符）" autocomplete="on" :maxlength="20" :show-password="true" @focus="handleFocus" @keyup.enter.native="handleKeyupEnter(checkCaptcha ? 'verificationCode' : '')">
					<i slot="prefix" class="el-icon-lock el-input__icon"></i>
				</el-input>
			</el-form-item>
			<!-- 验证码 -->
			<el-form-item label="" prop="verificationCode" v-if="checkCaptcha">
				<el-input ref="verificationCode" v-model.trim="form.verificationCode" placeholder="输入验证码（4位字符）" :maxlength="4" @focus="handleFocus" @keyup.enter.native="handleKeyupEnter()" style="width: calc(100% - 71px)">
					<i slot="prefix" class="el-icon-circle-check el-input__icon"></i>
				</el-input>
				<canvas ref="canvas" class="poi r" width="70" height="34" @click.stop.prevent="getVerificationCode"></canvas>
			</el-form-item>
			<!-- 登录按钮 -->
			<el-button class="pct100" type="primary" size="medium" :loading="loading" @click.prevent="handleLogin" style="margin-top: 10px;">登录</el-button>
		</el-form>
	</div>
</template>
<script>
import md5 from 'blueimp-md5';
import { Base64 } from 'js-base64';
import { mapActions } from 'vuex';
import { LOGIN } from '@/store/login';
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import fetch from '@/config/fetch';
import { STORAGE_KEY } from '@/assets/js/constant';
import validate from '@/assets/js/validate';
import util from '@/assets/js/util';

export default {
	props: {
		checkCaptcha: {
			type: Boolean,
			default: false
		}
	},
	data() {
		let validateUsername = (rule, value, callback) => {
			if (validate.validateUsername(value)) {
				callback();
			} else {
				callback(new Error('用户名需为2-30位字符'));
			}
		};
		let validatorVerificationCode = (rule, value, callback) => {
			if (value.length === 4) {
				callback();
			} else {
				callback(new Error('验证码不对'));
			}
		};
		return {
			loading: false,
			form: {
				username: '',
				password: '',
				key: '',
				verificationCode: ''
			},
			formRules: {
				username: [
					{ required: true, message: '请输入用户名', trigger: 'blur' },
					{ validator: validateUsername, trigger: 'blur' }
				],
				password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
				verificationCode: [
					{ required: true, message: '请输入验证码', trigger: 'blur' },
					{ validator: validatorVerificationCode, trigger: 'blur' }
				]
			}
		};
	},
	created() {
		this.form.username = LOCAL_STORAGE.get(STORAGE_KEY.USER_CODE);
	},
	watch: {
		checkCaptcha(value) {
			this.getVerificationCode();
		}
	},
	methods: {
		...mapActions([LOGIN]),
		/**
		 * 获取验证码
		 */
		getVerificationCode() {
			if (!this.checkCaptcha) {
				return;
			}
			fetch
				.get('/pa/captcha')
				.then(({ data: { key, verificationCode } }) => {
					this.form.key = key;
					this.fillVerificationCode(verificationCode);
				})
				.catch(err => {
					console.error(err);
					this.$message({
						type: 'error',
						message: '验证码获取失败，请稍后重试！'
					});
				});
		},
		/**
		 * 处理输入框focus事件
		 */
		handleFocus(event) {
			event.target.select();
		},
		/**
		 * 处理输入框keyupEnter事件
		 */
		handleKeyupEnter(nextProp) {
			if (util.isNotEmpty(nextProp)) {
				this.$refs[nextProp].focus();
			} else {
				this.handleLogin();
			}
		},
		/**
		 * 处理登录
		 * 1、校验表单
		 * 2、构建参数
		 */
		async handleLogin() {
			try {
				let valid = await this.validateForm();
				if (!valid) {
					return false;
				}
				this.loading = true;
				let loginInfo = await this.LOGIN(this.buildParams());
				this.$emit('login-success', loginInfo);
			} catch (err) {
				console.error(err);
				this.getVerificationCode();
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
		 * 填充验证码
		 */
		fillVerificationCode(value) {
			let canvas = this.$refs.canvas;
			let ctx = canvas.getContext('2d');
			let img = new Image();
			img.src = value;
			img.onload = function() {
				ctx.drawImage(img, 0, 0);
			};
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
			let result = {
				username: Base64.encode(this.form.username),
				password: md5(this.form.password)
			};
			if (this.checkCaptcha) {
				result.key = this.form.key;
				result.verificationCode = this.form.verificationCode;
			}
			return result;
		}
	},
	/**
	 * 获取验证码
	 */
	mounted() {
		this.getVerificationCode();
	}
};
</script>
<style lang="scss" scoped>
.password-container {
	padding: 20px;
}
</style>
