<template>
	<div class="select-input" v-clickoutside="handleClickoutside">
		<el-popover ref="popover" placement="bottom-start" trigger="manual" v-model="contentVisible">
			<!-- 内容区域 -->
			<div class="select-input-content" :id="`${activeId}`" @mouseleave="handleContentMouseleave">
				<i class="fa fa-times-circle select-input-content-close" @click="handleContentVisibleChange(false)"></i>
				<ul>
					<li class="select-input-content-option" v-for="(e, i) in option" :key="i" @click="handleClick(e)" @mouseenter="handleOptionMouseenter(e)">
						<span :class="{'letter-spacing-2': encrypt && 'encrypt' in e && e.encrypt > 0}">{{display(e)}}</span>
					</li>
				</ul>
				<div class="tc color-text-secondary f13" v-show="isEmpty(option)">
					暂无数据！
				</div>
			</div>
			<!-- 提示信息图标区域 -->
			<div class="select-input-tooltip-icon" v-show="tooltip && tooltipVisible">
				<div class="triangle">
					<div class="top"></div>
					<div class="bottom"></div>
				</div>
			</div>
			<!-- 提示信息区域 -->
			<div class="select-input-tooltip" v-show="tooltip && tooltipVisible">
				<slot name="tooltip" :data="tooltipData"></slot>
			</div>
			<!-- 输入框区域 -->
			<div slot="reference" class="select-input-editor" :class="{'is-disable': disabled}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
				<div class="select-input-prefix">
					<el-tooltip effect="light" :content="tip" placement="top">
						<i class="fa fa-search color-text-secondary"></i>
					</el-tooltip>
				</div>
				<input ref="input" :class="{'is-disable': disabled}" type="text" v-model.trim="editorValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" @focus="handleFocus" @input="handleInput" @change="handleChange" @blur="handleBlur" @keyup.enter="handleKeyupEnter">
				<div class="select-input-clear" v-show="isNotEmpty(currentValue) && clearVisible === true" @click="handleClear">
					<i class="fa fa-times-circle poi color-text-secondary"></i>
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
		 * 选项数据
		 */
		data: {
			type: Array,
			default() {
				return [];
			}
		},
		/**
		 * 绑定的值
		 */
		value: {
			type: [String, Number],
			default: ''
		},
		/**
		 * props值
		 */
		props: {
			type: String,
			default: 'name'
		},
		/**
		 * 是否禁用
		 */
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否加密显示（如需要加密，需要将数据中传入显示的位数）
		 */
		encrypt: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否在输入框focus时显示选项
		 */
		triggerOnFocus: {
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
		 * 提示信息
		 */
		tip: {
			type: String,
			default: '输入后匹配输入建议'
		},
		/**
		 * 是否显示提示信息
		 */
		tooltip: {
			Type: Boolean,
			default: false
		}
	},
	data() {
		return {
			activeId: new Date().getTime(),
			currentValue: '',
			editorValue: '',
			readonly: false,
			contentVisible: false,
			clearVisible: false,
			tooltipVisible: false,
			tooltipData: {}
		};
	},
	created() {
		this.debounceDispatchChange = _.debounce(this.dispatchChange, 200);
	},
	watch: {
		data() {
			this.setEditorValue(
				this.currentValue,
				this.getValueEncrypt(this.currentValue)
			);
		},
		value(value) {
			this.setValue(value, this.getValueEncrypt(value));
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
		 * 使输入框失去焦点
		 */
		blur() {
			this.$refs.input.blur();
		},
		/**
		 * 设置值（组件当前的值与输入框的值）
		 * 1、判断值与当前组件的值是否相等，如果相等，则直接返回
		 * 2、设置当前组件的值
		 * 3、设置输入框的值
		 */
		setValue(value, encrypt) {
			if (this.currentValue === value) {
				return;
			}
			this.currentValue = util.isNotEmpty(value) ? value : '';
			this.setEditorValue(this.currentValue, encrypt);
		},
		/**
		 * 设置编辑框的值
		 * 1、获取加密位数
		 * 2、根据是否需要加密显示，判断是否加密
		 * 3、设置输入框的只读状态
		 */
		setEditorValue(value, encrypt) {
			if (util.isNotEmpty(value) && this.encrypt && encrypt > 0) {
				value = value.toString();
				if (encrypt * 2 >= value.length) {
					this.editorValue = '*'.repeat(value.length);
				} else {
					let prefix = value.slice(0, encrypt);
					let middle = '*'.repeat(value.length - encrypt * 2);
					let suffix = value.slice(-encrypt);
					this.editorValue = prefix.concat(middle).concat(suffix);
				}
				this.readonly = true;
			} else {
				this.editorValue = value;
				this.readonly = false;
			}
		},
		/**
		 * 获取值的加密位数
		 */
		getValueEncrypt(value) {
			if (util.isEmpty(value)) {
				return 0;
			} else {
				let findResult = this.data.find(e => {
					return e[this.props] === value;
				});
				return util.isEmpty(findResult) || util.isEmpty(findResult.encrypt)
					? 0
					: findResult.encrypt;
			}
		},
		/**
		 * 处理获取焦点事件
		 * 1、如果为只读状态，则停止处理
		 * 2、选中输入区的值
		 * 3、触发focus事件
		 * 4、判断是否在输入框focus时显示选项
		 *    1、如果是，并且选项数据不为空时，更改显示区状态
		 *    2、如果否，并且输入框值不为空，并且选项数据不为空时，更改显示区状态
		 */
		handleFocus(event) {
			if (this.readonly === true) {
				return;
			}
			this.$nextTick(() => {
				event.target.select();
				this.$emit('focus', event);
				if (util.isNotEmpty(this.option)) {
					if (this.triggerOnFocus === true) {
						this.handleContentVisibleChange(true);
					}
					if (
						this.triggerOnFocus === false &&
						util.isNotEmpty(this.currentValue)
					) {
						this.handleContentVisibleChange(true);
					}
				}
			});
		},
		/**
		 * 处理输入框input事件
		 * 1、设置当前组件的值
		 * 2、设置内容区显示状态
		 * 3、更新popover状态
		 */
		handleInput() {
			this.currentValue = this.editorValue;
			if (util.isNotEmpty(this.currentValue)) {
				if (util.isNotEmpty(this.option) && this.contentVisible === false) {
					this.handleContentVisibleChange(true);
				}
			} else {
				if (this.contentVisible === true) {
					if (this.triggerOnFocus === true && util.isEmpty(this.option)) {
						this.handleContentVisibleChange(false);
					}
					if (this.triggerOnFocus === false) {
						this.handleContentVisibleChange(false);
					}
				}
			}
			if (this.contentVisible === true) {
				setTimeout(() => {
					this.$refs.popover.updatePopper();
				}, 0);
			}
		},
		/**
		 * 处理输入框change事件（防抖是避免点击选项的时候，重复触发change）
		 * 1、触发change事件
		 */
		handleChange() {
			this.debounceDispatchChange(this.currentValue, null);
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
		 * 处理选项点击事件
		 * 1、设置当前组件的值
		 * 2、触发change事件
		 * 3、处理内容区显示关闭
		 */
		handleClick(data) {
			this.setValue(data[this.props], data.encrypt);
			this.debounceDispatchChange(data[this.props], data);
			this.handleContentVisibleChange(false);
		},
		/**
		 * 处理选项数据鼠标进入
		 */
		handleOptionMouseenter(data) {
			this.$set(this.$data, 'tooltipData', data);
			this.tooltipVisible = true;
		},
		/**
		 * 处理内容区域鼠标离开
		 */
		handleContentMouseleave() {
			this.tooltipVisible = false;
		},
		/**
		 * 处理keyupEnter事件
		 * 1、如果当前组件的值不为空，选项数据只有一条，且内容区为显示状态
		 *    1、设置当前组件的值
		 *    2、触发change事件
		 * 2、如果内容区为显示状态，则应该关闭
		 */
		handleKeyupEnter() {
			if (
				util.isNotEmpty(this.currentValue) &&
				this.option.length === 1 &&
				this.contentVisible === true
			) {
				this.setValue(this.option[0][this.props], this.option[0].encrypt);
				this.debounceDispatchChange(this.option[0][this.props], this.option[0]);
			}
			if (this.contentVisible === true) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理组件清空
		 * 1、清空组件的值
		 * 2、触发change事件
		 * 3、触发clear事件
		 * 4、如果内容区为显示状态，则需要关闭内容区
		 */
		handleClear() {
			this.editorValue = '';
			this.currentValue = '';
			this.readonly = false;
			this.debounceDispatchChange(this.currentValue, null);
			this.$emit('clear');
			if (this.contentVisible === true) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理内容区显示关闭
		 * 1、更改内容区显示状态
		 * 2、触发事件
		 */
		handleContentVisibleChange(value) {
			this.contentVisible = value;
			this.$emit('visible-change', value);
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
		 * 触发change事件
		 */
		dispatchChange(value, data) {
			// hack方法，确保先触发input事件之后再触发change事件
			setTimeout(() => {
				this.$emit('change', value, data);
				dispatchValidateEvent(this, 'ElFormItem', 'el.form.change', [value]);
			}, 0);
		},
		/**
		 * 选项显示的值，根据是否加密，显示不同位数
		 */
		display(data) {
			if (util.isNotEmpty(data)) {
				if (this.encrypt && ('encrypt' in data && data.encrypt > 0)) {
					let value = util.isNotEmpty(data[this.props])
						? data[this.props].toString()
						: '';
					let encrypt = data.encrypt;
					if (encrypt * 2 >= value.length) {
						return '*'.repeat(value.length);
					} else {
						let prefix = value.slice(0, encrypt);
						let middle = '*'.repeat(value.length - encrypt * 2);
						let suffix = value.slice(-encrypt);
						return prefix.concat(middle).concat(suffix);
					}
				} else {
					return data[this.props];
				}
			} else {
				return data;
			}
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
		 * 过滤选项数据
		 */
		option() {
			return util.isEmpty(this.currentValue)
				? this.data
				: this.data.filter(e => {
						if (util.isEmpty(e[this.props])) {
							return false;
						} else {
							return (
								e[this.props].includes(this.currentValue) ||
								PinyinMatch.match(e[this.props], this.currentValue)
							);
						}
				  });
		}
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.setValue(this.value, this.getValueEncrypt(this.value));
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.select-input-content {
	min-width: 215px;
	max-height: 250px;
	overflow: auto;
	.select-input-content-close {
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
	.select-input-content-option {
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
	}
}
.select-input-tooltip-icon {
	position: absolute;
	top: 20px;
	left: 240px;
	z-index: 3;
	width: 13px;
	height: 11px;
	background-color: $--color-ffffff;
	.triangle {
		position: relative;
		.top,
		.bottom {
			position: absolute;
			width: 12px;
			height: 0;
			border: none;
			box-sizing: border-box;
			border-bottom: 1px solid $--color-c0c4cc;
		}
		.top {
			top: 1px;
			transform: rotate(-30deg);
			-ms-transform: rotate(-30deg); /* IE 9 */
			-moz-transform: rotate(-30deg); /* Firefox */
			-webkit-transform: rotate(-30deg); /* Safari 和 Chrome */
			-o-transform: rotate(-30deg); /* Opera */
		}
		.bottom {
			top: 7px;
			transform: rotate(30deg);
			-ms-transform: rotate(30deg); /* IE 9 */
			-moz-transform: rotate(30deg); /* Firefox */
			-webkit-transform: rotate(30deg); /* Safari 和 Chrome */
			-o-transform: rotate(30deg); /* Opera */
		}
	}
}
.select-input-tooltip {
	position: absolute;
	top: 0;
	left: 250px;
	z-index: 2;
	width: 220px;
	min-height: 100px;
	padding: 0 10px;
	border: 1px solid $--color-c0c4cc;
	border-radius: $--input-border-radius;
	background-color: $--color-ffffff;
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.select-input {
	display: inline-block;
	width: 240px;
	position: relative;
	.select-input-editor {
		height: 32px;
		line-height: 30px;
		position: relative;
		padding: 0 15px 0 15px;
		background-color: $--color-white;
		border: 1px solid $--color-c0c4cc;
		border-radius: $--input-border-radius;
		outline: none;
		box-sizing: border-box;
		&:hover {
			border: 1px solid $--color-909399;
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
		.select-input-prefix {
			position: absolute;
			left: 2px;
			top: 0;
		}
		.select-input-clear {
			position: absolute;
			right: 2px;
			top: 0;
		}
	}
}
</style>
