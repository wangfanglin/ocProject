<template>
	<v-main-container>
		<iframe :src="src" frameborder="0" width="100%" height="100%"></iframe>
	</v-main-container>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { getViewParams } from '@/store/service/system-service';

export default {
	name: 'REPORT',
	data() {
		return {
			src: ''
		};
	},
	created() {
		let { userCode, fiscal, fiscalPeriod } = this.GET_LOGIN_INFO;
		let { agyCode, acbCode } = this.GET_CONTEXT_AGY_ACB;
		this.src = `${getViewParams(
			this.$route.path
		)}&fiscal=${fiscal}&agyCode=${agyCode}&nd=${fiscal}&agy=${agyCode}&mon=${fiscalPeriod}&acb=${acbCode}&userId=${userCode}`;
	},
	beforeRouteUpdate({ path }, from, next) {
		let { userCode, fiscal, fiscalPeriod } = this.GET_LOGIN_INFO;
		let { agyCode, acbCode } = this.GET_CONTEXT_AGY_ACB;
		this.src = `${getViewParams(
			path
		)}&fiscal=${fiscal}&agyCode=${agyCode}&nd=${fiscal}&agy=${agyCode}&mon=${fiscalPeriod}&acb=${acbCode}&userId=${userCode}`;
		next();
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB])
	}
};
</script>
<style lang="scss" scoped>
</style>
