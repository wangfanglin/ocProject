<!-- 用户快捷菜单 -->
<template>
	<!-- 容器 -->
	<div class="panel-user-menu-container">
		<!-- 菜单主体 -->
		<ul class="fix">
			<li v-for="(e, i) in userMenu" :key="i">
				<div class="panel-user-menu-block poi" @click="handleMenuClick(e)" :title="e.menuName">
					<img class="panel-user-menu-remove" :src="panelUserMenuRemove" @click.stop="handleMenuRemove(e.mid)">
					<img :src="userMenuImg(e.menuId)" :alt="e.menuName">
					<div class="panel-user-menu-title ell">{{e.menuName}}</div>
				</div>
			</li>
			<li v-if="userMenu.length < 9" @click="handleMenuModify">
				<div class="panel-user-menu-block poi">
					<img :src="panelUserMenuConfig" alt="配置">
					<div class="panel-user-menu-title ell">配置</div>
				</div>
			</li>
		</ul>
		<!-- 菜单编辑弹出层 -->
		<el-dialog :visible.sync="dialog.visible" width="500px" v-draggable class="fastmenu">
			<span slot="title" class="b">
				快捷菜单<span class="color-ff6602">（{{dialog.value.length}}/9）</span>
			</span>
			<div class="panel-user-menu-tree-filter">
				<el-input size="small" v-model.trim="filter" placeholder="输入查询条件" suffix-icon="el-icon-search" @input="handleFilterInput"></el-input>
			</div>
			<el-tree class="panel-user-menu-tree" ref="tree" :data="menuTree" :props="{label: 'menuName', children: 'children'}" default-expand-all :filter-node-method="filterTree">
				<div class="pct90 lh32 fix" slot-scope="{ node, data }">
					<span :class="{'color-primary': dialog.value.includes(data.mid)}">
						{{ node.label }}
						<span v-if="dialog.value.includes(data.mid)" class="color-ff6602">（{{dialog.value.indexOf(data.mid) + 1}}）</span>
					</span>
					<span class="r">
						<el-button type="text" size="mini" @click="() => handleAdd(data.mid)" v-if="!dialog.value.includes(data.mid) && dialog.value.length < 9 && data.isLeaf === '1'">
							<i class="fa fa-plus color-success"></i>
						</el-button>
						<el-button type="text" size="mini" @click="() => handleRemove(data.mid)" v-if="dialog.value.includes(data.mid) && data.isLeaf === '1'">
							<i class="fa fa-trash color-danger"></i>
						</el-button>
					</span>
				</div>
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="dialog.visible = false">取消</el-button>
				<el-button type="primary" size="small" @click="handleSave">保存</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import util from '@/assets/js/util';
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import { setUserMenu, removeUserMenu } from '@/store/service/login-service';
import { openMenu, getMenu } from '@/store/service/system-service';
import { SWITCH } from '@/assets/js/constant';
import { Tree } from '@/assets/js/model';
import panelUserMenuGalVou from '@/assets/img/panel-user-menu-gal-vou.png';
import panelUserMenuGalVouBox from '@/assets/img/panel-user-menu-gal-vou-box.png';
import panelUserMenuGalRptBal from '@/assets/img/panel-user-menu-gal-rpt-bal.png';
import panelUserMenuGalRptJournal from '@/assets/img/panel-user-menu-gal-rpt-journal.png';
import panelUserMenuGalRptChrbook from '@/assets/img/panel-user-menu-gal-rpt-chrbook.png';
import panelUserMenuGalMemoArap from '@/assets/img/panel-user-menu-gal-memo-arap.png';
import panelUserMenuGipBizType from '@/assets/img/panel-user-menu-gip-biz-type.png';
import panelUserMenuMadAcb from '@/assets/img/panel-user-menu-mad-acb.png';
import panelUserMenuPaUser from '@/assets/img/panel-user-menu-pa-user';
import panelUserMenuPexWorkEntry from '@/assets/img/panel-user-menu-pex-work-entry.png';
import panelUserMenuPexWorkAudit from '@/assets/img/panel-user-menu-pex-ops-work-audit.png';
import panelUserMenuPexGalVou from '@/assets/img/panel-user-menu-pex-gal-vou.png';
import panelUserMenuPexLaborAudit from '@/assets/img/panel-user-menu-pex-labor-audit.png';
import panelUserMenuPexOtherExpense from '@/assets/img/panel-user-menu-pex-other-expense.png';
import panelUserMenuPexTravelExpense from '@/assets/img/panel-user-menu-pex-travel-expense.png';
import panelUserMenuPexAbroadExpense from '@/assets/img/panel-user-menu-pex-abroad-expense.png';
import panelUserMenuPexOverseasExpense from '@/assets/img/panel-user-menu-pex-overseas-expense.png';
import panelUserMenuPexLabourExpense from '@/assets/img/panel-user-menu-pex-labour-expense.png';
import panelUserMenuPexUnityExpense from '@/assets/img/panel-user-menu-pex-unity-expense.png';
import panelUserMenuReport from '@/assets/img/panel-user-menu-report.png';
import panelUserMenuDefault from '@/assets/img/panel-user-menu-default.png';
import panelUserMenuConfig from '@/assets/img/panel-user-menu-config.png';
import panelUserMenuRemove from '@/assets/img/panel-user-menu-remove.png';

/**
 * 常用菜单
 */
const COMMON_MENU = {
	GAL_VOU: 'GAL_VOU', //凭证编制
	GAL_VOUBOX: 'GAL_VOUBOX', //凭证箱
	GAL_RPT_BAL: 'GAL_RPT_BAL', //余额表
	GAL_RPT_JOURNAL: 'GAL_RPT_JOURNAL', //明细账
	GAL_RPT_CHRBOOK: 'GAL_RPT_CHRBOOK', //序时账
	GAL_MEMO_ARAP: 'GAL_MEMO_ARAP', //坏账备查簿
	GIP_BIZ_TYPE: 'GIP_BIZ_TYPE', //业务类型
	MAD_ACB: 'MAD_ACB', //帐套设置
	PA_USER: 'PA_USER', //用户管理
	PEX_OPS_WORK_ENTRY: 'PEX_OPS_WORK_ENTRY', //业务办理
	PEX_OPS_WORK_AUDIT: 'PEX_OPS_WORK_AUDIT', //业务审批
	PEX_GAL_VOU: 'PEX_GAL_VOU', //会计记账
	PEX_LABOR_AUDIT: 'PEX_LABOR_AUDIT', //劳务费报税
	PEX_OPS_OTHER_EXPENSE: 'PEX_OPS_OTHER_EXPENSE', //其他费用报销单
	PEX_OPS_TRAVEL_EXPENSE: 'PEX_OPS_TRAVEL_EXPENSE', //差旅费报销单
	PEX_OPS_ABROAD_EXPENSE: 'PEX_OPS_ABROAD_EXPENSE', //出国费报销单
	PEX_OPS_OVERSEAS_EXPENSE: 'PEX_OPS_OVERSEAS_EXPENSE', //出国费（外币）报销单
	PEX_OPS_LABOUR_EXPENSE: 'PEX_OPS_LABOUR_EXPENSE', //劳务费报销单
	PEX_OPS_UNITY_EXPENSE: 'PEX_OPS_UNITY_EXPENSE', //一家亲报销单
	REPORT: 'REPORT' //报表
};

export default {
	data() {
		return {
			filter: '',
			dialog: {
				visible: false,
				value: []
			},
			panelUserMenuConfig,
			panelUserMenuRemove
		};
	},
	methods: {
		/**
		 * 处理菜单点击
		 */
		handleMenuClick(menu) {
      openMenu(menu);
		},
		/**
		 * 编辑菜单
		 */
		handleMenuModify() {
			this.dialog.value = this.userMenu.map(e => {
				return e.mid;
			});
			this.dialog.visible = true;
		},
		/**
		 * 删除菜单
		 */
		handleMenuRemove(val) {
			this.$confirm('确定要删除快捷菜单？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.$loading();
					removeUserMenu(val)
						.then(() => {
							this.$loadingClose();
						})
						.catch(({ msg }) => {
							this.$loadingClose();
							this.$message({
								type: 'error',
								message: msg
							});
						});
				})
				.catch(() => {});
		},
		/**
		 * 添加菜单
		 */
		handleAdd(val) {
			this.dialog.value.push(val);
		},
		/**
		 * 删除菜单
		 */
		handleRemove(val) {
			for (let i = 0, len = this.dialog.value.length; i < len; i++) {
				if (this.dialog.value[i] === val) {
					this.dialog.value.splice(i, 1);
					break;
				}
			}
		},
		/**
		 * 保存用户菜单
		 */
		handleSave() {
			this.$loading();
			setUserMenu(this.dialog.value)
				.then(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'success',
						message: msg
					});
					this.dialog.visible = false;
				})
				.catch(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		/**
		 * 处理菜单数据过滤
		 */
		handleFilterInput() {
			this.$refs.tree.filter(this.filter);
		},
		/**
		 * 过滤菜单数据
		 */
		filterTree(value, data) {
			if (util.isEmpty(value)) {
				return true;
			} else {
				return data.menuName.includes(value);
			}
		},
		/**
		 * 菜单图片
		 */
		userMenuImg(menuId) {
			switch (menuId) {
				case COMMON_MENU.GAL_VOU:
					return panelUserMenuGalVou;
				case COMMON_MENU.GAL_VOUBOX:
					return panelUserMenuGalVouBox;
				case COMMON_MENU.GAL_RPT_BAL:
					return panelUserMenuGalRptBal;
				case COMMON_MENU.GAL_RPT_JOURNAL:
					return panelUserMenuGalRptJournal;
				case COMMON_MENU.GAL_RPT_CHRBOOK:
					return panelUserMenuGalRptChrbook;
				case COMMON_MENU.GAL_MEMO_ARAP:
					return panelUserMenuGalMemoArap;
				case COMMON_MENU.GIP_BIZ_TYPE:
					return panelUserMenuGipBizType;
				case COMMON_MENU.MAD_ACB:
					return panelUserMenuMadAcb;
				case COMMON_MENU.PA_USER:
					return panelUserMenuPaUser;
				case COMMON_MENU.PEX_OPS_WORK_ENTRY:
					return panelUserMenuPexWorkEntry;
				case COMMON_MENU.PEX_OPS_WORK_AUDIT:
					return panelUserMenuPexWorkAudit;
				case COMMON_MENU.PEX_GAL_VOU:
					return panelUserMenuPexGalVou;
				case COMMON_MENU.PEX_LABOR_AUDIT:
					return panelUserMenuPexLaborAudit;
				case COMMON_MENU.PEX_OPS_OTHER_EXPENSE:
					return panelUserMenuPexOtherExpense;
				case COMMON_MENU.PEX_OPS_TRAVEL_EXPENSE:
					return panelUserMenuPexTravelExpense;
				case COMMON_MENU.PEX_OPS_ABROAD_EXPENSE:
					return panelUserMenuPexAbroadExpense;
				case COMMON_MENU.PEX_OPS_OVERSEAS_EXPENSE:
					return panelUserMenuPexOverseasExpense;
				case COMMON_MENU.PEX_OPS_LABOUR_EXPENSE:
					return panelUserMenuPexLabourExpense;
				case COMMON_MENU.PEX_OPS_UNITY_EXPENSE:
					return panelUserMenuPexUnityExpense;
				case COMMON_MENU.REPORT:
					return panelUserMenuReport;
				default:
					return panelUserMenuDefault;
			}
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO]),
		/**
		 * 用户菜单
		 */
		userMenu() {
			return this.GET_LOGIN_INFO.userMenu;
		},
		/**
		 * 菜单树
		 */
		menuTree() {
			let menuFilter = getMenu().filter(e => {
				return e.isShow === SWITCH.ACTIVE;
			});
			return Tree.getTree(menuFilter, {
				id: 'menuId',
				label: 'menuName',
				pid: 'parentMenuId',
				children: 'children'
			});
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.panel-user-menu-container {
	margin-top: 5px;
	ul {
		margin: 0 -10px;
		li {
			float: left;
			width: (100%/9);
			.panel-user-menu-block {
				height: 93px;
				margin: 0 10px;
				padding: 15px;
				position: relative;
				box-sizing: border-box;
				text-align: center;
				background-color: $--color-white;
				border-radius: $--border-radius-base;
				transition: all 0.2s ease-in-out;
				&:hover {
					box-shadow: $--box-shadow-base;
					.panel-user-menu-remove {
						display: inline-block;
					}
				}
				.panel-user-menu-remove {
					display: none;
					position: absolute;
					top: 0;
					right: 0;
				}
				.panel-user-menu-title {
					margin-top: 5px;
					color: $--color-text-regular;
				}
			}
		}
	}
	.panel-user-menu-tree-filter {
		padding-left: 20px;
		padding-right: 20px;
	}
	.panel-user-menu-tree {
		height: 400px;
		margin-top: 5px;
		padding-left: 20px;
		padding-right: 20px;
		overflow: auto;
	}
}
.fastmenu /deep/ .el-tree-node {
	white-space: normal;
}
</style>
