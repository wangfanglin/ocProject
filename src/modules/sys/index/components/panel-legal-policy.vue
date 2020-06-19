<!-- 政策法规 -->
<template>
	<!-- 容器 -->
	<div class="panel-container">
		<!-- 顶部工具栏 -->
		<div class="panel-toolbar fix">
			<span class="panel-title">{{title}}</span>
			<span class="panel-message-type">
				<span class="article-unread-message color-faad14 ml10">未读消息</span>
				<span class="article-read-message color-text-secondary">已读消息</span>
			</span>
			<div class="r">
				<el-button class="color-faad14" type="text" size="small" @click="toLegalPolicy">更多</el-button>
				<!-- 操作按钮 -->
				<el-dropdown trigger="hover" @command="handleCommand">
					<span class="pl20 pr10 poi"><i class="fa fa-ellipsis-v"></i></span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="refresh"><i class="el-icon-refresh pr10"></i>刷新</el-dropdown-item>
						<el-dropdown-item command="modify"><i class="el-icon-edit pr10"></i>编辑</el-dropdown-item>
						<el-dropdown-item command="remove"><i class="el-icon-delete pr10"></i>删除</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</div>
		<!-- 主体区域 -->
		<div class="panel-legal-policy-main mt10">
			<ul v-if="isNotEmpty(value)">
				<li class="poi" v-for="(e, index) in value" :key="e.id" @click="handlePreview(e.id, index)">
					<div class="ell" :class="{'link-faad14': e.isConfirmed === 0, 'color-text-secondary': e.isConfirmed !== 0}">
						{{e.title}}
					</div>
					<span class="published-time" :class="{'link-faad14': e.isConfirmed === 0, 'color-text-secondary': e.isConfirmed !== 0}">{{e.publishedTime | formatDate}}</span>
				</li>
			</ul>
			<div class="panel-legal-policy-empty" v-else>
				暂无数据！
			</div>
		</div>
		<!-- 通知详情查看 -->
		<el-dialog class="panel-legal-policy-dialog" center :visible.sync="dialog.visible" width="90%" v-draggable>
			<span slot="title"><span class="b">{{dialog.title}}</span></span>
			<div class="legal-policy-content" v-html="dialog.legalPolicyContent">
			</div>
			<div class="pb20">
				<span>附件：</span>
				<el-button type="text" size="mini" @click="handleDownload(e.attachId)" v-for="e in dialog.legalPolicyAttachList" :key="e.attachId">{{e.fileName}}</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB } from '@/store/login';
import util from '@/assets/js/util';
import { CONTEXT_PATH, PANEL } from '@/assets/js/constant';
import fetch from '@/config/fetch';

export default {
	props: {
		title: String,
		getValue: Function
	},
	data() {
		return {
			value: [],
			dialog: {
				visible: false,
				title: '',
				legalPolicyContent: '',
				legalPolicyAttachList: []
			}
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
				this.value = await this.getValue(PANEL.LEGAL_POLICY);
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 处理预览
		 */
		handlePreview(articleId, index) {
			fetch
				.get('/pa/mix/article/view', {
					params: {
						agyCode: this.GET_CONTEXT_AGY_ACB.agyCode,
						confirmer: this.GET_LOGIN_INFO.userCode,
						confirmerName: this.GET_LOGIN_INFO.userName,
						articleId
					}
				})
				.then(({ data: { title, articleContent, articleAttachList } }) => {
					this.dialog.title = title;
					this.dialog.legalPolicyContent = articleContent;
					this.dialog.legalPolicyAttachList = articleAttachList;
					this.dialog.visible = true;
					if (this.value[index].isConfirmed === 0) {
						this.$set(this.value[index], 'isConfirmed', 1);
					}
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
		 * 处理附件下载
		 */
		handleDownload(value) {
			let url = CONTEXT_PATH + '/pub/fileDownload?attachId=' + value;
			util.download(url);
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
		 * 跳转到政策法规
		 */
		toLegalPolicy() {
			this.$router.push({
				path: '/pa/pa-article-preview',
				query: { type: 'legalPolicy' }
			});
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO, GET_CONTEXT_AGY_ACB])
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
		background-color: $--color-faad14;
	}
	.article-unread-message {
		&:before {
			background-color: $--color-faad14 !important;
		}
	}
	.panel-legal-policy-main {
		height: 320px;
		box-sizing: border-box;
		ul {
			width: 100%;
			height: 100%;
			overflow: auto;
			li {
				padding: 5px;
				padding-left: 10px;
				padding-right: 130px;
				position: relative;
				.unread {
					font-weight: bolder;
					position: absolute;
					top: 4px;
					right: 84px;
				}
				.published-time {
					position: absolute;
					top: 4px;
					right: 10px;
				}
				&:hover {
					background-color: $--background-color-base;
				}
			}
		}
		.panel-legal-policy-empty {
			height: 320px;
			line-height: 320px;
			text-align: center;
		}
	}
	.panel-legal-policy-dialog {
		.legal-policy-content {
			min-height: 300px;
			border: $--border-base;
			margin: 0 10px 10px;
		}
		/deep/ .el-dialog__body {
			padding: 0 25px 30px;
		}
	}
	.link-faad14 {
		color: $--color-faad14;
		&:hover {
			color: #ad6800;
			cursor: pointer;
			text-decoration: underline;
		}
	}
	.color-faad14 {
		color: $--color-faad14;
	}
}
</style>
