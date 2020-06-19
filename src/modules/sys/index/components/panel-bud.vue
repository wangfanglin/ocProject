<!-- 指标 -->
<template>
	<!-- 容器 -->
	<div class="panel-container">
		<!-- 顶部工具栏 -->
		<div class="panel-toolbar">
			<span class="panel-title">指标管理</span>
			<div class="panel-bud-dropdown">
				<span class="poi" :class="{'text-color':dimension === DIMENSION.MONTH,'color-text-secondary':dimension === DIMENSION.YEAR}" @click="dimension = DIMENSION.MONTH">月度指标</span>
				<div class="dib f15 panel-date-style" v-if="dimension === 'MONTH'">
					{{GET_LOGIN_INFO.fiscal}}年 {{currentMonth}}月
					<el-button class="el-icon-arrow-left" type="text" size="small" @click="currentMonth = currentMonth - 1" :disabled="currentMonth === 1"></el-button>
					<el-button class="el-icon-arrow-right" type="text" size="small" @click="currentMonth = currentMonth + 1" :disabled="currentMonth === GET_LOGIN_INFO.fiscalPeriod"></el-button>
				</div>
				<span class="poi" :class="{'text-color':dimension === DIMENSION.YEAR,'color-text-secondary':dimension === DIMENSION.MONTH}" @click="dimension = DIMENSION.YEAR">年度指标</span>
				<el-dropdown class="dib" trigger="click" @command="handleCommand">
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
		<!-- 模块主体 -->
		<div class="panel-bud-main">
			<!-- 预算支出 -->
			<div class="panel-bud-box">
				<div class="panel-bud-icon">
					<img :src="budgetPng" class="mr5"><span class="f16"> 预算支出</span>
				</div>
				<div class="money">
					{{activeValue.yszc.zzcAmt | formatCurrency}}
				</div>
				<div class="txt">总支出（万元）</div>
				<div class="detail-list">
					<div class="fix" v-if="isNotEmpty(activeValue.yszc.ryRatio)">
						<span class="l pl10">人员占比</span>
						<span class="r pr10 color-ff6602">{{activeValue.yszc.ryRatio | percent}}</span>
					</div>
					<div class="fix" v-if="isNotEmpty(activeValue.yszc.gyRatio)">
						<span class="l pl10">公用占比</span>
						<span class="r pr10 color-ff6602">{{activeValue.yszc.gyRatio | percent}}</span>
					</div>
					<div class="fix" v-if="isNotEmpty(activeValue.yszc.xmRatio)">
						<span class="l pl10">项目占比</span>
						<span class="r pr10 color-ff6602">{{activeValue.yszc.xmRatio | percent}}</span>
					</div>
				</div>
			</div>
			<!-- 三公经费 -->
			<div class="panel-bud-box">
				<div class="panel-bud-icon">
					<img :src="threePng" class="mr5"><span class="f16"> 三公经费</span>
				</div>
				<div class="money">
					{{activeValue.zdjf.zzcAmt | formatCurrency}}
				</div>
				<div class="txt">总支出（万元）</div>
				<div class="detail-list">
					<div class="fix" v-if="isNotEmpty(activeValue.zdjf.zdAmt)">
						<span class="l pl10">招待</span>
						<span class="r pr10 color-ff6602">
							{{activeValue.zdjf.zdAmt | formatCurrency}}
						</span>
					</div>
					<div class="fix" v-if="isNotEmpty(activeValue.zdjf.gcAmt)">
						<span class="l pl10">公车</span>
						<span class="r pr10 color-ff6602">
							{{activeValue.zdjf.gcAmt | formatCurrency}}
						</span>
					</div>
					<div class="fix" v-if="isNotEmpty(activeValue.zdjf.cgAmt)">
						<span class="l pl10">出国</span>
						<span class="r pr10 color-ff6602">
							{{activeValue.zdjf.cgAmt | formatCurrency}}
						</span>
					</div>
				</div>
			</div>
			<!-- 资产负债率 -->
			<div class="panel-bud-box">
				<div class="panel-bud-icon">
					<img class="mr5" :src="assetPng"><span class="f16"> 资产负债率</span>
				</div>
				<div class="money">{{activeValue.zcfzl.zcfzlRatio || 0 | percent}}</div>
				<div class="detail-list fix" v-if="isNotEmpty(activeValue.zcfzl.zcfzlLinkRatio)">
					<span :class="{'color-ff6602': activeValue.zcfzl.zcfzlLinkRatio > 0, 'color-success': activeValue.zcfzl.zcfzlLinkRatio < 0}">
						环比：{{activeValue.zcfzl.zcfzlLinkRatio | percent}}
						<i class="fa" :class="{'fa-long-arrow-up': activeValue.zcfzl.zcfzlLinkRatio > 0, 'fa-long-arrow-down': activeValue.zcfzl.zcfzlLinkRatio < 0}"></i>
					</span>
				</div>
				<div class="txt">&nbsp;</div>
			</div>
			<!-- 现金及等价物 -->
			<div class="panel-bud-box">
				<div class="panel-bud-icon">
					<img class="mr5" :src="cashPng"><span class="f16"> 现金及等价物</span>
				</div>
				<div class="money">
					{{activeValue.xjjdjw.balAmt | formatCurrency}}
				</div>
				<div class="detail-list fix" v-if="isNotEmpty(activeValue.xjjdjw.linkRatio)">
					<span :class="{'color-ff6602': activeValue.xjjdjw.linkRatio > 0, 'color-success': activeValue.xjjdjw.linkRatio < 0}">
						环比：{{activeValue.xjjdjw.linkRatio | percent}}
						<i class="fa" :class="{'fa-long-arrow-up': activeValue.xjjdjw.linkRatio > 0, 'fa-long-arrow-down': activeValue.xjjdjw.linkRatio < 0}"></i>
					</span>
				</div>
				<div class="txt">余额（万元）</div>
			</div>
		</div>
		<el-dialog :visible.sync="dialog.visible" top="3vh" width="1200px" v-draggable>
			<span slot="title">
				<i class="el-icon-setting b"> 配置</i>
			</span>
			<!-- 主体区域 -->
			<!-- 预算支出 -->
			<el-divider content-position="left">预算支出</el-divider>
			<el-radio-group size="small" v-model="dialog.activeYszc">
				<el-radio-button :label="key" v-for="(e, key) in BUD_TYPE.yszc" :key="key">{{e}}</el-radio-button>
			</el-radio-group>
			<span class="ml10">会计科目</span>
			<v-tree-input :data="acoList" v-model="dialog.yszc[dialog.activeYszc].acoObj" placeholder="选择会计科目：" @change="(value, data) => handleAcoChange(value, data, 'yszc', dialog.activeYszc)" style="width: 250px;">
			</v-tree-input>
			<!-- 重点经费辅助核算 -->
			<div class="panel-bud-acitem">
				<div :gutter="10">
					<el-col :span="8" v-for="e in dialog.yszc[dialog.activeYszc].acitemType" :key="e.atomCode">
						<div>
							<span>{{e.name}}</span>
							<v-tree-input class="ml10" :data="mad[e.atomCode]" v-model="dialog.yszc[dialog.activeYszc].acitemObj[e.atomCode].acitemCodes" :multiple="false" leaf :placeholder="`选择${e.name}：`" @change="(value, data) => handleAcitemChange(value, data, 'yszc', dialog.activeYszc, e.atomCode)">
							</v-tree-input>
						</div>
					</el-col>
				</div>
			</div>
			<!-- 重点经费 -->
			<el-divider content-position="left">重点经费</el-divider>
			<el-radio-group size="small" v-model="dialog.activeZdjf">
				<el-radio-button :label="key" v-for="(e, key) in BUD_TYPE.zdjf" :key="key">{{e}}</el-radio-button>
			</el-radio-group>
			<span class="ml10">会计科目</span>
			<v-tree-input :data="acoList" v-model="dialog.zdjf[dialog.activeZdjf].acoObj" placeholder="选择会计科目：" @change="(value, data) => handleAcoChange(value, data, 'zdjf', dialog.activeZdjf)" style="width: 250px;">
			</v-tree-input>
			<!-- 重点经费辅助核算 -->
			<div class="panel-bud-acitem">
				<div :gutter="10">
					<el-col :span="8" v-for="e in dialog.zdjf[dialog.activeZdjf].acitemType" :key="e.atomCode">
						<div>
							<span>{{e.name}}</span>
							<v-tree-input class="ml10" :data="mad[e.atomCode]" v-model="dialog.zdjf[dialog.activeZdjf].acitemObj[e.atomCode].acitemCodes" :multiple="false" leaf :placeholder="`选择${e.name}：`" @change="(value, data) => handleAcitemChange(value, data, 'zdjf', dialog.activeZdjf, e.atomCode)">
							</v-tree-input>
						</div>
					</el-col>
				</div>
			</div>
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
import { GET_ACO, GET_MAD } from '@/store/agy';
import { PANEL, SWITCH } from '@/assets/js/constant';
import { Tree } from '@/assets/js/model';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';
import assetPng from '@/assets/img/panel-bud-asset-ratio';
import budgetPng from '@/assets/img/panel-bud-budget';
import cashPng from '@/assets/img/panel-bud-cash';
import threePng from '@/assets/img/panel-bud-three-expenses';

/**
 * 查询维度（本月、本年）
 */
const DIMENSION = {
	MONTH: 'MONTH',
	YEAR: 'YEAR'
};

/**
 * 指标配置类型
 */
const BUD_TYPE = {
	yszc: {
		public: '公用',
		person: '个人',
		project: '项目'
	},
	zdjf: {
		serve: '招待',
		aboard: '出国',
		publicCar: '公车'
	}
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
			dimension: DIMENSION.MONTH,
			currentMonth: '',
			value: {
				month: [],
				year: {}
			},
			dialog: {
				visible: false,
				activeYszc: 'public',
				activeZdjf: 'serve',
				yszc: {
					public: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					},
					person: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					},
					project: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					}
				},
				zdjf: {
					serve: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					},
					aboard: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					},
					publicCar: {
						acoObj: [],
						acitemType: [],
						acitemObj: {}
					}
				}
			},
			DIMENSION,
			BUD_TYPE,
			assetPng,
			budgetPng,
			cashPng,
			threePng
		};
	},
	created() {
		this.currentMonth = this.GET_LOGIN_INFO.fiscalPeriod;
	},
	methods: {
		/**
		 * 初始化
		 * 1、初始化数据
		 * 2、获取门户块数据
		 */
		async init() {
			try {
				this.resetValue();
				let response = await this.getValue(PANEL.BUD);
				this.$set(this.$data, 'value', response);
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
		 * 配置
		 */
		handleConfig() {
			this.dialog.visible = true;
		},
		/**
		 * 处理科目编码
		 * 1、获取辅助核算
		 */
		handleAcoChange(value, data, budType, budTypeDetail) {
			let acitemType = this.acitemType(value);
			if (util.isEmpty(acitemType)) {
				this.$set(this.dialog[budType][budTypeDetail], 'acitemObj', {});
				this.$set(this.dialog[budType][budTypeDetail], 'acitemType', []);
			} else {
				let acitemTypeCode = acitemType.map(e => e.atomCode);
				for (let e in this.dialog[budType][budTypeDetail].acitemObj) {
					if (!acitemTypeCode.includes(e)) {
						this.$delete(this.dialog[budType][budTypeDetail].acitemObj, e);
					}
				}
				acitemType.forEach(e => {
					if (
						!this.dialog[budType][budTypeDetail].acitemObj.hasOwnProperty(
							e.atomCode
						)
					) {
						this.$set(
							this.dialog[budType][budTypeDetail].acitemObj,
							e.atomCode,
							{
								acitemTypes: e.atomCode,
								acitemTypeName: e.name,
								acitemCodes: '',
								acitemId: '',
								acitemName: ''
							}
						);
					}
				});
				this.$set(
					this.dialog[budType][budTypeDetail],
					'acitemType',
					acitemType
				);
			}
		},
		/**
		 * 处理辅助核算选择
		 */
		handleAcitemChange(value, data, budType, budTypeDetail, atomCode) {
			let acitem = this.dialog[budType][budTypeDetail].acitemObj[atomCode];
			if (util.isEmpty(value)) {
				acitem.acitemCodes = '';
				acitem.acitemId = '';
				acitem.acitemName = '';
			} else {
				acitem.acitemCodes = data.code;
				acitem.acitemId = data.id;
				acitem.acitemName = data.name;
			}
		},
		/**
		 * 处理保存
		 * 1、保存块数据
		 */
		async handleSave() {
			try {
				await this.savePanel();
				await this.saveConfig();
				this.init();
				this.dialog.visible = false;
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
			this.dialog.visible = false;
		},
		/**
		 * 保存配置
		 */
		saveConfig() {
			return new Promise((resolve, reject) => {
				let { acbCode, agyCode } = this.GET_CONTEXT_AGY_ACB;
				fetch
					.post('/pa/portal_conf/save', {
						agyCode,
						acbCode,
						userCode: this.GET_LOGIN_INFO.userCode,
						portletId: PANEL.BANK_ACCOUNT,
						config: this.buildConfig()
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
		 * 构建数据
		 * 1、构建重点经费与预算支出数据
		 */
		buildConfig() {
			let yszc = {
				public: {
					acoObj: [],
					acitemObj: []
				},
				person: {
					acoObj: [],
					acitemObj: []
				},
				project: {
					acoObj: [],
					acitemObj: []
				}
			};
			let zdjf = {
				serve: {
					acoObj: [],
					acitemObj: []
				},
				aboard: {
					acoObj: [],
					acitemObj: []
				},
				publicCar: {
					acoObj: [],
					acitemObj: []
				}
			};
			for (let e in this.dialog.yszc) {
				yszc[e].acoObj = this.dialog.yszc[e].acoObj.map(item => {
					let findResult = this.acoList.find(element => element.code === item);
					let aco = {
						acoCode: item,
						acoId: '',
						acoName: ''
					};
					if (util.isNotEmpty(findResult)) {
						aco.acoId = findResult.id;
						aco.acoName = findResult.name;
					}
					return aco;
				});
				for (let item in this.dialog.yszc[e].acitemObj) {
					yszc[e].acitemObj.push(this.dialog.yszc[e].acitemObj[item]);
				}
			}
			for (let e in this.dialog.zdjf) {
				zdjf[e].acoObj = this.dialog.zdjf[e].acoObj.map(item => {
					let findResult = this.acoList.find(element => element.code === item);
					let aco = {
						acoCode: item,
						acoId: '',
						acoName: ''
					};
					if (util.isNotEmpty(findResult)) {
						aco.acoId = findResult.id;
						aco.acoName = findResult.name;
					}
					return aco;
				});
				for (let item in this.dialog.zdjf[e].acitemObj) {
					zdjf[e].acitemObj.push(this.dialog.zdjf[e].acitemObj[item]);
				}
			}
			return JSON.stringify({ yszc, zdjf });
		},
		/**
		 * 初始化数据
		 */
		resetValue() {
			this.value.month = [];
			this.value.year.yszc = {
				zzcAmt: 0,
				xmAmt: 0,
				xmRatio: 0,
				ryAmt: 0,
				ryRatio: 0,
				gyAmt: 0,
				gyRatio: 0
			};
			this.value.year.zdjf = {
				zzcAmt: 0,
				cgAmt: 0,
				cgRatio: 0,
				zdAmt: 0,
				zdRatio: 0,
				gcAmt: 0,
				gcRatio: 0
			};
			this.value.year.zcfzl = {
				zcfzlRatio: 0,
				zcfzlLinkRatio: 0
			};
			this.value.year.xjjdjw = {
				balAmt: 0,
				linkRatio: 0
			};
		},
		/**
		 * 科目对应的辅助核算（求并集）
		 */
		acitemType(acoList) {
			acoList = this.acoList.filter(e => acoList.includes(e.code));
			let acitemType = [];
			acoList.forEach(e => {
				e.acitemType.forEach(item => {
					let findResult = acitemType.find(element => {
						return element.atomCode === item.atomCode;
					});
					if (util.isEmpty(findResult)) {
						acitemType.push(item);
					}
				});
			});
			return acitemType;
		},
		/**
		 * 判断是否为空且不为零
		 */
		isNotEmpty(val) {
			return util.isNotEmpty(val) && val !== 0;
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB, GET_ACO, GET_MAD]),
		/**
		 * 返回当前模块的值
		 * 1、如果是月返回月数组中对应的值 如果是空则返回默认
		 * 2、如果是年则返回年数据
		 */
		activeValue() {
			if (this.dimension === DIMENSION.MONTH) {
				let result = this.value.month[this.currentMonth - 1];
				return util.isNotEmpty(result)
					? result
					: {
							yszc: {
								zzcAmt: 0,
								xmAmt: 0,
								xmRatio: 0,
								ryAmt: 0,
								ryRatio: 0,
								gyAmt: 0,
								gyRatio: 0
							},
							zdjf: {
								zzcAmt: 0,
								cgAmt: 0,
								cgRatio: 0,
								zdAmt: 0,
								zdRatio: 0,
								gcAmt: 0,
								gcRatio: 0
							},
							zcfzl: {
								zcfzlRatio: 0,
								zcfzlLinkRatio: 0
							},
							xjjdjw: {
								balAmt: 0,
								linkRatio: 0
							}
					  };
			} else {
				return this.value.year;
			}
		},
		/**
		 * 会计科目
		 */
		acoList() {
			let acoList = this.GET_ACO[this.GET_CONTEXT_AGY_ACB.agyCode];
			if (util.isNotEmpty(acoList)) {
				return acoList.filter(e => {
					return (
						e.acbCode === this.GET_CONTEXT_AGY_ACB.acbCode &&
						e.isEnabled === SWITCH.ACTIVE
					);
				});
			} else {
				return [];
			}
		},
		/**
		 * 辅助核算
		 */
		mad() {
			let result = {};
			let mad = this.GET_MAD[this.GET_CONTEXT_AGY_ACB.agyCode];
			if (util.isNotEmpty(mad)) {
				for (let e in mad) {
					result[e] = mad[e].filter(item => item.isEnabled === SWITCH.ACTIVE);
				}
			}
			return result;
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
		position: relative;
		height: 35px;
		.panel-bud-dropdown {
			position: absolute;
			right: 0;
			top: 0;
			line-height: 32px;
			.panel-date-style {
				color: $--color-9254de;
			}
		}
		.panel-title {
			background-color: $--color-9254de;
		}
	}
	.panel-bud-main {
		display: flex;
		margin-top: 35px;
		.panel-bud-box {
			justify-content: space-around;
			box-sizing: border-box;
			width: 50%;
			height: 280px;
			border-right: $--border-base;
			text-align: center;
			.panel-bud-icon {
				img {
					vertical-align: middle;
					padding-bottom: 5px;
				}
			}
			.money {
				margin-top: 40px;
				font-size: 24px;
				font-weight: 500;
			}
			.txt {
				font-size: 14px;
				margin-top: 40px;
				color: $--color-text-secondary;
			}
			.detail-list {
				margin-top: 30px;
			}
		}
	}
	.panel-bud-acitem {
		margin-top: 10px;
		max-height: 200px;
		overflow: auto;
	}
	.text-color {
		color: $--color-9254de;
	}
}
</style>
