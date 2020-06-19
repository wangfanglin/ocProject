import Vue from 'vue';

const component = {
  vCrossTable: './cross-table/index',
  vSuperSelect: './super-select/index',
  vTreeSelect: './tree-select/index',
  vAgyAcbChange: './agy-acb-change',
  vAgyAcbHead: './agy-acb-head',
  vAgyHead: './agy-head',
  vAgyScheme: './agy-scheme',
  vAmtInput: './amt-input',
  vApprovalLog: './approval-log',
  vAreaInput: './area-input',
  vBankSelect: './bank-select',
  vConsole: './console',
  vCropper: './cropper',
  vDateRange: './date-range',
  vDateTime: './date-time',
  vDynamicForm: './dynamic-form',
  vEditor: './editor',
  vEloam: './eloam',
  vFileInput: './file-input',
  vFormatInput: './format-input',
  vInvoice: './invoice',
  vMainContainer: './main-container',
  vMonthRange: './month-range',
  vPrintSet: './print-set',
  vProcessPreview: './process-preview',
  vRangeInput: './range-input',
  vSelectInput: './select-input',
  vSelect: './select',
  vTreeInput: './tree-input'
};

Object.keys(component).forEach(key => {
  Vue.component(key, () => import(component[key] + '.vue'));
});
