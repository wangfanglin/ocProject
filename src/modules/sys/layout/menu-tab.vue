<!-- 菜单标签 -->
<template>
	<!-- 容器 -->
	<div class="bs-tabs-wrap fix">
		<!-- 超出区域左右箭头 -->
		<div class="tabs-arrow left el-icon-arrow-left" v-if="showTabsArrow" @click="handleClickTabsArrow('left')"></div>
		<div class="tabs-arrow right el-icon-arrow-right" v-if="showTabsArrow" @click="handleClickTabsArrow('right')"></div>
		<!-- 菜单标签页主体区域 -->
		<div class="bs-tabs">
			<ul class="fix">
				<li :class="{'active': $route.path === '/index'}" title="首页" @click="handleTabClick({path: '/index', query: {}})">
					<i class="fa fa-home icon-home" style="margin-left: -3px;"></i>
					首页
				</li>
				<li class="ell" :class="{'active': $route.path === e.path}" v-for="e in GET_VIEW" :key="e.path" :title="e.title" @click="handleTabClick(e)" @dblclick="handleCloseCurrentView(e)" @contextmenu.prevent="handleTabContextmenu(e, $event)">
					<i class="el-icon-close icon-close" @click.stop="handleCloseCurrentView(e)" title="关闭"></i>
					{{e.title}}
				</li>
			</ul>
		</div>
		<!-- 标签右键 关闭选项菜单 -->
		<div class="bs-tabs-dropdown" :class="{'show': tabsDropdown}" v-clickoutside="handleTabsDropdownClickoutside">
			<div @click="handleCloseCurrentView(checkedView, 'tabsDropdown')">关闭当前</div>
			<div @click="handleCloseOtherView('tabsDropdown')">关闭其他</div>
		</div>
	</div>
	<!-- TODO:大伟说留一留 -->
	<!--  <div class="bs-tabs-option-btn" ref="tabsOption" @click.stop="handleTabsOptionClick" v-show="GET_VIEW.length > 0"></div>
    <div class="bs-tabs-option-dropdown" :class="{'show': tabsOptionDropdown}" v-clickoutside="handleCloseTabsDropDown">
      <div @click="handleCloseOtherView('tabsOptionDropdown')">关闭其他</div>
      <div @click="handleCloseAllView">关闭全部</div>
    </div> -->
</template>
<script>
import $ from 'jquery';
import { mapGetters, mapActions } from 'vuex';
import {
	GET_VIEW,
	REMOVE_VIEW,
	REMOVE_OTHER_VIEW,
	REMOVE_ALL_VIEW
} from '@/store/system';
import util from '@/assets/js/util';

export default {
	data() {
		return {
			checkedView: {},
			tabsDropdown: false,
			showTabsArrow: false,
			tabsOptionDropdown: false,
			tabsLength: 0
		};
	},
	watch: {
		GET_VIEW: {
			handler(val) {
				this.$nextTick(() => {
					this.initTabs();
					this.tabsLength = val.length;
				});
			},
			deep: true
		},
		tabsLength(n, o) {
			if (n > o) {
				this.handleClickTabsArrow();
			}
		}
	},
	methods: {
		...mapActions([REMOVE_VIEW, REMOVE_OTHER_VIEW]),
		/**
		 * 初始化标签页
		 */
		initTabs() {
			let vm = this;
			let width = 0;
			let menuWrapWidth = $('.bs-tabs').width(); //包裹按钮div宽度
			$('.bs-tabs ul li').each((i, e) => {
				width += $(e).innerWidth() + 3;
			});
			$('.bs-tabs ul').width(width + 2);
			if (width > menuWrapWidth) {
				vm.showTabsArrow = true;
			} else {
				vm.showTabsArrow = false;
			}
		},
		/**
		 * 标签页菜单选项
		 */
		handleTabContextmenu(view, e) {
			let x = e.clientX;
			let y = e.clientY;
			$('.bs-tabs-dropdown').css({ top: y - 35, left: x });
			this.$set(this.$data, 'checkedView', view);
			this.tabsDropdown = true;
		},
		/**
		 * 处理标签点击事件
		 */
		handleTabClick(val) {
			if (this.$message) {
				this.$message.closeAll();
			}
			if (this.$notify) {
				this.$notify.closeAll();
			}
			this.$router.push({
				path: val.path,
				query: val.query
			});
			this.$nextTick(() => {
				this.initTabs();
			});
		},
		/**
		 * 点击标签页左右箭头
		 * @param direction 方向:left right
		 */
		handleClickTabsArrow(direction) {
			let $tabs = $('.bs-tabs');
			let $tabs_ul = $('.bs-tabs ul');
			if (direction === 'left') {
				$tabs.finish().animate({ scrollLeft: $tabs.scrollLeft() - 300 }, 300);
			} else if (direction === 'right') {
				$tabs.finish().animate({ scrollLeft: $tabs.scrollLeft() + 300 }, 300);
			} else {
				//新增菜单默认移到最右边
				$tabs
					.finish()
					.animate({ scrollLeft: $tabs_ul.width() - $tabs.width() }, 300);
			}
		},
		/**
		 * 关闭当前页面
		 * 1、关闭消息与通知
		 * 2、判断当前页是否不为首页
		 * 3、判断当前页是否修改过，如果修改过，则需要确定是否关闭
		 * 4、关闭当前视图
		 */
		handleCloseCurrentView(view, dropdown) {
			if (this.$message) {
				this.$message.closeAll();
			}
			if (this.$notify) {
				this.$notify.closeAll();
			}
			if (view.path !== '/index') {
				if (view.changed === true) {
					this.$confirm('页面数据未保存，是否关闭？', '提示', {
						confirmButtonText: '确认',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							this.closeCurrentView(view, dropdown);
						})
						.catch(() => {});
				} else {
					this.closeCurrentView(view, dropdown);
				}
			}
		},
		/**
		 * 关闭其他页面
		 * 1、判断当前关闭的页面，构建回调函数
		 * 2、判断其他页面有无改的页面
		 */
		handleCloseOtherView(dropdown) {
			let currentView, callback;
			if (dropdown === 'tabsDropdown') {
				currentView = {
					path: this.checkedView.path,
					name: this.checkedView.name
				};
				callback = () => {
					this.$router.push({
						path: this.checkedView.path,
						query: this.checkedView.query
					});
					this.tabsDropdown = false;
				};
			} else {
				currentView = {
					path: this.$route.path,
					name: this.$route.name
				};
				callback = () => {
					this.tabsOptionDropdown = false;
				};
			}
			let hasChanged = this.GET_VIEW.some(e => {
				return e.path !== currentView.path && e.changed === true;
			});
			if (hasChanged === true) {
				this.$confirm('其他页面数据未保存，是否关闭？', '提示', {
					confirmButtonText: '确认',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.REMOVE_OTHER_VIEW({
							path: currentView.path,
							name: currentView.name
						}).then(() => {
							callback();
						});
					})
					.catch(() => {});
			} else {
				this.REMOVE_OTHER_VIEW({
					path: currentView.path,
					name: currentView.name
				}).then(() => {
					callback();
				});
			}
		},
		/**
		 * 关闭所有页面
		 */
		handleCloseAllView() {
			this.REMOVE_ALL_VIEW().then(() => {
				this.$router.push('/index');
				this.handleCloseTabsDropDown();
			});
		},
		/**
		 * 关闭当前视图
		 */
		closeCurrentView(view, dropdown) {
			this.REMOVE_VIEW(view).then(res => {
				if (view.path === this.$route.path) {
					let lastView = res.slice(-1)[0];
					if (util.isNotEmpty(lastView)) {
						this.$router.push({
							path: lastView.path,
							query: lastView.query
						});
					} else {
						this.$router.push('/index');
					}
				}
			});
			if (util.isNotEmpty(dropdown)) {
				this[dropdown] = false;
			}
		},
		/**
		 * 处理标签页选项点击事件
		 */
		handleTabsOptionClick() {
			let left = $(this.$refs.tabsOption).offset().left;
			$('.bs-tabs-option-dropdown').css({ top: 29, left: left - 95 });
			this.tabsOptionDropdown = !this.tabsOptionDropdown;
		},
		/**
		 * 处理标签页菜单外部点击事件
		 */
		handleTabsDropdownClickoutside() {
			this.tabsDropdown = false;
		},
		/**
		 * 关闭标签页
		 */
		handleCloseTabsDropDown() {
			this.tabsOptionDropdown = false;
		}
	},
	computed: {
		...mapGetters([GET_VIEW, REMOVE_ALL_VIEW])
	},
	mounted() {
		this.initTabs();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.bs-tabs-wrap {
	& * {
		box-sizing: border-box;
	}
	position: relative;
	height: 25px;
	margin: 5px 13px 0;
	padding: 0 27px;
	.bs-tabs {
		white-space: nowrap;
		overflow: hidden;
		li {
			position: relative;
			float: left;
			padding: 0 15px 0 15px;
			min-width: 100px;
			max-width: 150px;
			margin-right: 3px;
			height: 25px;
			line-height: 24px;
			font-size: 14px;
			text-align: center;
			color: #303133;
			background-color: rgba(255, 255, 255, 0.5);
			box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
			border-bottom: 0;
			border-radius: 3px 3px 0 0;
			cursor: pointer;
			i.icon-close {
				position: absolute;
				top: 0;
				right: -20px;
				opacity: 0;
				width: 15px;
				height: 25px;
				line-height: 25px;
				transition: all 0.3s;
				&:hover {
					color: red;
					font-weight: bold;
				}
			}
			&.active {
				color: #333;
				font-weight: bold;
				background-color: #f5f7fa !important;
			}
			&:hover {
				background-color: rgba(255, 255, 255, 0.7);
				box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
				i.icon-close {
					opacity: 1;
					right: 0;
				}
			}
			&:last-child {
				margin-right: 0;
			}
		}
	}
	.tabs-arrow {
		position: absolute;
		width: 25px;
		height: 25px;
		text-align: center;
		line-height: 25px;
		font-size: 16px;
		background-color: rgba(255, 255, 255, 0.5);
		border-bottom: 0;
		cursor: pointer;
		box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
		&.left {
			left: 0;
			bottom: 0;
			border-top-left-radius: 4px;
		}
		&.right {
			right: 0;
			bottom: 0;
			border-top-right-radius: 4px;
		}
		&:hover {
			background-color: rgba(255, 255, 255, 0.7);
			box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
		}
	}
	.bs-tabs-option-btn {
		position: relative;
		display: inline-block;
		width: 25px;
		height: 25px;
		background-color: rgba(255, 255, 255, 0.5);
		border-bottom: 0;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
		&:before {
			position: absolute;
			top: 8px;
			left: 9px;
			content: '';
			display: block;
			width: 1px;
			height: 8px;
			transform: rotate(-45deg);
			background-color: #333;
		}
		&:after {
			position: absolute;
			top: 8px;
			left: 14px;
			content: '';
			display: block;
			width: 1px;
			height: 8px;
			transform: rotate(45deg);
			background-color: #333;
		}
		&:hover {
			background-color: rgba(255, 255, 255, 0.7);
			box-shadow: 0 -3px 3px rgba(0, 0, 0, 0.1);
		}
	}
	.bs-tabs-option-dropdown {
		z-index: 10;
		opacity: 0;
		visibility: hidden;
		position: absolute;
		right: 0;
		top: 0;
		padding: 7px 0;
		width: 120px;
		line-height: 25px;
		background: #fff;
		border: 1px solid #bbb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		transition: opacity 0.2s, visibility 0.2s;
		&.show {
			opacity: 1;
			visibility: visible;
		}
		div {
			padding-left: 30px;
			cursor: pointer;
			&:hover {
				background-color: #cde3f3;
			}
		}
	}
	.bs-tabs-dropdown {
		z-index: 10;
		opacity: 0;
		visibility: hidden;
		position: absolute;
		left: 0;
		top: 0;
		padding: 7px 0;
		width: 150px;
		line-height: 25px;
		background: #fff;
		border: 1px solid #bbb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		transition: opacity 0.2s, visibility 0.2s;
		&.show {
			opacity: 1;
			visibility: visible;
		}
		div {
			padding-left: 30px;
			cursor: pointer;
			&:hover {
				background-color: #cde3f3;
			}
		}
	}
}
</style>
