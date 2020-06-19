<template>
	<el-dialog top="3vh" width="1200px" :visible.sync="dialogVisible" @close="handleClose" v-draggable>
		<span slot="title">
			<i class="fa fa-camera b"> 使用高拍仪进行拍照</i>
			<span class="f12 color-warning ml5"><i class="el-icon-warning"> 提示（请务必关闭其他高拍仪软件，否则会导致高拍仪无法使用！）</i></span>
		</span>
		<div class="eloam-container">
			<!-- 图像实时传输区 -->
			<div class="eloam-container-img">
				<img :src="imgSrc" width="100%" height="100%" />
			</div>
			<!-- 附件列表 -->
			<div class="eloam-container-img-list fix">
				<div class="eloam-container-img-list-item" :class="{'mt10': i > 2}" v-for="(e, i) in imgList" :key="i">
					<span class="eloam-container-img-list-item-shade">
						<i class="fa fa-trash ml5" @click="handleRemove(i)"></i>
					</span>
					<img :src="`data:image/jpg;base64,${e.contentBase64}`">
				</div>
			</div>
		</div>
		<div slot="footer" class="dialog-footer fix">
			<div class="l">
				<el-button size="small" @click="handleRefresh"><i class="fa fa-refresh color-primary"></i> 初始化</el-button>
				<el-button size="small" @click="handleRotateLeft"><i class="fa fa-undo color-primary"></i> 左旋转</el-button>
				<el-button size="small" @click="handleRotateRight"><i class="fa fa-repeat color-primary"></i> 右旋转</el-button>
				<el-button size="small" @click="handleCamera"><i class="fa fa-camera color-primary"></i> 拍照</el-button>
			</div>
			<el-button size="small" @click="handleCancel">取消</el-button>
			<el-button type="primary" size="small" @click="handleConfirm">确定</el-button>
		</div>
	</el-dialog>
</template>
<script>
import QtChannel from '@/assets/js/qt-channel';
import util from '@/assets/js/util';

export default {
	data() {
		return {
			socket: null,
			channel: null,
			dialogVisible: false,
			imgSrc: '',
			imgList: []
		};
	},
	methods: {
		/**
		 * 打开高拍仪
		 */
		open() {
			this.dialogVisible = true;
			this.$nextTick(() => {
				this.channel.html_loaded('one');
			});
		},
		/**
		 * 初始化Socket
		 */
		initSocket() {
			this.socket = new WebSocket('ws://127.0.0.1:12345');
			this.socket.onopen = this.handleSocketOpen;
		},
		/**
		 * 处理Socket打开
		 * 1、触发open事件
		 * 2、初始化channel
		 * 3、设置处理高拍仪传输实时图像数据函数
		 * 4、处理高拍仪传输拍照图像数据函数
		 */
		handleSocketOpen() {
			this.$emit('open');
			new QtChannel(this.socket, channel => {
				this.channel = channel.objects.dialog;
				this.channel.send_priImgData.connect(this.handleChannelPriImgData);
				this.channel.send_priPhotoData.connect(this.handleChannelPriPhotoData);
			});
		},
		/**
		 * 处理初始化
		 */
		handleRefresh() {
			this.channel.html_loaded('one');
		},
		/**
		 * 处理左转
		 */
		handleRotateLeft() {
			this.channel.get_actionType('rotateLeft');
		},
		/**
		 * 处理右转
		 */
		handleRotateRight() {
			this.channel.get_actionType('rotateRight');
		},
		/**
		 * 处理拍照
		 */
		handleCamera() {
			this.channel.photoBtnClicked('primaryDev_');
		},
		/**
		 * 处理高拍仪传输实时图像数据
		 */
		handleChannelPriImgData(value) {
			this.imgSrc = `data:image/jpg;base64,${value}`;
		},
		/**
		 * 处理高拍仪传输拍照图像数据
		 */
		handleChannelPriPhotoData(value) {
			this.imgList.push({
				attachId: util.generateUUID(),
				fileName: `${new Date().getTime()}.jpg`,
				fileFormat: '.jpg',
				contentType: 'image/jpg',
				contentBase64: value
			});
		},
		/**
		 * 处理删除附件
		 */
		handleRemove(index) {
			this.imgList.splice(index, 1);
		},
		/**
		 * 处理取消
		 */
		handleCancel() {
			this.dialogVisible = false;
		},
		/**
		 * 处理确认逻辑
		 * 1、触发confirm事件
		 */
		handleConfirm() {
			this.$emit('confirm', this.imgList);
			this.dialogVisible = false;
		},
		/**
		 * 处理弹出层关闭
		 */
		handleClose() {
			this.channel.get_actionType('closeSignal');
			this.imgSrc = '';
			this.imgList = [];
		},
		isNotEmpty(value) {
			return util.isNotEmpty(value);
		}
	},
	mounted() {
		this.initSocket();
	},
	beforeDestroy() {
		this.socket.close();
		if (util.isNotEmpty(this.channel)) {
			this.channel = null;
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.eloam-container {
	.eloam-container-img {
		width: 640px;
		height: 480px;
		display: inline-block;
		border: 1px solid $--color-c0c4cc;
		border-radius: $--input-border-radius;
	}
	.eloam-container-img-list {
		margin-left: 10px;
		width: 500px;
		height: 480px;
		display: inline-block;
		overflow: auto;
		.eloam-container-img-list-item {
			height: 135px;
			width: 135px;
			margin-right: 20px;
			position: relative;
			overflow: hidden;
			border: 1px dashed $--border-color-base;
			border-radius: $--border-radius-base;
			box-sizing: border-box;
			float: left;
			.eloam-container-img-list-item-shade {
				opacity: 0;
				position: absolute;
				height: 100%;
				width: 100%;
				background: $--color-shade;
				line-height: 135px;
				text-align: center;
				i {
					color: $--color-white;
					font-size: 24px;
					cursor: pointer;
				}
				&:hover {
					opacity: 1;
				}
			}
			img {
				width: 100%;
				height: 100%;
			}
		}
	}
}
</style>


