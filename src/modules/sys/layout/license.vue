<!-- license管理 -->
<template>
	<!-- 容器 -->
	<div>
		<!-- 注册申请 -->
		<el-dialog :visible.sync="register.visible" @close="handleRegisterClose" :close-on-click-modal="false" :close-on-press-escape="false" v-draggable>
			<div class="license-dialog">
				<el-row class="mt20">
					<el-col :span="16">
						<div class="lh32 b">
							若您尚未生成过注册信息，点击生成
						</div>
					</el-col>
					<el-col :span="8">
						<el-button size="small" type="primary" @click="handleGenerateLicense">生成产品授权注册文件</el-button>
					</el-col>
				</el-row>
				<el-row class="mt20">
					<el-col :span="16">
						<div class="lh32 b">
							若您已有产品授权注册文件，点击上传
						</div>
					</el-col>
					<el-col :span="8">
						<el-upload :action="register.uploadUrl" :headers="register.uploadHeaders" :before-upload="handleRegisterBeforeUpload" :on-success="handleRegisterUploadSuccess" multiple :show-file-list="false">
							<el-button size="small" type="primary" style="width: 172px;">上传授权许可文件</el-button>
						</el-upload>
					</el-col>
				</el-row>
			</div>
			<div slot="footer" class="dialog-footer"></div>
		</el-dialog>
		<!-- 未注册生成弹框 -->
		<el-dialog :visible.sync="unRegister.visible" width="1300px" v-draggable :show-close="false" top="2vh" :close-on-click-modal="false">
			<!-- 生成页面标题 -->
			<div class="license-title fix">
				生成注册文件
				<div class="r">
					<el-button-group>
						<el-button size="small" @click="handleUnRegisterBack"><i class="fa fa-reply-all color-primary"></i> 返回</el-button>
						<el-button size="small" @click="handleRegister"><i class="fa fa-database color-primary"></i> 生成</el-button>
					</el-button-group>
				</div>
			</div>
			<!-- 基本信息 -->
			<el-row class="mt5">
				<el-col :span="12">
					<el-form ref="unRegisterForm" :model="unRegister" :rules="unRegister.formRules" label-width="100px" size="small">
						<el-form-item label="使用单位：" prop="company">
							<el-input v-model.trim="unRegister.company" placeholder="输入使用单位"></el-input>
						</el-form-item>
						<el-form-item label="地址：" prop="address">
							<el-input v-model.trim="unRegister.address" placeholder="输入地址"></el-input>
						</el-form-item>
						<el-form-item label="联系电话：" prop="phone">
							<el-input v-model.trim="unRegister.phone" placeholder="输入联系电话"></el-input>
						</el-form-item>
						<el-form-item label="邮箱：" prop="email">
							<el-input v-model.trim="unRegister.email" placeholder="输入邮箱"></el-input>
						</el-form-item>
					</el-form>
				</el-col>
				<el-col :span="12">
					<div class="ml30 bdc mt30 p10">
						<p>1.请将生成的注册文件发给供应商进行注册</p>
						<p>2.请填写使用单位和联系方式信息，以便供应商核实</p>
						<p>3.授权数信息务必准确填写</p>
					</div>
				</el-col>
			</el-row>
			<!-- 授权信息 -->
			<el-table class="mt10" :data="unRegister.tableData" size="small" border :header-cell-style="TABLE_HEADER_CELL_STYLE" :cell-style="TABLE_CELL_STYLE" :height="tableHeight">
				<el-table-column label="模块" prop="moduleName" header-align="center" align="left"></el-table-column>
				<el-table-column label="授权方式" prop="permit.permitName" header-align="center" align="left"></el-table-column>
				<el-table-column label="License版本" header-align="center" align="left">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.version" active-text="旗舰版" inactive-text="试用版" inactive-value="试用版" active-value="旗舰版" @change="val => handleRegisterVisionChange(val, scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="License试用截至日期" header-align="center" align="left">
					<template slot-scope="scope">
						<el-date-picker v-if="scope.row.version === '试用版'" size="small" v-model="scope.row.expiredDate" type="date" placeholder="选择试用截至日期" value-format="yyyy-MM-dd"></el-date-picker>
					</template>
				</el-table-column>
				<el-table-column label="授权数" prop="permit.count" header-align="center" align="right">
					<template slot-scope="scope">
						<el-input size="small" v-model="scope.row.permit.count" :disabled="scope.row.permit.permitId === 'none'" @input="(val)=>handleChange(val,scope.row,scope.$index)"></el-input>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer"></div>
		</el-dialog>
		<!-- 关于 -->
		<el-dialog class="about-dialog" :visible.sync="about.visible" width="650px" v-draggable :close-on-click-modal="false">
			<div slot="title">
				<div class="head-title">关于</div>
			</div>
			<div class="about-dialog-content fix">
				<div class="left-wrap">
					<img :src="logo" alt="" class="left-img">
				</div>
				<div class="right-wrap">
					<div class="title">{{GET_APP_INFO.productName}}</div>
					<div class="content mt20">
						<span class="f18 b">授权给：</span>{{about.company}}
					</div>
					<div class="content">
						<span class="f18 b">产品范围：</span>
						<el-tooltip :content="about.productRange" placement="top" effect="light">
							<span class="permit">
								<span>{{about.productRange}}</span>
								<i class="el-icon-info icon" @click="about.detail.visible = true"></i>
							</span>
						</el-tooltip>
					</div>
					<div class="content">
						<span class="f18 b">版本号：</span>{{about.version}}
					</div>
				</div>
			</div>
			<div slot="footer" class="dialog-footer about-dialog-bottom">
				<span v-if="isNotEmpty(GET_APP_INFO.copyRight)">Copyright<i class="fa fa-copyright pl5 pr5"> {{GET_APP_INFO.copyRight}}</i></span>
			</div>
			<el-dialog :visible.sync="about.detail.visible" width="1300px" v-draggable top="2vh" :append-to-body="true" title="授权信息">
				<el-table :data="about.detail.tableData" size="small" border :header-cell-style="TABLE_HEADER_CELL_STYLE" :cell-style="TABLE_CELL_STYLE" :height="tableHeight + 220">
					<el-table-column label="模块" prop="moduleName" header-align="center" align="left"></el-table-column>
					<el-table-column label="授权方式" prop="permitName" header-align="center" align="left"></el-table-column>
					<el-table-column label="授权版本" prop="version" header-align="center" align="left"></el-table-column>
					<el-table-column label="截至日期" prop="expiredDate" header-align="center" align="left"></el-table-column>
					<el-table-column label="授权数" prop="count" header-align="center" align="right"></el-table-column>
					<el-table-column label="状态" header-align="center" align="center">
						<template slot-scope="scope">
							<el-tag size="small" type="success" v-if="scope.row.count >= scope.row.use">正常</el-tag>
							<el-tag size="small" type="danger" v-else>超出许可</el-tag>
						</template>
					</el-table-column>
				</el-table>
				<div slot="footer" class="dialog-footer"></div>
			</el-dialog>
		</el-dialog>
	</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import { GET_TOKEN } from '@/store/login';
import { CONTEXT_PATH } from '@/assets/js/constant';
import { GET_APP_INFO, SET_LICENSE_INFO } from '@/store/system';
import {
	innerHeight,
	TABLE_HEADER_CELL_STYLE,
	TABLE_CELL_STYLE
} from '@/mixin/style';
import { USER_DROPDOWN } from './index';
import validate from '@/assets/js/validate';
import fetch from '@/config/fetch';
import util from '@/assets/js/util';
import logo from '@/assets/img/logo.png';

export default {
	mixins: [innerHeight],
	data() {
		const VALIDATE_TEL = (rule, value, callback) => {
			if (util.isNotEmpty(value) && !validate.validatePhone(value)) {
				callback(new Error('电话号需合法'));
			} else {
				callback();
			}
		};
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
		return {
      isExit: true,
			register: {
				visible: false,
				uploadUrl: `${CONTEXT_PATH}/pa/licenseApp/import`,
				uploadHeaders: {}
			},
			unRegister: {
				visible: false,
				company: '',
				address: '',
				phone: '',
				email: '',
				tableData: [],
				formRules: {
					company: [
						{ required: true, message: '请输入使用单位', trigger: 'blur' }
					],
					address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
					phone: [
						{ required: true, message: '请输入联系电话', trigger: 'blur' },
						{ validator: VALIDATE_TEL, trigger: 'blur' }
					],
					email: [
						{ required: true, message: '请输入邮箱', trigger: 'blur' },
						{ validator: validateEmail, trigger: 'blur' }
					],
					version: [{ required: true, message: '请选择版本', trigger: 'blur' }]
				}
			},
			about: {
				visible: false,
				company: '',
				productRange: [],
				version: '1.0.0',
				detail: {
					visible: false,
					tableData: []
				}
			},
			TABLE_HEADER_CELL_STYLE,
			TABLE_CELL_STYLE,
			logo
		};
	},
	methods: {
		...mapActions([SET_LICENSE_INFO]),
		open(val) {
			if (val === USER_DROPDOWN.VERSION_UPDATE) {
				this.$message({
					type: 'warning',
					message: '暂无更新信息！'
				});
			} else if (val === USER_DROPDOWN.REGIST_APPLY) {
				this.register.visible = true;
			} else if (val === USER_DROPDOWN.ABOUT) {
				this.handleAboutDetail();
			} else {
			}
		},
		/**
		 * 处理生成授权文件
		 */
		async handleGenerateLicense() {
			try {
				let data = await this.getModuleInfo();
				let curDate = new Date();
				let month = curDate.getMonth() + 1;
				let expiredDate =
					curDate.getFullYear() + '-' + month + '-' + curDate.getDate();
				this.unRegister.tableData = data.map(e => {
					return {
						...e,
						version: '试用版',
						expiredDate
					};
				});
        this.isExit = false;
        this.register.visible = false;
				this.unRegister.visible = true;
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * 注册申请——上传前的处理
		 */
		handleRegisterBeforeUpload() {
			this.$set(this.register.uploadHeaders, 'Authorization', this.GET_TOKEN);
		},
		/**
		 * 注册申请——上传成功后的操作
		 */
		handleRegisterUploadSuccess({ code, data, msg }) {
			if (code === '200') {
				this.$message({
					type: 'success',
					message: msg
				});
        this.isExit = true;
        this.register.visible = false;
				this.SET_LICENSE_INFO();
			} else {
				this.$message({
					type: 'error',
					message: msg
				});
			}
		},
		/**
		 * 注册申请——生成返回
		 */
		handleUnRegisterBack() {
      this.$refs.unRegisterForm.resetFields();
      this.unRegister.visible = false;
      this.isExit = true;
      this.register.visible = true;
		},
		/**
		 * 注册申请——处理版本变化
		 */
		handleRegisterVisionChange(val, row) {
			let curDate = new Date();
			let year =
				val === '试用版' ? curDate.getFullYear() : curDate.getFullYear() + 5;
			let month = curDate.getMonth() + 1;
			let day = curDate.getDate();
			row.expiredDate = year + '-' + month + '-' + day;
		},
		/**
		 * 点击注册按钮
		 * 1、验证表单
		 * 2、验证授权数
		 */
		handleRegister() {
			this.$refs.unRegisterForm.validate(valid => {
				if (valid) {
					let validAuthorizationNum = this.unRegister.tableData.every(e => {
						return util.isNotEmpty(e.permit.count);
					});
					if (!validAuthorizationNum) {
						this.$message({
							type: 'warning',
							message: `授权数不能为空！`
						});
						return;
					}
					this.$loading();
					let params = {
						company: this.unRegister.company,
						address: this.unRegister.address,
						phone: this.unRegister.phone,
						email: this.unRegister.email,
						licenseModuleInfoList: {}
					};
					let licenseModuleInfoList = this.unRegister.tableData.map(e => {
						return {
							moduleId: e.moduleId,
							moduleName: e.moduleName,
							permit: {
								count: Number(e.permit.count),
								expiredDate: e.expiredDate,
								permitId: e.permit.permitId,
								permitName: e.permit.permitName,
								version: e.version
							}
						};
					});
					params.licenseModuleInfoList = licenseModuleInfoList;
					fetch
						.post('/pa/licenseApp/apply', params)
						.then(() => {
							this.$loadingClose();
							this.$message({
								type: 'success',
								message: '生成成功，请将生成的注册文件发给供应商进行注册!'
							});
							let url = CONTEXT_PATH + '/pa/licenseApp/dowload';
							util.download(url);
							this.handleUnRegisterBack();
						})
						.catch(({ msg }) => {
							this.$loadingClose();
							this.$message({
								type: 'error',
								message: msg
							});
						});
				}
			});
		},
		/**
		 * 处理注册申清弹框关闭
		 */
		handleRegisterClose() {
			if (this.isExit) {
				this.$emit('exit');
			}
		},
		/**
		 * 获取license详情信息
		 */
		getLicenseInfo() {
			return new Promise((resolve, reject) => {
				fetch
					.get('/pa/licenseApp/status')
					.then(({ data }) => {
						resolve(data);
					})
					.catch(err => {
						this.$message({
							type: 'error',
							message: err.msg
						});
						reject(err);
					});
			});
		},
		/**
		 * 获取license模块信息
		 */
		getModuleInfo() {
			return new Promise((resolve, reject) => {
				fetch
					.get('/pa/licenseApp/module')
					.then(({ data }) => {
						resolve(data);
					})
					.catch(err => {
						this.$message({
							type: 'error',
							message: err.msg
						});
						reject(err);
					});
			});
		},
		/**
		 * 授权数更改
		 * 校验授权数为数字
		 * permitId相同则联动
		 */
		handleChange(val, row, index) {
			if (val.length === 1 || (val.length > 1 && val.slice(0, 1) !== '0')) {
				if (!validate.validateInteger(val)) {
					this.$message({
						type: 'warning',
						message: '授权数必须输入数字!'
					});
					this.$set(this.unRegister.tableData[index].permit, 'count', 0);
					this.handleCountChange(0, row);
					return false;
				}
			}
			if (val.length > 1 && val.slice(0, 1) === '0') {
				this.$set(this.unRegister.tableData[index].permit, 'count', 0);
				this.handleCountChange(0, row);
				return false;
			}
			this.handleCountChange(val, row);
		},
		/**
		 * 联查permitId相同的授权数保持一致
		 */
		handleCountChange(val, row) {
			this.unRegister.tableData.forEach(e => {
				if (e.permit.permitId === row.permit.permitId) {
					e.permit.count = val;
				}
			});
		},
		/**
		 * 关于详情
		 */
		async handleAboutDetail() {
			try {
				this.$loading();
				let data = await this.getLicenseInfo();
				this.about.company = data.company;
				let productRange = [];
				this.about.detail.tableData = data.licenseModuleInfoList.map(e => {
					productRange.push(e.moduleName);
					return {
						...e,
						count: e.permit.count,
						use: e.permit.use,
						version: e.permit.version,
						expiredDate: e.permit.expiredDate,
						permitName: e.permit.permitName,
						moduleName: e.moduleName
					};
				});
				this.about.productRange = productRange.join('、');
				this.$loadingClose();
				this.about.visible = true;
			} catch (err) {
				console.error(err);
				this.$loadingClose();
			}
		},
		isNotEmpty(val) {
			return util.isNotEmpty(val);
		}
	},
	computed: {
		...mapGetters([GET_TOKEN, GET_APP_INFO]),
		tableHeight() {
			return this.innerHeight - 450;
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.license-title {
	height: 32px;
	line-height: 32px;
	padding: 5px;
	font-size: 20px;
	font-weight: bold;
	border-bottom: 1px dashed $--border-color-base;
}
.license-dialog {
	width: 70%;
	margin: 0 auto;
}
.about-dialog {
	.head-title {
		text-align: center;
		font-size: 19px;
		font-weight: bolder;
		margin-left: 10px;
		color: $--color-909399;
	}
	/deep/ .el-dialog__body,
	/deep/ .el-dialog__header,
	/deep/ .el-dialog__footer {
		padding: 20px 0;
	}
	/deep/ .el-dialog__body {
		margin-top: 3px;
	}
	.about-dialog-content {
		height: 180px;
		.left-wrap {
			width: 30%;
			padding-top: 20px;
			height: 180px;
			line-height: 180px;
			text-align: center;
			float: left;
		}
		.right-wrap {
			float: left;
			width: 70%;
			.title {
				font-weight: bolder;
				height: 40px;
				line-height: 40px;
				font-size: 35px;
				color: $--color-primary;
			}
			.content {
				font-size: 17px;
				height: 40px;
				line-height: 40px;
				.permit {
					display: inline-block;
					font-size: 16px;
					position: relative;
					width: 250px;
					padding-right: 20px;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
					vertical-align: bottom;
					span {
						font-size: 17px;
					}
					.icon {
						position: absolute;
						right: 0px;
						bottom: 13px;
						font-size: 18px;
						color: $--color-primary;
					}
				}
			}
		}
	}
	.about-dialog-bottom {
		text-align: center;
		span {
			color: $--color-909399;
			font-size: 15px;
		}
	}
}
</style>

