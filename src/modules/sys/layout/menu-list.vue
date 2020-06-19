<!-- 菜单 -->
<template>
	<!-- 容器 -->
	<div>
		<!-- 顶部一级菜单 -->
		<div class="nav-menu l">
			<i class="el-icon-arrow-left left-arrow-menu poi" v-show="navLeftArrow"></i>
			<div class="nav-menu-wrap">
				<ul class="nav-menu-list fix">
					<li v-for="(e, i) in menuTree" :key="i" @click="handleMenuClick(e)">
						<span class="nav-menu-line poi"></span>{{e.menuName}}
					</li>
				</ul>
			</div>
			<i class="el-icon-arrow-right right-arrow-menu poi" v-show="navRightArrow"></i>
		</div>
		<!-- 下级菜单主体区域 -->
		<div class="nav-menu-dropdown">
			<div class="dropdown-box fix" v-for="menu in menuTree" :key="menu.mid">
				<div class="dropdown-con" v-for="item in menu.children" :key="item.mid">
					<div class="dropdown-con-tit">{{item.menuName}}</div>
					<ul>
						<li v-for="e in item.children" :key="e.mid">
							<span class="poi" @click="handleMenuClick(e)">{{e.menuName}}</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<!-- 向上的三角形 -->
		<span class="nav-menu-dropdown-arrow"></span>
	</div>
</template>
<script>
import $ from 'jquery';
import { openMenu, getMenu } from '@/store/service/system-service';
import { SWITCH } from '@/assets/js/constant';
import { Tree } from '@/assets/js/model';
import util from '@/assets/js/util';

export default {
	data() {
		return {
			navIndex: 0,
			maxIndex: '',
			navLeftArrow: false,
			navRightArrow: false
		};
	},
	methods: {
		/**
		 * 初始化菜单
		 */
		initMenu() {
			let vm = this;
			let width = 0;
			let menuWrapWidth = $('.nav-menu-wrap').width(); //包裹按钮div宽度
			$('.nav-menu-list li').each((i, e) => {
				width += $(e).innerWidth();
			});
			$('.nav-menu-list').width(width);
			if (width > menuWrapWidth) {
				vm.navRightArrow = true;
				vm.maxIndex = Math.ceil((width - menuWrapWidth) / 200);
				$('.left-arrow-menu').click(() => {
					vm.navIndex--;
					vm.navRightArrow = true;
					$('.nav-menu-wrap').animate({ scrollLeft: vm.navIndex * 200 }, 200);
					vm.navLeftArrow = vm.navIndex === 0 ? false : true;
				});
				$('.right-arrow-menu').click(() => {
					vm.navIndex++;
					vm.navLeftArrow = true;
					$('.nav-menu-wrap').animate({ scrollLeft: vm.navIndex * 200 }, 200);
					vm.navRightArrow = vm.navIndex === this.maxIndex ? false : true;
				});
			}
		},
		/**
		 * 初始化菜单点击事件
		 */
		initMenuClick() {
			//点击其他关闭当前菜单
			let that = this;
			$(document).bind('click', function(e) {
				if (
					$(e.target).closest('.nav-menu-dropdown').length == 0 &&
					$(e.target).closest('.nav-menu-list li').length == 0
				) {
					that.closeMenu();
				}
			});
			//记录初始化参数
			let navListOffsetLeft = $('.nav-menu').offset().left; //导航距左侧距离
			$('.nav-menu-list li').click(function() {
				let windowWidth = window.innerWidth;
				let index = $(this).index(); //当前点击的下标
				let offsetLeft = $(this).offset().left; //被点击导航距左侧的距离
				let navWidth = $(this).innerWidth(); //被点击导航的宽度
				let indexBox = $('.nav-menu-dropdown .dropdown-box').eq(index); //选中的盒子
				let arrowLeft = offsetLeft + navWidth / 2 - 8; //计算箭头位置
				$('.nav-menu-dropdown-arrow')
					.css('left', arrowLeft)
					.show();
				indexBox
					.slideDown(300)
					.siblings()
					.finish()
					.hide();
				let boxWidth = indexBox.innerWidth(); //选中盒子的宽
				let menuLeft = 0;
				if (boxWidth > 435) {
					menuLeft =
						offsetLeft + navWidth / 2 - boxWidth / 2 < navListOffsetLeft
							? navListOffsetLeft - 150
							: offsetLeft + navWidth / 2 - boxWidth / 2; //计算定位到左侧的距离
					if (boxWidth > windowWidth / 2 && offsetLeft > windowWidth / 2) {
						menuLeft = menuLeft - 180;
					}
				} else {
					menuLeft = offsetLeft + navWidth / 2 - boxWidth / 2; //计算定位到左侧的距离
				}
				if (menuLeft <= 0) {
					menuLeft = 100;
				}
				$('.nav-menu-dropdown').css('left', menuLeft);
			});
			$('.nav-menu-dropdown span').click(() => {
				$('.nav-menu-dropdown .dropdown-box').slideUp(200, () => {
					setTimeout(() => {
						$('.nav-menu-dropdown-arrow').hide();
					}, 200);
				});
			});
		},
		/**
		 * 处理菜单点击
		 */
		handleMenuClick(menu) {
      openMenu(menu);
		},
		/**
		 * 关闭菜单
		 */
		closeMenu() {
			$('.nav-menu-dropdown .dropdown-box').slideUp(200, () => {
				setTimeout(() => {
					$('.nav-menu-dropdown-arrow').hide();
				}, 200);
			});
		}
	},
	computed: {
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
	},
	mounted() {
		this.initMenuClick();
		this.initMenu();
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.nav-menu {
	& * {
		box-sizing: border-box;
	}
	position: relative;
	width: calc(100% - 700px);
	padding: 0 40px;
	.left-arrow-menu {
		position: absolute;
		top: 0;
		left: 10px;
		line-height: 35px;
		width: 30px;
		text-align: center;
		font-size: 16px;
	}
	.right-arrow-menu {
		position: absolute;
		top: 0;
		right: 10px;
		line-height: 35px;
		width: 30px;
		text-align: center;
		font-size: 16px;
	}
	.nav-menu-wrap {
		overflow: hidden;
		position: relative;
		height: 35px;
		.nav-menu-list {
			white-space: nowrap;
			position: absolute;
			left: 0;
			top: 0;
			li {
				float: left;
				position: relative;
				padding: 0 16px;
				cursor: pointer;
				.nav-menu-line {
					position: absolute;
					right: 0;
					top: 9px;
					height: 17px;
					width: 1px;
					background-color: #fff;
				}
				&:last-child .nav-menu-line {
					display: none;
				}
			}
		}
	}
}
.nav-menu-dropdown {
	z-index: 2000;
	position: absolute;
	top: 35px;
	left: 330px;
	background-color: #fff;
	color: $--color-text-primary;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.3);
	border-radius: 3px;
	.dropdown-box {
		display: none;
		padding: 8px 10px;
	}
	.dropdown-con {
		display: inline-block;
		padding: 10px 0 0 20px;
		margin-bottom: 10px;
		.dropdown-con-tit {
			min-width: 115px;
			margin-right: 10px;
			font-size: 14px;
			line-height: 30px;
			font-weight: bold;
			border-bottom: $--border-base;
			cursor: default;
		}
		ul {
			float: left;
			li {
				&:first-child {
					margin-top: 5px;
				}
				line-height: 30px;
				span {
					font-size: 13px;
					color: $--color-text-regular;
					text-decoration: none;
					transition: all 0.2s;
					&:hover {
						color: $--color-primary;
					}
				}
			}
		}
	}
}
.nav-menu-dropdown-arrow {
	display: none;
	font-size: 0;
	position: absolute;
	left: 0;
	top: 20px;
	width: 0;
	height: 0;
	border: 8px dashed transparent;
	border-bottom-color: #fff;
}
</style>
