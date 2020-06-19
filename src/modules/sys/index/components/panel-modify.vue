<!-- 门户块编辑 -->
<template>
	<!-- 容器 -->
	<el-dialog :visible.sync="visible" width="500px" v-draggable @close="handleClose">
		<span slot="title">
			<i class="fa fa-cog b"> 模块编辑</i>
		</span>
		<el-form ref="form" size="small" :model="form" :rules="formRules" label-width="80px">
			<el-form-item label="模块名称" prop="title">
				<el-input v-model.trim="form.title" placeholder="输入模块名称"></el-input>
			</el-form-item>
			<el-form-item label="模块占比" prop="area">
				<el-select v-model="form.area" placeholder="选择模块占比" style="width:100%;">
					<el-option label="1/3" :value="8"></el-option>
					<el-option label="1/2" :value="12"></el-option>
					<el-option label="2/3" :value="16"></el-option>
					<el-option label="100%" :value="24"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button size="small" @click="handleCancel">取消</el-button>
			<el-button size="small" type="primary" @click="handleSave">保存</el-button>
		</div>
	</el-dialog>
</template>
<script>
import util from '@/assets/js/util';

export default {
	data() {
		return {
			visible: false,
			form: {
				title: '',
				area: ''
			},
			formRules: {
				title: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
				area: [{ required: true, message: '请选择模块占比', trigger: 'change' }]
			},
			callback: null
		};
	},
	methods: {
		/**
		 * 处理弹出框打开
		 */
		open(data, callback) {
			this.visible = true;
			this.callback = callback;
			setTimeout(() => {
				util.copyProperties(this.form, data);
			}, 0);
		},
		/**
		 * 处理保存
		 */
		handleSave() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.callback(this.form);
					this.visible = false;
				} else {
					return false;
				}
			});
		},
		/**
		 * 处理取消
		 */
		handleCancel() {
			this.visible = false;
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.$refs.form.resetFields();
			this.callback = null;
		}
	}
};
</script>
<style lang="scss" scoped>
</style>
