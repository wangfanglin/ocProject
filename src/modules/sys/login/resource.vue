<!-- 资源下载 -->
<template>
	<!-- 容器 -->
	<el-dialog :visible.sync="visible" width="800px" v-draggable @close="handleClose">
		<div class="resource-container">
			<p class="pb30 mt30 f20 lh22" style="color: red;">温馨提醒：为了获得更好的操作体验，推荐使用以下浏览器!</p>
			<div class="l w250">
				<img :src="recommendIcon" alt="" width="180px">
			</div>
			<div class="l w180">
				<img class="pb20" :src="chromeIcon" alt="" width="120px">
				<br>
				<el-button class="mb5 f16 wh" type="success" @click="handleDownloadBrowser(BROWSER_TYPE.CHROME)">谷歌浏览器</el-button>
			</div>
			<div class="l w180">
				<img class="pb20" :src="firefoxIcon" alt="" width="125px">
				<br>
				<el-button class="mb5 f16 wh" type="primary" @click="handleDownloadBrowser(BROWSER_TYPE.FIREFOX)">火狐浏览器</el-button>
			</div>
		</div>
		<div class="resource-bottom fix">
			<span v-if="mutipleLogin" class="link-primary poi ml30" @click="handleDownloadCa">CA证书下载</span>
			<span class="link-primary poi ml30" @click="handleDownloadEloam">高拍仪连接程序下载</span>
			<el-checkbox class="r" v-model="noRemind">不再提醒</el-checkbox>
		</div>
	</el-dialog>
</template>
<script>
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { STORAGE_KEY } from '@/assets/js/constant';
import util from '@/assets/js/util';
import recommendIcon from '@/assets/img/login-recommend.png';
import chromeIcon from '@/assets/img/login-chrome.png';
import firefoxIcon from '@/assets/img/login-firefox.png';

/**
 * 浏览器下载类型
 */
const BROWSER_TYPE = {
	CHROME: 'chrome',
	FIREFOX: 'firefox'
};

export default {
	props: {
		mutipleLogin: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			visible: false,
			noRemind: false,
			BROWSER_TYPE,
			recommendIcon,
			chromeIcon,
			firefoxIcon
		};
	},
	methods: {
		/**
		 * 处理资源下载打开
		 */
		open() {
			this.visible = true;
		},
		/**
		 * 检测浏览器版本
		 */
		checkBrowserVision() {
			this.visible =
				(util.getBrowser().versions.ie || util.getBrowser().versions.edge) &&
				LOCAL_STORAGE.get(STORAGE_KEY.NO_REMIND_UPDATE_BROWSER) !== true;
		},
		/**
		 * 浏览器下载
		 */
		handleDownloadBrowser(type) {
			let url;
			if (util.getBrowser().versions.win) {
				if (type === BROWSER_TYPE.CHROME) {
					// chrome浏览器
					if (util.getBrowser().versions.operatingSystem === '32') {
						// 32位操作系统
						url = `${util.getBasePath()}/static-resource/chrome32-71.exe`;
					} else if (util.getBrowser().versions.operatingSystem === '64') {
						// 64位操作系统
						url = `${util.getBasePath()}/static-resource/chrome-71.exe`;
					}
				} else {
					// 火狐浏览器
					if (util.getBrowser().versions.operatingSystem === '32') {
						// 32位操作系统
						url = `${util.getBasePath()}/static-resource/firefox32-64.0.2.exe`;
					} else if (util.getBrowser().versions.operatingSystem === '64') {
						// 64位操作系统
						url = `${util.getBasePath()}/static-resource/firefox-64.0.2.exe`;
					}
				}
			} else {
				if (type === BROWSER_TYPE.CHROME) {
					url = `${util.getBasePath()}/static-resource/chrome-71.dmg`;
				} else {
					url = `${util.getBasePath()}/static-resource/firefox-64.0.2.dmg`;
				}
			}
			util.download(url);
		},
		/**
		 * 下载CA证数
		 */
		handleDownloadCa() {
			let url = `${util.getBasePath()}/static-resource/ca-3.2.1.exe`;
			util.download(url);
		},
		/**
		 * 高拍仪连接程序下载
		 */
		handleDownloadEloam() {
			let url = `${util.getBasePath()}/static-resource/eloam.zip`;
			util.download(url);
		},
		/**
		 * 处理弹出框关闭
		 */
		handleClose() {
			LOCAL_STORAGE.set(STORAGE_KEY.NO_REMIND_UPDATE_BROWSER, this.noRemind);
		}
	}
};
</script>
<style lang="scss" scoped>
.resource-container {
	height: 300px;
	text-align: center;
}
.resource-bottom {
	height: 30px;
	line-height: 30px;
	padding-bottom: 20px;
}
</style>
