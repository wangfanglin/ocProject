<template>
</template>
<script>
import { setViewParams } from '@/store/service/system-service';
import fetch from '@/config/fetch';
import util from '@/assets/js/util';

/**
 * 系统模块
 */
const SYSTEM_ID = {
	GAL: 'gal', //核算
	PEX: 'pex', //报销
	BUD: 'bud', //指标
	HT: 'ht', //合同
	REM: 'rem', //报账
	PUR: 'pur' //采购
};
export default {
	name: 'REMIND-REDIRECT',
	created() {
		this.init();
	},
	methods: {
		/**
		 * 初始化
		 * 1、参数解密
		 * 2、处理跳转
		 */
		async init() {
			try {
				let params = this.$route.query.params;
				if (util.isEmpty(params)) {
					this.$router.push('/404');
				} else {
					let decodeParams = await this.decodeParams(params);
					this.handleRedirect(decodeParams);
				}
			} catch (err) {
				console.error(err);
				this.$message({
					type: 'error',
					message: err.msg
				});
			}
		},
		/**
		 * 参数解密
		 * 1.跳转对应路由页面
		 */
		decodeParams(params) {
			return new Promise((resolve, reject) => {
				fetch
					.post('/pa/sync/user/Decrypt', { params })
					.then(({ data }) => {
						return resolve(data);
					})
					.catch(err => {
						return reject(err);
					});
			});
		},
		/**
		 * 处理根据systemId 判断跳转页面
		 */
		handleRedirect(value) {
			switch (value.systemId) {
				case SYSTEM_ID.GAL:
					this.toGalDetail(value);
					break;
				case SYSTEM_ID.PEX:
					this.toPexDetail(value);
					break;
				case SYSTEM_ID.HT:
					this.toPctDetail(value);
					break;
				case SYSTEM_ID.REM:
					break;
				case SYSTEM_ID.PUR:
					this.toPurDetail(value);
					break;
				case SYSTEM_ID.BUD:
					this.toBudDetail();
					break;
				default:
					return;
			}
		},
		/**
		 * 处理核算详情跳转
		 */
		toGalDetail(value) {
			this.$router.push({
				path: '/gal/gal-gipba',
				query: { billTypeCode: value.billTypeCode }
			});
		},
		/**
		 * 处理报销详情跳转
		 */
		toPexDetail(value) {
			setViewParams(value.billId, {
				billId: value.billId,
				billFunc: value.billFunc,
				billType: value.billType,
				taskId: value.wfTaskId,
				agyCode: value.agyCode,
				agyName: value.agyName,
				fiscal: value.fiscal
			});
			let path;
			if (['0', '1', '2'].includes(value.status)) {
				if (value.billFunc === 'loan') {
					path = '/pex/pex-ops-loan';
				} else {
					path = `/pex/pex-ops-${value.billType}-${value.billFunc}`;
				}
			} else {
				path = '/pex/pex-ops-approval';
			}
			this.$router.push({
				path,
				query: { billId: value.billId }
			});
		},
		/**
		 * 处理合同详情跳转
		 */
		toPctDetail(value) {
			setViewParams(value.billId, {
				billId: value.billId,
				billFunc: value.billFunc,
				billType: value.billType,
				taskId: value.wfTaskId,
				agyCode: value.agyCode,
				fiscal: value.fiscal
			});
			let path;
			if (value.billStatus === '1') {
				path = `/pct/pct-ops-edit-${value.billType}-ht`;
			} else {
				path = '/pct/pct-ops-approval';
			}
			this.$router.push({
				path,
				query: { billId: value.billId }
			});
		},
		/**
		 * 处理采购详情跳转
		 */
		toPurDetail(value) {
			let billType = value.billType.toLowerCase();
			let path = '';
			if (value.billStatus === '0') {
				path = `/rem/rem-opt-edit-${billType}`;
			} else if (value.billStatus === '1' || value.billStatus === '2') {
				path = '/rem/rem-opt-audit';
			} else if (value.billStatus === '3') {
				path = '/rem/rem-opt-voucher';
			} else {
				path = '/404';
			}
			this.$router.push({
				path,
				query: { billId: value.billId, taskId: value.wfTaskId }
			});
		},
		/**
		 * 处理指标详情跳转
		 */
		toBudDetail() {
			this.$router.push('/bud/bud-ops-audit');
		}
	}
};
</script>
