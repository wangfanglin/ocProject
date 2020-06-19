<!-- 银行账号 -->
<template>
	<!-- 容器 -->
	<div class="panel-container">
		<!-- 顶部工具栏 -->
		<div class="panel-toolbar fix">
			<span class="panel-title">资产余额</span>
			<!-- 操作按钮 -->
			<div class="r">
				<span class="poi">
					<i class="fa fa-bar-chart color-text-secondary mr10" :class="{'is-active':chartSettings.type === 'histogram'}" @click="handleChartTypeChange('histogram')"> 柱状图</i>
					<i class="fa fa-line-chart color-text-secondary" :class="{'is-active':chartSettings.type === 'line'}" @click="handleChartTypeChange('line')"> 折线图</i>
				</span>
				<el-dropdown trigger="hover" @command="handleCommand">
					<span class="pl20 pr10 poi"><i class="fa fa-ellipsis-v"></i></span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="refresh"><i class="el-icon-refresh pr10"></i>刷新</el-dropdown-item>
						<el-dropdown-item command="modify"><i class="el-icon-edit pr10"></i>编辑</el-dropdown-item>
						<el-dropdown-item command="remove"><i class="el-icon-delete pr10"></i>删除</el-dropdown-item>
						<el-dropdown-item command="config" v-if="canConfig"><i class="el-icon-setting pr10"></i>配置</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</div>
		<!-- tab切换 -->
		<div class="panel-account-tab mt10">
			<span class="panel-account-type poi" :class="{'color-primary': activeTab === e.acoCode}" v-for="e in value" :key="e.acoCode" @click="setChartOptions(e.acoCode)">{{e.acoName}}</span>
		</div>
		<!-- 提示信息 -->
		<div>
			<span class="f14 b">
				当前余额（万元）：<span class="color-ff6602 f16 mr10">{{activeValue.balAmt | formatCurrency}}</span>
			</span>
			<span class="f14" :class="{'color-ff6602': activeValue.chBalRatio > 0, 'color-success': activeValue.chBalRatio < 0}" v-if="isNotEmpty(activeValue.chBalRatio) && activeValue.chBalRatio !== 0">
				环比：{{activeValue.chBalRatio | percent}}
				<i class="fa" :class="{'fa-long-arrow-up': activeValue.chBalRatio > 0, 'fa-long-arrow-down': activeValue.chBalRatio < 0}"></i>
			</span>
		</div>
		<!-- 图表容器 -->
		<div class="panel-bank-account-echarts">
			<ve-chart :data="chartData" :settings="chartSettings" :legend-visible="false" :grid="chartConfig.grid" :colors="chartConfig.colors" :tooltip-visible="true" width="100%" height="100%"></ve-chart>
		</div>
		<!-- 银行账号弹出层 -->
		<el-dialog :visible.sync="dialogVisible" class="panel-bank-account-dialog" width="500px" v-draggable>
			<span slot="title">
				<i class="el-icon-setting b"> 配置</i><span class="ml5 f12 color-danger">*最多选择六项</span>
			</span>
			<el-tree class="panel-bank-account-tree" ref="tree" :data="bankAccountAco" default-expand-all :expand-on-click-node="false" :props="treeProps" :check-on-click-node="true" :check-strictly='true' show-checkbox node-key="code">
				<span slot-scope="{ node, data }">
					<span class="mr5">{{data.code}}</span>
					<span>{{node.label}}</span>
				</span>
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="dialogVisible = false">取消</el-button>
				<el-button size="small" type="primary" @click="handleSave">保存</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { GET_ACO } from '@/store/agy';
import { PANEL, SWITCH } from '@/assets/js/constant';
import { Tree } from '@/assets/js/model';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

/**
 * 会计科目类型 0 普通科目 1 现金科目 2 银行科目 3 零余额科目 4 往来科目 5 资产项目
 */
const ACO_TYPE_CODE = {
	ORIGIN: 0,
	CASH: 1,
	BANK: 2,
	ZEROBAL: 3,
	AC: 4,
	ASSET: 5
};

export default {
	props: {
		config: String,
		getValue: Function,
		savePanel: Function,
		canConfig: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			value: [],
			activeTab: '',
			chartData: {
				columns: ['month', 'value'],
				rows: []
			},
			chartConfig: {
				grid: {
					left: '3%',
					right: '10%',
					top: '20',
					bottom: '5%',
					containLabel: true
				},
				colors: [
					{
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{
								offset: 0,
								color: '#71c8f9' // 0% 处的颜色
							},
							{
								offset: 1,
								color: '#4a9be5' // 100% 处的颜色
							}
						],
						global: false // 缺省为 false
					}
				]
			},
			chartSettings: {
				type: 'histogram'
			},
			dialogVisible: false,
			treeProps: {
				id: 'code',
				label: 'name',
				children: 'children',
				pid: 'pcode'
			}
		};
	},
	methods: {
		/**
		 * 初始化
		 * 1、清空数据
		 * 2、获取门户块数据
		 * 3、设置激活的tab
		 * 4、设置图表数据
		 */
		async init() {
			try {
				this.value = [];
				this.value = await this.getValue(PANEL.BANK_ACCOUNT);
				this.activeTab = util.isNotEmpty(this.value)
					? this.value[0].acoCode
					: '';
				this.setChartOptions(this.activeTab);
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 设置图表数据
		 */
		setChartOptions(code) {
			this.activeTab = code;
			this.chartData.rows = [
				{ month: '1月', value: '' },
				{ month: '2月', value: '' },
				{ month: '3月', value: '' },
				{ month: '4月', value: '' },
				{ month: '5月', value: '' },
				{ month: '6月', value: '' },
				{ month: '7月', value: '' },
				{ month: '8月', value: '' },
				{ month: '9月', value: '' },
				{ month: '10月', value: '' },
				{ month: '11月', value: '' },
				{ month: '12月', value: '' }
			];
			this.activeValue.perdBalAmts.forEach((e, i) => {
				this.$set(this.chartData.rows[i], 'value', e);
			});
		},
		/**
		 * 处理图表类型变化
		 */
		handleChartTypeChange(value) {
			this.chartSettings.type = value;
		},
		/**
		 * 处理操作
		 * 1、判断操作类型
		 * 2、刷新、配置，或者触发事件
		 */
		handleCommand(value) {
			if (value === 'refresh') {
				this.init();
			} else if (value === 'config') {
				this.handleConfig();
			} else {
				this.$emit(value);
			}
		},
		/**
		 * 处理配置
		 */
		handleConfig() {
			this.dialogVisible = true;
			if (util.isNotEmpty(this.config)) {
				this.$nextTick(() => {
					this.$refs.tree.setCheckedKeys(this.config.split(','));
				});
			}
		},
		/**
		 * 处理保存
		 * 1、校验选项
		 * 2、保存块数据
		 * 3、保存配置
		 * 4、初始化数据
		 */
		async handleSave() {
			try {
				let checkedKeys = this.$refs.tree.getCheckedKeys();
				if (checkedKeys.length > 6) {
					this.$message({
						type: 'warning',
						message: '最多选择六项！'
					});
					return;
				}
				await this.savePanel();
				await this.saveConfig(checkedKeys);
				this.init();
				this.dialogVisible = false;
				this.$message({
					type: 'success',
					message: '保存成功！'
				});
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 保存配置
		 */
		saveConfig(checkedKeys) {
			return new Promise((resolve, reject) => {
				let { acbCode, agyCode } = this.GET_CONTEXT_AGY_ACB;
				fetch
					.post('/pa/portal_conf/save', {
						agyCode,
						acbCode,
						userCode: this.GET_LOGIN_INFO.userCode,
						portletId: PANEL.BANK_ACCOUNT,
						config: checkedKeys.join(',')
					})
					.then(() => {
						return resolve();
					})
					.catch(err => {
						return reject(err);
					});
			});
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB, GET_ACO]),
		/**
		 * 激活的数据
		 */
		activeValue() {
			let findResult = this.value.find(e => {
				return this.activeTab === e.acoCode;
			});
			return util.isNotEmpty(findResult)
				? findResult
				: {
						acoCode: '',
						acoName: '',
						balAmt: 0,
						chBalRatio: 0,
						perdBalAmts: []
				  };
		},
		/**
		 * 银行会计科目（现金、银行、零余额科目）
		 */
		bankAccountAco() {
			let acoList = this.GET_ACO[this.GET_CONTEXT_AGY_ACB.agyCode];
			if (util.isNotEmpty(acoList)) {
				let filterResult = acoList.filter(e => {
					return (
						e.acbCode === this.GET_CONTEXT_AGY_ACB.acbCode &&
						e.isEnabled === SWITCH.ACTIVE &&
						[
							ACO_TYPE_CODE.CASH,
							ACO_TYPE_CODE.BANK,
							ACO_TYPE_CODE.ZEROBAL
						].includes(e.acoTypeCode)
					);
				});
				return Tree.getTree(filterResult);
			} else {
				return [];
			}
		}
	},
	mounted() {
		this.init();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/modules/sys/index/common/index.scss';
@import '~@/assets/style/variables.scss';
.panel-container {
	.panel-toolbar {
		.panel-title {
			background-color: $--color-primary;
		}
		.is-active {
			color: $--color-primary !important;
		}
	}
	.panel-account-tab {
		.panel-account-type {
			display: inline-block;
			padding-right: 40px;
			margin-bottom: 10px;
		}
	}
	.panel-bank-account-echarts {
		height: 265px;
	}
	.panel-bank-account-dialog {
		.panel-bank-account-tree {
			height: 300px;
			overflow: auto;
		}
	}
}
</style>
