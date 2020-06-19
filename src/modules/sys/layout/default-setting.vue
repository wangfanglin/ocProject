<!-- 默认设置弹出框 -->
<template>
	<!-- 容器 -->
	<el-dialog :visible.sync="visible" @close="handleClose" width="500px" v-draggable :close-on-click-modal="false">
		<span slot="title">
			<i class="fa fa-cog b"> 默认设置</i>
		</span>
		<el-form ref="form" :model="form" :rules="formRules" label-width="120px" size="small">
			<el-form-item label="单位：" prop="agyCode">
				<el-select placeholder="选择单位" filterable v-model="form.agyCode" @change="handleAgyChange" style="width: 100%">
					<el-option v-for="(e, i) in agyList" :label="e.name" :value="e.code" :key="i"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="账套：" prop="acbCode">
				<el-select placeholder="选择账套" filterable v-model="form.acbCode" style="width: 100%">
					<el-option v-for="(e, i) in acbList" :label="e.name" :value="e.code" :key="i"></el-option>
				</el-select>
			</el-form-item>
			<div>
				<span class="mr30">切换帐套是否显示提醒弹窗：</span>
				<el-radio-group v-model="storageData.isRecord">
					<el-radio :label="false">显示提醒</el-radio>
					<el-radio :label="true">不再提醒</el-radio>
				</el-radio-group>
			</div>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="visible = false" size="small">取消</el-button>
			<el-button type="primary" @click="handleSave" size="small">保存</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import { getAgyInfo } from '@/store/service/agy-service';
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { updateDefaultInfo } from '@/store/service/login-service';
import { STORAGE_KEY } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

export default {
	data() {
		return {
			visible: false,
			form: {
				agyCode: '',
				acbCode: '',
				transDate: ''
			},
			formRules: {
				agyCode: [{ required: true, message: '请选择单位', trigger: 'blur' }],
				acbCode: [{ required: true, message: '请选择账套', trigger: 'blur' }]
			},
			agyList: [],
			storageData: {
				isRecord: '',
				setRadio: ''
			}
		};
	},
	methods: {
		/**
		 * 打开默认设置弹出框
		 * 1、获取浏览器存储数据
		 * 2、获取单位信息
		 * 3、获取选择年份的默认单位账套信息
		 */
		open() {
			this.visible = true;
			let storageData = LOCAL_STORAGE.get(STORAGE_KEY.AGY_ACB_CHANGE_DATA);
			if (util.isNotEmpty(storageData)) {
				util.copyProperties(this.storageData, storageData);
			}
			this.getAgyInfo();
			this.getDefaultAgyInfo();
		},
		/**
		 * 获取选择年份的单位账套信息
		 */
		getAgyInfo() {
			fetch
				.get('/mad/acb/listMadAgyAcbSetVo', {
					params: {
						userCode: this.GET_LOGIN_INFO.userCode,
						fiscal: util.getDateInfo(this.GET_LOGIN_INFO.transDate).year
					}
				})
				.then(({ data }) => {
					this.agyList = data;
				})
				.catch(({ msg }) => {
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 获取选择年份的默认单位账套信息
		 */
		getDefaultAgyInfo() {
			fetch
				.get('/pa/mix/userPageCustom/get', {
					params: {
						userCode: this.GET_LOGIN_INFO.userCode,
						pageId: 'DEFAULT_ORG_ACB',
						customType: 'DEFAULT_ORG_ACB',
						fiscal: util.getDateInfo(this.GET_LOGIN_INFO.transDate).year
					}
				})
				.then(({ data }) => {
					util.copyProperties(this.form, data);
				})
				.catch(({ msg }) => {
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 处理单位信息change事件
		 */
		handleAgyChange() {
			this.form.acbCode = '';
		},
		/**
		 * 默认设置保存
		 * 1、保存存储数据
		 * 2、校验默认设置数据
		 * 3、保存用户设置
		 * 4、获取新单位信息
		 * 5、设置默认信息
		 */
		async handleSave() {
			try {
				this.$loading();
				LOCAL_STORAGE.set(
					`${STORAGE_KEY.AGY_ACB_CHANGE_DATA}`,
					this.storageData
				);
				await this.validateData();
				await this.saveData();
				getAgyInfo(this.form.agyCode)
					.then(() => {
						this.$loadingClose();
						let agyInfo = this.agyList.find(e => {
							return e.code === this.form.agyCode;
						});
						updateDefaultInfo(agyInfo, this.form.acbCode);
						this.visible = false;
					})
					.catch(() => {
						this.$loadingClose();
						this.$message({
							type: 'error',
							message: '获取单位信息失败！'
						});
					});
			} catch (e) {
				this.$loadingClose();
				console.error(e);
			}
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.$refs.form.resetFields();
		},
		/**
		 * 校验默认设置数据
		 */
		validateData() {
			return new Promise((resolve, reject) => {
				this.$refs.form.validate(valid => {
					if (valid) {
						resolve();
					} else {
						reject(valid);
					}
				});
			});
		},
		/**
		 * 保存用户设置
		 */
		saveData() {
			return new Promise((resolve, reject) => {
				fetch
					.post('pa/mix/userPageCustom/add', {
						agyCode: this.form.agyCode,
						acbCode: this.form.acbCode,
						fiscal: util.getDateInfo(this.GET_LOGIN_INFO.transDate).year,
						customContent: '{}',
						customType: 'DEFAULT_ORG_ACB',
						pageId: 'DEFAULT_ORG_ACB',
						userCode: this.GET_LOGIN_INFO.userCode,
						userName: this.GET_LOGIN_INFO.username
					})
					.then(() => {
						resolve();
					})
					.catch(e => {
						this.$message({
							type: 'error',
							message: e.msg
						});
						reject(e);
					});
			});
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO]),
		acbList() {
			let result = this.agyList.find(e => {
				return e.code === this.form.agyCode;
			});
			return util.isNotEmpty(result) ? result.acbList : [];
		}
	}
};
</script>
