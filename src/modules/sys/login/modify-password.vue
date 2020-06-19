<!-- 强制修改密码 -->
<template>
	<!-- 容器 -->
	<el-dialog class="modify-password" :visible.sync="visible" width="1000px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" v-draggable>
		<span slot="title">
			<i class="fa fa-pencil-square-o b"> 修改初始密码</i>
		</span>
		<div class="modify-password-tip">
			<i class="el-icon-warning f18"> 安全提示</i>
			<div class="f12">为了保证您的账户安全，请务必修改您的初始密码！</div>
		</div>
		<el-form ref="form" :model="form" :rules="formRules" label-width="120px" size="small">
			<el-form-item label="原密码：" prop="oldPassword">
				<el-input type="password" v-model.trim="form.oldPassword" :show-password="true" :maxlength="20" placeholder="输入原密码"></el-input>
			</el-form-item>
			<el-form-item label="新密码：" prop="newPassword">
				<el-input type="password" v-model.trim="form.newPassword" :show-password="true" :maxlength="20" placeholder="输入新密码，6-20位字符"></el-input>
			</el-form-item>
			<el-form-item label="确认新密码：" prop="confirmPassword">
				<el-input type="password" v-model.trim="form.confirmPassword" :show-password="true" :maxlength="20" placeholder="再次输入新密码"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button type="primary" size="small" @click="handleSave">保存</el-button>
		</div>
	</el-dialog>
</template>
<script>
import md5 from 'blueimp-md5';
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import fetch from '@/config/fetch';
import validate from '@/assets/js/validate';
import { GET_APP_INFO } from '@/store/system';
import util from '@/assets/js/util';
export default {
	data() {
		let validatePassword = (rule, value, callback) => {
			let pwdLevel = util.isNotEmpty(this.GET_APP_INFO.pwdLevel)
				? this.GET_APP_INFO.pwdLevel
				: 1;
			if (pwdLevel === 1) {
				if (validate.validateNumberPassword(value)) {
					callback();
				} else {
					callback(new Error('密码6 - 20位，且为纯数字'));
				}
			} else if (pwdLevel === 2) {
				if (validate.validatePassword(value)) {
					callback();
				} else {
					callback(new Error('密码6 - 20位，且至少同时存有数字和字母'));
				}
			} else {
				if (value.length >= 6 && value.length <= 20) {
					callback();
				} else {
					callback(new Error('密码6 - 20位'));
				}
			}
		};
		let validatorConfirmPassword = (rule, value, callback) => {
			if (util.isNotEmpty(this.form.newPassword)) {
				if (this.form.confirmPassword === this.form.newPassword) {
					callback();
				} else {
					callback(new Error('两次密码输入不一致'));
				}
			} else {
				callback();
			}
		};
		return {
			visible: false,
			callback: null,
			form: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			formRules: {
				oldPassword: [
					{ required: true, message: '请输入原密码', trigger: 'blur' }
				],
				newPassword: [
					{ required: true, message: '请输入新密码', trigger: 'blur' },
					{ validator: validatePassword, trigger: 'blur' }
				],
				confirmPassword: [
					{ required: true, message: '请再次输入新密码', trigger: 'blur' },
					{ validator: validatorConfirmPassword, trigger: 'blur' }
				]
			}
		};
	},
	methods: {
		/**
		 * 处理弹出框打开
		 */
		open(callback) {
			this.visible = true;
			this.callback = callback;
		},
		/**
		 * 处理保存
		 */
		handleSave() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.$loading();
					fetch
						.post('/pa/user/modifyPassword', {
							userCode: this.GET_LOGIN_INFO.userCode,
							opassword: md5(this.form.oldPassword),
							password: md5(this.form.newPassword)
						})
						.then(({ msg }) => {
							this.$loadingClose();
							this.$message({
								type: 'success',
								message: msg
							});
							this.visible = false;
							this.callback();
						})
						.catch(err => {
							this.$loadingClose();
							console.error(err);
							this.$message({
								type: 'error',
								message: err.msg
							});
						});
				} else {
					return false;
				}
			});
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_APP_INFO])
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.modify-password {
	/deep/ .el-dialog__body {
		padding: 0 30%;
	}
	.modify-password-tip {
		text-align: center;
		line-height: 32px;
		padding-bottom: 20px;
		color: $--color-warning;
	}
}
</style>
