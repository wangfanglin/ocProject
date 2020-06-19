<template>
	<div class="select-container" v-clickoutside="handleClickoutside">
		<el-popover ref="popover" placement="bottom-start" trigger="manual" v-model="contentVisible">
			<!-- 内容区关闭按钮 -->
			<i class="fa fa-times-circle select-content-close" @click="handleContentVisibleChange(false)"></i>
			<!-- 内容区 -->
			<div class="select-content" @scroll="handleScroll" :id="`${activeId}`">
				<!-- 内容虚拟区域 -->
				<div class="select-content-phantom" :style="{height: contentHeight}"></div>
				<!-- 内容展示区域 -->
				<div ref="option" class="select-content-option">
					<div class="select-content-option-item" :class="{'select-option-selected': e[props.value] === currentValue}" v-for="(e, i) in option" :key="i" @click="handleClick(e)">
						{{e[props.label]}}
					</div>
				</div>
				<!-- 无数据展示区 -->
				<div class="tc color-text-secondary" v-show="isEmpty(option)">
					暂无数据！
				</div>
			</div>
			<!-- 输入框区域 -->
			<div slot="reference" class="select-editor" :class="{'is-disable': disabled}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
				<input ref="input" :class="{'is-disable': disabled}" type="text" v-model.trim="editorValue" :placeholder="placeholder" :disabled="disabled" :readonly="!filterable" @focus="handleFocus" @input="debounceHandleInput" @blur="handleBlur" @keyup.enter="handleKeyupEnter">
				<div class="select-clear" v-if="clearable === true" @click="handleClear">
					<i class="fa fa-times-circle poi color-text-secondary" v-show="isNotEmpty(currentValue) && clearVisible === true"></i>
				</div>
			</div>
		</el-popover>
	</div>
</template>
<script>
import $ from 'jquery';
import PinyinMatch from 'pinyin-match';
import { dispatchValidateEvent } from '@/mixin/form';
import util from '@/assets/js/util';

export default {
	props: {
		/**
		 * 绑定的值
		 */
		value: {
			type: [String, Number],
			default: ''
		},
		/**
		 * 展示数据
		 */
		data: {
			type: Array,
			default() {
				return [];
			}
		},
		/**
		 * 是否禁用
		 */
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否可以搜索
		 */
		filterable: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否可以清空选项
		 */
		clearable: {
			type: Boolean,
			default: false
		},
		/**
		 * placeholder
		 */
		placeholder: {
			type: String,
			default: ''
		},
		/**
		 * 展示值的数据结构
		 */
		props: {
			type: Object,
			default() {
				return {
					label: 'label',
					value: 'value'
				};
			}
		}
	},
	data() {
		return {
			activeId: new Date().getTime(),
			currentValue: '', //当前组件的值
			editorValue: '', //输入框的值
			activeData: [], //激活的数据
			option: [], //可选项的值
			visibleCount: Math.ceil(250 / 34), //内容区最大显示条数，内容区高度 / 每一项高度
			contentVisible: false, //内容区显示隐藏
			clearVisible: false //清除按钮，显示隐藏
		};
	},
	created() {
		this.debounceHandleInput = _.debounce(this.handleInput, 350);
	},
	watch: {
		value(value) {
			this.setCurrentValue(value);
		},
		data: {
			handler(value) {
				this.initActiveData(value);
				if (util.isNotEmpty(this.value)) {
					this.setCurrentValue(this.value);
				}
			},
			deep: true
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
		 * 使输入框获取焦点
		 */
		focus() {
			this.$refs.input.focus();
			return true;
		},
		/**
		 * 初始化激活的数据
		 */
		initActiveData(data, scrollTop = 0) {
			this.activeData = data;
			let start = Math.floor(scrollTop / 34);
			let end = start + this.visibleCount;
			this.option = this.activeData.slice(start, end);
			this.$refs.option.style.transform = `translate3d(0, ${start * 34}px, 0)`;
		},
		/**
		 * 设置当前组件的值
		 */
		setCurrentValue(value) {
			if (this.currentValue === value) {
				return;
			}
			if (util.isEmpty(value)) {
				this.currentValue = '';
				this.editorValue = '';
			} else {
				let findResult = this.data.find(e => {
					return e[this.props.value] === value;
				});
				if (util.isNotEmpty(findResult)) {
					this.currentValue = findResult[this.props.value];
					this.editorValue = findResult[this.props.label];
				} else {
					this.currentValue = '';
					this.editorValue = '';
				}
			}
		},
		/**
		 * 处理组件清空
		 * 1、将当前组件的值清空
		 * 2、触发change事件
		 * 3、如果内容区为显示状态，则需要关闭显示区
		 */
		handleClear() {
			this.currentValue = '';
			this.editorValue = '';
			this.dispatchChange(this.currentValue, null);
			if ((this.contentVisible = true)) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理输入框focus事件
		 * 1、触发获取焦点事件
		 * 2、显示内容区
		 */
		handleFocus(event) {
			this.$emit('focus', event);
			this.handleContentVisibleChange(true);
		},
		/**
		 * 处理输入框input事件
		 * 1、过滤数据
		 * 2、初始化激活的数据
		 */
		handleInput() {
			let filterResult = util.isEmpty(this.editorValue)
				? this.data
				: this.data.filter(e => {
						return e[this.props.label].includes(this.editorValue);
				  });
			this.initActiveData(filterResult);
		},
		/**
		 * 处理输入框blur事件
		 */
		handleBlur(event) {
			this.$emit('blur', event);
			dispatchValidateEvent(this, 'ElFormItem', 'el.form.blur', [
				this.currentValue
			]);
		},
		/**
		 * 处理keyupEnter事件
		 * 1、选项数据只有一条，且内容区为显示状态
		 *    1、设置当前组件的值
		 *    2、触发change事件
		 * 2、如果内容区为显示状态，则应该关闭
		 */
		handleKeyupEnter() {
			if (this.option.length === 1 && this.contentVisible === true) {
				this.currentValue = this.option[0][this.props.value];
				this.dispatchChange(this.currentValue, this.option[0]);
			}
			if (this.contentVisible === true) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理选项点击事件
		 * 1、设置当前组件的值
		 * 2、触发change事件
		 * 3、关闭内容区
		 */
		handleClick(data) {
			this.currentValue = data[this.props.value];
			this.dispatchChange(this.currentValue, data);
			this.handleContentVisibleChange(false);
		},
		/**
		 * 处理内容区滚动
		 */
		handleScroll() {
			let scrollTop = $(`#${this.activeId}`).scrollTop();
			this.initActiveData(this.activeData, scrollTop);
		},
		/**
		 * 触发组件外点击事件
		 * 1、处理内容区关闭
		 */
		handleClickoutside(value) {
			let targetId = value.path.reduce((collect, e) => {
				return (collect += e.id);
			}, '');
			if (targetId.includes(this.activeId)) {
				return;
			}
			this.handleContentVisibleChange(false);
		},
		/**
		 * 处理内容区显示关闭
		 * 1、如果为内容区关闭
		 *    1、恢复输入框的值
		 *    2、初始化激活的数据
		 * 2、更改内容区显示状态
		 * 3、触发事件
		 */
		handleContentVisibleChange(value) {
			if (value === false) {
				if (util.isNotEmpty(this.currentValue)) {
					let findResult = this.data.find(e => {
						return e[this.props.value] === this.currentValue;
					});
					this.editorValue = findResult[this.props.label];
				} else {
					this.editorValue = '';
				}
				this.initActiveData(this.data);
			}
			this.contentVisible = value;
			this.$emit('visible-change', value);
		},
		/**
		 * 触发change事件
		 */
		dispatchChange(value, data) {
			// hack方法，确保先触发input事件之后再触发change事件
			setTimeout(() => {
				this.$emit('change', value, data);
				dispatchValidateEvent(this, 'ElFormItem', 'el.form.change', [value]);
			}, 0);
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		},
		isEmpty(value) {
			return util.isEmpty(value);
		}
	},
	computed: {
		/**
		 * 内容区高度
		 * 1、激活数据的长度 * 每项的高度
		 */
		contentHeight() {
			return this.activeData.length * 34 + 'px';
		}
	},
	/**
	 * 1、如果展示数据不为空，初始化激活的数据
	 * 2、如果绑定的值不为空，设置当前组件的值
	 */
	mounted() {
		if (util.isNotEmpty(this.data)) {
			this.initActiveData(this.data);
			if (util.isNotEmpty(this.value)) {
				this.setCurrentValue(this.value);
			}
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.select-content-close {
	color: $--color-text-placeholder;
	position: absolute;
	top: -8px;
	right: -8px;
	z-index: 1;
	font-size: 17px;
	cursor: pointer;
	&:hover {
		color: $--color-text-regular;
	}
}
.select-content {
	position: relative;
	min-width: 215px;
	height: 238px;
	overflow: auto;
	.select-content-phantom {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		z-index: -1;
	}
	.select-content-option {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
	}
	.select-content-option-item {
		font-size: 14px;
		padding: 0 10px;
		white-space: nowrap;
		color: $--select-option-color;
		height: 34px;
		line-height: 34px;
		box-sizing: border-box;
		cursor: pointer;
		&:hover {
			background-color: $--select-option-hover-background;
		}
		&.select-option-selected {
			color: $--color-primary;
		}
	}
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.select-container {
	display: inline-block;
	width: 240px;
	position: relative;
	.select-editor {
		height: 32px;
		line-height: 30px;
		position: relative;
		padding: 0 15px 0 10px;
		background-color: $--color-white;
		border: $--input-border;
		border-radius: $--input-border-radius;
		outline: none;
		box-sizing: border-box;
		&:hover {
			border-color: $--border-color-hover;
		}
		&.is-disable {
			background-color: $--input-disabled-fill;
		}
		input {
			width: 100%;
			height: 30px;
			line-height: 30px;
			font-size: $--font-size-small;
			padding: 0;
			border: none;
			color: $--input-color;
			background-color: transparent;
			outline: none;
			overflow: hidden;
			&.is-disable {
				color: $--input-disabled-color;
				cursor: not-allowed;
			}
			&::-webkit-input-placeholder {
				/* WebKit browsers */
				color: $--color-text-placeholder;
				font-size: $--font-size-small;
			}
			&:-moz-placeholder {
				/* Mozilla Firefox 4 to 18 */
				color: $--color-text-placeholder;
				font-size: $--font-size-small;
			}
			&::-moz-placeholder {
				/* Mozilla Firefox 19+ */
				color: $--color-text-placeholder;
				font-size: $--font-size-small;
			}
			&:-ms-input-placeholder {
				/* Internet Explorer 10+ */
				color: $--color-text-placeholder;
				font-size: $--font-size-small;
			}
		}
		.select-clear {
			position: absolute;
			right: 2px;
			top: 0;
		}
	}
}
</style>
