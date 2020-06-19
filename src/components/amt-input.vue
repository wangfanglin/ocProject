<template>
	<div class="currency" ref="currency" :style="widthAndHeight">
		<div v-if="readOnly || !editing" @click="goEditing()" :style="getHeight">
			<span v-if="noValue()">&nbsp;</span>
			{{ val | format-currency(decLen) }}
		</div>
		<input @keydown="keyDown($event)" @focus="inputFocus($event)" @blur="inputBlur($event)" @input="inputEvent($event)" v-if="!readOnly && editing" :disabled="disabled" v-model="val" class="amt" :style="getHeight" :class="{ error: isError }">
	</div>
</template>
<script>
import op from '@/assets/js/operator';
import filter from '@/config/filter';
import util from '@/assets/js/util';

export default {
	props: {
		decLen: {
			type: Number,
			default: 2
		},
		width: {
			type: String,
			default: '100%'
		},
		height: {
			type: String,
			default: '100%'
		},
		value: {
			type: [Number, String]
		},
		readOnly: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		autoFocus: {
			type: Boolean,
			default: false
		},
		autoSelect: {
			type: Boolean,
			default: true
		},
		maxNum: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			isError: false,
			editing: false,
			calculated: false,
			val: this.value
		};
	},
	computed: {
		widthAndHeight() {
			return {
				width: this.width,
				height: this.height
			};
		},
		getHeight() {
			return { height: this.height };
		}
	},
	watch: {
		value(v) {
			this.val = v;
		}
	},
	methods: {
		keyDown(event) {
			if (op.isSpaceKey(event)) {
				this.$emit('spaceKeyDown', this.val);
      }
			if (op.isEqualKey(event)) {
				event.preventDefault();
				this.$emit('equalKeyDown', this.val);
      }
			if (op.isEnterOrTabKey(event)) {
				this.enterOrTabKeyDown(event);
      }
			if (
				!op.isMathKey(event) &&
				!op.isCopyKey(event) &&
				!op.isPasteKey(event)
			) {
        event.preventDefault();
			}
		},

		change() {
			let v = this.num(this.val);
			this.val = v ? v : '';
			this.$emit('input', this.val);
			this.$emit('change', this.val);
		},
		/**
		 * 数字输入框进行加减乘除四则运算
		 * @param 输入框事件
		 */
		enterOrTabKeyDown(event) {
			if (this.isExpression(this.val)) {
				this.change();
			}
			this.$emit('afterEnter', event);
			this.calculated = true;
		},

		inputFocus(event) {
			if (this.autoSelect) {
				event.target.select();
			}
			this.$emit('focus');
		},

		inputBlur(event) {
			if (!this.calculated && this.isExpression(this.val)) {
				this.change();
			}
			this.$emit('blur');
			this.calculated = false;
			this.editing = false;
		},

		isExpression(expression) {
			return _.isNaN(Number(expression));
		},
		/**
		 * 返回表达式表达的数字,如果不是有效数字，返回undefined
		 */
		num(expression) {
			let ve = expression;
			if (_.startsWith(_.trim(expression), '-')) {
				ve = '0' + expression;
			}
			try {
				if (typeof ve === 'number') {
					return ve;
				}
				let v = filter.toFixed(op.dal2Rpn(ve), this.decLen);
				return _.isNaN(Number(v)) ? undefined : v;
			} catch (e) {
				return undefined;
			}
		},
		/**
		 * input输入框的input事件
		 * 用于把值及时传出去
		 */
		inputEvent(event) {
			let val = this.val.replace(/=/g, '');
			this.$set(this.$data, 'val', val);
			if (!this.isExpression(val)) {
				this.$emit('input', val);
				this.$emit('change', val);
			}
		},

		noValue() {
			return util.isEmpty(this.val);
		},

		goEditing() {
			if (this.readOnly) {
				return;
			}
			this.editing = true;
			this.$nextTick(() => {
				if (this.$refs.currency) {
					this.$refs.currency.children[0].focus();
				}
			});
		}
	},

	mounted() {
		if (this.autoFocus) {
			this.goEditing();
		}
	}
};
</script>
<style lang="scss" scoped>
.amt {
	text-align: right;
	width: 100%;
	background-color: transparent;
	box-sizing: border-box;
	outline: none;
	border: none;
	font-size: 1em;
}
.error {
	border: 0 solid red !important;
}
.currency {
	display: inline-block;
	text-align: right;
	background-color: transparent;
	padding-right: 5px;
	box-sizing: border-box;
	div {
		width: 100%;
		background-color: transparent;
	}
}
</style>
