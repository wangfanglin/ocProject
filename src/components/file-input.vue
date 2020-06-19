<template>
	<el-upload class="dib file-input-contain" ref="upload" :action="url" :headers="uploadHeaders" multiple :data="uploadData" :show-file-list="false" :disabled="disabled" :limit="limit" :before-upload="handleBeforeUpload" :on-success="handleSuccess" :on-error="handleError" :on-exceed="handleExceed" @click.native="active = true" v-clickoutside="handleClickoutside">
		<div class="file-input fix" :class="{'is-active': active}" @mouseenter="clearVisible = true" @mouseleave="clearVisible = false">
			<span class="file-input-upload" v-if="isEmpty(fileList)" key="upload">
				<i class="fa fa-cloud-upload"> 点击上传</i>
			</span>
			<span class="file-input-display link-primary ell" :title="fileDisplay" @click.stop="handleDownload" v-else key="display">
				{{fileDisplay}}
			</span>
			<i class="fa fa-times-circle file-input-clear" @click.stop="handleClear" v-show="clearVisible === true && !isEmpty(fileList)"></i>
		</div>
	</el-upload>
</template>
<script>
import { mapGetters } from 'vuex';
import { GET_TOKEN } from '@/store/login';
import { CONTEXT_PATH, FILE_TYPE } from '@/assets/js/constant';
import util from '@/assets/js/util';
import fetch from '@/config/fetch';
import { dispatchValidateEvent } from '@/mixin/form';

export default {
	props: {
		/**
		 * 绑定的值
		 */
		value: {
			type: Array,
			default() {
				return [];
			}
		},
		/**
		 * 上传地址
		 */
		url: {
			type: String,
			default: `${CONTEXT_PATH}/pub/attachmentFileUpload`
		},
		/**
		 * 是否支持上传多文件
		 */
		multiple: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否禁用
		 */
		disabled: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		/**
		 * 绑定的值的监听
		 * 1、设置组件的值
		 */
		value: {
			handler(val) {
				val = util.isNotEmpty(val) ? val : [];
				this.setFileList(val);
			},
			deep: true
		},
		/**
		 * 附件列表的监听
		 */
		fileList: {
			handler(val) {
				this.$emit('input', val);
				setTimeout(() => {
					this.$emit('change', val);
					dispatchValidateEvent(this, 'ElFormItem', 'el.form.change', [val]);
				}, 0);
			},
			deep: true
		}
	},
	data() {
		return {
			fileList: [],
			uploadHeaders: {},
			uploadData: {
				sysId: 'PUB',
				attachId: '',
				contentType: ''
			},
			active: false,
			clearVisible: false
		};
	},
	methods: {
		/**
		 * 设置附件列表
		 */
		setFileList(value) {
			if (_.isEqual(value, this.fileList)) {
				return;
			}
			this.fileList = _.cloneDeep(value);
		},
		/**
		 * 上传前数据处理
		 * 1、请求头信息添加Token
		 * 2、生成附件ID
		 */
		handleBeforeUpload(file) {
			this.$set(this.uploadHeaders, 'Authorization', this.GET_TOKEN);
			this.uploadData.attachId = util.generateUUID();
			this.uploadData.contentType = file.type;
			return true;
		},
		/**
		 * 上传成功时的钩子
		 */
		handleSuccess({ code, data }, { name }) {
			if (code === '200') {
				this.fileList.push({ id: data, name });
			} else {
				this.$refs.upload.clearFiles();
				this.$message({
					type: 'error',
					message: '上传失败，请稍后重试！'
				});
			}
		},
		/**
		 * 上传失败时的钩子
		 */
		handleError() {
			this.$message({
				type: 'error',
				message: '上传失败，请稍后重试！'
			});
		},
		/**
		 * 文件超出个数限制时的钩子
		 */
		handleExceed() {
			this.$message({
				type: 'error',
				message: '只能上传一个文件！'
			});
		},
		/**
		 * 附件下载
		 */
		handleDownload() {
			util.download(
				`${CONTEXT_PATH}/pub/fileDownload?attachId=${this.fileList[0].id}`
			);
		},
		/**
		 * 清空附件
		 */
		handleClear() {
			this.fileList = [];
			this.$refs.upload.clearFiles();
		},
		handleClickoutside() {
			this.active = false;
			dispatchValidateEvent(this, 'ElFormItem', 'el.form.blur', [
				this.fileList
			]);
		},
		isEmpty(value) {
			return util.isEmpty(value);
		}
	},
	computed: {
		...mapGetters([GET_TOKEN]),
		fileDisplay() {
			return util.isEmpty(this.fileList) ? '' : `${this.fileList[0].name}`;
		},
		limit() {
			return this.multiple ? 9999 : 1;
		}
	},
	mounted() {
		if (util.isNotEmpty(this.value)) {
			this.setFileList(this.value);
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.file-input-contain {
	width: 240px;
	vertical-align: top;
	height: $--input-small-height;
	/deep/ .el-upload {
		width: 100%;
		.file-input {
			width: 100%;
			height: $--input-small-height;
			line-height: 24px;
			padding: 3px 5px 3px 5px;
			background-color: $--color-white;
			border: 1px solid $--color-c0c4cc;
			border-radius: $--input-border-radius;
			font-size: $--font-size-base;
			display: inline-block;
			box-sizing: border-box;
			outline: none;
			text-align: center;
			position: relative;
			&:hover {
				border: 1px solid $--color-909399;
			}
			&.is-active {
				border-color: $--color-primary;
			}
			.file-input-upload {
				display: inline-block;
				font-size: 12px;
				cursor: pointer;
				i {
					color: $--color-text-secondary;
					&:hover {
						color: $--color-primary;
					}
				}
			}
			.file-input-display {
				font-size: 12px;
				width: 85%;
				display: inline-block;
			}
			.file-input-clear {
				position: absolute;
				right: 3px;
				top: 0;
				width: 18px;
				height: 100%;
				line-height: 30px;
				text-align: center;
				color: $--color-text-secondary;
				display: inline-block;
				&:hover {
					cursor: pointer;
				}
			}
		}
	}
}
</style>
