<template>
	<div class="monthrange-picker-container bsb tc dib fix">
		<el-date-picker class="l left-picker" ref="leftPicker" name="leftPicker" type="month" size="small" :editable="editable" :value-format="valueFormat" v-model="leftValue" :picker-options="pickerOptions" :clearable="clearable" @blur="handleBlur">
		</el-date-picker>
		<span class="range-separator">
			{{rangeSeparator}}
		</span>
		<el-date-picker class="r right-picker" ref="rightPicker" name="rightPicker" type="month" size="small" :editable="editable" :value-format="valueFormat" v-model="rightValue" :picker-options="pickerOptions" :clearable="clearable" @blur="handleBlur">
		</el-date-picker>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import util from '@/assets/js/util';
import { GET_LOGIN_INFO } from '@/store/login';

export default {
	props: {
		value: {
			type: Array,
			default() {
				return [];
			}
		},
		rangeSeparator: {
			type: String,
			default: '-'
		},
		valueFormat: {
			type: String,
			default: 'yyyy-MM'
		},
		editable: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: true
		}
	},
	data() {
		let that = this;
		return {
			leftValue: '',
			rightValue: '',
			pickerOptions: {
				shortcuts: [
					{
						text: '本年',
						onClick(picker) {
							picker.handleClear();
							that.pickerYear();
						}
					},
					{
						text: '本期',
						onClick(picker) {
							picker.handleClear();
							that.pickerPeriod();
						}
					}
				]
			}
		};
	},
	watch: {
		value(val, oldVal) {
			if (val[0] !== oldVal[0] && this.leftValue !== val[0]) {
				this.leftValue = val[0];
			}
			if (val[1] !== oldVal[1] && this.rightValue !== val[1]) {
				this.rightValue = val[1];
			}
		},
		leftValue(val) {
			if (util.isEmpty(val) && util.isNotEmpty(this.rightValue)) {
				this.rightValue = '';
			}
			this.$emit('input', [this.leftValue, this.rightValue]);
		},
		rightValue(val) {
			if (util.isEmpty(val) && util.isNotEmpty(this.leftValue)) {
				this.leftValue = '';
			}
			this.$emit('input', [this.leftValue, this.rightValue]);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO])
	},
	methods: {
		handleBlur({ name }) {
			if (
				name === 'leftPicker' &&
				util.isNotEmpty(this.leftValue) &&
				util.isEmpty(this.rightValue)
			) {
				this.$refs.rightPicker.focus();
			}
			if (
				name === 'rightPicker' &&
				util.isNotEmpty(this.rightValue) &&
				util.isEmpty(this.leftValue)
			) {
				this.$refs.leftPicker.focus();
			}
		},
		/*
		 * 点击本年以系统时间为准 设置选中时间
		 * */
		pickerYear() {
			let { fiscal } = this.GET_LOGIN_INFO;
			this.leftValue = `${fiscal}-01`;
			this.rightValue = `${fiscal}-12`;
		},
		/*
		 * 点击本期以系统时间为准 设置选中时间
		 * */
		pickerPeriod() {
			let { fiscal, fiscalPeriod } = this.GET_LOGIN_INFO;
			let perd = fiscalPeriod.toString().padStart(2, '0');
			this.leftValue = `${fiscal}-${perd}`;
			this.rightValue = `${fiscal}-${perd}`;
		}
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.leftValue = this.value[0];
			this.rightValue = this.value[1];
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';

.monthrange-picker-container {
	width: 200px;
	height: 32px;
	line-height: 30px;
	border: $--border-base;
	border-radius: $--border-radius-base;
	background: $--color-white;
	.left-picker {
		width: 88px;
		/deep/ .el-input__inner {
			padding-left: 30px;
			padding-right: 0;
		}
	}
	.right-picker {
		width: 85px;
		/deep/ .el-input__prefix {
			display: none;
		}
		/deep/ .el-input__inner {
			padding-left: 0;
			padding-right: 0;
		}
	}
	/deep/ .el-input__inner {
		border: none;
		height: 30px;
	}
	/deep/ .el-input__icon {
		line-height: 30px;
	}
	.range-separator {
		font-size: 13px;
	}
}
</style>
