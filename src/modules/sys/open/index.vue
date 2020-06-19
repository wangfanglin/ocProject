<template>
</template>
<script>
import util from '@/assets/js/util';
import { setViewParams } from '@/store/service/system-service';

export default {
  name: 'OPEN',
  created() {
    if (util.isNotEmpty(this.$route.query.url)) {
      if (util.isNotEmpty(this.$route.query.queryKey)) {
        setViewParams(this.$route.query.queryKey, this.$route.query);
        this.$router.replace({path: this.$route.query.url, query: this.$route.query});
      } else {
        this.$router.replace(this.$route.query.url);
      }
    } else {
      this.$router.replace('/404');
    }
  }
};
</script>
