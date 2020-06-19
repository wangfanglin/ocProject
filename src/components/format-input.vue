<template>
	<div class="dib format-input">
		<el-input ref="formatInput" v-model.trim="formatValue" :size="size" :clearable="clearable" :readonly="readonly" :disabled="disabled" :placeholder="placeholder" @focus="handleFormatInputFocus" @clear="handleClear" v-if="display === DISPLAY.FORMAT" :key="DISPLAY.FORMAT">
			<template v-slot:suffix>
				<slot name="suffix"></slot>
			</template>
		</el-input>
		<el-input ref="editorInput" v-model.trim="editorValue" :size="size" :clearable="clearable" :readonly="readonly" :disabled="disabled" :placeholder="placeholder" @focus="handleEditorInputFocus" @change="handleEditorInputChange" @blur="handleEditorInputBlur" @clear="handleClear" v-if="display === DISPLAY.EDITOR" :key="DISPLAY.EDITOR">
			<template v-slot:suffix>
				<slot name="suffix"></slot>
			</template>
		</el-input>
	</div>
</template>
<script>
import filter from '@/config/filter';
import util from '@/assets/js/util';
import validate from '@/assets/js/validate';
import { dispatchValidateEvent } from '@/mixin/form';

const DISPLAY = {
	FORMAT: 'FORMAT',
	EDITOR: 'EDITOR'
};

export default {
	props: {
		value: [String, Number],
		size: {
			type: String,
			default: 'small'
		},
		clearable: {
			type: Boolean,
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: ''
		},
		/**
		 * 保留小数位数
		 */
		decimal: {
			type: Number,
			default: 2
		}
	},
	data() {
		return {
			formatValue: '',
			editorValue: '',
			display: DISPLAY.FORMAT,
			DISPLAY
		};
	},
	watch: {
		value(val) {
			val = util.isNotEmpty(val) ? val : '';
			this.setFormatValue(val);
			this.setEditorValue(val);
		},
		editorValue(value) {
			if (value === this.value) {
				return;
			}
			this.$emit('input', value);
		}
	},
	methods: {
		/**
		 * 使当前组件获得焦点
		 */
		focus() {
			this.handleFormatInputFocus();
		},
		/**
		 * 设置格式化输入框的值
		 * 1、金额校验通过
		 *    1、数值转字符串
		 *    2、声明小数位数变量
		 *    3、若值包含小数点，判断小数点后数据长度，若大于1则保留自身长度，否则保留两位
		 *       不包含，默认2位小数
		 *    4、处理值
		 */
		setFormatValue(value) {
			let formatValue;
			if (validate.validateAmount(value, this.decimal)) {
				value = String(value);
				let formatDecimal;
				if (value.includes('.')) {
					let length = value.split('.')[1].length;
					formatDecimal = length > 1 ? length : 2;
				} else {
					formatDecimal = 2;
				}
				formatValue = filter.formatCurrency(value, formatDecimal);
			} else {
				formatValue = value;
			}
			if (this.formatValue === value) {
				return;
			}
			this.formatValue = formatValue;
		},
		/**
		 * 设置编辑输入框的值
		 */
		setEditorValue(value) {
			if (this.editorValue === value) {
				return;
			}
			this.editorValue = value;
		},
		/**
		 * 处理formatInput获取焦点事件
		 */
		handleFormatInputFocus() {
			this.display = DISPLAY.EDITOR;
			this.$nextTick(() => {
				this.$refs.editorInput.focus();
			});
		},
		/**
		 * 处理editorInput获取焦点事件
		 */
		handleEditorInputFocus(event) {
			event.target.select();
			this.$emit('focus', event);
		},
		/**
		 * 处理editorInput change事件
		 */
		handleEditorInputChange(value) {
			setTimeout(() => {
				this.$emit('change', value);
				dispatchValidateEvent(this, 'ElFormItem', 'el.form.change', value);
			}, 0);
		},
		/**
		 * 处理editorInput blur事件
		 */
		handleEditorInputBlur(event) {
			if (!validate.validateAmount(this.editorValue, this.decimal)) {
				this.editorValue = '';
			}
			this.display = DISPLAY.FORMAT;
			setTimeout(() => {
				this.$emit('blur', event);
				dispatchValidateEvent(
					this,
					'ElFormItem',
					'el.form.blur',
					this.editorValue
				);
			}, 0);
		},
		/**
		 * 处理清空值的事件
		 */
		handleClear() {
			this.formatValue = this.editorValue = '';
			this.$emit('clear');
		}
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.setFormatValue(this.value);
			this.setEditorValue(this.value);
		}
	}
};
</script>
<style lang="scss" scoped>
.format-input {
	width: 100%;
}
</style>



