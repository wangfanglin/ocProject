<template>
	<el-dialog :visible.sync="visible" width="1300px" top="2vh" @close="handleClose" v-draggable>
		<div class="fix" slot="title">
			<i class="fa fa-exchange b"> 选择票据</i>
			<el-button class="r" type="text" size="mini" @click="handleAdd" style="margin-right: 30px;">
				<i class="fa fa-plus"></i> 添加
			</el-button>
		</div>
		<!-- 内容区域 -->
		<div class="invoice-content fix" :style="{'max-height': tableHeight - 100 + 'px'}">
			<div class="invoice-content-block" v-for="(e, i) in data" :key="i">
				<el-checkbox v-model="e.checked"></el-checkbox>
				<div class="invoice-content-block-box" @click="handleChecked(e)">
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">票据类型：</span>{{eInvoiceTypeDisplay(e.billType)}}
					</div>
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">票据代码：</span>{{e.billNumber}}
					</div>
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">票据号码：</span>{{e.billCode}}
					</div>
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">开票日期：</span>{{e.issueDate}}
					</div>
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">校验码：</span>{{e.randomNumber}}
					</div>
					<div class="invoice-content-block-item ell">
						<span class="dib pct30 tr b">总金额：</span>{{e.totalAmount | formatCurrency}}
					</div>
				</div>
				<div class="invoice-auth" :class="{'color-danger border-danger': e.billAuth === -1, 'color-warning border-warning': e.billAuth === 0, 'color-success border-success': e.billAuth === 1}">{{invoiceAuth(e.billAuth)}}</div>
			</div>
		</div>
		<div slot="footer" class="dialog-footer fix">
			<span v-if="checkedTotal > 0">
				<span class="b">已勾选：</span>
				<span class="color-primary">{{checkedTotal}}张</span>
			</span>
			<div class="r">
				<el-button size="small" @click="visible = false">取消</el-button>
				<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
			</div>
		</div>
	</el-dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import { innerHeight } from '@/mixin/style';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';

/**
 * 票据类型
 */
const INVOICE_TYPE = [
	{
		key: '04',
		value: '增值税普通发票'
	},
	{
		key: '01',
		value: '增值税专用发票'
	},
	{
		key: '10',
		value: '增值税电子普通发票'
	}
];

export default {
	mixins: [innerHeight],
	props: {
		checked: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			visible: false,
			data: []
		};
	},
	methods: {
		/**
		 * 组件显示
		 * 1、获取数据
		 * 2、设置数据
		 */
		async show() {
			try {
				let data = await this.getData();
				this.setData(data);
				this.visible = true;
			} catch (err) {
				console.error(err);
				let errMsg = util.isNotEmpty(err.msg) ? err.msg : '';
				this.$message({
					type: 'error',
					message: errMsg
				});
			}
		},
		/**
		 * 获取数据
		 */
		getData() {
			return new Promise((resolve, reject) => {
				fetch
					.post('/arc/efo/bill/selectByBillType', {
						agyCode: this.GET_CONTEXT_AGY_ACB.agyCode,
						fiscal: this.GET_LOGIN_INFO.fiscal,
						creator: this.GET_LOGIN_INFO.userCode,
						billTypes: ['01', '04', '10'],
						billUse: 0
					})
					.then(({ data }) => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
					});
			});
		},
		/**
		 * 设置数据
		 */
		setData(data) {
			data.forEach(e => {
				e.checked = false;
				if (!this.checked.includes(e.id)) {
					this.data.push(e);
				}
			});
		},
		/**
		 * 处理新增
		 */
		handleAdd() {
			this.$router.push('/arc/arc-efo-bill');
		},
		/**
		 * 区域内点击，修改选中状态
		 */
		handleChecked(data) {
			data.checked = !data.checked;
		},
		/**
		 * 确定操作
		 * 1、若勾选数据不为空，向父组件抛值
		 * 2、关闭弹框
		 */
		handleConfirm() {
			if (this.checkedTotal > 0) {
				let filterResult = this.data.filter(e => {
					return e.checked;
				});
				this.$emit('confirm', filterResult);
			}
			this.visible = false;
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.data = [];
		},
		/**
		 * 票据类型显示
		 */
		eInvoiceTypeDisplay(value) {
			let findResult = INVOICE_TYPE.find(e => {
				return e.key === value;
			});
			return util.isNotEmpty(findResult) ? findResult.value : value;
		},
		/**
		 * 发票验真
		 */
		invoiceAuth(value) {
			switch (value) {
				case -1:
					return '伪';
				case 0:
					return '未验';
				case 1:
					return '真';
				default:
					return '';
			}
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB]),
		/**
		 * 内容区域最大高度
		 */
		tableHeight() {
			return this.innerHeight - 180;
		},
		/**
		 * 当前已勾选数据条数
		 */
		checkedTotal() {
			return this.data.filter(e => {
				return e.checked;
			}).length;
		}
	}
};
</script>
<style lang="scss">
@import '~@/assets/style/variables.scss';
.invoice-content {
	min-height: 500px;
	overflow: auto;
	border: 1px solid $--color-c0c4cc;
	border-radius: $--border-radius-base;
	.invoice-content-block {
		position: relative;
		width: 400px;
		height: 180px;
		margin: 10px 0 10px 10px;
		border: $--border-base;
		border-radius: $--border-radius-base;
		cursor: pointer;
		box-sizing: border-box;
		float: left;
		&:hover {
			box-shadow: $--box-shadow-base;
		}
		/deep/ .el-checkbox {
			position: absolute;
			top: 8px;
			left: 5px;
			z-index: 2;
			.el-checkbox__inner {
				border: solid 1px $--color-primary;
			}
		}
		.invoice-content-block-box {
			margin-top: 5px;
			height: 170px;
			overflow: scroll;
			.invoice-content-block-item {
				height: 25px;
				line-height: 25px;
			}
		}
		.invoice-auth {
			position: absolute;
			top: 20px;
			right: 20px;
			width: 50px;
			height: 50px;
			line-height: 50px;
			text-align: center;
			font-weight: bold;
			font-size: 20px;
			border-radius: 50%;
			transform: rotate(-30deg);
			-ms-transform: rotate(-30deg); /* IE 9 */
			-moz-transform: rotate(-30deg); /* Firefox */
			-webkit-transform: rotate(-30deg); /* Safari 和 Chrome */
			-o-transform: rotate(-30deg); /* Opera */
		}
		.border-danger {
			border: solid 5px $--color-danger;
		}
		.border-warning {
			border: solid 5px $--color-warning;
		}
		.border-success {
			border: solid 5px $--color-success;
		}
	}
}
</style>
