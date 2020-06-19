<template>
	<div>
		<el-form ref="printSetFrom" :model="printSet" label-width="110px" size="small" class="print-set">
			<el-form-item v-show="isSelectTemplate" label="模板名称：" prop="paper">
				<el-select v-model="tmplGuid" :disabled="isDisabledSelect" style="width:250px;" @change="changePaper">
					<el-option v-for="(item,index) in paperData" :key="Math.random()" :label="item.tmplName" :value="item.tmplGuid">
						<span>{{item.tmplName}}</span>
						<span v-show="item.agyCode === '*' && item.userCode === '*'">(系统预置)</span>
						<span v-show="item.agyCode !== '*' && item.userCode === '*'">(单位共享)</span>
						<span v-show="item.agyCode !== '*' && item.userCode !== '*'">(个人配置)</span>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="纸张大小：">
				长：{{printSet.paperHeight}}厘米&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;宽：{{printSet.paperWidth}}厘米
			</el-form-item>
			<el-form-item label="每页打印条数：">
				<el-input style="width:120px;" v-model="printSet.pageSize" @input="pageSizeC" placeholder="请输入条数"></el-input>
			</el-form-item>
			<el-form-item label="页面方向：" prop="Direction">
				<el-radio-group v-model="printSet.Direction" @change="changeDir">
					<el-radio label="横向">横向</el-radio>
					<el-radio label="纵向">纵向</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="页边距：">
				<el-row style="margin-bottom:10px;">
					<el-col :span="11">
						<div>
							<el-input v-model="printSet.MarginUp" @input="MarginUpC">
								<template slot="prepend">上</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
					<el-col :span="11" :offset="1">
						<div>
							<el-input v-model="printSet.MarginRight" @input="MarginRightC">
								<template slot="prepend">右</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="11">
						<div>
							<el-input v-model="printSet.MarginDown" @input="MarginDownC">
								<template slot="prepend">下</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
					<el-col :span="11" :offset="1">
						<div>
							<el-input v-model="printSet.MarginLeft" @input="MarginLeftC">
								<template slot="prepend">左</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="偏移量：" style="margin-top:10px;">
				<el-row>
					<el-col :span="11">
						<div>
							<el-input v-model="printSet.OffsetX" @input="OffsetXC">
								<template slot="prepend">横</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
					<el-col :span="11" :offset="1">
						<div>
							<el-input v-model="printSet.OffsetY" @input="OffsetYC">
								<template slot="prepend">纵</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="行高：" style="margin-top:10px;">
				<el-row>
					<el-col :span="11">
						<div>
							<el-input v-model="printSet.lineHeight" @input="lineHeightInput">
								<template slot="prepend">高</template>
								<template slot="append">厘米</template>
							</el-input>
						</div>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item v-if="isBtnSave" :key="Math.random()">
				<el-row>
					<el-col :span="11">
						<div>&nbsp;</div>
					</el-col>
					<el-col :span="11" :offset="1">
						<div style="text-align: right;margin-top:10px;margin-bottom:15px;">
							<el-button type="primary" @click="savePrintset">保存</el-button>
						</div>
					</el-col>
				</el-row>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { GET_LOGIN_INFO } from '@/store/login';
import fetch from '@/config/fetch';
import { LOCAL_STORAGE } from '@/store/service/storage-service';
import { STORAGE_KEY } from '@/assets/js/constant';
import util from '@/assets/js/util';

export default {
	props: {
		basicdata: {
			//当前弹框的基本信息
			type: Object,
			default() {
				return {
					agyCode: ''
				};
			}
		},
		isDefaultVal: {
			//父组件是否记录了上次打印操作
			type: Boolean,
			default: false
		},
		paperSize: {
			//纸张大小的尺寸
			type: Object,
			default() {
				return {
					width: '10',
					height: '10'
				};
			}
		},
		isBtnSave: {
			//是否出现保存按钮，如果此参数为true，对应的父组件标签里面就应该有@alert='method',method:父组件里面的方法
			type: Boolean,
			default: false
		},
		isSelectTemplate: {
			//是否显示选择模板名称下拉框（默认显示）
			type: Boolean,
			default: true
		},
		isDisabledSelect: {
			//选择模板的下拉框是不是禁用的
			type: Boolean,
			default: false
		},
		disabledData: {
			//配合紧邻上面(isDisabledSelect)使用，当禁用的时候要将当前模板数据传入，保存或者修改需要
			type: Object,
			default() {
				return {};
			}
		},
		tmplName: {
			//打印模板名称
			type: String,
			default: ''
		},
		pageSize: {
			//每页打印多少条
			type: String,
			default: ''
		},
		Direction: {
			//纸张方向
			type: String,
			default: '纵向'
		},
		MarginDown: {
			//下边距
			type: String,
			default: '0'
		},
		MarginLeft: {
			//左边距
			type: String,
			default: '0'
		},
		MarginRight: {
			//右边距
			type: String,
			default: '0'
		},
		MarginUp: {
			//上边距
			type: String,
			default: '0'
		},
		OffsetX: {
			//横向偏移
			type: String,
			default: '0'
		},
		OffsetY: {
			//纵向偏移
			type: String,
			default: '0'
		},
		lineHeight: {
			//纵向偏移
			type: String,
			default: '0'
		}
	},
	watch: {
		basicdata: {
			handler(val) {
				const result = _.cloneDeep(val);
			},
			deep: true
		},
		paperSize: {
			handler(val) {
				const result = _.cloneDeep(val);
				this.printSet.paperWidth = result.width;
				this.printSet.paperHeight = result.height;
			},
			deep: true
		},
		disabledData: {
			handler(val, oldVal) {
				if (!_.isEqual(val, oldVal)) {
					this.selectedPaperData = _.cloneDeep(val);
					this.paperData = [val];
					this.tmplGuid = val.tmplGuid;
					this.printSet.paperWidth = JSON.parse(val.printsetContent).paperWidth;
					this.printSet.paperHeight = JSON.parse(
						val.printsetContent
					).paperHeight;
				}
			},
			deep: true
		},
		tmplName(val) {
      const result = _.cloneDeep(val);
			let curData = this.paperData.find(item => {
				return item.tmplName === result;
			});
			this.tmplGuid = util.isNotEmpty(curData) ? curData.tmplGuid : '';
		},
		pageSize(val) {
			this.printSet.pageSize = val;
		},
		Direction(val) {
			this.printSet.Direction = val;
		},
		MarginDown(val) {
			this.printSet.MarginDown = val;
		},
		MarginLeft(val) {
			this.printSet.MarginLeft = val;
		},
		MarginRight(val) {
			this.printSet.MarginRight = val;
		},
		MarginUp(val) {
			this.printSet.MarginUp = val;
		},
		OffsetX(val) {
			this.printSet.OffsetX = val;
		},
		OffsetY(val) {
			this.printSet.OffsetY = val;
		},
		lineHeight(val) {
			this.printSet.lineHeight = val;
		}
	},
	data() {
		return {
			paperData: [], //纸张数据
			selectedPaperData: {},
			tmplGuid: '', //打印模板Id
			printSet: {
				paperWidth: '210', //纸张长度
				paperHeight: '297', //纸张宽度
				pageSize: '20', //每页打印多少条
				Direction: '纵向', //纸张方向
				MarginDown: '0', //下边距
				MarginLeft: '0', //左边距
				MarginRight: '0', //右边距
				MarginUp: '0', //上边距
				OffsetX: '0', //横向偏移
				OffsetY: '0', //纵向偏移
				lineHeight: '0'
			}
		};
	},
	methods: {
		/*
		 * getPaperSet方法执行后所需要的赋值操作
		 * */
		setPrintData(data) {
			this.selectedPaperData = data[0];
			this.printSet = JSON.parse(data[0].printsetContent);
			this.tmplGuid = data[0].tmplGuid;
			this.$emit('update:tmplName', data[0].tmplName);
			this.$emit(
				'update:Direction',
				JSON.parse(data[0].printsetContent).Direction
			);
			this.$emit(
				'update:pageSize',
				JSON.parse(data[0].printsetContent).pageSize
			);
			this.$emit(
				'update:MarginDown',
				JSON.parse(data[0].printsetContent).MarginDown
			);
			this.$emit(
				'update:MarginLeft',
				JSON.parse(data[0].printsetContent).MarginLeft
			);
			this.$emit(
				'update:MarginRight',
				JSON.parse(data[0].printsetContent).MarginRight
			);
			this.$emit(
				'update:MarginUp',
				JSON.parse(data[0].printsetContent).MarginUp
			);
			this.$emit('update:OffsetX', JSON.parse(data[0].printsetContent).OffsetX);
			this.$emit('update:OffsetY', JSON.parse(data[0].printsetContent).OffsetY);
			this.$emit(
				'update:lineHeight',
				JSON.parse(data[0].printsetContent).lineHeight
			);
		},
		//获取页面设置纸张数据
		getPaperSet() {
			let postData = {
				agyCode: this.newBasicdata.agyCode,
				userCode: this.GET_LOGIN_INFO.userCode,
				functionCode: this.$route.name
			};
			this.$loading();
			fetch
				.get('/gal/voucher/printSet/printTemplateList', {
					params: postData
				})
				.then(({ data }) => {
					this.paperData = data;
					if (data.length !== 0) {
						if (this.isDefaultVal) {
							let storageResult = LOCAL_STORAGE.get(
								`${STORAGE_KEY.PRINT_TEMPLATE_TYPE}${this.$route.name}`
							);
							if (util.isNotEmpty(storageResult)) {
								let curData = this.paperData.find(item => {
									return item.tmplName === storageResult;
								});
								this.tmplGuid = curData.tmplGuid;
								this.$emit('update:tmplName', curData.tmplName);
							} else {
								this.setPrintData(data);
							}
						} else {
							this.setPrintData(data);
						}
					}
					this.$loadingClose();
				})
				.catch(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		//保存打印设置
		savePrintset() {
			let url = '';
			if (this.selectedPaperData.userCode === this.GET_LOGIN_INFO.userCode) {
				url = '/pa/mix/printTemplate/modify';
			} else {
				url = '/pa/mix/printTemplate/save';
			}
			let emitData = _.cloneDeep(this.printSet);
			let postData = _.cloneDeep(this.selectedPaperData);
			postData.userCode = this.GET_LOGIN_INFO.userCode;
			postData.agyCode = this.newBasicdata.agyCode;
			postData.printsetContent = JSON.parse(postData.printsetContent);
			Object.keys(emitData).forEach(e => {
				postData.printsetContent[e] = emitData[e];
			});
			postData.printsetContent = JSON.stringify(postData.printsetContent);
			this.$loading();
			fetch
				.post(url, postData)
				.then(({ msg }) => {
					this.$message({
						type: 'success',
						message: msg
					});
					this.$emit('alert', postData);
					this.$loadingClose();
				})
				.catch(({ msg }) => {
					this.$loadingClose();
					this.$message({
						type: 'error',
						message: msg
					});
				});
		},
		//切换纸张事件
		changePaper(data) {
			let curPaper = this.paperData.find(item => {
				return item.tmplGuid === data;
			});
			this.$emit('update:tmplName', curPaper.tmplName);
			this.selectedPaperData = _.cloneDeep(curPaper);
			this.printSet = JSON.parse(curPaper.printsetContent);
		},
		//页面方向点击
		changeDir(data) {
			this.$emit('update:Direction', data);
		},
		//页面打印条数
		pageSizeC(data) {
			this.$emit('update:pageSize', data);
		},
		//上边距
		MarginUpC(data) {
			this.$emit('update:MarginUp', data);
		},
		//右边距
		MarginRightC(data) {
			this.$emit('update:MarginRight', data);
		},
		//下边距
		MarginDownC(data) {
			this.$emit('update:MarginDown', data);
		},
		//左边距
		MarginLeftC(data) {
			this.$emit('update:MarginLeft', data);
		},
		//横向偏移
		OffsetXC(data) {
			this.$emit('update:OffsetX', data);
		},
		//纵向偏移
		OffsetYC(data) {
			this.$emit('update:OffsetY', data);
		},
		lineHeightInput(data) {
			this.$emit('update:lineHeight', data);
		}
	},
	computed: {
		...mapGetters([GET_LOGIN_INFO]),
		newBasicdata() {
			return _.cloneDeep(this.basicdata);
		}
	},
	mounted() {
		if (this.isDisabledSelect === true) {
			//模板下拉框要是被禁用的话
			this.selectedPaperData = _.cloneDeep(this.disabledData);
			this.paperData = [this.selectedPaperData];
			this.tmplGuid = this.selectedPaperData.tmplGuid;
			this.printSet.paperWidth = JSON.parse(
				this.selectedPaperData.printsetContent
			).paperWidth;
			this.printSet.paperHeight = JSON.parse(
				this.selectedPaperData.printsetContent
			).paperHeight;
		} else {
			if (this.isSelectTemplate) {
				this.getPaperSet();
			} else {
				this.printSet.paperWidth = this.paperSize.width;
				this.printSet.paperHeight = this.paperSize.height;
			}
		}
		if (this.Direction) {
			this.printSet.Direction = this.Direction;
		}
		if (this.pageSize) {
			this.printSet.pageSize = this.pageSize;
		}
		if (this.MarginDown) {
			this.printSet.MarginDown = this.MarginDown;
		}
		if (this.MarginLeft) {
			this.printSet.MarginLeft = this.MarginLeft;
		}
		if (this.MarginRight) {
			this.printSet.MarginRight = this.MarginRight;
		}
		if (this.MarginUp) {
			this.printSet.MarginUp = this.MarginUp;
		}
		if (this.OffsetX) {
			this.printSet.OffsetX = this.OffsetX;
		}
		if (this.OffsetY) {
			this.printSet.OffsetY = this.OffsetY;
		}
		if (this.lineHeight) {
			this.printSet.lineHeight = this.lineHeight;
		}
	}
};
</script>

<style lang="scss" scoped>
.print-set /deep/ .el-form-item {
	margin: 0;
}
</style>
