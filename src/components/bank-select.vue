<template>
	<div class="bank-select" v-clickoutside="handleClickoutside">
		<!-- 组件主体区域 -->
		<el-popover ref="popover" placement="bottom-start" trigger="manual" v-model="contentVisible">
			<!-- 内容内容区 -->
			<div class="bank-select-content" :id="`${activeId}`">
				<i class="fa fa-times-circle bank-select-content-close" @click="handleContentVisibleChange(false)"></i>
				<ul>
					<li class="bank-select-content-option" :class="{'bank-select-option-selected': e.banknodeName === currentValue}" v-for="(e, i) in option" :key="i" @click="handleClick(e)">
						{{e.banknodeName}}
					</li>
				</ul>
				<div class="tc color-text-secondary f13" v-show="isEmpty(option)">
					暂无数据！
				</div>
			</div>
			<!-- 输入框区域 -->
			<div slot="reference" class="bank-select-editor" :class="{'is-disable': disabled, 'pr40': isNotEmpty(currentValue)}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
				<input ref="input" :class="{'is-disable': disabled}" type="text" v-model.trim="editorValue" :placeholder="placeholder" :disabled="disabled" @focus="handleFocus" @input="handleInput" @change="handleChange" @blur="handleBlur" @keyup.enter="handleKeyupEnter">
				<div class="bank-select-action">
					<i class="fa fa-times-circle poi color-text-secondary" @click="handleClear" v-show="isNotEmpty(currentValue) && clearVisible === true"></i>
					<span class="f12 link-primary" @click="handleMore">更多</span>
				</div>
			</div>
		</el-popover>
		<!-- 组件弹出框区域 -->
		<el-dialog top="5vh" :visible.sync="dialog.visible" width="1100px" :append-to-body="true" v-draggable @close="handleDialogClose">
			<span slot="title">
				<i class="fa fa-university b"> 开户行</i>
				<i class="el-icon-info color-warning ml5 f12"> 双击行选中数据</i>
			</span>
			<!-- 条件查询 -->
			<div class="fix">
				<span>开户行：</span>
				<el-select v-model="dialog.bankCode" placeholder="选择开户行" filterable clearable @change="getPageInfo">
					<el-option v-for="(e, i) in dialog.bankTypeList" :key="i" :label="e.bankName" :value="e.bankCode">
					</el-option>
				</el-select>
				<span class="ml5">省份：</span>
				<el-select v-model="dialog.provinceCode" placeholder="选择省份" filterable clearable @change="handleProvinceChange">
					<el-option v-for="(e, i) in dialog.provinceList" :key="i" :label="e.name" :value="e.code">
					</el-option>
				</el-select>
				<span class="ml5">城市：</span>
				<el-select v-model="dialog.cityCode" placeholder="选择省份" filterable clearable @change="getPageInfo">
					<el-option v-for="(e, i) in dialog.cityList" :key="i" :label="e.name" :value="e.code">
					</el-option>
				</el-select>
				<el-input class="r" size="small" v-model.trim="dialog.madKeyWord" @keyup.enter.native="getPageInfo" placeholder="输入关键字（按Enter键查询）" style="width: 200px;"></el-input>
			</div>
			<!-- 列表区域 -->
			<el-table class="mt5" size="small" border :data="dialog.tableData" :height="450" :header-cell-style="TABLE_HEADER_CELL_STYLE" row-class-name="poi" @row-dblclick="handleRowDbClick">
				<el-table-column prop="bankName" label="开户行" align="left" header-align="center" width="200"></el-table-column>
				<el-table-column prop="banknodeName" label="支行信息" align="left" header-align="center"></el-table-column>
				<el-table-column prop="provinceName" label="省份" align="left" header-align="center" width="130"></el-table-column>
				<el-table-column prop="cityName" label="城市" align="left" header-align="center" width="170"></el-table-column>
			</el-table>
			<div class="fix">
				<el-pagination class="r" @current-change="handleCurrentPageChange" :current-page="dialog.currentPage" :page-size="dialog.pageSize" layout="total, prev, pager ,next,jumper" :total="dialog.total">
				</el-pagination>
			</div>
			<div slot="footer" class="dialog-footer">
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { dispatchValidateEvent } from '@/mixin/form';
import { TABLE_HEADER_CELL_STYLE } from '@/mixin/style';
import fetch from '@/config/fetch';
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
		 * 是否禁用
		 */
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * placeholder
		 */
		placeholder: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			activeId: new Date().getTime(),
			currentValue: '',
			editorValue: '',
			option: [],
			contentVisible: false,
			clearVisible: false,
			dialog: {
				visible: false,
				bankCode: '',
				provinceCode: '',
				cityCode: '',
				madKeyWord: '',
				bankTypeList: [],
				provinceList: [],
				cityList: [],
				tableData: [],
				currentPage: 1,
				pageSize: 50,
				total: 0
			},
			TABLE_HEADER_CELL_STYLE
		};
	},
	created() {
		this.debounceGetOption = _.debounce(this.getOption, 350);
		this.debounceDispatchChange = _.debounce(this.dispatchChange, 200);
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
		 */
		setCurrentValue(value) {
			if (this.currentValue === value) {
				return;
			}
			this.currentValue = value;
			this.editorValue = value;
		},
		/**
		 * 获取选项数据
		 * 1、如果当前组件值为空
		 *    1、则清空选项数据
		 *    2、更新popper状态
		 * 2、如果当前组件值不为空
		 *    1、请求数据
		 *    2、如果请求到的数据不为空，并且内容区为关闭状态，则更改内容区状态
		 *    3、更新popper状态
		 */
		getOption() {
			if (util.isEmpty(this.currentValue)) {
				this.option = [];
				this.updatePopper();
			} else {
				fetch
					.get('/pex/business/ehcache/getBankNodes', {
						params: {
							madKeyWord: this.editorValue
						}
					})
					.then(({ data }) => {
						this.option = data;
						if (util.isNotEmpty(this.option) && this.contentVisible === false) {
							this.handleContentVisibleChange(true);
						}
						this.updatePopper();
					})
					.catch(() => {
						this.option = [];
					});
			}
		},
		/**
		 * 获取银行类型
		 */
		getBankTypeList() {
			return new Promise((resolve, reject) => {
				fetch
					.get('/pex/business/getBankCodeAndNames')
					.then(({ data }) => {
						this.dialog.bankTypeList = data;
						if (util.isNotEmpty(data)) {
							this.dialog.bankCode = data[0].bankCode;
						}
						resolve();
					})
					.catch(err => {
						reject(err);
						this.$message({
							type: 'error',
							message: err.msg
						});
					});
			});
		},
		/**
		 * 获取省份列表
		 */
		getProvinceList() {
			fetch
				.get('/pex/business/firstArea')
				.then(({ data }) => {
					this.dialog.provinceList = data;
				})
				.catch(({ msg }) => {
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 获取城市数据
		 */
		getCityList(provinceCode) {
			this.dialog.cityCode = '';
			if (util.isEmpty(provinceCode)) {
				this.dialog.cityList = [];
			} else {
				fetch
					.get('/pex/business/secondArea', {
						params: {
							provinceCode: provinceCode
						}
					})
					.then(({ data }) => {
						this.dialog.cityList = data;
					})
					.catch(({ msg }) => {
						this.$message({
							type: 'error',
							message: msg
						});
					});
			}
		},
		/**
		 * 获取分页信息
		 */
		getPageInfo() {
			this.dialog.currentPage = 1;
			this.dialog.total = 0;
			this.dialog.tableData = [];
			this.getTableData();
		},
		/**
		 * 获取表格数据
		 */
		getTableData() {
			this.$loading();
			fetch
				.get('/pex/business/getNodesByKeywordPage', {
					params: {
						bankCode: this.dialog.bankCode,
						provinceCode: this.dialog.provinceCode,
						cityCode: this.dialog.cityCode,
						madKeyWord: this.dialog.madKeyWord,
						pageIndex: this.dialog.currentPage,
						pageSize: this.dialog.pageSize
					}
				})
				.then(({ data }) => {
					this.$loadingClose();
					this.dialog.tableData = data.result;
					this.dialog.total = data.total;
				})
				.catch(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 处理选项点击事件
		 * 1、设置当前组件的值
		 * 2、触发change事件
		 * 3、关闭内容区
		 */
		handleClick(data) {
			this.setCurrentValue(data.banknodeName);
			this.debounceDispatchChange(data.banknodeName, data);
			this.handleContentVisibleChange(false);
		},
		/**
		 * 处理行点击
		 * 1、设置当前组件的值
		 * 2、触发change事件
		 * 3、关闭弹出框
		 */
		handleRowDbClick(rowData) {
			this.setCurrentValue(rowData.banknodeName);
			this.debounceDispatchChange(rowData.banknodeName, rowData);
			this.dialog.visible = false;
		},
		/**
		 * 处理组件清空
		 * 1、将当前组件的值清空
		 * 2、触发change事件
		 * 3、触发clear事件
		 * 4、如果内容区为显示状态，则需要关闭内容区
		 */
		handleClear() {
			this.setCurrentValue('');
			this.debounceDispatchChange('', null);
			this.$emit('clear');
			if ((this.contentVisible = true)) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理输入框focus事件
		 * 1、选中输入区的值
		 * 2、触发focus事件
		 * 3、如果组件当前的值不为空，则获取选项数据
		 */
		handleFocus(event) {
			this.$nextTick(() => {
				event.target.select();
				this.$emit('focus', event);
				if (util.isNotEmpty(this.currentValue)) {
					this.debounceGetOption();
				}
			});
		},
		/**
		 * 处理输入框input事件
		 * 1、设置当前组件的值
		 * 2、获取选项数据
		 */
		handleInput() {
			this.setCurrentValue(this.editorValue);
			this.debounceGetOption();
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
		 * 处理keyupEnter事件
		 * 1、如果选项数据只有一条
		 *    1、设置当前组件的值
		 *    2、触发change事件
		 * 2、如果内容区为显示状态，则应该关闭
		 */
		handleKeyupEnter() {
			if (this.option.length === 1) {
				this.setCurrentValue(this.option[0].banknodeName);
				this.debounceDispatchChange(
					this.option[0].banknodeName,
					this.option[0]
				);
			}
			if (this.contentVisible === true) {
				this.handleContentVisibleChange(false);
			}
		},
		/**
		 * 处理查看更多
		 * 1、获取银行类型数据
		 * 2、获取省份数据
		 * 3、获取表格数据
		 */
		async handleMore() {
			try {
				await this.getBankTypeList();
				this.getProvinceList();
				this.getTableData();
				this.dialog.visible = true;
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * 处理省份变化
		 * 1、获取城市数据
		 * 2、获取列表数据
		 */
		handleProvinceChange(value) {
			this.getCityList(value);
			this.getPageInfo();
		},
		/**
		 * 处理页码变化
		 */
		handleCurrentPageChange(value) {
			this.dialog.currentPage = value;
			this.getTableData();
		},
		/**
		 * 处理弹出框关闭
		 */
		handleDialogClose() {
			this.dialog.bankCode = '';
			this.dialog.provinceCode = '';
			this.dialog.cityCode = '';
			this.dialog.madKeyWord = '';
			this.dialog.currentPage = 1;
			this.dialog.total = 0;
			this.dialog.tableData = [];
			this.dialog.bankTypeList = [];
			this.dialog.provinceList = [];
			this.dialog.cityList = [];
		},
		/**
		 * 处理内容区显示关闭
		 * 1、如果内容区为关闭，则清空选项数据
		 * 2、更改内容区显示状态
		 * 3、触发事件
		 */
		handleContentVisibleChange(value) {
			if (value === false) {
				this.option = [];
			}
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
		 * 更新popover状态
		 */
		updatePopper() {
			if (this.contentVisible === true) {
				setTimeout(() => {
					this.$refs.popover.updatePopper();
				}, 0);
			}
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
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		}
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.setCurrentValue(this.value);
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.bank-select-content {
	min-width: 215px;
	max-height: 250px;
	overflow: auto;
	.bank-select-content-close {
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
	.bank-select-content-option {
		font-size: $--font-size-small;
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
		&.bank-select-option-selected {
			color: $--color-primary;
		}
	}
}
</style>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.bank-select {
	display: inline-block;
	width: 240px;
	position: relative;
	.bank-select-editor {
		height: 32px;
		line-height: 30px;
		position: relative;
		padding: 0 25px 0 10px;
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
		.bank-select-action {
			position: absolute;
			right: 2px;
			top: 0;
		}
	}
}
/deep/ .el-input__validateIcon {
	width: 0;
	&:before {
		content: '';
	}
}
</style>
