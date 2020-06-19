<!-- 地区选择 -->
<template>
	<!-- 容器 -->
	<div class="area-input" v-clickoutside="handleClickoutside">
		<!-- 组件主体区域 -->
		<el-popover ref="popover" placement="bottom-start" trigger="manual" v-model="contentVisible">
			<!-- 内容区域 -->
			<div class="area-input-content" :id="`${activeId}`">
				<i class="fa fa-times-circle content-close" @click="handleContentVisibleChange(false)"></i>
				<el-tree ref="tree" :data="data" :props="props" node-key="code" :expand-on-click-node="false" :default-expand-all="true" empty-text="加载中......" @node-click="handleNodeClick">
					<span class="area-tree-content" slot-scope="{ node, data }">
						<i class="fa fa-caret-right expand-icon" @click.stop="handleExpand(data)" v-if="data.isLeaf !== 1 && isEmpty(data.children)"></i>
						<span :class="{'color-primary': currentValue === data.code, 'color-text-secondary': data.disabled === SWITCH.ACTIVE}">{{data.name}}</span>
					</span>
				</el-tree>
			</div>
			<!-- 输入框区域 -->
			<div slot="reference" class="area-input-editor" :class="{'is-disable': disabled}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
				<input ref="input" :class="{'is-disable': disabled}" type="text" v-model.trim="editorValue" :placeholder="placeholder" :disabled="disabled" @focus="handleFocus" @input="debounceHandleInput" @blur="handleBlur" @keyup.enter="handleKeyupEnter">
				<div class="area-input--clear" @click="handleClear" v-if="clearable">
					<i class="fa fa-times-circle poi color-text-secondary" v-show="!isEmpty(currentValue) && clearVisible === true"></i>
				</div>
			</div>
		</el-popover>
	</div>
</template>
<script>
import { dispatchValidateEvent } from '@/mixin/form';
import { SWITCH } from '@/assets/js/constant';
import { Tree } from '@/assets/js/model';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

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
		 * 显示的值
		 */
		displayValue: {
			type: String,
			default: ''
		},
		/**
		 * placeholder
		 */
		placeholder: {
			type: String,
			default: ''
		},
		/**
		 * 是否懒加载数据
		 */
		lazy: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否禁用
		 */
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否可以清空组件
		 */
		clearable: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			activeId: new Date().getTime(),
			currentValue: '',
			editorValue: '',
			originalEditorValue: '',
			data: [],
			contentVisible: false,
			clearVisible: false,
			props: {
				label: 'name',
				disabled: 'disabled',
				children: 'children'
			},
			SWITCH
		};
	},
	created() {
		this.debounceHandleInput = _.debounce(this.handleInput, 350);
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
		 * 使输入框获取焦点
		 */
		focus() {
			this.$refs.input.focus();
			return true;
		},
		/**
		 * 设置当前组件的值
		 * 1、判断是否与当前组件的值相等，如果相等的话，不继续执行
		 * 2、如果传进来的值为空，则清空组件相关的值
		 * 3、判断显示的值是否不为空
		 */
		async setCurrentValue(value) {
			try {
				if (this.currentValue === value) {
					return;
				}
				if (util.isEmpty(value)) {
					this.currentValue = '';
					this.editorValue = '';
					this.originalEditorValue = '';
				} else {
					let response = util.isNotEmpty(this.displayValue)
						? {
								code: value,
								name: this.displayValue
						  }
						: await this.getDataByCode(value);
					this.currentValue = response.code;
					this.editorValue = response.name;
					this.originalEditorValue = response.name;
				}
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * 获取数据
		 */
		getData(keyword = '') {
			return new Promise((resolve, reject) => {
				fetch
					.get('/pex/travelGraph/getCityData', {
						params: {
							cityKeys: keyword
						}
					})
					.then(({ data }) => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
						let errMsg = util.isNotEmpty(err.msg) ? err.msg : '获取数据失败！';
						this.$message({
							type: 'error',
							message: errMsg
						});
					});
			});
		},
		/**
		 * 根据代码获取数据
		 */
		getDataByCode(value) {
			return new Promise((resolve, reject) => {
				fetch
					.get('/pex/travelGraph/getCityDataByCode', {
						params: {
							code: value
						}
					})
					.then(({ data }) => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
						let errMsg = util.isNotEmpty(err.msg) ? err.msg : '获取数据失败！';
						this.$message({
							type: 'error',
							message: errMsg
						});
					});
			});
		},
		/**
		 * 处理节点点击
		 * 1、设置当前组件的值
		 * 2、触发change事件
		 * 3、关闭内容区
		 */
		handleNodeClick(data) {
			if (data.disabled === SWITCH.ACTIVE) {
				return;
			}
			this.currentValue = data.code;
			this.editorValue = data.name;
			this.originalEditorValue = data.name;
			this.dispatchChange(this.currentValue, data);
			this.handleContentVisibleChange(false);
		},
		/**
		 * 处理组件清空
		 * 1、将当前组件的值清空
		 * 2、触发change事件
		 * 3、如果内容区为显示状态，则需要关闭显示区
		 * 4、重新获取数据
		 */
		handleClear() {
			this.currentValue = '';
			this.editorValue = '';
			this.originalEditorValue = '';
			this.dispatchChange(this.currentValue, null);
			if ((this.contentVisible = true)) {
				this.handleContentVisibleChange(false);
			}
			this.getData().then(data => {
				this.data = data;
			});
		},
		/**
		 * 处理输入框获取焦点事件
		 * 1、如果为懒加载数据，且data为空，需要获取数据
		 * 2、触发获取焦点事件
		 * 3、显示内容区
		 */
		handleFocus(event) {
			if (this.lazy && util.isEmpty(this.data)) {
				this.getData().then(data => {
					this.data = data;
				});
			}
			this.$emit('focus', event);
			this.handleContentVisibleChange(true);
		},
		/**
		 * 处理输入框input事件
		 * 1、获取数据
		 * 2、设置树组件数据
		 * 3、滚动条置顶
		 * 4、显示内容区
		 * 5、更新Popper状态
		 */
		async handleInput() {
			try {
				let response = await this.getData(this.editorValue);
				this.data = Tree.getTree(response);
				$(this.$refs.tree.$el).animate({ scrollTop: 0 });
				this.handleContentVisibleChange(true);
				setTimeout(() => {
					this.$refs.popover.updatePopper();
				}, 0);
			} catch (err) {
				console.error(err);
			}
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
		 * 1、如果内容区为显示状态
		 *    1、过滤数据，看是否只有一条数据
		 *    2、处理内容区显示关闭
		 */
		handleKeyupEnter() {
			if (this.contentVisible === true) {
				let filterResult = Tree.getArray(this.data, Tree.defaultProps).filter(
					e => {
						return e.name.includes(this.editorValue);
					}
				);
				if (filterResult.length === 1) {
					this.currentValue = filterResult[0].code;
					this.editorValue = filterResult[0].name;
					this.originalEditorValue = filterResult[0].name;
					this.dispatchChange(this.currentValue, filterResult[0]);
				}
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理节点展开
		 * 1、获取子节点数据
		 * 2、设置子节点数据
		 */
		async handleExpand(data) {
			try {
				let response = await this.getData(data.code);
				this.$set(data, 'children', response);
			} catch (err) {
				console.error(err);
			}
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
		 * 1、如果为内容区关闭，需要重置输入框的值
		 * 2、更改内容区显示状态
		 * 3、触发事件
		 */
		handleContentVisibleChange(value) {
			if (value === false) {
				this.editorValue = util.isNotEmpty(this.currentValue)
					? this.originalEditorValue
					: '';
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
		isEmpty(value) {
			return util.isEmpty(value);
		}
	},
	/**
	 * 1、如果不为lazy，则需要获取选项数据
	 * 2、如果绑定的值不为空，则应该设置当前组件的值
	 */
	mounted() {
		if (!this.lazy) {
			this.getData().then(data => {
				this.data = data;
			});
		}
		if (util.isNotEmpty(this.value)) {
			this.setCurrentValue(this.value);
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.area-input-content {
	min-width: 215px;
	.content-close {
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
	.el-tree {
		max-height: 250px;
		width: 100%;
		overflow: auto;
	}
	.area-tree-content {
		position: relative;
		cursor: pointer;
		.expand-icon {
			position: absolute;
			top: 2px;
			left: -19px;
			padding: 0 6px;
			color: $--color-c0c4cc;
		}
	}
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.area-input {
	display: inline-block;
	width: 240px;
	position: relative;
	.area-input-editor {
		height: 32px;
		line-height: 30px;
		position: relative;
		padding: 0 15px 0 10px;
		background-color: $--color-white;
		border: 1px solid $--color-c0c4cc;
		border-radius: $--input-border-radius;
		outline: none;
		box-sizing: border-box;
		&:hover {
			border: 1px solid $--color-909399;
		}
		&.pr40 {
			padding-right: 40px;
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
		.area-input--clear {
			position: absolute;
			right: 2px;
			top: 0;
		}
	}
}
</style>
