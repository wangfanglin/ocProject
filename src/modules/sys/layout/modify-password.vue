<!-- 修改密码弹出框 -->
<template>
	<!-- 容器 -->
	<el-dialog :visible.sync="visible" @close="handleClose" width="500px" v-draggable :close-on-click-modal="false">
		<span slot="title">
			<i class="fa fa-pencil-square-o b"> 修改密码</i>
		</span>
		<!-- 表单信息 -->
		<el-form ref="form" :model="form" :rules="formRules" label-width="120px" size="small">
			<el-form-item label="原密码：" prop="oldPassword">
				<el-input type="password" :show-password="true" v-model.trim="form.oldPassword" :maxlength="20" placeholder="输入原密码"></el-input>
			</el-form-item>
			<el-form-item label="新密码：" prop="newPassword">
				<el-input type="password" :show-password="true" v-model.trim="form.newPassword" :maxlength="20" placeholder="输入新密码，6-20位字符"></el-input>
			</el-form-item>
			<el-form-item label="确认新密码：" prop="confirmPassword">
				<el-input type="password" :show-password="true" v-model.trim="form.confirmPassword" :maxlength="20" placeholder="再次输入新密码"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="visible = false" size="small">取消</el-button>
			<el-button type="primary" @click="handleSave" size="small">保存</el-button>
		</div>
	</el-dialog>
</template>
<script>
import md5 from 'blueimp-md5';
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import { GET_APP_INFO } from '@/store/system';
import util from '@/assets/js/util';
import validate from '@/assets/js/validate';
import fetch from '@/config/fetch';

export default {
	data() {
		const validatePassword = (rule, value, callback) => {
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
		const validatorConfirmPassword = (rule, value, callback) => {
			if (this.form.confirmPassword === this.form.newPassword) {
				callback();
			} else {
				callback(new Error('两次密码输入不一致'));
			}
		};
		return {
			visible: false,
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
		 * 打开修改密码弹出框
		 */
		open() {
			this.visible = true;
		},
		/**
		 * 处理修改密码保存
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
						})
						.catch(({ msg }) => {
							this.$loadingClose();
							this.$message({
								type: 'error',
								message: msg
							});
						});
				} else {
					return false;
				}
			});
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.$refs.form.resetFields();
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_APP_INFO])
	}
};
</script>
