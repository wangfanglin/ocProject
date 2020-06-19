<!-- 待办提醒 -->
<template>
	<!-- 容器 -->
	<div class="panel-container">
		<!-- 顶部工具栏 -->
		<div class="panel-toolbar fix">
			<span class="panel-title">{{title}}</span>
			<!-- 操作按钮 -->
			<el-dropdown class="r" trigger="hover" @command="handleCommand">
				<span class="pl20 pr10 poi"><i class="fa fa-ellipsis-v"></i></span>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item command="refresh"><i class="el-icon-refresh pr10"></i>刷新</el-dropdown-item>
					<el-dropdown-item command="modify"><i class="el-icon-edit pr10"></i>编辑</el-dropdown-item>
					<el-dropdown-item command="remove"><i class="el-icon-delete pr10"></i>删除</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
		<!-- 主体区域 -->
		<div class="panel-remind-main fix">
			<!-- 左侧区域 -->
			<ul class="remind-main-left pr10">
				<li class="fix poi" :class="{'is-active': activeIndex === i}" v-for="(e, i) in value" :key="e.id" @mouseenter="activeIndex = i" @click="handleLeftClick(e)">
					<span class="l remind-main-left-title">{{e.title | filterTitle }} </span>
					<span class="l">{{e.title}}</span>
					<span class="r color-36cfc9 f13">{{e.content.length}}笔</span>
					<span class="r color-36cfc9 f13 mr10"> {{e.purpose}}</span>
				</li>
			</ul>
			<!-- 右侧区域 -->
			<ul class="remind-main-right">
				<li class="remind-detail" v-for="(e, i) in activeValue.content" :class="{'is-active': detailActiveIndex === i}" :key="i" @click="handleRightClick(e)" @mouseenter="detailActiveIndex = i" @mouseleave="detailActiveIndex = ''">
					<div class="remind-desc">
						<div class="remind-desc-title" v-if="activeValue.systemId === SYSTEM_ID.GAL">{{e.desc}}</div>
						<div class="remind-desc-title" v-if="[SYSTEM_ID.PEX, SYSTEM_ID.REM, SYSTEM_ID.BUD].includes(activeValue.systemId)" :title="e.billTypeName+'('+e.creatorName+e.createdTime+')'"><span>{{e.billTypeName}}</span><span class="f12 ml2 black">({{e.creatorName}} {{e.createdTime | formatDate}})</span></div>
						<div class="remind-desc-title" v-if="[SYSTEM_ID.HT, SYSTEM_ID.PUR].includes(activeValue.systemId)">{{e.billTypeName}}</div>
					</div>
					<span class="remind-money"><span class="f12">￥</span>{{e.money | formatCurrency}}</span>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { setViewParams } from '@/store/service/system-service';
import { PANEL } from '@/assets/js/constant';
import util from '@/assets/js/util';

/**
 * 系统模块
 */
const SYSTEM_ID = {
	GAL: 'gal', //核算
	PEX: 'pex', //报销
	BUD: 'bud', //指标
	HT: 'ht', //合同
	REM: 'rem', //报账
	PUR: 'pur' //采购
};

export default {
	props: {
		title: String,
		getValue: Function
	},
	data() {
		return {
			value: [],
			activeIndex: 0,
			detailActiveIndex: 0,
			SYSTEM_ID
		};
	},
	methods: {
		/**
		 * 初始化
		 * 1、清空数据
		 * 2、获取门户块数据
		 */
		async init() {
			try {
				this.value = [];
				this.value = await this.getValue(PANEL.REMIND);
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 处理操作
		 * 1、判断操作类型
		 * 2、触发事件或者刷新数据
		 */
		handleCommand(value) {
			if (value !== 'refresh') {
				this.$emit(value);
			} else {
				this.init();
			}
		},
		/**
		 * 处理左侧点击
		 * 1、根据不同系统类型，跳转不同页面
		 */
		handleLeftClick(value) {
			switch (value.systemId) {
				case SYSTEM_ID.GAL:
					this.toGalPage(value);
					break;
				case SYSTEM_ID.PEX:
					this.toPexPage(value);
					break;
				case SYSTEM_ID.HT:
					this.toPctPage();
					break;
				case SYSTEM_ID.REM:
					// 用户多角色时无法区分，暂不做页面跳转
					break;
				case SYSTEM_ID.PUR:
					this.toPurPage();
					break;
				case SYSTEM_ID.BUD:
					this.toBudPage();
					break;
				default:
					return;
			}
		},
		/**
		 * 处理核算跳转
		 * 1、跳转业务单据记账
		 */
		toGalPage(value) {
			this.$router.push({
				path: '/gal/gal-gipba',
				query: {
					billTypeCode: util.isNotEmpty(value.content)
						? value.content[0].billTypeCode
						: ''
				}
			});
		},
		/**
		 * 处理报销跳转
		 * 1、判断当前内容区是否含有状态为 0、1、2状态的单据（"0"：保存未送审，"1"：退回到第一岗的单据，“2”：撤回到第一岗的单据）
		 *    1、如果单据全部为这三个状态，则跳转到业务办理页面，否则跳转到业务审批页面
		 */
		toPexPage(value) {
			let everyResult = this.activeValue.content.every(e => {
				return ['0', '1', '2'].includes(e.status);
			});
			if (everyResult) {
				this.$router.push('/pex/pex-ops-work-entry');
			} else {
				this.$router.push({
					path: '/pex/pex-ops-work-audit',
					query: { billFunc: value.billFunc }
				});
			}
		},
		/**
		 * 处理合同跳转
		 * 1、判断当前内容区是否含有状态为 1 状态的单据（"1"：未送审状态）
		 *    1、如果单据全部为这个状态，则跳转到业务办理，否则跳转到业务审批页面
		 */
		toPctPage() {
			let everyResult = this.activeValue.content.every(e => {
				return e.billStatus === '1';
			});
			if (everyResult) {
				this.$router.push('/pct/pct-ops-edit');
			} else {
				this.$router.push('/pct/pct-ops-audit');
			}
		},
		/**
		 * 处理采购跳转
		 * 1、判断当前内容区是否含有状态为 1 状态的单据（"1"：未送审状态）
		 * 		1、如果单据全部为这个状态，则跳转到业务办理，否则跳转到业务审批页面
		 */
		toPurPage() {
			let everyResult = this.activeValue.content.every(e => {
				return e.billStatus === 1;
			});
			if (everyResult) {
				this.$router.push('/pur/pur-ops-work-entry');
			} else {
				this.$router.push('/pur/pur-ops-work-audit');
			}
		},
		/**
		 * 处理指标跳转
		 */
		toBudPage() {
			this.$router.push('/bud/bud-ops-audit');
		},
		/**
		 * 处理右侧点击
		 */
		handleRightClick(value) {
			switch (this.activeValue.systemId) {
				case SYSTEM_ID.GAL:
					this.toGalDetail(value);
					break;
				case SYSTEM_ID.PEX:
					this.toPexDetail(value);
					break;
				case SYSTEM_ID.HT:
					this.toPctDetail(value);
					break;
				case SYSTEM_ID.REM:
					// 用户多角色时无法区分，暂不做页面跳转
					break;
				case SYSTEM_ID.PUR:
					this.toPurDetail(value);
					break;
				case SYSTEM_ID.BUD:
					this.toBudDetail(value);
					break;
				default:
					return;
			}
		},
		/**
		 * 处理核算详情跳转
		 * 1、跳转业务单据记账
		 */
		toGalDetail(value) {
			this.$router.push({
				path: '/gal/gal-gipba',
				query: { billTypeCode: value.billTypeCode }
			});
		},
		/**
		 * 处理报销详情跳转
		 * 1、设置参数
		 * 2、判断单据状态（"0"：保存未送审，"1"：退回到第一岗的单据，“2”：撤回到第一岗的单据）
		 * 3、判断单据类型
		 * 4、分别跳转单据详情页面，以及单据审批页面
		 */
		toPexDetail(value) {
			setViewParams(value.billId, {
				billId: value.billId,
				billFunc: value.billFunc,
				billType: value.billType,
				taskId: value.wfTaskId,
				agyCode: value.agyCode,
				agyName: value.agyName,
				fiscal: value.fiscal
			});
			let path;
			if (['0', '1', '2'].includes(value.status)) {
				if (value.billFunc === 'loan') {
					path = '/pex/pex-ops-loan';
				} else {
					path = `/pex/pex-ops-${value.billType}-${value.billFunc}`;
				}
			} else {
				path = '/pex/pex-ops-approval';
			}
			this.$router.push({
				path,
				query: { billId: value.billId }
			});
		},
		/**
		 * 处理合同详情跳转
		 * 1、设置参数
		 * 2、判断单据状态（"1"：未送审状态）
		 * 3、根据单据状态跳转不同的页面
		 */
		toPctDetail(value) {
			setViewParams(value.billId, {
				billId: value.billId,
				billFunc: value.billFunc,
				billType: value.billType,
				taskId: value.wfTaskId,
				agyCode: value.agyCode,
				fiscal: value.fiscal
			});
			let path;
			if (value.billStatus === '1') {
				path = `/pct/pct-ops-edit-${value.billType}-ht`;
			} else {
				path = '/pct/pct-ops-approval';
			}
			this.$router.push({
				path,
				query: { billId: value.billId }
			});
		},
		/**
		 * 处理采购详情跳转
		 * 1、判断单据状态（"0"：未送审， "1"：审核中， "2"：待支付， "3"：待记账， "9"：已终审）
		 * 2、分别跳不同页面
		 */
		toPurDetail(value) {
			let billType = value.billType.toLowerCase();
			let path = '';
			if (value.billStatus === '0') {
				path = `/rem/rem-opt-edit-${billType}`;
			} else if (value.billStatus === '1' || value.billStatus === '2') {
				path = '/rem/rem-opt-audit';
			} else if (value.billStatus === '3') {
				path = '/rem/rem-opt-voucher';
			} else {
				path = '/404';
			}
			this.$router.push({
				path,
				query: { billId: value.billId, taskId: value.wfTaskId }
			});
		},
		/**
		 * 处理指标详情跳转
		 */
		toBudDetail() {
			this.$router.push('/bud/bud-ops-audit');
		}
	},
	computed: {
		/**
		 * 激活的数据
		 */
		activeValue() {
			let result = this.value[this.activeIndex];
			return util.isNotEmpty(result) ? result : [];
		}
	},
	filters: {
		filterTitle(val) {
			return util.isEmpty(val) ? '待' : val.slice(0, 1);
		}
	},
	mounted() {
		this.init();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/modules/sys/index/common/index.scss';
.panel-container {
	.panel-title {
		background-color: $--color-36cfc9;
	}
	.panel-remind-main {
		height: 315px;
		margin-top: 5px;
		.remind-main-left,
		.remind-main-right {
			float: left;
      box-sizing: border-box;
      overflow: auto;
      height: 100%;
      width: 50%;
		}
		.remind-main-left {
			li {
				position: relative;
				padding: 9px 10px 9px 45px;
				height: 30px;
				line-height: 30px;
				&.is-active {
					background-color: $--color-eeeeee;
				}
				.remind-main-left-title {
					position: absolute;
					top: 10px;
					left: 5px;
					width: 30px;
					height: 30px;
					line-height: 30px;
					display: block;
					text-align: center;
					font-size: 16px;
					color: $--color-ffffff;
					background-color: $--color-36cfc9;
					border-radius: 50%;
				}
				.color-36cfc9 {
					color: $--color-36cfc9;
				}
			}
		}
		.remind-main-right {
			.remind-detail {
				padding: 10px 110px 10px 20px;
				position: relative;
				cursor: pointer;
				.remind-desc {
					.remind-desc-title {
						color: $--color-text-secondary;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
				.remind-money {
					font-size: 12px;
					color: $--color-text-secondary;
					position: absolute;
					top: 10px;
					right: 16px;
				}
				&.is-active {
					background-color: $--color-eeeeee;
				}
			}
		}
	}
	::-webkit-scrollbar {
		width: 5px;
	}
}
</style>
