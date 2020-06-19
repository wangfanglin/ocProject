<template>
	<div class="range-input-container bsb dib tc fix">
		<el-input class="l" size="small" v-model.trim="l" @input="handleInput" @keyup.enter.native="handleKeyupEnter" placeholder="请输入"></el-input>
		<span class="range-separator">
			{{rangeSeparator}}
		</span>
		<el-input class="r" size="small" v-model.trim="r" @input="handleInput" @keyup.enter.native="handleKeyupEnter" placeholder="请输入"></el-input>
	</div>
</template>

<script>
import util from '@/assets/js/util';

export default {
	props: {
		rangeSeparator: {
			type: String,
			default: '-'
		},
		value: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			l: '',
			r: ''
		};
	},
	watch: {
		value: {
			handler(val) {
				if (util.isEmpty(val)) {
					this.l = this.r = '';
				} else {
					if (val.length === 1) {
						this.l = val[0];
					}
					if (this.value.length === 2) {
						this.l = this.value[0];
						this.r = this.value[1];
					}
				}
			},
			deep: true
		}
	},
	methods: {
		handleInput() {
			if (util.isEmpty(this.l) && util.isEmpty(this.r)) {
				this.$emit('input', []);
			} else {
				this.$emit('input', [this.l, this.r]);
			}
		},
		handleKeyupEnter() {
			this.$emit('keyupEnter');
		}
	},
	mounted() {
		if (this.value.length === 1) {
			this.l = this.value[0];
		}
		if (this.value.length === 2) {
			this.l = this.value[0];
			this.r = this.value[1];
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';

.range-input-container {
	width: 250px;
	height: 34px;
	line-height: 32px;
	border: $--border-base;
	border-radius: $--border-radius-base;
	background: $--color-white;
	.el-input {
		width: 120px;
		/deep/ input {
			text-align: center;
		}
	}
	/deep/ .el-input__inner {
		border: none;
		height: 32px;
		padding: 0;
	}
	.range-separator {
		font-size: 13px;
	}
}
</style>
