<template>
	<div ref="editor"></div>
</template>
<script>
import E from 'wangeditor';

export default {
	props: {
		value: {
			type: String,
			default: ''
		}
	},
	watch: {
		value(val) {
			this.setCurrentValue(val);
		}
	},
	data() {
		return {
			currentValue: this.value === undefined ? '' : this.value,
			editor: null
		};
	},
	methods: {
		setCurrentValue(value) {
			if (this.currentValue === value) {
				return;
			}
			this.currentValue = value;
			this.editor.txt.html(this.currentValue);
		}
	},
	mounted() {
		this.editor = new E(this.$refs.editor);
		this.editor.customConfig.onchange = val => {
			this.currentValue = val === '<p><br></p>' ? '' : val;
			this.$emit('input', this.currentValue);
		};
		this.editor.create();
		this.editor.txt.html(this.currentValue);
	},
	beforeDestroy() {
		this.editor = null;
	}
};
</script>
<style lang="scss" scoped>
</style>
