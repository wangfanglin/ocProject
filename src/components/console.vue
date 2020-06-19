<template>
	<el-dialog top="5vh" :visible.sync="visible" v-draggable custom-class="console-dialog" :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose">
		<span slot="title">
			<i class="fa fa-skyatlas b"> {{title}}</i>
		</span>
		<div class="console-container">
			<ul>
				<li class="console-container-option fix" v-for="(e, i) in data" :key="i">
					<span :class="{'color-danger': e.type === TYPE.ERROR}">{{e.value}}</span>
					<span class="r f12 color-text-secondary">{{e.time}}</span>
				</li>
			</ul>
			<div class="console-container-loading" v-if="loadingVisible">
				<i class="fa fa-spinner fa-pulse"></i>
			</div>
		</div>
		<div slot="footer" class="dialog-footer">
		</div>
	</el-dialog>
</template>
<script>
import $ from 'jquery';
import util from '@/assets/js/util';

/**
 * 消息类型
 */
const TYPE = {
	INFO: 'INFO',
	ERROR: 'ERROR'
};

export default {
	props: {
		title: {
			type: String,
			default: '提示'
		}
	},
	data() {
		return {
			visible: false,
			loadingVisible: true,
			data: [],
			TYPE
		};
	},
	methods: {
		/**
		 * 显示
		 */
		show() {
			this.visible = true;
		},
		/**
		 * 关闭
		 */
		close() {
			this.visible = false;
		},
		/**
		 * 停止
		 */
		stop() {
			this.loadingVisible = false;
		},
		/**
		 * push一条输出
		 */
		push(type = TYPE.INFO, value) {
			this.data.push({ type, value: value, time: util.getDateInfo().timeInfo });
			$('.console-container').animate({ scrollTop: 2000 });
		},
		/**
		 * 添加一条标准信息
		 */
		info(value) {
			this.push(TYPE.INFO, value);
		},
		/**
		 * 添加一条错误信息
		 */
		error(value) {
			this.push(TYPE.ERROR, value);
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.loadingVisible = true;
			this.data = [];
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
/deep/ .console-dialog.el-dialog {
	background-color: $--color-F6F6F6;
}
.console-container {
	height: 300px;
	overflow: auto;
	border: 1px solid $--color-c0c4cc;
	border-radius: $--border-radius-small;
	background-color: $--color-ffffff;
	.console-container-option,
	.console-container-loading {
		color: $--select-option-color;
		height: 32px;
		line-height: 32px;
	}
	.console-container-option {
		padding: 0 10px;
		white-space: nowrap;
		box-sizing: border-box;
		font-size: 13px;
	}
	.console-container-loading {
		text-align: center;
		font-size: 16px;
	}
}
</style>


