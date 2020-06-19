<template>
	<div class="agy-acb-head tl fix">
		<div class="dib poi" v-if="isNotEmpty(GET_AGY_ACB_TREE)">
			<el-popover ref="agyAcbTree" placement="bottom" trigger="click">
				<el-input size="mini" v-model.trim="filter" placeholder="请输入内容" prefix-icon="el-icon-search">
				</el-input>
				<div class="agy-acb-head-content">
					<el-tree ref="tree" empty-text="无数据" :data="GET_AGY_ACB_TREE" :props="props" node-key="id" :default-expand-all="true" :filter-node-method="filterNode" @node-click="handleNodeClick">
						<span slot-scope="{node, data}">
              <!--选中项为蓝色字体-->
							<span class="b" :class="{'color-primary': value.agyCode === data.code}" v-if="'agyTypeCode' in data">{{data.code}} {{data.name}}</span>
							<span :class="{'color-primary': value.agyCode === data.agyCode && value.acbCode === data.code}" v-else>{{data.name}}</span>
						</span>
					</el-tree>
				</div>
				<span slot="reference">
          <!--单位账套悬浮加提示（二十五个字以上）-->
					<el-tooltip effect="dark" :disabled="showDark(value.agyName)" :content="`${value.agyCode}  ${value.agyName}`" placement="bottom-start">
						<span class="tdl">{{value.agyCode}}&ensp;&ensp;{{value.agyName}}</span>
					</el-tooltip>
					<span>/</span>
					<el-tooltip effect="dark" :disabled="showDark(value.acbName)" :content="`${value.acbName}`" placement="bottom-start">
						<span class="tdl">{{value.acbName}}</span>
					</el-tooltip>
				</span>
			</el-popover>
		</div>
    <!--居中插槽-->
		<div class="agy-acb-head-center">
			<slot name="center">
			</slot>
		</div>
    <!--居右插槽-->
		<div class="r mr5 fix">
			<slot>
			</slot>
		</div>
		<v-agy-acb-change ref="agyAcbChange" @confirm="handleConfirm"></v-agy-acb-change>
	</div>
</template>
<script>
import PinyinMatch from 'pinyin-match';
import { mapGetters, mapActions } from 'vuex';
import { SET_CONTEXT_AGY_ACB } from '@/store/login';
import { GET_AGY_ACB, GET_AGY_ACB_TREE } from '@/store/global';
import { getAgyInfo } from '@/store/service/agy-service';
import util from '@/assets/js/util';
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { REMOVE_OTHER_VIEW, REMOVE_ALL_VIEW } from '@/store/system';
import { STORAGE_KEY } from '@/assets/js/constant';
export default {
	props: {
	  /**
	   * 绑定的单位账套体系等信息
	   * */
		value: {
			type: Object,
			default() {
				return {
          agyCode: '',
          agyName: ''
        };
			}
		},
		/**
		 * 确认信息 不传则不提示
		 */
		confirmMessage: {
			type: String,
			default: ''
		},
		/*
		 * 是否刷新缓存
		 * */
		isCashAgyInfo: {
			type: Boolean,
			default: true
		},
		/**
		 * 是否在加载完缓存之后，触发change事件
		 */
		lazy: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			filter: '',//模糊查询关键字
			recordData: {},//记录点击当前行的data和node
      props: {
        label: 'name',
        children: 'children'
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
     * canChange：是否符合点击对象（点击的是账套，且不是已经被选中的账套）
     * isCashAgyInfo：是否需要刷新缓存，如果不需要将直接抛出事件
     * confirmMessage：提示信息，如果有值将在切换中弹出
     * agyAcbChangeEdit：记录了用户关于切换后是否关闭其他页面的选项
     * agyAcbChangeEdit.isRecord: 是否提醒 （true: 提醒 false: 不提醒）
     * 如果agyAcbChangeEdit没值或者提醒则直接打开 agy-acb-change弹窗，反之不提醒，则根据上次选中的情况选择是否关闭页签，再执行handleChange方法
		 */
		handleNodeClick(data, node) {
			if (this.canChange(data)) {
				if (!this.isCashAgyInfo) {
					//假如是政府会计报表弹窗下拉触发则不提示弹窗(弹窗用来设置是否关闭其它已打开标签)
					if (util.isNotEmpty(this.confirmMessage)) {
						this.$confirm(this.confirmMessage, '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						})
							.then(() => {
								this.handleChange(data, node);
							});
					} else {
						this.handleChange(data, node);
					}
				} else {
					let agyAcbChangeEdit = LOCAL_STORAGE.get(
						STORAGE_KEY.AGY_ACB_CHANGE_DATA
					);
					if (util.isEmpty(agyAcbChangeEdit)) {
						this.recordData = {
							data: data,
							node: node
						};
						this.$refs.agyAcbChange.show();
					} else {
						if (!agyAcbChangeEdit.isRecord) {
							this.recordData = {
								data: data,
								node: node
							};
							this.$refs.agyAcbChange.show();
						} else {
							if (agyAcbChangeEdit.setRadio === 1) {
								let { path, name } = this.$route;
								if (path === '/index' && name === 'INDEX') {
									this.REMOVE_ALL_VIEW();
								} else {
									this.REMOVE_OTHER_VIEW({ path, name });
								}
							}
							if (util.isNotEmpty(this.confirmMessage)) {
								this.$confirm(this.confirmMessage, '提示', {
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
								})
									.then(() => {
										this.handleChange(data, node);
									});
							} else {
								this.handleChange(data, node);
							}
						}
					}
				}
			}
		},
		/**
		 * 切换账套后需执行的逻辑
     * 如果需要刷新缓存，使用SET_CONTEXT_AGY_ACB方法更新单位账套等数据
     * lazy：是否在刷新完以后抛出事件
     * 抛出事件change，将最新的单位账套数据抛出
     * 最后关闭单位账套弹出层
		 */
		handleChange(data, node) {
			let agyAcb = {
				agyCode: node.parent.data.code,
				agyName: node.parent.data.name,
				acbCode: data.code,
				acbName: data.name,
				acsCode: data.acsCode,
				isPairAc: data.isPairAc
			};
			if (this.isCashAgyInfo) {
				this.SET_CONTEXT_AGY_ACB(agyAcb);
				if (agyAcb.agyCode !== this.value.agyCode) {
					this.$loading();
					if (this.lazy) {
						getAgyInfo(agyAcb.agyCode)
							.then(() => {
								this.$loadingClose();
								this.$emit('change', agyAcb);
							})
							.catch(err => {
								this.$loadingClose();
								console.error(err);
								this.$message({
									type: 'error',
									message: '加载单位数据失败！'
								});
							});
					} else {
						this.$emit('change', agyAcb);
						getAgyInfo(agyAcb.agyCode)
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
					}
				} else {
					this.$emit('change', agyAcb);
				}
			} else {
				this.$emit('change', agyAcb);
			}
			this.$refs.agyAcbTree.doClose();
		},
		/**
		 * 是否可以变化
     * 点击逻辑： 只可点击账套，且不是同一账套
		 */
		canChange(data) {
			return (
				util.isEmpty(data.children) &&
				util.isNotEmpty(data.agyCode) &&
				(data.code !== this.value.acbCode ||
					(data.code === this.value.acbCode &&
						data.agyCode !== this.value.agyCode))
			);
		},
		/**
		 * 处理节点过滤
     * 逻辑：如果点击的是单位，直接从点击数据中匹配名称、code、和拼音，如果点击的是账套，那么由点击数据的agyCode匹配到单位信息，然后同上
     * 过滤维度：单位
		 */
		filterNode(value, data) {
      if (util.isEmpty(value)) {
				return true;
			} else {
				if ('agyTypeCode' in data) {
					return (
						data.name.includes(value) ||
						data.code.includes(value) ||
						PinyinMatch.match(data.name, value)
					);
				} else {
					let agy = this.GET_AGY_ACB.find(e => {
						return e.code === data.agyCode;
					});
					return (
						agy.name.includes(value) ||
						agy.code.includes(value) ||
						PinyinMatch.match(agy.name, value)
					);
				}
			}
		},
    /**
     * 判断数据是否不为空
     * */
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		},
    /**
     * agy-acb-change组件触发的方法
     *  value（0：只切换当前页面账簿，其他页面账簿保持不变 1：切换本页面账簿后关闭其它页面）
     *  如果是在首页切换关闭首页以外的页面，如果不是关闭除当前页面以外的页面
     *  如果有提示信息，展示提示信息
     * */
		handleConfirm(value) {
      if (value === 1) {
				let { path, name } = this.$route;
				if (path === '/index' && name === 'INDEX') {
					this.REMOVE_ALL_VIEW();
				} else {
					this.REMOVE_OTHER_VIEW({ path, name });
				}
			};
			if (util.isNotEmpty(this.confirmMessage)) {
				this.$confirm(this.confirmMessage, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.handleChange(this.recordData.data, this.recordData.node);
					});
			} else {
				this.handleChange(this.recordData.data, this.recordData.node);
			}
		},
		/**
		 * 是否显示文字提示
		 */
		showDark(value) {
			return value ? !(value.toString().length > 25) : false;
		}
	},
	computed: {
		...mapGetters([GET_AGY_ACB, GET_AGY_ACB_TREE])
	}
};
</script>
<style lang="scss" scoped>
  .agy-acb-head {
    line-height: 39px;
    position: relative;
    .agy-acb-head-center {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }
  }
  .agy-acb-head-content {
    height: 250px;
    min-width: 330px;
    overflow-y: auto;
  }
</style>
