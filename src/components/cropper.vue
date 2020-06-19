<template>
	<!-- 裁剪弹出框 -->
	<el-dialog top="2vh" width="98%" :visible.sync="visible" @close="handleClose" :append-to-body="true" :close-on-click-modal="false" v-draggable>
		<span slot="title">
			<i class="fa fa-scissors b"> 图片裁剪</i>
		</span>
		<!-- 剪裁区域 -->
		<div class="cropper-container">
			<img ref="cropperImg" :src="imgSrc">
		</div>
		<!-- 操作区域 -->
		<div slot="footer" class="dialog-footer fix">
			<div class="l">
				<!-- 缩放 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleZoom(0.1)"><i class="fa fa-search-plus"></i> 放大</el-button>
					<el-button type="primary" size="small" @click="handleZoom(-0.1)"><i class="fa fa-search-minus"></i> 缩小</el-button>
				</el-button-group>
				<!-- 移动 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleMove(-10, 0)"><i class="fa fa-arrow-left"></i> 左移</el-button>
					<el-button type="primary" size="small" @click="handleMove(10, 0)"><i class="fa fa-arrow-right"></i> 右移</el-button>
					<el-button type="primary" size="small" @click="handleMove(0, -10)"><i class="fa fa-arrow-up"></i> 上移</el-button>
					<el-button type="primary" size="small" @click="handleMove(0, 10)"><i class="fa fa-arrow-down"></i> 下移</el-button>
				</el-button-group>
				<!-- 旋转 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleRotate(-45)"><i class="fa fa-undo"></i> 左转</el-button>
					<el-button type="primary" size="small" @click="handleRotate(45)"><i class="fa fa-repeat"></i> 右转</el-button>
				</el-button-group>
				<!-- 翻转 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleScaleX"><i class="fa fa-arrows-h"></i> 水平翻转</el-button>
					<el-button type="primary" size="small" @click="handleScaleY"><i class="fa fa-arrows-v"></i> 垂直翻转</el-button>
				</el-button-group>
				<!-- 裁剪 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleCrop"><i class="fa fa-check"></i> 裁剪</el-button>
					<el-button type="primary" size="small" @click="handleClear"><i class="fa fa-close"></i> 取消裁剪</el-button>
				</el-button-group>
				<!-- 预览 -->
				<el-button-group>
					<el-button type="primary" size="small" @click="handleDownload"><i class="fa fa-download"></i> 下载</el-button>
					<el-button type="primary" size="small" @click="handleReset"><i class="fa fa-refresh"></i> 重置</el-button>
				</el-button-group>
			</div>
			<el-button size="small" @click="handleCancel">取消</el-button>
			<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
		</div>
	</el-dialog>
</template>
<script>
import Cropper from 'cropperjs';
import util from '@/assets/js/util';

export default {
	data() {
		return {
			cropper: null,
			imgSrc: '',
			previewImgSrc: '',
			scaleX: 1,
			scaleY: 1,
			visible: false,
			previewVisible: false
		};
	},
	methods: {
		/**
		 * 打开图片裁剪
		 */
		open(imgSrc) {
			this.imgSrc = imgSrc;
			this.visible = true;
			this.$nextTick(() => {
				this.initCropper();
			});
		},
		/**
		 * 初始化图片剪裁组件
		 */
		initCropper() {
			let el = this.$refs.cropperImg;
			this.cropper = new Cropper(el);
		},
		/**
		 * 获取剪切框Base64的图片
		 */
		getBase64url() {
			let croppedCanvas = this.cropper.getCroppedCanvas();
			return croppedCanvas.toDataURL('image/png');
		},
		/**
		 * 处理缩放
		 */
		handleZoom(ratio) {
			this.cropper.zoom(ratio);
		},
		/**
		 * 处理移动
		 */
		handleMove(offsetX, offsetY) {
			this.cropper.move(offsetX, offsetY);
		},
		/**
		 * 处理旋转
		 */
		handleRotate(degree) {
			this.cropper.rotate(degree);
		},
		/**
		 * 处理水平翻转
		 */
		handleScaleX() {
			this.scaleX = -this.scaleX;
			this.cropper.scaleX(this.scaleX);
		},
		/**
		 * 处理垂直翻转
		 */
		handleScaleY() {
			this.scaleY = -this.scaleY;
			this.cropper.scaleY(this.scaleY);
		},
		/**
		 * 处理剪裁
		 */
		handleCrop() {
			this.cropper.crop();
		},
		/**
		 * 处理取消剪裁
		 */
		handleClear() {
			this.cropper.clear();
		},
		/**
		 * 处理下载
		 */
		handleDownload() {
			util.download(this.getBase64url(), `${new Date().getTime()}.png`);
		},
		/**
		 * 处理重置
		 */
		handleReset() {
			this.cropper.reset();
		},
		/**
		 * 处理确认
		 */
		handleConfirm() {
			this.$emit('confirm', this.getBase64url());
			this.visible = false;
		},
		/**
		 * 处理取消
		 */
		handleCancel() {
			this.visible = false;
		},
		/**
		 * 处理预览关闭
		 */
		handlePreviewClose() {
			this.previewImgSrc = '';
			this.previewVisible = false;
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			this.imgSrc = '';
			this.cropper.destroy();
			this.cropper = null;
		}
	}
};
</script>
<style lang="scss" scoped>
@import '~@/assets/style/variables.scss';
.cropper-container {
	height: 75vh;
	border: 1px solid $--color-c0c4cc;
	border-radius: $--input-border-radius;
}
</style>
