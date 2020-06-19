<template>
	<div class="agy-head fix">
		<div class="dib poi" v-if="isNotEmpty(GET_AGY_TREE)">
			<el-popover ref="agyTree" placement="bottom" trigger="click">
				<el-input size="mini" v-model.trim="filter" placeholder="请输入内容" prefix-icon="el-icon-search">
				</el-input>
				<div class="agy-head-content">
					<el-tree ref="tree" empty-text="无数据" :data="GET_AGY_TREE" :props="{label: 'name', children: 'children'}" node-key="id" :default-expand-all="true" :filter-node-method="filterNode" @node-click="handleNodeClick">
						<span slot-scope="{node, data}">
							<span :class="{'color-primary': value.madCode === data.code}">{{data.code}} {{data.name}}</span>
						</span>
					</el-tree>
				</div>
				<span slot="reference">
					<span class="tdl">{{value.madCode}}&ensp;&ensp;{{value.madName}}</span>
				</span>
			</el-popover>
		</div>
		<div class="r">
			<slot>
			</slot>
		</div>
		<v-agy-acb-change ref="agyAcbChange" @confirm="handleConfirm"></v-agy-acb-change>
	</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import { GET_AGY_TREE } from '@/store/global';
import { SET_CONTEXT_AGY_ACB } from '@/store/login';
import { getAgyInfo } from '@/store/service/agy-service';
import util from '@/assets/js/util';
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { REMOVE_OTHER_VIEW, REMOVE_ALL_VIEW } from '@/store/system';
import { STORAGE_KEY } from '@/assets/js/constant';

export default {
	props: {
		value: {
			type: Object,
			default() {
				return {};
			}
		}
	},
	data() {
		return {
			filter: '',
			recordData: {},
			props: {
				id: 'id',
				code: 'code',
				label: 'name',
				children: 'children',
				icon: 'icon',
				disabled: 'disabled'
			}
		};
	},
	watch: {
		filter(val) {
			this.$refs.tree.filter(val);
		}
	},
	methods: {
		...mapActions([SET_CONTEXT_AGY_ACB, REMOVE_OTHER_VIEW, REMOVE_ALL_VIEW]),
		/**
		 * 处理节点点击
		 */
		handleNodeClick(data) {
			if (this.value.madCode === data.code) {
				return;
			}
			let agyAcbChangeEdit = LOCAL_STORAGE.get(STORAGE_KEY.AGY_ACB_CHANGE_DATA);
			if (util.isEmpty(agyAcbChangeEdit)) {
				this.recordData = data;
				this.$refs.agyAcbChange.show();
			} else {
				if (!agyAcbChangeEdit.isRecord) {
					this.recordData = data;
					this.$refs.agyAcbChange.show();
				} else {
					if (agyAcbChangeEdit.setRadio === 1) {
						let { path, name } = this.$route;
						if (path === '/index' && name === 'index') {
							this.REMOVE_ALL_VIEW();
						} else {
							this.REMOVE_OTHER_VIEW({ path, name });
						}
					}
					this.SET_CONTEXT_AGY_ACB({ agyCode: data.code, agyName: data.name });
					this.$loading();
					getAgyInfo(data.code)
						.then(() => {
							this.$loadingClose();
						})
						.catch(err => {
							this.$loadingClose();
							console.error(err);
							this.$message({
								type: 'error',
								message: '加载单位数据失败！'
							});
						});
					this.$emit('input', { madCode: data.code, madName: data.name });
					this.$refs.agyTree.doClose();
				}
			}
		},
		/**
		 * 处理节点过滤
		 */
		filterNode(value, data) {
			if (util.isEmpty(value)) {
				return true;
			} else {
				return data.name.includes(value) || data.code.includes(value);
			}
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		},
		handleConfirm(value) {
			if (value === 1) {
				let { path, name } = this.$route;
				if (path === '/index' && name === 'index') {
					this.REMOVE_ALL_VIEW();
				} else {
					this.REMOVE_OTHER_VIEW({ path, name });
				}
			}
			this.SET_CONTEXT_AGY_ACB({
				agyCode: this.recordData.code,
				agyName: this.recordData.name
			});
			this.$loading();
			getAgyInfo(this.recordData.code)
				.then(() => {
					this.$loadingClose();
				})
				.catch(err => {
					this.$loadingClose();
					console.error(err);
					this.$message({
						type: 'error',
						message: '加载单位数据失败！'
					});
				});
			this.$emit('input', {
				madCode: this.recordData.code,
				madName: this.recordData.name
			});
			this.$refs.agyTree.doClose();
		}
	},
	computed: {
		...mapGetters([GET_AGY_TREE])
	}
};
</script>
<style lang="scss">
.agy-head-content {
	height: 250px;
	min-width: 330px;
	overflow-y: auto;
}
</style>
<style lang="scss" scoped>
.agy-head {
	height: 39px;
	line-height: 39px;
}
</style>
