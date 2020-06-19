<template>
	<div class="dynamic-wrapper">
		<!-- 头部区域 -->
		<div class="dynamic-toolbar bottom-dashed-border">
			<span class="dynamic-tit">审批日志</span>
		</div>
		<!-- 主体区域 -->
		<div class="dynamic-container">
			<div class="node" v-for="(e, i) in logData" :key="e.taskId">
				<div class="node-img">
					<img :src="meauImg(e.isStart, e.isEnd)" alt="">
				</div>
				<div class="node-content">
					<div class="mt5">
						<span class="main-font pr10">{{e.activityName}}</span>
						<span class="main-font">({{e.assignee}})</span>
					</div>
					<div class="mt5">
						<span class="main-font mr20 color-primary">{{e.deleteReason}}</span>
						<span class="color-text-secondary f15">{{e.endTime}}</span>
					</div>
					<div class="color-success f15 mt5 mb5">
						<!-- 插槽 合同正文变更痕迹 -->
						<slot name="textMark" :textMark="e"></slot>
					</div>
					<div class="mt5 mb10" v-if="isNotEmpty(e.comment)">
						<span class="comment">审批意见：</span>
						<span class="comment" v-html="e.comment"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import fetch from '@/config/fetch';
import util from '@/assets/js/util';
import { format } from 'date-fns';
import processIsStart from '@/assets/img/process-is-start';
import processIsEnd from '@/assets/img/process-is-end';
import processIsAudit from '@/assets/img/process-is-audit';

export default {
	props: {
		/**
		 * 获取数据的url
		 */
		url: {
			type: String,
			default() {
				return '/bpm/histoicFlowList/';
			}
    },
    billId: {
      type: String,
      default() {
        return '';
      }
    }
	},
	data() {
		return {
			logData: []
		};
  },
  watch: {
    billId(val) {
      if(util.isNotEmpty(val)){
        this.getData(val);
      }
    }
  },
	methods: {
		/**
		 * 获取审批日志数据
		 */
		getData(billId) {
			fetch
				.get(`${this.url}${billId}`)
				.then(({ data }) => {
					this.logData = data.map(e => {
						return {
							...e,
							endTime: util.isNotEmpty(e.endTime)
								? format(e.endTime, 'MM/DD HH:mm')
								: ''
						};
					});
				})
				.catch(({ msg }) => {
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		meauImg(isStart, isEnd) {
			if (isStart === 1) {
				return processIsStart;
			} else if (isEnd === 1) {
				return processIsEnd;
			} else {
				return processIsAudit;
			}
		},
		isNotEmpty(val) {
			return util.isNotEmpty(val);
		}
  },
  mounted() {
    if(util.isNotEmpty(this.billId)){
      this.getData(this.billId);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.dynamic-wrapper {
	box-sizing: border-box;
	.dynamic-toolbar {
		height: 30px;
		line-height: 30px;
		padding: 5px;
		.dynamic-tit {
			font-size: 18px;
			font-weight: bold;
		}
	}
	.dynamic-container {
		margin-top: 20px;
		.node {
			position: relative;
			.node-img {
				position: absolute;
				left: 5px;
				z-index: 3;
				img {
					width: 45px;
					height: 45px;
				}
			}
			.node-content {
				min-height: 130px;
				padding-left: 60px;
				margin-left: 27px;
				overflow: hidden;
				border-left: 2px solid $--color-primary;
				.main-font {
					font-size: 16px;
					font-weight: 400;
				}
				.comment {
					font-size: 14px;
					color: $--color-666666;
				}
			}
			&:last-child {
				.node-content {
					border-left: none;
				}
			}
		}
	}
}
</style>

