<template>
</template>
<script>
import { mapActions } from 'vuex';
import { TOKEN_LOGIN } from '@/store/login';
import util from '@/assets/js/util';

export default {
	name: 'OAUTH',
	created() {
		if (util.isNotEmpty(this.$route.query)) {
			this.TOKEN_LOGIN(this.$route.query)
				.then(data => {
					if (util.isEmpty(this.$route.query.url)) {
						this.$router.push('/index');
					} else {
						this.$router.push({
							path: this.$route.query.url,
							query: this.$route.query
						});
					}
				})
				.catch(() => {
					this.$router.push('/404');
				});
		} else {
			this.$router.push('/404');
		}
	},
	methods: {
		...mapActions([TOKEN_LOGIN])
	}
};
</script>
