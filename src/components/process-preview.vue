<template>
	<el-dialog :visible.sync="visible" width="1200px" v-draggable>
		<span slot="title">
			<i class="fa fa-exchange b"> 流转信息</i>
		</span>
		<el-tabs v-model="activeTab">
			<el-tab-pane label="流程状态" name="detail">
				<el-table :data="tableData" :header-cell-style="TABLE_HEADER_CELL_STYLE" border :height="600">
					<el-table-column prop="activityName" label="执行环节" align="center" width="150">
					</el-table-column>
					<el-table-column prop="assignee" label="执行人" header-align="center" align="left" width="120">
					</el-table-column>
					<el-table-column prop="startTime" label="开始时间" header-align="center" align="left" width="160">
					</el-table-column>
					<el-table-column prop="endTime" label="结束时间" header-align="center" align="left" width="160">
					</el-table-column>
					<el-table-column prop="comment" label="提交意见" header-align="center" align="left" min-width="140" show-overflow-tooltip>
					</el-table-column>
					<el-table-column prop="dueTime" label="任务历时" header-align="center" align="center" width="160">
					</el-table-column>
					<el-table-column prop="deleteReason" label="审批状态" header-align="center" align="center" width="120">
					</el-table-column>
				</el-table>
			</el-tab-pane>
			<el-tab-pane label="流程图" name="preView">
				<div style="height:600px;">
					<iframe :src="CONTEXT_PATH + '/diagram-viewer/index.html?processDefinitionId=' + processDefinitionId+'&processInstanceId=' + processInstanceId" frameborder="0" width="100%" height="100%" v-if="activeTab === 'preView'"></iframe>
				</div>
			</el-tab-pane>
		</el-tabs>
		<div slot="footer" class="dialog-footer">
		</div>
	</el-dialog>
</template>
<script>
import { innerHeight, TABLE_HEADER_CELL_STYLE } from '@/mixin/style';
import { CONTEXT_PATH } from '@/assets/js/constant';
import fetch from '@/config/fetch';

export default {
	mixins: [innerHeight],
	data() {
		return {
			activeTab: 'detail',
			processDefinitionId: '',
			processInstanceId: '',
			tableData: [],
			visible: false,
			CONTEXT_PATH,
			TABLE_HEADER_CELL_STYLE
		};
	},
	methods: {
		processPreview(processInstanceId, processDefinitionId) {
			this.$loading();
			fetch
				.get(`bpm/histoicFlow/${processInstanceId}`)
				.then(({ data }) => {
					this.$loadingClose();
					this.processDefinitionId = processDefinitionId;
					this.processInstanceId = processInstanceId;
					this.tableData = data;
					this.activeTab = 'detail';
					this.visible = true;
				})
				.catch(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'error',
						message: msg
					});
				});
		}
	},
	computed: {
		tableHeight() {
			return this.innerHeight - 385;
		}
	}
};
</script>
