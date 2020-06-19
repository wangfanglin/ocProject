<!-- 日期时间选择框 -->
<template>
	<!-- 容器 -->
	<div class="date-time">
		<el-date-picker ref="datePicker" type="date" size="small" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="dateValue" :readonly="readonly" :disabled="disabled" :placeholder="placeholder" :clearable="true" :editable="false" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="handleChange">
		</el-date-picker>
		<el-tooltip placement="bottom" effect="light">
			<ul slot="content" class="date-time-24-hour-content">
				<li @click="handleClick('09:00:00')">上午</li>
				<li @click="handleClick('14:00:00')">下午</li>
			</ul>
			<span class="date-time-24-hour link-primary">{{format24Hour}}</span>
		</el-tooltip>
	</div>
</template>
<script>
import util from '@/assets/js/util';

/**
 * 开始时间属性
 */
const BEGIN_PROPS = ['begin', 'start', 'from'];

export default {
	props: {
		value: String,
		props: {
			type: String,
			default: BEGIN_PROPS[0]
		},
		readonly: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			currentValue: '',
			dateValue: ''
		};
	},
	watch: {
		value(value) {
			this.setCurrentValue(value);
		},
		currentValue(value) {
			if (value === this.value) {
				return;
			}
			this.$emit('input', value);
		}
	},
	methods: {
		/**
		 * 使组件获取焦点
		 */
		focus() {
			this.$refs.datePicker.focus();
			return true;
		},
		/**
		 * 设置当前组件的值
		 */
		setCurrentValue(value) {
			if (value !== this.currentValue) {
				if (util.isNotEmpty(value)) {
					let dateInfo = util.getDateInfo(value);
					this.currentValue = dateInfo.dateTimeInfo;
					this.dateValue = dateInfo.dateInfo;
				} else {
					this.currentValue = '';
					this.dateValue = '';
				}
			}
		},
		/**
		 * 处理选择时间（am/pm）
		 */
		handleClick(value) {
			let currentValue = `${this.dateValue} ${value}`;
			if (currentValue !== this.currentValue) {
				this.currentValue = currentValue;
				this.dispatch('change', this.currentValue);
			}
		},
		/**
		 * 处理日期框值变化
		 */
		handleChange(value) {
			if (util.isNotEmpty(value)) {
				let hasBeginProps = BEGIN_PROPS.some(e => {
					return this.props.toLowerCase().includes(e);
				});
				this.currentValue = hasBeginProps
					? `${value} 08:00:00`
					: `${value} 14:00:00`;
			} else {
				this.currentValue = '';
			}
			this.dispatch('change', this.currentValue);
		},
		/**
		 * 触发事件
		 */
		dispatch(event, value) {
			// hack方法，确保值修改之后，先触发input事件
			setTimeout(() => {
				this.$emit(event, value);
			}, 0);
		}
	},
	computed: {
		/**
		 * 格式化时间
		 */
		format24Hour() {
			if (util.isNotEmpty(this.currentValue)) {
				let dateInfo = util.getDateInfo(this.currentValue);
				return dateInfo.hours < 12 ? '上午' : '下午';
			} else {
				return '';
			}
		}
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
.date-time {
	display: inline-block;
	position: relative;
	line-height: 32px;
	.date-time-24-hour {
		position: absolute;
		font-size: 12px;
		top: 0;
		right: 25px;
	}
}
.date-time-24-hour-content {
	li {
		padding: 8px;
		&:hover {
			color: $--color-primary;
			cursor: pointer;
			background-color: $--select-option-hover-background;
		}
	}
}
</style>
