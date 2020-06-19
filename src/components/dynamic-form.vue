<template>
	<div>
		<!-- input -->
		<el-input :ref="FORM_TYPE.INPUT" size="small" :readonly="readonly" :disabled="disabled" :placeholder="placeholder" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" @clear="() => dispatch('clear')" v-model.trim="currentValue" v-if="type === FORM_TYPE.INPUT">
		</el-input>
		<!-- format-input -->
		<v-format-input :ref="FORM_TYPE.FORMAT_INPUT" size="small" :readonly="readonly" :disabled="disabled" :placeholder="placeholder" :decimal="formatDecimal" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" @clear="() => dispatch('clear')" v-model.trim="currentValue" v-if="type === FORM_TYPE.FORMAT_INPUT">
		</v-format-input>
		<!-- textarea -->
		<el-input :ref="FORM_TYPE.TEXTAREA" type="textarea" rows="3" :readonly="readonly" :disabled="disabled" :maxlength="showWordLimit ? maxlength : 9999" :show-word-limit="showWordLimit" :placeholder="placeholder" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" @clear="() => dispatch('clear')" v-model="currentValue" v-if="type === FORM_TYPE.TEXTAREA">
		</el-input>
		<!-- select -->
		<el-select :ref="FORM_TYPE.SELECT" size="small" :disabled="disabled" :clearable="clearable" :placeholder="placeholder" :multiple="multiple" :filterable="true" v-model="currentValue" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" @visible-change="val => dispatch('visible-change', val)" @remove-tag="val => dispatch('remove-tag', val)" v-if="type === FORM_TYPE.SELECT">
			<el-option v-for="(e, i) in options" :key="i" :label="e[optionsProps.label]" :value="e[optionsProps.id]" :disabled="e[optionsProps.disabled] === SWITCH.ACTIVE">
			</el-option>
		</el-select>
		<!-- radio -->
		<el-radio-group :ref="FORM_TYPE.RADIO" size="small" :disabled="disabled" :border="false" v-model="currentValue" @change="val => dispatch('change', val)" v-if="type === FORM_TYPE.RADIO">
			<el-radio v-for="(e, i) in options" :key="i" :label="e[optionsProps.id]" :disabled="e[optionsProps.disabled]">{{e[optionsProps.label]}}</el-radio>
		</el-radio-group>
		<!-- checkbox -->
		<el-checkbox-group :ref="FORM_TYPE.CHECKBOX" size="small" :disabled="disabled" v-model="currentValue" @change="val => dispatch('change', val)" v-if="type === FORM_TYPE.CHECKBOX">
			<el-checkbox v-for="(e, i) in options" :key="i" :label="e[optionsProps.id]">{{e[optionsProps.label]}}</el-checkbox>
		</el-checkbox-group>
		<!-- date -->
		<el-date-picker :ref="FORM_TYPE.DATE" size="small" :readonly="readonly" :disabled="disabled" :clearable="clearable" :placeholder="placeholder" type="date" value-format="yyyy-MM-dd" v-model="currentValue" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" :picker-options="datePickerOptions" v-if="type === FORM_TYPE.DATE">
		</el-date-picker>
		<!-- datetime -->
		<v-date-time :ref="FORM_TYPE.DATE_TIME" size="small" v-model="currentValue" :props="bindProps" :readonly="readonly" :disabled="disabled" :clearable="clearable" :placeholder="placeholder" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="val => dispatch('change', val)" v-if="type === FORM_TYPE.DATE_TIME">
		</v-date-time>
		<!-- switch -->
		<el-switch :ref="FORM_TYPE.SWITCH" :disabled="disabled" v-model="currentValue" active-text="是" inactive-text="否" :active-value="SWITCH.ACTIVE" :inactive-value="SWITCH.INACTIVE" @change="val => dispatch('change', val)" v-if="type === FORM_TYPE.SWITCH">
		</el-switch>
		<!-- tree -->
		<v-tree-input :ref="FORM_TYPE.TREE" :data="options" :data-type="treeDataType" :multiple="multiple" :display="display" :disabled="disabled" v-model="currentValue" :placeholder="placeholder" :props="optionsProps" :clearable='clearable' :leaf="treeLeaf" :expand="treeExpand" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="handleTreeInputChange" @clear="() => dispatch('clear')" v-if="type === FORM_TYPE.TREE"></v-tree-input>
		<!-- selectInput -->
		<v-select-input :ref="FORM_TYPE.SELECT_INPUT" :data="options" v-model="currentValue" :disabled="disabled" :placeholder="placeholder" :props="bindProps" :encrypt="encrypt" :trigger-on-focus="triggerOnFocus" :tip="tip" :tooltip="selectInputTooltip" @focus="val => dispatch('focus', val)" @blur="val => dispatch('blur', val)" @change="handleSelectInputChange" v-if="type === FORM_TYPE.SELECT_INPUT">
			<template v-slot:tooltip="slotProps">
				<slot name="select-input" :data="slotProps.data"></slot>
			</template>
		</v-select-input>
		<!-- file -->
		<v-file-input :ref="FORM_TYPE.FILE" v-model="currentValue" :url="uploadUrl" :disabled="disabled" @change="val => dispatch('change', val)" v-if="type === FORM_TYPE.FILE"></v-file-input>
	</div>
</template>
<script>
import { FORM_TYPE, SWITCH } from '@/assets/js/constant';

export default {
	props: {
		type: {
			type: String,
			default: FORM_TYPE.INPUT
		},
		value: [String, Number, Array],
		placeholder: {
			type: String,
			default: ''
		},
		readonly: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		maxlength: {
			type: Number,
			default: 9999
		},
		showWordLimit: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: true
		},
		multiple: {
			type: Boolean,
			default: false
		},
		display: {
			type: String,
			default: 'NAME'
		},
		triggerOnFocus: {
			type: Boolean,
			default: false
		},
		options: {
			type: Array,
			default() {
				return [];
			}
		},
		optionsProps: {
			type: Object,
			default() {
				return {
					id: 'code',
					label: 'name',
					pid: 'pcode',
					children: 'children',
					disabled: 'disabled'
				};
			}
		},
		bindProps: String,
		encrypt: {
			type: Boolean,
			default: false
		},
		treeDataType: String,
		treeLeaf: Boolean,
		treeExpand: Boolean,
		uploadUrl: String,
		tip: String,
		selectInputTooltip: Boolean,
		/**
		 * 金额输入框小数位数
		 */
		formatDecimal: {
			type: Number,
			default: 2
		}
	},
	data() {
		return {
			currentValue: this.value === undefined ? '' : this.value,
			datePickerOptions: {
				shortcuts: [
					{
						text: '今天',
						onClick(picker) {
							picker.$emit('pick', new Date());
						}
					},
					{
						text: '昨天',
						onClick(picker) {
							const date = new Date();
							date.setTime(date.getTime() - 3600 * 1000 * 24);
							picker.$emit('pick', date);
						}
					},
					{
						text: '一周前',
						onClick(picker) {
							const date = new Date();
							date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', date);
						}
					},
					{
						text: '一周后',
						onClick(picker) {
							const date = new Date();
							date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
							picker.$emit('pick', date);
						}
					}
				]
			},
			FORM_TYPE,
			SWITCH
		};
	},
	watch: {
		value(val) {
			if (_.isEqual(val, this.currentValue)) {
				return;
			}
			this.currentValue = val;
		},
		currentValue: {
			handler(val) {
				this.$emit('input', _.cloneDeep(val));
			},
			deep: true
		}
	},
	methods: {
		focus() {
			if (this.$refs[this.type].focus) {
				this.$refs[this.type].focus();
				return true;
			} else {
				return false;
			}
		},
		blur() {
			if (this.$refs[this.type].blur) {
				this.$refs[this.type].blur();
				return true;
			} else {
				return false;
			}
		},
		select() {
			if (this.$refs[this.type].select) {
				this.$refs[this.type].select();
				return true;
			} else {
				return false;
			}
		},
		clear() {
			if (this.$refs[this.type].clear) {
				this.$refs[this.type].clear();
				return true;
			} else {
				return false;
			}
		},
		getValue() {
			if (this.$refs[this.type].getValue) {
				return this.$refs[this.type].getValue();
			} else {
				return undefined;
			}
		},
		handleTreeInputChange(...value) {
			setTimeout(() => {
				this.$emit('change', ...value);
			}, 0);
		},
		handleSelectInputChange(...value) {
			setTimeout(() => {
				this.$emit('change', ...value);
			}, 0);
		},
		dispatch(event, value) {
			// hack方法，确保值修改之后，先触发input事件
			setTimeout(() => {
				this.$emit(event, value);
			}, 0);
		}
	}
};
</script>
<style lang="scss" scoped>
</style>
