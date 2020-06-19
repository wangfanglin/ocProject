<!-- 个人中心弹出框 -->
<template>
	<!-- 容器 -->
	<el-dialog class="person-center-dialog" :visible.sync="visible" width="550px" v-draggable @close="handleClose" :close-on-click-modal="false">
		<span slot="title">
			<i class="fa fa-user-o b"> 个人中心</i>
		</span>
		<!-- 表单信息 -->
		<el-form ref="form" :model="form" :rules="formRules" label-width="100px" size="small">
			<el-row>
				<el-col :span="10">
					<!-- 图像区域 -->
					<el-upload :action="uploadUrl" :headers="uploadHeaders" :data="uploadData" :show-file-list="false" :on-success="handleUploadSuccess" :on-error="handleUploadError" :before-upload="handleBeforeUpload">
						<img v-if="form.imageUrl" :src="form.imageUrl" class="upload-img">
						<i v-else class="el-icon-upload uploader-icon"></i>
					</el-upload>
				</el-col>
				<el-col :span="14" class="mt20">
					<el-form-item label="用户名：" prop="userCode">
						<el-input v-model="form.userCode" readonly></el-input>
					</el-form-item>
					<el-form-item label="真实姓名：" prop="userName">
						<el-input v-model.trim="form.userName" placeholder="输入真实姓名"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="邮箱:" prop="email">
				<el-input v-model.trim="form.email" placeholder="输入邮箱"></el-input>
			</el-form-item>
			<el-form-item label="手机号：" prop="mobile">
				<el-input v-model.trim="form.mobile" placeholder="输入手机号"></el-input>
			</el-form-item>
			<el-form-item label="身份证号：" prop="idCode">
				<el-input v-model.trim="form.idCode" placeholder="输入身份证号"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button size="small" @click="visible = false">取消</el-button>
			<el-button size="small" type="primary" @click="handleSave">保存</el-button>
		</div>
	</el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import {
	GET_LOGIN_INFO,
	SET_LOGIN_INFO,
	GET_TOKEN,
	GET_CONTEXT_AGY_ACB
} from '@/store/login';
import { CONTEXT_PATH } from '@/assets/js/constant';
import validate from '@/assets/js/validate';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

export default {
	data() {
		const validateEmail = (rule, value, callback) => {
			if (util.isNotEmpty(value)) {
				if (validate.validateEmail(value)) {
					callback();
				} else {
					callback(new Error('邮箱格式不对'));
				}
			} else {
				callback();
			}
		};
		const validateMobile = (rule, value, callback) => {
			if (util.isNotEmpty(value)) {
				if (validate.validateMobile(value)) {
					callback();
				} else {
					callback(new Error('手机号格式不对'));
				}
			} else {
				callback();
			}
		};
		const validateIdCode = (rule, value, callback) => {
			if (util.isNotEmpty(value)) {
				if (validate.validateIdCode(value)) {
					callback();
				} else {
					callback(new Error('身份证号格式不对'));
				}
			} else {
				callback();
			}
		};
		return {
			visible: false,
			form: {
				userCode: '',
				userName: '',
				email: '',
				mobile: '',
				idCode: '',
				imageUrl: ''
			},
			formRules: {
				userName: [
					{ required: true, message: '请输入真实姓名', trigger: 'blur' }
				],
				email: [{ validator: validateEmail, trigger: 'blur' }],
				mobile: [{ validator: validateMobile, trigger: 'blur' }],
				idCode: [{ validator: validateIdCode, trigger: 'blur' }]
			},
			uploadUrl: CONTEXT_PATH + '/pa/mix/userImage/upload',
			uploadHeaders: {},
			uploadData: {
				userCode: '',
				imageContentType: ''
			}
		};
	},
	methods: {
		...mapMutations([SET_LOGIN_INFO]),
		/**
		 * 打开个人中心弹出框
		 * 1、给用户名赋值
		 * 2、获取用户信息
		 */
		open() {
			util.copyProperties(this.form, this.GET_LOGIN_INFO);
			this.visible = true;
			this.getUserInfo();
		},
		/**
		 * 获取用户信息
		 */
		getUserInfo() {
			fetch
				.get('/pa/user/info', {
					params: {
						userCode: this.form.userCode
					}
				})
				.then(({ data }) => {
					let { email, mobileNo, identityCode, userImageBase64 } = data;
					this.form.email = email;
					this.form.mobile = mobileNo;
					this.form.idCode = identityCode;
					this.form.imageUrl = userImageBase64;
				})
				.catch(({ msg }) => {
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 个人中心保存
		 * 1、刷新缓存个人信息
		 */
		handleSave() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.$loading();
					fetch
						.post('/pa/user/info', {
							email: this.form.email,
							mobileNo: this.form.mobile,
							identityCode: this.form.idCode,
							userCode: this.form.userCode,
							userName: this.form.userName,
							agyCode: this.GET_CONTEXT_AGY_ACB.agyCode,
							fiscal: this.GET_LOGIN_INFO.fiscal
						})
						.then(({ msg }) => {
							this.$loadingClose();
							this.$message({
								type: 'success',
								message: msg
							});
							let loginInfo = _.cloneDeep(this.GET_LOGIN_INFO);
							loginInfo.userName = this.form.userName;
							this.SET_LOGIN_INFO(loginInfo);
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
		 * 弹出框关闭
		 */
		handleClose() {
			this.$refs.form.resetFields();
			this.form.imageUrl = '';
			this.visible = false;
		},
		/**
		 * 图像上传前
		 * 1、校验文件格式和大小 设置token
		 */
		handleBeforeUpload({ type, size }) {
			let isImage = validate.validateImageType(type);
			let isLt2M = validate.validateFileSize(size, 2);
			if (!isImage) {
				this.$message({
					type: 'error',
					message: '上传附件只能是图片格式！'
				});
			}
			if (!isLt2M) {
				this.$message({
					type: 'error',
					message: '上传附件大小不能超过 2MB！'
				});
			}
			if (isImage && isLt2M) {
				this.uploadData.userCode = this.form.userCode;
				this.uploadData.imageContentType = type;
				this.$set(this.uploadHeaders, 'Authorization', this.GET_TOKEN);
			}
			return isImage && isLt2M;
		},
		/**
		 * 图像上传成功
		 */
		handleUploadSuccess({ code, data, msg }) {
			if (code === '200') {
				this.$message({
					type: 'success',
					message: msg
				});
				this.form.imageUrl = data;
			} else {
				this.$message({
					type: 'error',
					message: msg
				});
			}
		},
		/**
		 * 处理上传错误
		 */
		handleUploadError() {
			this.$message({
				type: 'error',
				message: '上传失败，请稍后重试！'
			});
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_TOKEN, GET_CONTEXT_AGY_ACB])
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.person-center-dialog {
	/deep/ .el-upload {
		position: relative;
		overflow: hidden;
		margin-left: 25px;
		border: 1px dashed $--color-c0c4cc;
		border-radius: 6px;
		cursor: pointer;
	}
	/deep/ .el-upload:hover {
		border-color: $--color-primary;
	}
	.uploader-icon {
		width: 180px;
		height: 130px;
		line-height: 130px;
		font-size: 28px;
		color: $--color-text-secondary;
		text-align: center;
	}
	.upload-img {
		display: block;
		width: 120px;
		height: 90px;
	}
}
</style>
