<!-- 凭证 -->
<template>
	<!-- 容器 -->
	<div class="panel-container">
		<!-- 顶部工具栏 -->
		<div class="panel-toolbar fix">
			<span class="panel-title">{{title}}</span>
			<span class="panel-vou-type">
				<span class="color-text-secondary poi" :class="{'is-active': dimension === DIMENSION.MONTH}" @click="handleDimensionChange(DIMENSION.MONTH)">本月</span>
				<span class="color-text-secondary poi ml10" :class="{'is-active': dimension === DIMENSION.YEAR}" @click="handleDimensionChange(DIMENSION.YEAR)">本年</span>
			</span>
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
		<!-- 图表容器 -->
		<div class="panel-vou-echarts">
			<ve-ring :data="chartData" :settings="chartSettings" :title="chartConfig.title" :colors="chartConfig.colors" :legend-visible="false" height="100%"></ve-ring>
		</div>
		<!-- 底部操作 -->
		<div class="panel-vou-bottom fix">
			<div class="panel-vou-bottom-item" @click="toGalVouBox(VOU_STATUS.F.key)">
				<div class="pan-vou-num">
					{{activeValue.wsh}}
				</div>
				<div class="color-line">
					未审核
				</div>
			</div>
			<div class="panel-vou-bottom-item" @click="toGalVouBox(VOU_STATUS.A.key)">
				<div class="pan-vou-num">
					{{activeValue.ysh}}
				</div>
				<div class="color-line">
					已审核
				</div>
			</div>
			<div class="panel-vou-bottom-item" @click="toGalVouBox(VOU_STATUS.P.key)">
				<div class="pan-vou-num">
					{{activeValue.yjz}}
				</div>
				<div class="color-line">
					已记账
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { VOU_STATUS, PANEL } from '@/assets/js/constant';
import util from '@/assets/js/util';

/**
 * 查询维度（本月、本年）
 */
const DIMENSION = {
	MONTH: 'MONTH',
	YEAR: 'YEAR'
};

export default {
	props: {
		title: String,
		getValue: Function
	},
	data() {
		return {
			dimension: DIMENSION.MONTH,
			value: {
				currYear: {
					wsh: 0,
					ysh: 0,
					yjz: 0
				},
				currMonth: {
					wsh: 0,
					ysh: 0,
					yjz: 0
				}
			},
			chartData: {
				columns: ['name', 'value'],
				rows: [
					{
						name: '未审核',
						key: 'wsh',
						value: ''
					},
					{
						name: '已审核',
						key: 'ysh',
						value: ''
					},
					{
						name: '已记账',
						key: 'yjz',
						value: ''
					}
				]
			},
			chartConfig: {
				title: {
					show: true,
					text: '',
					position: 'center',
					subtext: '凭证数量',
					left: 'center',
					top: 'center',
					textStyle: {
						fontSize: 30,
						fontWeight: 'bold'
					}
				},
				colors: ['#f56c6c', '#409eff', '#67c23a']
			},
			chartSettings: {
				radius: [70, 100],
				offsetY: 140,
				label: {
					show: false
				}
			},
			DIMENSION,
			VOU_STATUS
		};
	},
	methods: {
		/**
		 * 初始化
		 * 1、清空数据
		 * 2、获取门户块数据
		 * 3、设置图表数据
		 */
		async init() {
			try {
				this.resetValue();
				let response = await this.getValue(PANEL.VOU);
				this.$set(this.$data, 'value', response);
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
		 */
		setChartOptions() {
			let { wsh, ysh, yjz } = this.activeValue;
			this.chartConfig.title.text = `${wsh + ysh + yjz}`;
			this.chartData.rows.forEach(e => {
				e.value = this.activeValue[e.key];
			});
		},
		/**
		 * 处理期间变化
		 */
		handleDimensionChange(value) {
			this.dimension = value;
			this.setChartOptions();
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
		 * 路由跳转凭证箱
		 */
		toGalVouBox(value) {
			this.$router.push({
				path: '/gal/gal-voubox',
				query: { vouStatus: value, dimension: this.dimension }
			});
		},
		/**
		 * 重置值
		 */
		resetValue() {
			this.$set(this.$data, 'value', {
				currYear: {
					wsh: 0,
					ysh: 0,
					yjz: 0
				},
				currMonth: {
					wsh: 0,
					ysh: 0,
					yjz: 0
				}
			});
		}
	},
	computed: {
		/**
		 * 激活的数据
		 */
		activeValue() {
			return this.dimension === DIMENSION.MONTH
				? this.value.currMonth
				: this.value.currYear;
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
	padding-bottom: 5px;
	.panel-title {
		background-color: $--color-danger;
	}
	.panel-vou-type {
		margin-left: 20px;
		.is-active {
			color: $--color-danger;
		}
	}
	.panel-vou-echarts {
		height: 280px;
		overflow: hidden;
	}
	.panel-vou-bottom {
		height: 45px;
		.panel-vou-bottom-item {
			float: left;
			width: (100%/3);
			height: 100%;
			text-align: center;
			cursor: pointer;
			.pan-vou-num {
				height: 20px;
				line-height: 20px;
				font-size: 20px;
			}
			&:nth-child(1) .pan-vou-num {
				color: $--color-danger;
			}
			&:nth-child(2) .pan-vou-num {
				color: $--color-primary;
			}
			&:nth-child(3) .pan-vou-num {
				color: $--color-success;
			}
			.color-line {
				height: 25px;
				line-height: 25px;
				font-size: 16px;
				color: $--color-ffffff;
			}
			&:nth-child(1) .color-line {
				background-color: $--color-danger;
			}
			&:nth-child(2) .color-line {
				background-color: $--color-primary;
			}
			&:nth-child(3) .color-line {
				background-color: $--color-success;
			}
		}
	}
}
</style>
