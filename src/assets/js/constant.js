/**
 * 应用上下文路径
 * @type {string}
 */
const CONTEXT_PATH = '/pty';

/**
 * source：来源（STANDARD、CLOUD）
 * handle：处理函数
 */
const API = {
  source: 'STANDARD',
  handle(data) {
    let result = {};
    for (let e in data) {
      result[e] = data[e][this.source];
    }
    return result;
  }
};

/**
 * 产品版本（迷你版、旗舰版）
 */
const APP_EDITION = {
  MINI: 'MINI',
  FLAGSHIP: 'FLAGSHIP'
};

/**
 * StorageKey
 */
const STORAGE_KEY = {
  /**
   * lincense信息
   */
  LICENSE: 'X-license',

  /**
   * Token
   */
  TOKEN: 'X-Token',

  /**
   * 菜单
   */
  MENU: 'X-Menu',

  /**
   * 视图参数
   */
  VIEW_PARAMS: 'X-ViewParams',

  /**
   * 登录信息
   */
  LOGIN_INFO: 'X-LoginInfo',

  /**
   * 应用上下文单位账套
   */
  CONTEXT_AGY_ACB: 'X-ContextAgyAcb',

  /**
   * 枚举
   */
  ENUMERATE: 'X-Enumerate',

  /**
   * 单位类型
   */
  AGY_TYPE: 'X-AgyType',

  /**
   * 单位及账套
   */
  AGY_ACB: 'X-AgyAcb',

  /**
   * 单位账套树
   */
  AGY_ACB_TREE: 'X-AgyAcbTree',

  /**
   * 会计体系
   */
  ACA: 'X-Aca',

  /**
   * 科目体系
   */
  ACS: 'X-Acs',

  /**
   * 会计要素
   */
  ACE: 'X-Ace',

  /**
   * 币种
   */
  CURRENCY: 'X-Currency',

  /**
   * 汇率
   */
  EXCHANGE_RATE: 'X-ExchangeRate',

  /**
   * 预算类型
   */
  BUD_TYPE: 'X-BudType',

  /**
   * 系统级辅助核算项数据
   */
  SYS_ACITEM_TYPE: 'X-SysAcitemType',

  /**
   * 不再提醒升级浏览器
   */
  NO_REMIND_UPDATE_BROWSER: 'X-NoRemindUpdateBrowser',

  /**
   * appName
   */
  APP_NAME: 'X-AppName',

  /**
   * userCode
   */
  USER_CODE: 'X-UserCode',

  /**
   * budOpsIdx
   */
  BUD_OPS_IDX: 'X-BudOpsIdx',

  /**
   * 列宽度
   */
  COLUMN_WIDTH: 'X-ColumnWidth',

  /**
   * 余额表记录是树表还是平行表
   */
  GAL_RPT_BAL_TBOL: 'X-TableTreeIsBol',

  /**
   * 记录切换单位账套时用户是希望关闭其它标签，还是保留其它标签
   */
  AGY_ACB_CHANGE_DATA: 'X-AayAcbChangeData',

  /**
   * 是否使用高拍仪
   */
  ELOAM: 'X-Eloam',

  /**
   * 打开凭证
   */
  OPEN_VOU: 'X-OpenVou',

  /**
   * 报销选择指标时，是否按项目汇总
   */
  PEX_PROJECT_COLLECT: 'X-PexProjectCollect',

  /**
   * 报账银行对账单导入方案
   */
  REM_IMPORT_SCHEME: 'X-RemImportScheme',

  /**
   * 记录页面上次选择的打印模板类型
   */
  PRINT_TEMPLATE_TYPE: 'X-TEMPLATE',

  /**
   * 报销会计记账配置
   */
  PEX_VOU_CONFIG: 'X-PexVouConfig',

  /**
   * 不再提醒升级浏览器
   */
  NO_REMIND_DOWNLOAD_OPENIE: 'X-NoRemindDownloadOpenIE',

  /**
   * 默认排序
   */
  DEFAULT_SORT: 'X-DefaultSort',

  /**
   * 凭证宽度
   */
  VOU_WIDTH: 'X-VouWidth',

  /**
   * 固定资产页面记录列的显示与隐藏
   */
  GAL_MEMO_FAAC_SHOW_COLUMN: 'X-galMemoFaacShowColumn',
};

/**
 * 枚举Code
 */
const ENUMERATE_CODE = {
  ACA_CODE: {
    key: 'ACA_CODE',
    value: '会计体系'
  },
  ACITEM_USE_TYPE: {
    key: 'ACITEM_USE_TYPE',
    value: '基础资料辅助核算关系'
  },
  ACO_TYPE: {
    key: 'ACO_TYPE',
    value: '会计科目类型'
  },
  AGENCY_CTRLLEVEL: {
    key: 'AGENCY_CTRLLEVEL',
    value: '基础资料控制逻辑'
  },
  AUTO_ENTRY_DIR: {
    key: 'AUTO_ENTRY_DIR',
    value: '自动记账结转方向'
  },
  AUTO_GATHER_TYPE: {
    key: 'AUTO_GATHER_TYPE',
    value: '自动记账凭证分录合并方式'
  },
  AUTO_SCHE_TYPE: {
    key: 'AUTO_SCHE_TYPE',
    value: '自动记账业务类型'
  },
  CARRY_OVER_TYPE: {
    key: 'CARRY_OVER_TYPE',
    value: '结转类型（年结月结）'
  },
  CHR_CONMODE: {
    key: 'CHR_CONMODE',
    value: '控制级次'
  },
  ENABLED: {
    key: 'ENABLED',
    value: '是否启用'
  },
  FIELD_DISPTYPE: {
    key: 'FIELD_DISPTYPE',
    value: '字段显示类型'
  },
  GENDER: {
    key: 'GENDER',
    value: '性别'
  },
  CUACB_TYPE: {
    key: 'CUACB_TYPE',
    value: '账簿类型'
  },
  GL_RPT_PRJ_SCOPE: {
    key: 'GL_RPT_PRJ_SCOPE',
    value: '账表方案共享级别'
  },
  IS_MUST_INPUT: {
    key: 'IS_MUST_INPUT',
    value: '是否必录'
  },
  MEMO_TYPE_CODE: {
    key: 'MEMO_TYPE_CODE',
    value: '备查簿类型'
  },
  NATION: {
    key: 'NATION',
    value: '民族'
  },
  DOCUMENT_TYPE: {
    key: 'DOCUMENT_TYPE',
    value: '证件类型'
  },
  ORG_TYPE: {
    key: 'ORG_TYPE',
    value: '机构类型'
  },
  PRINT_STATUS: {
    key: 'PRINT_STATUS',
    value: '打印状态'
  },
  QRY_PRJ_SCOPE: {
    key: 'QRY_PRJ_SCOPE',
    value: '账表查询方案共享级别'
  },
  RPT_PRINT: {
    key: 'RPT_PRINT',
    value: '账簿打印类型'
  },
  RPT_PRJ_OPT_CODE: {
    key: 'RPT_PRJ_OPT_CODE',
    value: '账表查询选项'
  },
  SECRET_DEGREE: {
    key: 'SECRET_DEGREE',
    value: '涉密级别'
  },
  SUBJECT_TYPE: {
    key: 'SUBJECT_TYPE',
    value: '会计要素'
  },
  USER_TYPE: {
    key: 'USER_TYPE',
    value: '用户类型'
  },
  VIEW_TYPE: {
    key: 'VIEW_TYPE',
    value: '视图类型'
  },
  OPT_VOU_INPUTOR: {
    key: 'OPT_VOU_INPUTOR',
    value: '凭证录入人记录规则'
  },
  VOU_KIND: {
    key: 'VOU_KIND',
    value: '凭证业务类型'
  },
  VOU_SOURCE: {
    key: 'VOU_SOURCE',
    value: '凭证来源'
  },
  VOU_STATUS: {
    key: 'VOU_STATUS',
    value: '凭证状态'
  },
  PA_YSGLJC: {
    key: 'PA_YSGLJC',
    value: '预算管理级次'
  },
  PA_YWKS: {
    key: 'PA_YWKS',
    value: '业务科室'
  },
  AGENCY_TYPE_CODE: {
    key: 'AGENCY_TYPE_CODE',
    value: '单位性质'
  },
  TRAVEL_VEHICLE: {
    key: 'TRAVEL_VEHICLE',
    value: '交通工具'
  },
  TRAVEL_TRAIN: {
    key: 'TRAVEL_TRAIN',
    value: '火车'
  },
  TRAVEL_HIGH_TRAIN: {
    key: 'TRAVEL_HIGH_TRAIN',
    value: '高铁'
  },
  TRAVEL_MOTOR_TRAIN: {
    key: 'TRAVEL_MOTOR_TRAIN',
    value: '动车'
  },
  TRAVEL_SOFT_MAT_TRAIN: {
    key: 'TRAVEL_SOFT_MAT_TRAIN',
    value: '全列软席列车'
  },
  TRAVEL_SHIP: {
    key: 'TRAVEL_SHIP',
    value: '轮船'
  },
  TRAVEL_AIRCRAFT: {
    key: 'TRAVEL_AIRCRAFT',
    value: '飞机'
  },
  TRAVEL_OTHER: {
    key: 'TRAVEL_OTHER',
    value: '其他交通工具'
  },
  TRAVEL_OTHER_INNER: {
    key: 'TRAVEL_OTHER_INNER',
    value: '本单位用车'
  },
  TRAVEL_OTHER_OUTER: {
    key: 'TRAVEL_OTHER_OUTER',
    value: '外单位用车'
  },
  TRAVEL_OTHER_RENT: {
    key: 'TRAVEL_OTHER_RENT',
    value: '平台租车'
  },
  JOB_LEVEL: {
    key: 'JOB_LEVEL',
    value: '职务级别'
  },
  DEPT_TYPE: {
    key: 'DEPT_TYPE',
    value: '部门类别'
  },
  CONTROL_LEVEL: {
    key: 'CONTROL_LEVEL',
    value: '费用控制级别'
  },
  PLAYER_FUN_LEVEL: {
    key: 'PLAYER_FUN_LEVEL',
    value: '运动员职务级别'
  },
  PLAYER_LEVEL: {
    key: 'PLAYER_LEVEL',
    value: '运动员级别'
  },
  INDUSTRY_TYPE: {
    key: 'INDUSTRY_TYPE',
    value: '行业性质'
  },
  MEETING_CATEGORY_NUMBER: {
    key: 'MEETING_CATEGORY_NUMBER',
    value: '会议类型'
  },
  TRAINNING_CATEGORY_NUMBER: {
    key: 'TRAINNING_CATEGORY_NUMBER',
    value: '培训类型'
  },
  TRAVEL_CATEGORY_NUMBER: {
    key: 'TRAVEL_CATEGORY_NUMBER',
    value: '出差类型'
  },
  CURRENT_AGENCY_TYPE: {
    key: 'CURRENT_AGENCY_TYPE',
    value: '单位类型'
  },
  MEMO_TYPE: {
    key: 'MEMO_TYPE',
    value: '单位类型'
  },
  ACCOUNT_TYPE: {
    key: 'ACCOUNT_TYPE',
    value: '账户类型'
  },
  FIELD_CLASS: {
    key: 'FIELD_CLASS',
    value: '地区类别'
  },
  WORK_WAY: {
    key: 'WORK_WAY',
    value: '工作方式'
  },
  PERSONNEL_TYPE: {
    key: 'PERSONNEL_TYPE',
    value: '人员类型'
  },
  LOAN_TYPE: {
    key: 'LOAN_TYPE',
    value: '借款类别'
  }
};

/**
 * 表单类型
 */
const FORM_TYPE = {
  INPUT: 'input',
  FORMAT_INPUT: 'formatInput',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  DATE_TIME: 'datetime',
  SWITCH: 'switch',
  TREE: 'tree',
  SELECT_INPUT: 'selectInput',
  FILE: 'file'
};

/**
 * 数据类型
 */
const DATA_TYPE = {
  STRING: 'string',
  INT: 'int',
  DECIMAL: 'decimal',
  ARRAY: 'array'
};

/**
 * 凭证状态
 */
const VOU_STATUS = {
  F: {
    key: 'F',
    value: '未审核'
  },
  A: {
    key: 'A',
    value: '已审核'
  },
  SIG: {
    key: 'SIG',
    value: '已签章'
  },
  D: {
    key: 'D',
    value: '已复审'
  },
  P: {
    key: 'P',
    value: '已记账'
  },
  C: {
    key: 'C',
    value: '已作废'
  }
};

/**
 * Boolean（是否）
 */
const SWITCH = {
  ACTIVE: 1,
  INACTIVE: 0
};

/**
 * 文件类型
 */
const FILE_TYPE = {
  IMAGE: 'IMAGE',
  TXT: 'TXT',
  PDF: 'PDF',
  WORD: 'WORD',
  EXCEL: 'EXCEL',
  PPT: 'PPT',
  ZIP: 'ZIP',
  RAR: 'RAR',
  OTHER: 'OTHER'
};

/**
 * 组件名称
 */
const PANEL = {
  ARTICLE: 'article', //通知公告
  BANK_ACCOUNT: 'bankAccount', //银行账号,
  BUD_BALANCE_AGY: 'agyBudInOut', //单位预算收入支出情况表
  BUD_BALANCE: 'budInOut', //预算支出情况表
  BUD: 'bud', //指标
  EXPEND_CONSTITUTE: 'galOutAnaly', //支出构成分析
  LEGAL_POLICY: 'legalPolicy', //政策法规
  REMIND: 'remind', //待办提醒
  VOU: 'vou' //凭证
};

export {
  CONTEXT_PATH,
  API,
  STORAGE_KEY,
  ENUMERATE_CODE,
  FORM_TYPE,
  DATA_TYPE,
  VOU_STATUS,
  SWITCH,
  FILE_TYPE,
  PANEL,
  APP_EDITION
};
