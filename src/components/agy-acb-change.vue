<!--为了在切换账套时提供给用户两种选择，1：切单位账套树其它页面不变2：切单位账套关闭其它页面-->
<template>
	<div>
		<el-dialog :visible.sync="visible" width="450px" top="20vh" append-to-body :lock-scroll="false" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<span slot="title" class="fix">
				<i class="fa fa-edit b"> 设置</i>
				<el-checkbox class="r" v-model="checked">不再提醒</el-checkbox>
			</span>
			<div class="p10">
				<el-radio-group v-model="radio">
					<el-radio :label="0">只切换当前页面账簿，其他页面账簿保持不变</el-radio>
					<br />
					<el-radio :label="1" class="mt20">切换本页面账簿后关闭其它页面</el-radio>
				</el-radio-group>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" size="small" @click="handleConfirm">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { STORAGE_KEY } from '@/assets/js/constant';
import util from '@/assets/js/util';
export default {
	data() {
		return {
			visible: false,
			radio: 0,
			checked: false
		};
	},
	methods: {
		/**
		 * 弹出框打开
     * AGY_ACB_CHANGE_DATA 记录了用户的选择，如果有值需要做回显
		 */
		show() {
			this.visible = true;
			let agyAcbChangeData = LOCAL_STORAGE.get(STORAGE_KEY.AGY_ACB_CHANGE_DATA);
			if (util.isNotEmpty(agyAcbChangeData)) {
				let { setRadio, isRecord } = agyAcbChangeData;
				this.radio = setRadio;
				this.checked = isRecord;
			}
		},
		/**
		 * 处理确认操作
     * 记录用户选择，向父组件抛出事件 radio代表用户选项（0：只切换当前页面账簿，其他页面账簿保持不变 1：切换本页面账簿后关闭其它页面）
		 */
		handleConfirm() {
			this.visible = false;
			LOCAL_STORAGE.set(`${STORAGE_KEY.AGY_ACB_CHANGE_DATA}`, {
				setRadio: this.radio,
				isRecord: this.checked
			});
			this.$emit('confirm', this.radio);
		}
	}
};
</script>
