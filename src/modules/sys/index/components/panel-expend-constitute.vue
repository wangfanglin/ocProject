<!-- 支出构成 -->
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
					<el-dropdown-item command="config" v-if="canConfig"><i class="el-icon-setting pr10"></i>配置</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
		<!-- 图表容器 -->
		<div class="panel-expend-constitute-echarts">
			<ve-pie :data="chartData" :legend-visible="false" :settings="chartSettings" width="100%" height="100%" v-if="isNotEmpty(chartData.rows)"></ve-pie>
			<div class="panel-expend-constitute-echarts-empty" v-else>
				暂无数据！
			</div>
		</div>
		<!-- 配置页 -->
		<el-dialog :visible.sync="dialogVisible" width="400px" v-draggable>
			<span slot="title">
				<i class="el-icon-setting b"> 配置</i>
			</span>
			<!-- 会计科目选择 -->
			<v-tree-input :data="acoList" v-model="expenditureAco" placeholder="选择会计科目：" style="width: 100%;">
			</v-tree-input>
			<span slot="footer" class="dialog-footer">
				<el-button size="small" @click="handleCancel">取消</el-button>
				<el-button size="small" type="primary" @click="handleSave">保存</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { GET_ACO } from '@/store/agy';
import { PANEL, SWITCH } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

// 支出科目编码 7
const ACE_TYPE = {
	EXPENDITURE: '7'
};

export default {
	props: {
		title: String,
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
			chartData: {
				columns: ['name', 'value'],
				rows: []
			},
			chartSettings: {
				radius: 100,
				offsetY: 150
			},
			dialogVisible: false,
			expenditureAco: []
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
				this.value = await this.getValue(PANEL.EXPEND_CONSTITUTE);
				this.setChartOptions();
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
		 * 1、计算总的支出
		 * 2、设置图表数据
		 */
		setChartOptions() {
			let totalGovexpecoCode = this.value.reduce((sum, e) => {
				let code = !isNaN(e.govexpecoCode) ? Number(e.govexpecoCode) : 0;
				return sum + code;
			}, 0);
			this.chartData.rows = this.value.map(e => {
				return {
					name: `${e.govexpecoName} ${e.govexpecoCode} ${Number(
						((e.govexpecoCode / totalGovexpecoCode) * 100).toFixed(2)
					)}%`,
					value: e.govexpecoCode
				};
			});
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
				let { expenditureArr } = JSON.parse(this.config);
				this.expenditureAco = expenditureArr;
			}
		},
		/**
		 * 处理保存
		 * 1、保存块数据
		 * 2、保存配置
		 * 3、初始化数据
		 */
		async handleSave() {
			try {
				await this.savePanel();
				await this.saveConfig();
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
		 * 处理取消
		 */
		handleCancel() {
			this.dialogVisible = false;
		},
		/**
		 * 保存配置
		 */
		saveConfig() {
			return new Promise((resolve, reject) => {
				let { agyCode, acbCode } = this.GET_CONTEXT_AGY_ACB;
				let config = JSON.stringify({
					agyCode,
					expenditureArr: this.expenditureAco
				});
				fetch
					.post('/pa/portal_conf/save', {
						agyCode,
						acbCode,
						userCode: this.GET_LOGIN_INFO.userCode,
						portletId: PANEL.EXPEND_CONSTITUTE,
						config
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
		 * 支出类科目
		 */
		acoList() {
			let acoList = this.GET_ACO[this.GET_CONTEXT_AGY_ACB.agyCode];
			if (util.isNotEmpty(acoList)) {
				return acoList.filter(e => {
					return (
						e.acbCode === this.GET_CONTEXT_AGY_ACB.acbCode &&
						e.isEnabled === SWITCH.ACTIVE &&
						e.aceCode === ACE_TYPE.EXPENDITURE
					);
				});
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
.panel-container {
	.panel-toolbar {
		.panel-title {
			background-color: $--color-e97788;
		}
	}
	.panel-expend-constitute-echarts {
		height: 320px;
		overflow: hidden;
		.panel-expend-constitute-echarts-empty {
			height: 100%;
			line-height: 270px;
			text-align: center;
			color: $--color-text-secondary;
		}
	}
}
</style>
