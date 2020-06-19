<template>
	<div class="date-range fix" :class="{'is-active': active}" @click="active = true" v-clickoutside="handleClickoutside" @mouseenter="handleMouseenter" @mouseleave="clearVisible = false">
		<i class="fa fa-calendar date-range-icon"></i>
		<el-date-picker class="date-range-left" size="mini" type="date" :placeholder="startPlaceholder" :editable="editable" :clearable="clearable" value-format="yyyy-MM-dd" v-model="leftValue" :picker-options="leftPickerOptions">
		</el-date-picker>
		<span class="date-range-separator">~</span>
		<el-date-picker class="date-range-right" size="mini" type="date" :placeholder="endPlaceholder" :editable="editable" :clearable="clearable" value-format="yyyy-MM-dd" v-model="rightValue" :picker-options="rightPickerOptions">
		</el-date-picker>
		<i class="fa fa-times-circle date-range-clear" v-show="clearable && clearVisible" @click="handleClear"></i>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import util from '@/assets/js/util';

export default {
	props: {
		value: Array,
		editable: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: true
		},
		startPlaceholder: {
			type: String,
			default: '开始日期'
		},
		endPlaceholder: {
			type: String,
			default: '结束日期'
		},
		disabledDate: {
			type: Boolean,
			default: true
		},
		showPickerOptions: {
			type: Boolean,
			default: true
		}
	},
	data() {
		let vm = this;
		return {
			leftValue: '',
			rightValue: '',
			active: false,
			clearVisible: false,
			leftPickerOptions: this.showPickerOptions && {
				disabledDate(val) {
					if (vm.disabledDate) {
						let endTime = vm.rightValue
							? new Date(`${vm.rightValue} 00:00:00:00`).getTime()
							: 0;
						let { year, time } = util.getDateInfo(val);
						let fiscal = vm.GET_LOGIN_INFO.fiscal;
						if (endTime > 0) {
							return (
								year < fiscal ||
								time > endTime ||
								(year > fiscal || time > endTime)
							);
						} else {
							return year < fiscal || year > fiscal;
						}
					} else {
						return false;
					}
				},
				shortcuts: [
					{
						text: '本年',
						onClick(picker) {
							picker.handleClear();
							vm.pickerYear();
						}
					},
					{
						text: '本期',
						onClick(picker) {
							picker.handleClear();
							vm.pickerPeriod();
						}
					},
					{
						text: '本周',
						onClick(picker) {
							picker.handleClear();
							vm.pickerWeek();
						}
					},
					{
						text: '今日',
						onClick(picker) {
							picker.handleClear();
							vm.pickerToday();
						}
					}
				]
			},
			rightPickerOptions: this.showPickerOptions && {
				disabledDate(val) {
					if (vm.disabledDate) {
						let startTime = vm.leftValue
							? new Date(`${vm.leftValue} 00:00:00:00`).getTime()
							: 0;
						let { year, time } = util.getDateInfo(val);
						let fiscal = vm.GET_LOGIN_INFO.fiscal;
						return (
							year < fiscal ||
							time < startTime ||
							(year > fiscal || time < startTime)
						);
					} else {
						return false;
					}
				},
				shortcuts: [
					{
						text: '本年',
						onClick(picker) {
							picker.handleClear();
							vm.pickerYear();
						}
					},
					{
						text: '本期',
						onClick(picker) {
							picker.handleClear();
							vm.pickerPeriod();
						}
					},
					{
						text: '本周',
						onClick(picker) {
							picker.handleClear();
							vm.pickerWeek();
						}
					},
					{
						text: '今日',
						onClick(picker) {
							picker.handleClear();
							vm.pickerToday();
						}
					}
				]
			}
		};
	},
	watch: {
		value: {
			handler(val) {
				this.setCurrentValue(val);
			},
			deep: true
		},
		leftValue(val) {
			if (_.isEqual(this.value, [val, this.rightValue])) {
				return;
			}
			this.$emit('input', [val, this.rightValue]);
			this.dispatchChange();
		},
		rightValue(val) {
			if (_.isEqual(this.value, [this.leftValue, val])) {
				return;
			}
			this.$emit('input', [this.leftValue, val]);
			this.dispatchChange();
		}
	},
	methods: {
		setCurrentValue(value) {
			if (util.isEmpty(value)) {
				if (util.isEmpty(this.leftValue) && util.isEmpty(this.rightValue)) {
					return;
				} else {
					this.leftValue = this.rightValue = '';
				}
			} else {
				if (_.isEqual(value, [this.leftValue, this.rightValue])) {
					return;
				} else {
					this.leftValue = value[0];
					this.rightValue = value[1];
				}
			}
		},
		pickerYear() {
			let { fiscal } = this.GET_LOGIN_INFO;
			this.leftValue = util.getDateInfo(new Date(fiscal, 0, 1)).dateInfo;
			this.rightValue = util.getDateInfo(new Date(fiscal, 11, 31)).dateInfo;
		},
		pickerPeriod() {
			let { fiscal, fiscalPeriod } = this.GET_LOGIN_INFO;
			fiscalPeriod = fiscalPeriod - 1;
			let day = new Date(fiscal, fiscalPeriod + 1, 0).getDate();
			this.leftValue = util.getDateInfo(
				new Date(fiscal, fiscalPeriod, 1)
			).dateInfo;
			this.rightValue = util.getDateInfo(
				new Date(fiscal, fiscalPeriod, day)
			).dateInfo;
		},
		pickerWeek() {
			let { year, month, week, day } = util.getDateInfo(
				this.GET_LOGIN_INFO.transDate
			);
			month = month - 1;
			this.leftValue = util.getDateInfo(
				new Date(year, month, day - week)
			).dateInfo;
			this.rightValue = util.getDateInfo(
				new Date(year, month, day + 6 - week)
			).dateInfo;
		},
		pickerToday() {
			let { dateInfo } = util.getDateInfo(this.GET_LOGIN_INFO.transDate);
			this.leftValue = util.getDateInfo(new Date(dateInfo)).dateInfo;
			this.rightValue = util.getDateInfo(new Date(dateInfo)).dateInfo;
		},
		handleClear() {
			this.leftValue = this.rightValue = '';
		},
		handleMouseenter() {
			if (util.isNotEmpty(this.leftValue) || util.isNotEmpty(this.rightValue)) {
				this.clearVisible = true;
			}
		},
		handleClickoutside() {
			this.active = false;
		},
		dispatchChange() {
			setTimeout(() => {
				this.$emit('change', [this.leftValue, this.rightValue]);
			}, 0);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO])
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.setCurrentValue(this.value);
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.date-range {
	width: 230px;
	height: $--input-small-height;
	line-height: 24px;
	padding: 3px 5px 3px 10px;
	background-color: $--color-white;
	border: 1px solid $--color-c0c4cc;
	border-radius: $--input-border-radius;
	font-size: $--font-size-base;
	position: relative;
	display: inline-block;
	box-sizing: border-box;
	outline: none;
	&:hover {
		border: 1px solid $--color-909399;
	}
	&.is-active {
		border-color: $--color-primary;
	}
	.date-range-icon {
		width: 15px;
		line-height: 25px;
		color: $--color-text-secondary;
		float: left;
	}
	.date-range-left,
	.date-range-right {
		width: 39%;
		/deep/ .el-input__inner {
			padding: 0;
			text-align: center;
			height: 25px;
			line-height: 25px;
			border: none;
		}
		/deep/ .el-input__prefix,
		/deep/ .el-input__suffix {
			display: none;
		}
	}
	.date-range-separator {
		display: inline-block;
		width: 4%;
		height: 100%;
		line-height: 25px;
		text-align: center;
		color: $--color-text-secondary;
	}
	.date-range-clear {
		position: absolute;
		right: 2px;
		top: 8px;
		color: $--color-text-secondary;
		&:hover {
			cursor: pointer;
		}
	}
}
</style>
