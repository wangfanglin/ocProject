<!-- 设置坞 -->
<template>
	<!-- 容器 -->
	<div class="index-dock-container" v-clickoutside="handleClickoutside">
		<!-- 设置坞容器 -->
		<div class="index-dock-icon-container" @click="handleSwitchVisible">
			<div class="index-dock-icon" :class="{'index-dock-icon-active': visible}"><img :src="panelDock"></div>
		</div>
		<!-- 设置坞内容区域容器 -->
		<div class="index-dock-content-container" :class="{'index-dock-size-big' : visible}">
			<!-- 设置坞内容区域主体 -->
			<div class="index-dock-content">
				<!-- 设置坞内容区域主体头部 -->
				<div class="index-dock-content-header fix">
					<h4>模块设置</h4>
					<span class="r">
						<i class="fa fa-minus-square-o poi" @click="handleSwitchVisible"></i>
					</span>
				</div>
				<!-- 设置坞内容区域块 -->
				<div class="index-dock-content-block">
					<!-- 设置坞内容区域项 -->
					<div class="index-dock-content-item" v-for="(e, i) in panelList" :key="e.id + i" @click="handlePanelClick(e)">
						<el-checkbox v-model="e.visibility" :true-label="SWITCH.ACTIVE" :false-label="SWITCH.INACTIVE" @click.native="stopPropagation" @change="handlePanelChange(e)"></el-checkbox>
						<div class="index-dock-content-item-img">
							<img :src="panelImage(e.id)">
						</div>
						<div class="index-dock-content-item-title ell">{{e.title}}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import { SWITCH, PANEL } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';
import panelDock from '@/assets/img/panel-dock.png';
import panelArticle from '@/assets/img/panel-article.png';
import panelBankAccount from '@/assets/img/panel-bank-account.png';
import panelBudBalanceAgy from '@/assets/img/panel-bud-balance-agy.png';
import panelBudBalance from '@/assets/img/panel-bud-balance.png';
import panelBud from '@/assets/img/panel-bud.png';
import panelExpendConstitute from '@/assets/img/panel-expend-constitute.png';
import panelLegalPolicy from '@/assets/img/panel-legal-policy.png';
import panelRemind from '@/assets/img/panel-remind.png';
import panelVou from '@/assets/img/panel-vou.png';

export default {
	props: {
		userRoles: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			visible: false,
			panelList: [],
			SWITCH,
			panelDock
		};
	},
	methods: {
		/**
		 * 门户块取消激活
		 */
		switchActive(panelId, visibility) {
			let findResult = this.panelList.find(e => e.id === panelId);
			util.isNotEmpty(findResult) && (findResult.visibility = visibility);
		},
		/**
		 * 获取所有模块
		 */
		getPanelList() {
			let userCode = this.GET_LOGIN_INFO.userCode;
			fetch
				.get(
					`/pa/portal_user_role?userCode=${userCode}&userRoles=${this.userRoles}`
				)
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
		 * 处理模块点击
		 * 1、切换是否激活状态
		 * 2、触发事件
		 */
		handlePanelClick(data) {
			data.visibility =
				data.visibility === SWITCH.ACTIVE ? SWITCH.INACTIVE : SWITCH.ACTIVE;
			this.$emit('change', data);
		},
		/**
		 * 处理模块改变
		 */
		handlePanelChange(data) {
			this.$emit('change', data);
		},
		/**
		 * 处理切换显示隐藏
		 */
		handleSwitchVisible() {
			this.visible = !this.visible;
		},
		/**
		 * 处理外部点击
		 */
		handleClickoutside() {
			this.visible = false;
		},
		/**
		 * 阻止事件冒泡
		 */
		stopPropagation(event) {
			return util.stopPropagation(event);
		},
		/**
		 * 门户块图片
		 */
		panelImage(value) {
			switch (value) {
				case PANEL.ARTICLE:
					return panelArticle;
				case PANEL.BANK_ACCOUNT:
					return panelBankAccount;
				case PANEL.BUD_BALANCE_AGY:
					return panelBudBalanceAgy;
				case PANEL.BUD_BALANCE:
					return panelBudBalance;
				case PANEL.BUD:
					return panelBud;
				case PANEL.EXPEND_CONSTITUTE:
					return panelExpendConstitute;
				case PANEL.LEGAL_POLICY:
					return panelLegalPolicy;
				case PANEL.REMIND:
					return panelRemind;
				case PANEL.VOU:
					return panelVou;
				default:
					return;
			}
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO])
	},
	mounted() {
		this.getPanelList();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.index-dock-container {
	* {
		box-sizing: border-box;
		user-select: none;
	}
	position: fixed;
	left: 14px;
	bottom: 14px;
	z-index: 200;
	.index-dock-icon-container {
		width: 52px;
		height: 52px;
		position: absolute;
		left: -9px;
		bottom: -9px;
		cursor: pointer;
		.index-dock-icon {
			position: absolute;
			left: 9px;
			bottom: 9px;
			z-index: 20;
			width: 32px;
			height: 32px;
			background-color: $--color-background;
			border-radius: 32px;
			transition: all 0.3s;
			img {
				width: 22px;
				height: 22px;
				margin: 5px 0 0 5px;
			}
			&.index-dock-icon-active {
				box-shadow: none;
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
			&:hover {
				box-shadow: 0 0 10px $--color-background;
			}
		}
	}
	.index-dock-content-container {
		overflow: hidden;
		position: absolute;
		left: 5px;
		bottom: 5px;
		width: 0;
		height: 0;
		background-color: $--color-background;
		border-radius: 5px;
		transition: all 0.3s;
		&.index-dock-size-big {
			bottom: 32px;
			left: 0;
			border-bottom-left-radius: 0;
			width: 880px;
			height: 480px;
			.index-dock-content-block {
				padding-top: 10px;
				.index-dock-content-item {
					display: inline-block;
					width: 90px;
					height: 105px;
					margin-left: 10px;
					padding-top: 2px;
					.index-dock-content-item-img {
						margin: 5px auto;
						width: 40px;
						height: 40px;
						img {
							width: 40px;
							height: 40px;
						}
					}
					.index-dock-content-item-title {
						text-align: center;
						padding-left: 0;
						width: 100%;
						font-size: 12px;
					}
				}
			}
		}
		.index-dock-content {
			margin: 10px;
			.index-dock-content-header {
				line-height: 30px;
				h4 {
					display: inline-block;
					margin: 0;
					padding-left: 5px;
					color: $--color-ffffff;
					font-weight: normal;
					font-size: 16px;
				}
				i {
					font-size: 16px;
					color: $--color-ffffff;
					&:first-child {
						margin-right: 5px;
					}
				}
			}
			.index-dock-content-item {
				position: relative;
				padding: 0 5px;
				margin-bottom: 5px;
				height: 44px;
				border: 1px solid transparent;
				cursor: pointer;
				&:hover {
					background-color: $--color-shade;
					border: 1px solid $--color-ffffff;
					border-radius: 4px;
				}
				.index-dock-content-item-title {
					display: inline-block;
					padding-left: 10px;
					width: 100px;
					line-height: 32px;
					color: $--color-ffffff;
				}
			}
		}
	}
}
</style>
