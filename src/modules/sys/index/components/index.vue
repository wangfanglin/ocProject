<!-- 首页 -->
<template>
	<!-- 容器 -->
	<div>
		<!-- 头部组件 -->
		<v-agy-acb-head :value="agyAcb" @change="handleAgyAcbChange" v-if="agyAcbHeadVisible"></v-agy-acb-head>
		<!-- 快捷菜单 -->
		<v-panel-user-menu></v-panel-user-menu>
		<!-- 门户块 -->
		<el-row ref="elRow" :gutter="10">
			<el-col class="mt10" :span="e.area" v-for="(e, i) in panelList" :key="e.id">
				<!-- 通知公告 -->
				<v-panel-article :ref="e.id" :title="e.title" :get-value="getPanelValue" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.ARTICLE"></v-panel-article>
				<!-- 银行账号 -->
				<v-panel-bank-account :ref="e.id" :title="e.title" :config="e.config" :get-value="getPanelValue" :save-panel="savePanel" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.BANK_ACCOUNT"></v-panel-bank-account>
				<!-- 单位预算收入支出情况表 -->
				<v-panel-bud-balance-agy :ref="e.id" :title="e.title" :config="e.config" :get-value="getPanelValue" :save-panel="savePanel" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.BUD_BALANCE_AGY"></v-panel-bud-balance-agy>
				<!-- 预算支出情况表 -->
				<v-panel-bud-balance :ref="e.id" :title="e.title" :config="e.config" :get-value="getPanelValue" :save-panel="savePanel" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.BUD_BALANCE"></v-panel-bud-balance>
				<!-- 指标 -->
				<v-panel-bud :ref="e.id" :title="e.title" :config="e.config" :get-value="getPanelValue" :save-panel="savePanel" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.BUD"></v-panel-bud>
				<!-- 支出构成 -->
				<v-panel-expend-constitute :ref="e.id" :title="e.title" :config="e.config" :get-value="getPanelValue" :save-panel="savePanel" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.EXPEND_CONSTITUTE"></v-panel-expend-constitute>
				<!-- 政策法规 -->
				<v-panel-legal-policy :ref="e.id" :title="e.title" :get-value="getPanelValue" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.LEGAL_POLICY"></v-panel-legal-policy>
				<!-- 待办提醒 -->
				<v-panel-remind :ref="e.id" :title="e.title" :get-value="getPanelValue" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.REMIND"></v-panel-remind>
				<!-- 凭证 -->
				<v-panel-vou :ref="e.id" :title="e.title" :get-value="getPanelValue" @modify="handleModify(e, i)" @remove="handleRemove(e, i)" v-if="e.id === PANEL.VOU"></v-panel-vou>
			</el-col>
		</el-row>
		<!-- 设置坞 -->
		<v-panel-dock ref="panelDock" :user-roles="userRoles" @change="handleDockChange"></v-panel-dock>
		<!-- 门户块编辑 -->
		<v-panel-modify ref="panelModify"></v-panel-modify>
	</div>
</template>
<script>
import Sortable from 'sortablejs';
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { getMenu } from '@/store/service/system-service';
import { SWITCH, PANEL } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

export default {
	components: {
		vPanelUserMenu: () =>
			import('@/modules/sys/index/components/panel-user-menu'),
		vPanelDock: () => import('@/modules/sys/index/components/panel-dock'),
		vPanelModify: () => import('@/modules/sys/index/components/panel-modify'),
		vPanelArticle: () => import('@/modules/sys/index/components/panel-article'),
		vPanelBankAccount: () =>
			import('@/modules/sys/index/components/panel-bank-account'),
		vPanelBudBalanceAgy: () =>
			import('@/modules/sys/index/components/panel-bud-balance-agy'),
		vPanelBudBalance: () =>
			import('@/modules/sys/index/components/panel-bud-balance'),
		vPanelBud: () => import('@/modules/sys/index/components/panel-bud'),
		vPanelExpendConstitute: () =>
			import('@/modules/sys/index/components/panel-expend-constitute'),
		vPanelLegalPolicy: () =>
			import('@/modules/sys/index/components/panel-legal-policy'),
		vPanelRemind: () => import('@/modules/sys/index/components/panel-remind'),
		vPanelVou: () => import('@/modules/sys/index/components/panel-vou')
	},
	data() {
		return {
			agyAcb: {
				agyCode: '',
				agyName: '',
				acbCode: '',
				acbName: ''
			},
			panelList: [],
			sortable: null,
			PANEL
		};
	},
	created() {
		util.copyProperties(this.agyAcb, this.GET_CONTEXT_AGY_ACB);
	},
	methods: {
		/**
		 * 获取门户块数据
		 */
		getPanelList() {
			fetch
				.post('/pa/portal_user_query', {
					userCode: this.GET_LOGIN_INFO.userCode,
					userRoles: this.userRoles,
					agyCode: this.agyAcb.agyCode,
					acbCode: this.agyAcb.acbCode || '',
					fiscal: this.GET_LOGIN_INFO.fiscal,
					perd: String(this.GET_LOGIN_INFO.fiscalPeriod) || '0'
				})
				.then(({ data }) => {
					this.panelList = data;
				})
				.catch(err => {
					console.error(err);
					this.$message({
						type: 'error',
						message: err.msg
					});
				});
		},
		/**
		 * 获取门户块数据
		 */
		getPanelValue(panelId) {
			return new Promise((resolve, reject) => {
				fetch
					.post('/pa/portal/singleData', {
						userCode: this.GET_LOGIN_INFO.userCode,
						userRoles: this.userRoles,
						agyCode: this.agyAcb.agyCode,
						acbCode: this.agyAcb.acbCode || '',
						fiscal: this.GET_LOGIN_INFO.fiscal,
						perd: String(this.GET_LOGIN_INFO.fiscalPeriod) || '0',
						portletId: panelId
					})
					.then(({ data }) => {
						return resolve(data);
					})
					.catch(err => {
						return reject(err);
					});
			});
		},
		/**
		 * 更新门户块的值
		 */
		updtaePanelValue() {
			this.panelList.forEach(e => {
				let ref = this.$refs[e.id][0];
				util.isNotEmpty(ref) && ref.init();
			});
		},
		/**
		 * 初始化门户块拖拽
		 */
		initSortable() {
			let el = this.$refs.elRow.$el;
			this.sortable = Sortable.create(el, {
				ghostClass: 'sortable-ghost',
				animation: 60,
				setData(dataTransfer) {
					dataTransfer.setData('Text', '');
				},
				onEnd: e => {
					let targetRow = this.panelList.splice(e.oldIndex, 1)[0];
					this.panelList.splice(e.newIndex, 0, targetRow);
					this.savePanel();
				}
			});
		},
		/**
		 * 处理单位帐套变化
		 * 1、填充单位帐套数据
		 * 2、更新门户块的值
		 */
		handleAgyAcbChange(value) {
			util.copyProperties(this.agyAcb, value);
			this.updtaePanelValue();
		},
		/**
		 * 处理编辑
		 * 1、修改门户块
		 * 2、保存门户块
		 */
		handleModify(data, index) {
			this.$refs.panelModify.open(data, async value => {
				try {
					util.copyProperties(data, value);
					this.savePanel();
				} catch (err) {
					console.error(err);
					this.$message({
						type: 'error',
						message: err.msg
					});
				}
			});
		},
		/**
		 * 处理删除
		 */
		async handleRemove(data, index) {
			try {
				let confirm = await this.removeConfirm();
				if (!confirm) {
					return;
				}
				this.panelList.splice(index, 1);
				this.$refs.panelDock.switchActive(data.id, SWITCH.INACTIVE);
				this.savePanel();
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 处理设置坞变化
		 * 1、判断门户块是激活还是非激活
		 *    1、激活时需要新增门户块
		 *    2、非激活时，需要删除门户块
		 * 2、保存门户块
		 */
		async handleDockChange(data) {
			try {
				if (data.visibility === SWITCH.ACTIVE) {
					this.panelList.push(data);
				} else {
					let findIndex = this.panelList.findIndex(e => e.id === data.id);
					findIndex !== -1 && this.panelList.splice(findIndex, 1);
				}
				this.savePanel();
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 保存门户块
		 * 1、构建参数
		 * 2、保存数据
		 */
		savePanel() {
			return new Promise((resolve, reject) => {
				let panelList = this.panelList.map((e, i) => {
					return {
						portletId: e.id,
						title: e.title,
						area: e.area,
						sort: i,
						roleCode: e.roleCodes
					};
				});
				fetch
					.post(
						'/pa/portal_user_save?userCode=' + this.GET_LOGIN_INFO.userCode,
						panelList
					)
					.then(() => {
						return resolve();
					})
					.catch(err => {
						return reject(err);
					});
			});
		},
		/**
		 * 删除确认
		 */
		removeConfirm() {
			return new Promise(resolve => {
				this.$confirm('确定删除当前模块？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						return resolve(true);
					})
					.catch(() => {
						return resolve(false);
					});
			});
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB]),
		/**
		 * 用户角色
		 */
		userRoles() {
			return this.GET_LOGIN_INFO.assetRoles.map(e => e.roleCode).join(',');
		},
		/**
		 * 单位帐套菜单是否显示，有任意一个模块权限就显示（gal、gip、pfs、fcq、gcu）
		 */
		agyAcbHeadVisible() {
			return getMenu().some(e => {
				return ['/gal', '/gip', '/pfs', '/fcq', 'gcu'].some(item => {
					return e.menuUrl.includes(item);
				});
			});
		}
	},
	mounted() {
		this.getPanelList();
		this.initSortable();
	},
	beforeDestroy() {
		this.sortable.destroy();
		this.sortable = null;
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
</style>
