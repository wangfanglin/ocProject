<template>
	<div class="main-container" :class="{'mt5': marginTop === 0}" ref="mainContainer">
		<slot>
		</slot>
	</div>
</template>
<script>
import { innerHeight } from '@/mixin/style';

export default {
	props: {
		marginTop: {
			type: Number,
			default: 0
		}
	},
	mixins: [innerHeight],
	watch: {
		innerHeight(val) {
			let marginTop = 80;
			if (this.marginTop !== 0) {
				marginTop = marginTop + this.marginTop + 15;
			}
			this.$refs.mainContainer.style.height = `${val - marginTop}px`;
		}
	}
};
</script>
<style lang="scss" scoped>
.main-container {
	width: 100%;
	box-sizing: border-box;
}
</style>


