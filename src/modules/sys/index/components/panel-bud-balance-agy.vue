<!-- 单位预算收入支出情况表 -->
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
		<!-- 主体区域 -->
		<div class="panel-main">
			<!-- 比例 -->
			<div class="mt5">
				<span class="b">总收入 {{totalIncome | formatCurrency}}</span>
				<span class="b ml10">总支出 {{totalExpenditure | formatCurrency}}</span>
				<el-progress class="panel-progress-style r" :text-inside="true" :stroke-width="18" :percentage="expenRatio(totalExpenditure, totalIncome)" status="exception"></el-progress>
				<span class="r b mr5">
					已支出比例
				</span>
			</div>
			<!-- 表格 -->
			<el-table class="mt5" size="small" :data="value" height="295px" :cell-class-name="handleCellStyle" :cell-style="TABLE_CELL_STYLE">
				<el-table-column label="项目" prop="projectName" header-align="center" align="left" min-width="90"></el-table-column>
				<el-table-column label="支出功能分类" prop="expfuncName" header-align="center" align="left" min-width="120"></el-table-column>
				<el-table-column label="收入数" prop="income" header-align="center" align="right" min-width="80">
					<template slot-scope="scope">
						{{scope.row.income | formatCurrency}}
					</template>
				</el-table-column>
				<el-table-column label="支出数" prop="expenditure" header-align="center" align="right" min-width="80">
					<template slot-scope="scope">
						{{scope.row.expenditure | formatCurrency}}
					</template>
				</el-table-column>
				<el-table-column label="支出比例" header-align="center" align="right" min-width="100">
					<template slot-scope="scope">
						{{expenRatio(scope.row.expenditure, scope.row.income)}}%
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- 配置 -->
		<el-dialog :visible.sync="dialogVisible" width="400px" v-draggable>
			<span slot="title">
				<i class="el-icon-setting b"> 配置</i>
			</span>
			<el-tabs v-model="activeAce">
				<el-tab-pane label="收入" :name="ACE_TYPE.INCOME">
					<v-tree-input :data="acoList" v-model="incomeAco" placeholder="选择会计科目：" style="width: 100%;">
					</v-tree-input>
				</el-tab-pane>
				<el-tab-pane label="支出" :name="ACE_TYPE.EXPENDITURE">
					<v-tree-input :data="acoList" v-model="expenditureAco" placeholder="选择会计科目：" style="width: 100%;">
					</v-tree-input>
				</el-tab-pane>
			</el-tabs>
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
import { TABLE_CELL_STYLE } from '@/mixin/style';
import { PANEL, SWITCH } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

// 收入科目编码 6 支出科目编码 7
const ACE_TYPE = {
	INCOME: '6',
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
			dialogVisible: false,
			activeAce: ACE_TYPE.INCOME,
			incomeAco: [],
			expenditureAco: [],
			ACE_TYPE,
			TABLE_CELL_STYLE
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
				this.value = await this.getValue(PANEL.BUD_BALANCE_AGY);
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
				let { incomeArr, expenditureArr } = JSON.parse(this.config);
				this.incomeAco = incomeArr;
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
					incomeArr: this.incomeAco,
					expenditureArr: this.expenditureAco
				});
				fetch
					.post('/pa/portal_conf/save', {
						agyCode,
						acbCode,
						userCode: this.GET_LOGIN_INFO.userCode,
						portletId: PANEL.BUD_BALANCE_AGY,
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
		/**
		 * 计算支出比例
		 */
		expenRatio(expenditure, income) {
			let ant, a;
			if ((expenditure, income)) {
				ant = (Number(expenditure) / Number(income)) * 100;
				a = Number(ant.toFixed(2));
				if (a > 100) {
					a = 100;
				}
				return a;
			} else {
				a = 0;
				return a;
			}
		},
		/**
		 * 处理最后一列比例样式
		 */
		handleCellStyle({ row, column, rowIndex, columnIndex }) {
			if (columnIndex === 4) {
				return 'ratio-color';
			}
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB, GET_ACO]),
		/**
		 * 总收入
		 */
		totalIncome() {
			return this.value.reduce((sum, e) => {
				let amount = !isNaN(e.income) ? Number(e.income) : 0;
				return sum + amount;
			}, 0);
		},
		/**
		 * 总支出
		 */
		totalExpenditure() {
			return this.value.reduce((sum, e) => {
				let amount = !isNaN(e.expenditure) ? Number(e.expenditure) : 0;
				return sum + amount;
			}, 0);
		},
		/**
		 * 科目（根据ace获取收支类科目）
		 */
		acoList() {
			let acoList = this.GET_ACO[this.GET_CONTEXT_AGY_ACB.agyCode];
			if (util.isNotEmpty(acoList)) {
				return acoList.filter(e => {
					return (
						e.acbCode === this.GET_CONTEXT_AGY_ACB.acbCode &&
						e.isEnabled === SWITCH.ACTIVE &&
						e.aceCode === this.activeAce
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
	.panel-title {
		background-color: $--color-primary;
	}
	/deep/ .el-table {
		padding: 0 10px;
		td {
			border-color: #f0f0f0;
			border-right: 1px solid #f0f0f0;
		}
		th {
			border-right: 1px solid #f0f0f0;
			border-top: 1px solid #f0f0f0;
			padding: 5px 0;
		}
	}
	::-webkit-scrollbar {
		width: 3px;
	}
}
</style>
<style lang='scss'>
@import '~@/assets/style/variables.scss';
.ratio-color {
	color: $--color-success;
}
</style>
