/**
 * 此模块的性能调优说明
 * 运行过程中，最多的时间消耗在handsontable的创建与销毁上，但是一些操作会触发两次创建与销毁，这样，第一次创建的handsontable马上又被销毁，浪费了大量的时间。
 * 有两种情况会引发两次创建：
 *    一种是页面打开时调用restoreData,这个方法有两部分，一部分是回复schm配置数据，一部分是调用getTableData查询数据。第一部分运行
 * 完成配置数据恢复，到发送取数请求之前，会触发一次hotsettings的计算和handsontable的构建，数据取回来之后又会再次触发hotsettings计算和handsontable
 * 的销毁和构建；
 *    另一种情况是,点击右侧面板的要素、选项、选择值，可能会清空rowMadData,这也会触发两次handsontable的构建；
 * 解决问题的思路是设置状态变量来阻止第一次的构建。具体做法是设置beforeFetchData变量，阻止restoreData方法的第一次构建；设置dataWillChange变量阻止第
 * 二种情况的重复构建；dataWillChange变量在dataCdtn计算属性里设置；设置dataWillChange变量需要用到rowMadData，这在第一种情况中的getTableData会
 * 修改rowMadData，从而意外触发dataCdtn的计算，所以增加dataChange变量，表示当前的触发是由rowMadData的变化引起的，不是要素及选择值的变化引起的，从而
 * 做得只在要素及其值的变化的时候设置dataWillChange变量。为确保dataWillChange变量在hotsettings运行之前已经计算完成，hotsettings计算属性里对要素及
 * 其值都从dataCdtn计算属性里取。为防止这些状态变量本身引起dataCdtn的计算，把他们放在status下的动态增加的属性里（这算是利用vue的漏洞吧）
 * 解决性能问题的第二个方面是给handsontable的每一列设置列宽，不需要handsontable自动计算，大概可以降低40%左右的构建时间。这就需要每个要素增加一个属性：宽度
 * 为提升体验，在长时间销毁构建的过程中，增加进度提示页面，免得用户以为系统死机了
 */
import {setAgyInfo} from '@/store/service/agy-service';
import {mapGetters} from 'vuex';
import util from '@/assets/js/util';
import codeRule from '@/assets/js/code-rule';
import fetch from '@/config/fetch';
import Handsontable from 'handsontable-pro';
import filter from '@/config/filter';
import {LOCAL_STORAGE} from '@/store/service/storage-service';
import {GET_LOGIN_INFO} from '@/store/login';
import {innerHeight} from '@/mixin/style';

export default {
  mixins: [innerHeight],
  props:{
    options:{
      /**
         reportId:'report-content'
         dataUrl:取数url
         getParams:获得查询参数的钩子函数,参数是sheme
         getSaveSchemeParams:获得保存查询方案的参数的钩子函数,有参数
         atoms:[{code:'ACO',name:'科目',field:'ACO',codeRule:'4-2-2-2-2-2-2-2-2-2-2',list:[]},...]
         colAtoms:[{code:'ACO',name:'科目',field:'ACO',codeRule:'4-2-2-2-2-2-2-2-2-2-2',list:[]},...]列分组要素列表，如果行列分组的要素一样，则可不传此参数
         monthAtom:{code:'PERD',name:'会计期间',field:'PERD'},//会计期间PERD或月份
         removeTemplate:删除模板的钩子函数
         rowMadDataFn: 对rowMadData的读取钩子函数，可以在rowMadData的基础上增、删、排序等。在contentAtomRows方法里被调用
         notReLoadOnOpen: 查询时不保存查询参数到本地，打开页面时也不从本地取参数
         noConditionGroup:Boolean是否有条件分组，有条件分组时可不传此参数
         noPreview:Boolean是否在选择行列分组的时候预览
         noSumCol:Boolean 是否不要小计列
         amts:[{code:'yrBegBalAmt',name:'年初余额'},
         {code:'begDrAmt',name:'借方期初余额'},{code:'begCrAmt',name:'贷方期初余额'},{code:'begBalAmt',name:'期初余额'},
         {code:'cDrAmt',name:'借方发生额'},{code:'cCrAmt',name:'贷方发生额'},{code:'cBalAmt',name:'发生净额'},
         {code:'totalDrAmt',name:'借方累计额'},{code:'totalCrAmt',name:'贷方累计额'},{code:'totalBalAmt',name:'累计净额'},
         {code:'endDrAmt',name:'借方期末余额'},{code:'endCrAmt',name:'贷方期末余额'},{code:'endBalAmt',name:'期末余额'}]
         default:{
           schmName:报表缺省名称
         }
         valueConsistsOf:'ALL'
         emptyAsAll:fasle 要素为空时是否表示全部
         amtLink:点击金额自动时调用的函数
       */
      type:Object,
      default(){
        return {};
      }
    },
    templates:{
      type:Object,
      default(){
        return {psn:[],agy:[],sys:[]};
      }
    },
    filterText:{
      type:String,
      default:''
    }
  },
  data() {
    return {
      activeTemplates:'psn',
      hot:undefined,
      data:[],
      rowMadData:[],
      schm:{
        schmId:'',
        schmName:'',
        schmScope:'1',
        style:'line',//有两个值可选，stripe、line
        selectedColor:'#FF9800',

        listAmts:[],
        colAtomSeq:[],
        colConfig:{},
        rowAtomSeq:[],
        rowConfig:{},
        cdtnConfig:{},
        atomValues:{},
        selectedValues:{},//用于记录每个要素真实被选择的节点（去掉半选中节点）,记录这个数据的原因是：atomValues里记录的值可能是ALL,选中和半选中的节点都包含，这样在存为模板和保存到本地之后，用于恢复原始条件时，系统就分不清哪些是选中节点，哪些是半选中节点，造成恢复数据出错

        fromPERD:1,
        toPERD:5,
        amtOrder:'default'   //金额是否按默认顺序，有两个值：default、custom
      },
      colors: [['#f44336','#ffebee'],['#E91E63','#FCE4EC'],['#9C27B0','#F3E5F5'],['#673AB7','#EDE7F6'],['#3F51B5','#E8EAF6'],
               ['#2196F3','#E3F2FD'],['#03A9F4','#E1F5FE'],['#00BCD4','#E0F7FA'],['#009688','#E0F2F1'],['#4CAF50','#E8F5E9'],
               ['#8BC34A','#F1F8E9'],['#CDDC39','#F9FBE7'],['#FFEB3B','#FFFDE7'],['#FFC107','#FFF8E1'],['#FF9800','#FFF3E0'],
               ['#FF5722','#FBE9E7'],['#795548','#EFEBE9'],['#9E9E9E','#FAFAFA'],['#607D8B','#ECEFF1'],
               ['#0097a7','#E0F7FA'],['#ce6d39','#ffeee4'],['#566270','#e0e3da'],['#7C7877','#F0E5DE'],['#08182b','#f4f4f4']],
      atomMap: {},
      cache:{},
      status:{}//里面会动态增加三个属性:dataChange,dataWillChange,beforeFetchData
    };
  },

  watch:{
    'hotSettings':{
      handler(v,o){
        let oldHotSetting = this.cache.oldHotSetting;
        if (!v || oldHotSetting && _.isEqual(v,oldHotSetting)){ return; }
        this.cache.oldHotSetting = _.cloneDeep(_.omit(v,'cells'));
        v.cells = this.cellRender();//挂接渲染函数
        this.renderReport(v);
      },
      deep:true
    },

    'schm.schmName':{
      handler(v){
        this.$emit('nameChange', v);
      },
      deep:false
    },
    'schm.rowAtomSeq': {
      handler(v){
        this.$emit('rowAtomSeqChange', v);
      },
      deep: true
    },
    'data':{
      handler(v){
        this.$emit('dataChanged',v);
      },
      deep:true
    },
    //当行列要素及其值发生变化时，清空rowMadData；当rowMadData为空时，进入表格设计模式，行组合为前端拼凑
    'dataCdtn':{
      handler(v){
        // console.log('dataCdtn handler');
        if (this.status.dataWillChange){
          this.status.dataChange = true;
          this.status.dataWillChange = false;
          this.rowMadData.splice(0,this.rowMadData.length);
        }
      },
      deep:true
    }
  },

  computed: {
    ...mapGetters([GET_LOGIN_INFO]),

    /**
     * 返回其值变化后会清空data的属性
     */
    dataCdtn(){
      if (!this.status.dataChange && this.rowMadData.length > 0){
        this.status.dataWillChange = true;
      }
      return {
        rowAtomSeq:this.schm.rowAtomSeq,
        colAtomSeq:this.schm.colAtomSeq,
        atomValues:this.schm.atomValues,
        fromPERD:this.schm.fromPERD,
        toPERD:this.schm.toPERD
      };
    },

    /**
     * 预置颜色组合中的主色
     */
    mainColors(){
      return this.colors.map(c => {
        return c[0];
      });
    },

    atoms(){
      return this.options.monthAtom ? [this.options.monthAtom].concat(this.options.atoms) : this.options.atoms;
    },

    /**
     * 列要素列表
     */
    colAtoms(){
      if (this.options.colAtoms){
        return this.options.monthAtom ? [this.options.monthAtom].concat(this.options.colAtoms) : this.options.colAtoms;
      }
      return this.options.monthAtom ? [this.options.monthAtom].concat(this.options.atoms) : this.options.atoms;
    },

    /**
     * 可在条件页签列出来的要素
     */
    conditionAtoms(){
      return _.filter(this.atoms,
                atom => {
                  return !this.schm.rowAtomSeq.includes(atom.code) &&
                    !this.schm.colAtomSeq.includes(atom.code);
                });
    },

    /**
     * 金额缺省顺序数组
     */
    amtDefaultOrder(){
      return _.map(this.options.amts,
                   amt => {
                     return amt.code;
                   });
    },
    /**
     * 每一个明细列作为一个数组
     */
    genColVec(){
      // console.time('genColVec');
      let atomList = this.schm.colAtomSeq;
      let colConfig = this.schm.colConfig;
      if (this.schm.listAmts.length === 0){
        return [];
      }
      let valueList1 = [];
      let valueList2 = [];
      if (atomList.length > 0){
        let atomCode = atomList[0];
        valueList1 = this.getAtomValueList(atomCode, false);
      }
      if (atomList.length > 1){
        let atomCode = atomList[1];
        valueList2 = this.getAtomValueList(atomCode, false);
      }
      let resultList = [];
      if (valueList1.length > 0){
        _.forEach(valueList1,
                  val1 => {
                    if (!this.options.noSumCol || val1.isLeaf && valueList2.length === 0){
                      _.forEach(this.orderedAmts,
                                amt => {
                                  resultList.push([val1.code,amt]);
                                });
                    }
                    if (valueList2.length > 0){
                      _.forEach(valueList2,
                                val2 => {
                                  if (this.options.noSumCol && !val2.isLeaf){
                                    return;
                                  }
                                  _.forEach(this.orderedAmts,
                                            amt => {
                                              resultList.push([val1.code,val2.code,amt]);
                                            });
                                });
                    }
                  });
      }else{
        _.forEach(this.orderedAmts,
                  amt => {
                    resultList.push([amt]);
                  });
      }
      // console.timeEnd('genColVec');
      return resultList;
    },

    /**
     * 计算每个数据单元格对应的行列代码对象，返回结果类似如下：
     * {"r0_c0":{"ACO":"1001"},"r0_c1":{"ACO":"1001"},"r1_c0":{"ACO":"100101"},"r1_c1":{"ACO":"100101"},
     *  "r2_c0":{"ACO":"1002"},"r2_c1":{"ACO":"1002"},"r3_c0":{"ACO":"100201"},"r3_c1":{"ACO":"100201"}}
     * 在调用cellVal时用到
     */
    cellKeyObjects(){
      function addAtomCode(codeArray,atoms){
        return _.reduce(codeArray,
                        (r,code,index) => {
                          if (!_.isNull(code)){
                            r[atoms[index]] = code;
                          }
                          return r;
                        },{});
      }

      let result = {};
      this.contentAtomRows.forEach((oAtomRow,rowIndex) => {
        this.genColVec.forEach((atomCol,colIndex) => {
          let atomRow = oAtomRow.map(item => {
            if (_.isNull(item)){
              return item;
            }else{
              return item.code;
            }
          });
          let amtCode = atomCol[atomCol.length - 1];
          result['r' + rowIndex + '_c' + colIndex] = _.assign(addAtomCode(atomRow,this.schm.rowAtomSeq),
                                                              addAtomCode(_.cloneDeep(atomCol).splice(0,atomCol.length - 1),
                                                                          this.schm.colAtomSeq));
        });
      });
      Object.keys(result).forEach(k => {
        if (result[k].hasOwnProperty('PERD')) {
          result[k]['PERD'] = String(result[k]['PERD']);
        }
      });
      return result;
    },

    genColHtml(){
      let atomList = this.schm.colAtomSeq;
      let colConfig = this.schm.colConfig;
      if (this.schm.listAmts.length === 0){
        return [];
      }
      let valueList1 = [];
      let valueList2 = [];
      if (atomList.length > 0){
        valueList1 = this.getAtomValueList(atomList[0], colConfig[atomList[0]].nameOnly);
      }
      if (atomList.length > 1){
        valueList2 = this.getAtomValueList(atomList[1], colConfig[atomList[1]].nameOnly);
      }
      function resetStack(stack,val){
        for (let i = stack.length - 1; i >= 0 ; i--){
          if (_.startsWith(val.code,stack[i].code)){
            break;
          }else{
            stack.pop();
          }
        }
        stack.push(val);
      }
      let resultList = [];
      let stack1 = [];
      let stack2 = [];
      if (valueList1.length > 0){
        _.forEach(valueList1,
                  val1 => {
                    resetStack(stack1,val1);
                    if (!this.options.noSumCol || val1.isLeaf && valueList2.length === 0){
                      _.forEach(this.orderedAmts,
                                amt => {
                                  resultList.push(stack1.concat([amt]));
                                });
                    }
                    if (valueList2.length > 0){
                      val1.isLeaf = false;
                      stack2.splice(0,stack2.length);
                      _.forEach(valueList2,
                                val2 => {
                                  resetStack(stack2,val2);
                                  if (!this.options.noSumCol || val2.isLeaf){
                                    _.forEach(this.orderedAmts,
                                              amt => {
                                                resultList.push(stack1.concat(stack2).concat([amt]));
                                              });
                                  }
                                });
                    }
                  });
      }else{
        _.forEach(this.orderedAmts,
                  amt => {
                    resultList.push([amt]);
                  });
      }
      // console.timeEnd('genColHtml');
      return resultList;
    },

    headerRowsCount(){
      let rows = 0;
      _.forEach(this.genColHtml,
                col => {
                  if (col.length > rows){
                    rows = col.length;
                  }
                });
      if (rows > 1 && this.schm.listAmts.length === 1){
        rows = rows - 1;
      }else if (rows === 0){
        rows = 1;
      }
      return rows;
    },

    madDataRows(){
      let tempRmd = this.rowMadData;
      if (this.options.rowMadDataFn){
        tempRmd = this.options.rowMadDataFn(this.rowMadData);
        tempRmd.pop();
      }
      if (!tempRmd) return [];
      let rowAtomKeys = this.schm.rowAtomSeq.reduce((r,item) => {
        r.push(this.atomMap[item].field.toLowerCase() + 'Code');
        r.push(this.atomMap[item].field.toLowerCase() + 'Name');
        return r;
      },[]);
      return tempRmd.reduce((r,item) => {
        let row = _.pick(item,rowAtomKeys);
        if (r.length === 0 || !_.isEqual(r[r.length - 1],row)){
          r.push(row);
        }
        return r;
      },[]);
    },
    /**
     * 计算行表头
     */
    contentAtomRows(){
      let rmd = this.madDataRows;
      //情况1:改变了要素条件，前端拼凑一些示例行即可
      if (!rmd || rmd.length === 0){
        if (this.options.noPreview){ return []; }
        let vLists = this.schm.rowAtomSeq.map(atomCode => {
          return this.getAtomValueList(atomCode, this.schm.rowConfig[atomCode].nameOnly, true);
        });
        let idx = 0;//计算从第几个要素开始，笛卡尔积已经大于示例行数了
        let limits = 49;//示例行数
        for (let s = 1,i = 0; i < vLists.length && s < limits; i++){
          s = s * vLists[i].length;
          idx = i;
        }
        //对于大于示例行数的要素开始，最多保留4个值
        let trimedLists = vLists.map((list,index) => {
          if (index <= idx || list.length <= 4){
            return list;
          }else{
            return list.slice(0,3);
          }
        });
        return this.rowVec(0,trimedLists,limits);
      }

      //情况2:使用后台返回数据(含名称)组成的行，不用前端拼
      let isContainName = false;
      if (this.schm.rowAtomSeq.length > 0 && rmd.length > 0){
        isContainName = _.keys(rmd[0]).includes(this.atomMap[this.schm.rowAtomSeq[0]].field.toLowerCase() + 'Name');
      }
      if (isContainName){
        return rmd.map(ro => {
          let row = [];
          this.schm.rowAtomSeq.forEach(atom => {
            let atomCode = this.atomMap(atom).field.toLowerCase() + 'Code';
            let atomName = this.atomMap(atom).field.toLowerCase() + 'Name';
            row.push({code:ro[atomCode],
                      name:this.schm.rowConfig[atom].nameOnly ? ro[atomName] : ro[atomCode] + ' ' + ro[atomName]});
          },this);
          return row;
        });
      }

      //情况3:还是前端拼
      let vLists = this.schm.rowAtomSeq.map(atomCode => {
        return this.getAtomValueList(atomCode, this.schm.rowConfig[atomCode].nameOnly, true);
      });
      let resultList = this.rowVec(0,vLists);
      return resultList.filter(row => {
        return this.isValidRow(row);
      },this);
    },

    /**
     * 计算行表头名称
     */
    contentAtomNames(){
      return _.map(this.contentAtomRows,
                   row => {
                     return _.map(row,
                                  col => {
                                    return _.isNull(col) ? '' : col.name;
                                  });
                   });
    },

    hotSettings(){
      let result = {renderAllRows:false,
                    readOnly:true,
                    rowHeaders: true,
                    colHeaders: true,
                    // rowHeights:30,
                    // colWidths:100,
                    // colWidths:[],
                    height: this.tableHeight,
                    manualRowResize: true,
                    manualColumnResize: true,
                    numericFormat:  {pattern: '0,0.00'},
                    fixedRowsTop:this.headerRowsCount + this.titleRowCount(),
                    fixedColumnsLeft:this.dataCdtn.rowAtomSeq.length,
                    mergeCells:this.getHeaderMergeCells(),
                    customBorders:this.getCustomBorders(),
                    data:this.getHandsonTableData()
                   };
      // for(let i = 0; i < this.schm.rowAtomSeq.length + this.genColHtml.length; i++){
        // result.colWidths.push(100);
      // }
      return result;
    },
    /**
     * 表格高度
     */
    tableHeight() {
      return this.innerHeight - 150;
    },
    orderedAmts(){
      if (this.schm.amtOrder === 'custom'){
        return this.schm.listAmts;
      }
      let r = [];
      _.forEach(this.amtDefaultOrder,
                amt => {
                  if (this.schm.listAmts.includes(amt)){
                    r.push(amt);
                  }
                });
      return r;
    },

    /**
     * 是否有查询模板
     */
    hasTemplates(){
      return !util.isEmpty(this.templates) &&
        (!util.isEmpty(this.templates.psn) ||
         !util.isEmpty(this.templates.unit) ||
         !util.isEmpty(this.templates.sys));
    },

    /**
     * 影响行列组合的要素及条件
     */
    scheme(){
      function action(that,atomCode,level,tree,position){
        let item = {};
        let atom = _.find(that.atoms, one => {
          return one.code === atomCode;
        });
        item.itemType = atom.field;
        item.itemLevel = level;
        item.isGradSum = tree ? '1' : '0';
        item.itemPos = position;
        if (that.isMonthCode(atomCode)){
          let r = [];
          for (let i = that.schm.fromPERD; i <= that.schm.toPERD; i++){
            r.push({code: i + ''});
          }
          item.items = r;
        }else{
          item.items = _.map(that.schm.atomValues[atomCode],
                             cdt => {
                               return {code:cdt.code,name:''};
                             });
        }
        return item;
      };
      let result = [];
      _.forEach(this.schm.rowAtomSeq,
                atomCode => {
                  result.push(action(this,atomCode,this.schm['rowConfig'][atomCode].level,this.schm['rowConfig'][atomCode].isSum,'row'));
                });
      _.forEach(this.schm.colAtomSeq,
                atomCode => {
                  result.push(action(this,atomCode,this.schm['colConfig'].level,this.schm['colConfig'][atomCode].isSum,'column'));
                });
      _.forEach(_.keys(this.schm.cdtnConfig),
                atomCode => {
                  if (this.schm.cdtnConfig[atomCode].selected){
                    result.push(action(this,atomCode,0,false,'condition'));
                  }
                });
      return result;
    }
  },
  methods: {

    hasTitle(){
      return false;
      // return !util.isEmpty(this.schm.schmName);
    },

    getTitle(){
      return this.schm.schmName;
    },

    titleRowCount(){
      return 0;
      // return this.hasTitle() ? 1 : 0;
    },

    setData(d){
      this.data = d;
    },

    getColor(){
      let pColor = this.colors.find(c => {
        return c[0] === this.schm.selectedColor;
      });
      if (pColor){
        return pColor;
      }
      return [this.schm.selectedColor,this.colors[18][1]];
    },

    getHandsonTableData(){
      return this.getTitleRowData().concat(this.getHeaderRowData()).concat(this.getBodyData());
    },

    getTitleRowData(){
      if (this.hasTitle()){
        let cols = this.dataCdtn.rowAtomSeq.length + this.genColVec.length;
        let row = [this.dataCdtn.schmName];
        for(let i = 1; i < cols; i++){
          row.push('');
        }
        return [row];
      }
      return [];
    },

    /**
     * 获取构建hansontable的表头数组
     */
    getHeaderRowData(){
      let result = [];
      for(let rowIndex = 0; rowIndex < this.headerRowsCount; rowIndex++){
        let ri = rowIndex + this.titleRowCount();
        let rowData = [];
        if (rowIndex === 0){
          _.forEach(this.dataCdtn.rowAtomSeq,
                    (atom,colIndex) => {
                      rowData.push(this.getAtomName(atom));
                    });
        }else{
          _.forEach(this.dataCdtn.rowAtomSeq,
                    (atom,colIndex) => {
                      rowData.push('');
                    });
        }
        _.forEach(this.headerRowCells(rowIndex),
                  (cell,index) => {
                    rowData.push(cell.name);
                  });
        result.push(rowData);
      }
      return result;
    },

    /**
     * 获取构建hansontable的表体数组
     */
    getBodyData(){
      return this.contentAtomNames.map(
        (row,rowIndex) => {
          let rowData = [];
          _.forEach(row, cell => { rowData.push(cell); });
          for(let i = 0; i < this.genColVec.length; i++ ){
            rowData.push(this.cellVal(rowIndex,i));
          }
          return rowData;
        });
    },
    /**
     * 获取构建hansontable的表头合并信息的数组
     */
    getHeaderMergeCells(){
      let result = [];
      let cols = this.dataCdtn.rowAtomSeq.length + this.genColVec.length;
      let atomColumnCount = this.dataCdtn.rowAtomSeq.length;
      if (this.hasTitle()){
        result.push({row:0,col:0,rowspan:1,colspan:cols});
      }
      for(let rowIndex = 0; rowIndex < this.headerRowsCount; rowIndex++){
        let ri = rowIndex + this.titleRowCount();
        if (rowIndex === 0){
          _.forEach(this.dataCdtn.rowAtomSeq,
                    (atom,colIndex)=> {
                      if (this.headerRowsCount > 1){
                        result.push({row:ri, col:colIndex, rowspan:this.headerRowsCount, colspan:1});
                      }
                    });
        }
        _.forEach(this.headerRowCells(rowIndex),
                  (cell,index)=> {
                    if (cell.rowspan > 1 || cell.colspan > 1){
                      let colIndex = atomColumnCount + index;
                      result.push({row:ri,col:colIndex,colspan:cell.colspan,rowspan:cell.rowspan});
                    }
                  });
      }
      return result;
    },

    getCustomBorders(){
      let atomColumnCount = this.dataCdtn.rowAtomSeq.length;
      let columnCount = atomColumnCount + this.genColVec.length;
      let pColor = this.getColor();
      let result = [];
      if (this.schm.style === 'line'){
        if (this.headerRowsCount === 1){
          result.push({
            range:{
              from:{row: this.titleRowCount(), col: 0},
              to:{row: this.titleRowCount(), col: columnCount - 1}},
            top:{width:2, color:pColor[0]},
            bottom:{width:2, color:pColor[0]}});
        }else{
          result.push(
            {range:{
              from:{row: this.headerRowsCount + this.titleRowCount() - 1, col: 0},
              to:{row: this.headerRowsCount + this.titleRowCount() - 1, col: columnCount - 1}},
             bottom:{width:2, color:pColor[0]}});
          result.push(
            {range:{
              from:{row: this.titleRowCount(), col: 0},
              to:{row: this.titleRowCount(), col: columnCount - 1}},
             top:{width:2, color:pColor[0]}});
        }
      }
      return result;
    },

    cellRender(){
      let that = this;
      return function(row,col,prop){
        let totalRowsCount = that.contentAtomRows.length + that.headerRowsCount + that.titleRowCount();
        let atomColumnCount = that.dataCdtn.rowAtomSeq.length;
        let columnCount = atomColumnCount + that.genColVec.length;
        let pColor = that.getColor();
        let headerRowRenderStripe = function(instance, td, row, col, prop, value, cellProperties) {
          if (col === atomColumnCount - 1){
            td.style.borderRight= 'solid #fff 2px';
          }else{
            td.style.borderRight= 'solid #fff 1px';
          }
          td.style.backgroundColor = pColor[0];
          td.style.color = '#fff';
          td.className = 'htMiddle htCenter';
        };
        let headerRowRenderLine = function(instance, td, row, col, prop, value, cellProperties) {
          if (col === atomColumnCount - 1){
            td.style.borderRight = 'solid 2px ' + pColor[0];
          }else if (col < columnCount - 1){
            td.style.borderRight = 'dotted 1px ' + pColor[0];
          }else if (col === columnCount -1){
            td.style.borderRight = 'none';
          }
          if (row < that.headerRowsCount + that.titleRowCount() - 1){
            td.style.borderBottom = 'dotted 1px ' + pColor[0];
          }
          td.style.fontWeight = 'bold';
          td.style.color = '#666';
          td.className = 'htMiddle htCenter';
        };
        let atomColumnRenderStripe = function(instance, td, row, col, prop, value, cellProperties){
          td.style.borderBottom = 'none';
          if (col === atomColumnCount - 1){
            td.style.borderRight = 'solid 2px ' + pColor[0];
          }else{
            td.style.borderRight = 'solid 1px #fff';
          }
          if ((row - (that.headerRowsCount + that.titleRowCount())) % 2 == 1){
            if (col < atomColumnCount - 1){
              td.style.borderRight = 'solid 1px ' + pColor[1];
            }
            td.style.backgroundColor = pColor[1];
          }
        };
        let atomColumnRenderLine = function(instance, td, row, col, prop, value, cellProperties){
          td.style.borderBottom = 'none';
          if (row < totalRowsCount){
            if (col === atomColumnCount - 1){
              td.style.borderRight = 'solid 2px ' + pColor[0];
            }else{
              td.style.borderRight = 'solid 1px #fff';
            }
            if (row < totalRowsCount - 1){
              td.style.borderBottom = 'dotted 1px ' + pColor[0];
            }else{
              td.style.borderBottom = 'solid 2px ' + pColor[0];
            }
          }else{
            td.style.borderRight = 'none';
            td.style.borderBottom = 'none';
          }
        };
        let amtCellRenderStripe = function(instance, td, row, col, prop, value, cellProperties){
          td.style.borderBottom = 'none';
          td.style.borderRight = 'solid 1px #fff';
          td.className = 'htMiddle htRight';
          if ((row - (that.headerRowsCount + that.titleRowCount())) % 2 == 1){
            td.style.borderRight = 'solid 1px ' + pColor[1];
            td.style.backgroundColor = pColor[1];
          }
        };
        let amtCellRenderLine = function(instance, td, row, col, prop, value, cellProperties){
          td.className = 'htMiddle htRight';
          td.style.borderRight = 'none';
          if (row < totalRowsCount - 1){
            td.style.borderBottom = 'dotted 1px ' + pColor[0];
          }else if (row === totalRowsCount - 1){
            td.style.borderBottom = 'solid 2px ' + pColor[0];
          }else{
            td.style.borderBottom = 'none';
          }
        };
        let renders = {
          headRender: that.schm.style === 'stripe' ? headerRowRenderStripe : headerRowRenderLine,
          atomRender: that.schm.style === 'stripe' ? atomColumnRenderStripe : atomColumnRenderLine,
          amtRender: that.schm.style === 'stripe' ? amtCellRenderStripe : amtCellRenderLine
        };
        let titleRender = function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          td.style.fontWeight = 'bold';
          td.style.fontSize = '2em';
          td.style.height = '70px';
          td.style.borderRight= 'none';
          td.className = 'htMiddle htCenter pl10';
        };

        let headerRowRender = function(instance, td, row, col, prop, value, cellProperties){
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          renders.headRender.apply(this,arguments);
        };
        let atomColumnRender = function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          td.innerHTML = value;
          renders.atomRender.apply(this, arguments);
        };
        let amtCellRender = function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.renderers.NumericRenderer.apply(this, arguments);
          if (filter.toFixedFloat(value,2) === 0.00){
            td.innerText = '';
          }
          renders.amtRender.apply(this,arguments);
        };
        let blankRender = function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          td.style.borderRight = 'none';
          td.style.borderBottom = 'none';
          td.className = 'htMiddle htRight';
        };

        if (col >= columnCount){
          this.renderer = blankRender;
        }else{
          if (row === 0 && that.hasTitle()){
            this.renderer = titleRender;
          }else if (row < that.headerRowsCount + that.titleRowCount()){
            this.renderer = headerRowRender;
          }else if (col < atomColumnCount){
            let atomCode = that.dataCdtn.rowAtomSeq[col];
            if (atomCode && that.options[atomCode.toLowerCase() + 'Render']){
              this.renderer = that.options[atomCode.toLowerCase()+'Render'](renders.atomRender,that.contentAtomRows,that.headerRowsCount);
            }else{
              this.renderer = atomColumnRender;
            }
          }else{
            let amtCode = that.getColAmtCode(col - atomColumnCount);
            if (amtCode && that.options[amtCode.toLowerCase() + 'Render']){
              this.renderer = that.options[amtCode.toLowerCase() + 'Render'](renders.amtRender);
            }else{
              this.renderer = amtCellRender;
            }
          }
        }
      };
    },

    renderReport(settings){
      if (this.status.dataWillChange || this.status.beforeFetchData){
        return;
      }
      if (!settings){ return; }
      this.$loading();
      if (this.hot){
        this.hot.destroy();
      }
      let minRows = 35,minColumns = 35;
      this.createEmptySpreadsheetData(settings.data,minRows,minColumns);
      // console.time('new Handsontable');
      this.hot = new Handsontable(document.getElementById(this.options.reportId),settings);
      // console.timeEnd('new Handsontable');
      this.$emit('hotChange', this.hot);
      //去掉license提示
      document.getElementById('hot-display-license-info').innerHTML = '';
      if (this.options.amtLink){
        let that = this;
        Handsontable.hooks.add('afterOnCellMouseDown',
                               (event,coords,td) => {
                                 let col = coords.col - that.schm.rowAtomSeq.length;
                                 let row = coords.row - that.headerRowsCount;
                                 if (row < that.contentAtomRows.length && col < that.genColVec.length){
                                   let cellKeysObject = that.cellKeyObjects['r' + row + '_c' + col];
                                   if (cellKeysObject){
                                     that.options.amtLink(cellKeysObject);
                                   }
                                 }
                               },
                               this.hot);
      }
      this.$loadingClose();
      this.status.dataChange = false;
    },

    isAmtSelected(code){
      return this.schm['listAmts'].includes(code);
    },

    amtIndex(code){
      return this.schm['listAmts'].indexOf(code) + 1;
    },

    atomIndex(atomCode,atoms){
      return this.schm[atoms].indexOf(atomCode) + 1;
    },

    getMonthCode(){
      return this.options.monthAtom ? this.options.monthAtom.code: undefined;
    },

    isMonthCode(atomCode){
      return this.getMonthCode() === atomCode;
    },
    /**
     * 行列选择要素checkbox change事件
     */
    rowConfigChange(atomCode){
      this.configChange(atomCode,'rowAtomSeq','colConfig','colAtomSeq');
    },

    colConfigChange(atomCode){
      let colAtomSeq = this.schm.colAtomSeq;
      let colConfig = this.schm.colConfig;
      if (atomCode !== this.getMonthCode()){
        if (colAtomSeq.length === 2){
          let code = this.isMonthCode(colAtomSeq[0]) ? colAtomSeq[1] : colAtomSeq[0];
          if (atomCode !== code){
            colConfig[code]['selected'] = false;
            if (this.isMonthCode(colAtomSeq[0])){
              colAtomSeq.splice(1,1);
            }else{
              colAtomSeq.splice(0,1);
            }
          }
        }else if (colAtomSeq.length === 1){
          let code = colAtomSeq[0];
          if (code !== atomCode && !this.isMonthCode(code)){
            colConfig[code]['selected'] = false;
            colAtomSeq.splice(0,1);
          }
        }
      }
      this.configChange(atomCode,'colAtomSeq','rowConfig','rowAtomSeq');
    },

    configChange(atomCode,currentSeq,otherConfig,otherSeq){
      if (this.schm[currentSeq].includes(atomCode)){
        let index = this.schm[currentSeq].indexOf(atomCode);
        this.schm[currentSeq].splice(index,1);
        this.schm.atomValues[atomCode] = [];
      }else{
        this.schm[currentSeq].push(atomCode);
        if (this.schm[otherConfig][atomCode]['selected']){
          this.schm[otherConfig][atomCode]['selected'] = false;
          let index = this.schm[otherSeq].indexOf(atomCode);
          this.schm[otherSeq].splice(index,1);
        }
      }
    },

    getMonthList(){
      let fromPERD = this.schm.fromPERD;
      let toPERD = this.schm.toPERD;
      if (this.schm.fromPERD === -1){
        fromPERD = 1;
        toPERD = new Date().getMonth() + 1;
      }
      let r = [];
      for (let i = fromPERD; i <= toPERD; i++){
        r.push({code:i,name:i + '月',level:1,isLeaf:1});
      }
      return r;
    },

    /**
     * 根据atomCode 读取atom信息
     */
    getAtom(atomCode){
      return this.atomMap[atomCode];
    },

    setAtomIsTree(isTree,configObject){
      configObject.tree = isTree;
    },

    /**
     * 要素选择框发出的事件处理，values为选中的值（不包括半选）
     */
    setSelectedAtoms(values,atomCode){
      this.schm.selectedValues[atomCode] = values;
    },

    /**
     * 设置行或列要素显示至哪一级
     */
    setAtomLevel(level,configObject){
      configObject.level = level;
    },

    /**
     * 获取指定要素的值集条件
     */
    getCondition(atomCode,isRowAtom){
      let r = [];
      if (this.isConditionAtom(atomCode) && !this.isMonthCode(atomCode)){
        if (this.options.emptyAsAll && isRowAtom &&
            (!this.schm.atomValues[atomCode] || this.schm.atomValues[atomCode].length === 0)){
          if (this.options.valueConsistsOf === 'LEAF_ONLY'){
            if (!this.atomMap[atomCode].list){
              r = [];
            }else{
              r = this.atomMap[atomCode].list.filter(e => {
                return e.isLeaf === 1;
              });
            }
          }else{
            r = this.atomMap[atomCode].list;
          }
        }else{
          r = this.schm.atomValues[atomCode];
        }
      }
      if (!r){
        return [];
      }
      return r.filter(e => {
        return !this.filterText || this.filterText === '' || e.code.includes(this.filterText) || e.name.includes(this.filterText);
      });
    },

    /**
     * 计算每个元素的值范围
     */
    getAtomValueList(atomCode,nameOnly,isRowAtom){
      if (this.isMonthCode(atomCode)){
        return this.getMonthList();
      }
      let leveLength = codeRule.levelFn(this.getAtom(atomCode).codeRule);
      let r = [];
      let space = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      let condition = this.getCondition(atomCode,isRowAtom);
      _.forEach(condition,
                atom => {
                  let lvl = leveLength(atom.code);
                  let atomName = nameOnly ? atom.name : atom.code + ' ' + atom.name;
                  if (isRowAtom){
                    atomName = space.substr(0,(lvl - 1) * 3 * 6) + atomName;
                  }
                  r.push({code:atom.code,name:atomName,isLeaf:atom.isLeaf});
                });
      return r;
    },

    /**
     * 将行转换为对象
     */
    getRowObject(row){
      let o = {};
      _.forEach(row,
                (item,index)=> {
                  if (!_.isNull(item)){
                    let atomCode = this.schm.rowAtomSeq[index];
                    o[this.atomMap[atomCode].field.toLowerCase() + 'Code'] = item.code;
                  }
                });
      return o;
    },
    /**
     * 判断指定行是否有效组合
     */
    isValidRow(o){
      if (!this.rowMadData || this.rowMadData.length === 0){
        return true;
      }
      let that = this;
      let xr = this.getRowObject(o);
      return _.some(this.rowMadData,
                    row => {
                      let rowValid = _.every(_.keys(xr),
                                             key => {
                                               return row[key] && _.startsWith(row[key],xr[key]);
                                             });
                      if (!rowValid){ return false; }
                      let colValid = true;
                      let colAtomSeq = this.schm.colAtomSeq;
                      if (colAtomSeq.length > 0){//如果有行列交叉，则判断这个行是否与列有交集
                        colValid = _.some(colAtomSeq,
                                          atomCode => {
                                            let v = row[that.atomMap[atomCode].field.toLowerCase() + 'Code'];
                                            return v && v !== '*';
                                          });
                      }
                      return colValid;
                    });
    },

    rowVec(index,vLists,limits = -1){
      let atomList = this.schm.rowAtomSeq;
      let atomCode = atomList[index];
      if (atomList.length === 0){
        return [];
      }
      let resultList = [];
      let len = 0;
      for(let i = 0; i < vLists[index].length && (len < limits || limits < 0); i++){
        let val = vLists[index][i];
        if (this.schm.rowConfig[atomCode].isSum ||
            index === atomList.length - 1 ||
            val.isLeaf !== 1){
          let row = [val];
          for (let i = 1; i < atomList.length - index; i++){
            row.push(null);
          }
          resultList.push(row);
          len += 1;
        }
        let that = this;
        if (index < atomList.length - 1){
          let nextValList = this.rowVec(index + 1,vLists);
          for (let j = 0; j < nextValList.length && (len < limits || limits < 0); j++){
            let row = [val].concat(nextValList[j]);
            resultList.push(row);
            len += 1;
          }
        }
      }
      return resultList;
    },
    /**
     * 判断要素是否是条件
     */
    isConditionAtom(atomCode){
      return this.schm.conditionAtoms && this.schm.conditionAtoms.includes(atomCode) ||
        this.schm.rowAtomSeq && this.schm.rowAtomSeq.includes(atomCode) ||
        this.schm.colAtomSeq && this.schm.colAtomSeq.includes(atomCode);
    },

    getAtomName(atomCode){
      return _.find(this.atoms,
                    atom => {
                      return atomCode === atom.code;
                    }).name;
    },
    getAmtName(amtCode){
      let amt = _.find(this.options.amts,
                       m => {
                         return m.code === amtCode;
                       });
      return amt.name;
    },
    /**
     * 计算表头行对象数组
     */
    headerRowCells(rowIndex){
      let r = [];
      if (rowIndex === 0 && this.schm.colAtomSeq.length === 0){
        _.forEach(this.orderedAmts,
                  amt => {
                    r.push({name:this.getAmtName(amt),colspan:1,rowspan:1});
                  });
        return r;
      }
      let hasMoreAmt = this.orderedAmts.length > 1;
      let headerCell = undefined;
      let currCode = '';
      let currName = '';
      let tRowSpan = 1;
      let isLastCell = false;
      let isSecondLastCell = false;
      _.forEach(this.genColHtml,
                col => {
                  isLastCell = col.length === rowIndex + 1;
                  isSecondLastCell = col.length === rowIndex + 2;
                  if (col.length <= rowIndex ||
                      rowIndex > 0 && isLastCell && col[rowIndex - 1].isLeaf && !hasMoreAmt){
                    r.push({code:'',name:'',colspan:0,rowspan:0});
                    return;
                  }
                  tRowSpan = isLastCell ? this.headerRowsCount - rowIndex : 1;
                  if (isSecondLastCell && col[rowIndex].isLeaf && !hasMoreAmt){
                    tRowSpan = this.headerRowsCount - rowIndex;
                  }
                  currCode= isLastCell ? col[rowIndex] : col[rowIndex].code;
                  currName = isLastCell ? this.getAmtName(currCode) : col[rowIndex].name;
                  if (isLastCell && !hasMoreAmt){
                    currName = '小计';
                  }
                  if (!headerCell){
                    headerCell = {code:currCode,name:currName,colspan:1,rowspan:tRowSpan};
                    r.push(headerCell);
                  }else if (headerCell.code !== currCode){
                    headerCell = {code:currCode,name:currName,colspan:1,rowspan:tRowSpan};
                    r.push(headerCell);
                  }else{
                    headerCell.colspan += 1;
                    r.push({code:'',name:'',colspan:0,rowspan:0});
                  }
                });
      return r;
    },

    getColAmtCode(colIndex){
      let atomCol = this.genColVec[colIndex];
      if (!atomCol){
        return undefined;
      }
      return atomCol[atomCol.length - 1];
    },

    /**
     * 把atomCode转换为field
     */
    toFieldKeysObject(cell){
      let r = {};
      _.forEach(_.keys(cell),
                key => {
                  r[this.atomMap[key].field.toLowerCase() + 'Code'] = cell[key];
                });
      return r;
    },
    /**
     * 取某单元格的金额
     */
    cellVal(rowIndex,colIndex){
      let cellKO = this.cellKeyObjects['r' + rowIndex + '_c' + colIndex];
      let cellKeysObject = this.toFieldKeysObject(cellKO);
      let cell = _.find(this.data,
                        cell => {
                          let valueKeysObject = {};
                          _.forEach(_.keys(cell),
                                    key => {
                                      if (_.endsWith(key,'Code')){
                                        valueKeysObject[key] = cell[key];
                                      }
                                    });
                          return _.isEqual(valueKeysObject,cellKeysObject);
                        });
      if (cell){
        return cell[this.getColAmtCode(colIndex)];
      }
      return 0.00;
    },

    /**
     * 返回表格空数据
     */
    createEmptySpreadsheetData(data,rows = 20,columns = 26){
      var _rows = [],
          i,
          j;

      for (i = 0; i < rows; i++) {
        var row = [];
        if (data.length > i){
          row = data[i];
        }else{
          data.push(row);
        }

        for (j = row.length - 1; j < columns; j++) {
          row.push('');
        }
      }
    },

    getTableData(noSave) {
      if (this.schm.listAmts.length === 0 || this.schm.rowAtomSeq.length === 0){
        return;
      }
      this.$loading();
      if (!noSave && !this.options.notReloadOnOpen){
        LOCAL_STORAGE.set('jcb' + this.options.rptType,this.schm);
      }
      let params = {
        'schmName':this.schm.schmName,
        'schmScope':this.schm.schmScope
      };
      params = _.assign(params,this.options.getParams(this.scheme));
      fetch.post(this.options.dataUrl, params)
        .then(({data}) => {
          // console.log('getTableData fetched data');
          this.status.beforeFetchData = false;
          this.status.dataChange = true;
          this.rowMadData = data.occMadData;
          this.data = data.tableData;
          this.$loadingClose();
        })
        .catch(({msg}) => {
          this.status.beforeFetchData = false;
          this.$loadingClose();
          this.$message.warning({
            message:msg
          });
        });
    },

    canSaveScheme(){
      return this.options.getSaveSchemeParams;
    },

    getSchemeId(scope){
      return new Promise((resolve,reject) => {
        let scopeMap = {'1':'psn','2':'unit','3':'sys'};
        if (this.templates && this.templates[scopeMap[scope]]){
          let originScheme = this.templates[scopeMap[scope]].find(
            item => {
              return item.schmName === this.schm.schmName;
            });
          if (originScheme){
            this.$confirm('已有同名称的查询方案，是否覆盖？', '提示', {
              confirmButtonText: '覆盖',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              resolve(originScheme.schmId);
              return;
            }).catch(() => {
              reject();
              return;
            });
          }else{
            resolve(util.generateUUID());
          }
        }else{
          resolve(util.generateUUID());
        }
      });
    },

    saveScheme(scope) {
      if (_.trim(this.schm.schmName) === ''){
        this.$message.error({message: '名称不能为空'});
        return;
      }
      if (this.schm.listAmts.length === 0){
        this.$message.error({message:'显示金额至少选择一个'});
        return;
      }
      if (this.schm.rowAtomSeq.length === 0 &&
          this.schm.colAtomSeq.length === 0){
        this.$message.error({message: '行分组元素和列分组元素至少要选择一个要素'});
        return;
      }
      this.getSchemeId(scope)
        .then(id => {
          this.schm.schmId = id;
          let params = this.options.getSaveSchemeParams({
            schmId:this.schm.schmId,
            schmScope:scope,
            schmName:this.schm.schmName,
            schmContent:this.schm
          });
          this.$loading();
          fetch.post('/gal/rptScheme/save', params)
            .then(({data}) => {
              setAgyInfo(params.agyCode).then(() => {
                this.$loadingClose();
                this.$message({
                  message: '保存方案成功！',
                  type: 'success'
                });
              });
            })
            .catch(({msg}) => {
              this.$message.error({message:msg});
            });
        })
        .catch(() => {});
    },

    handleSchemeClick(scheme) {
      this.$set(this,'schm',_.cloneDeep(scheme.schmContent));
      this.$refs.schemePopver.doClose();
    },

    removeTemplate(template){
      this.options.removeTemplate(template);
    },
    /**
     * 设置默认值
     */
    setDefault(){
      if (this.options.default){
        this.schm.schmName = this.options.default.schmName ? this.options.default.schmName : '';
      }else{
        this.options.default = {};
      }
    },

    restoreData(){
      // console.log('restoreData begin');
      let localSchm = LOCAL_STORAGE.get('jcb' + this.options.rptType);
      if (localSchm){
        this.$set(this.schm,'schmId',localSchm.schmId);
        this.$set(this.schm,'schmName',localSchm.schmName);
        this.$set(this.schm,'schmScope',localSchm.schmScope);
        this.$set(this.schm,'selectedColor',localSchm.selectedColor);
        this.$set(this.schm,'listAmts',localSchm.listAmts);
        this.$set(this.schm,'colAtomSeq',localSchm.colAtomSeq);
        this.$set(this.schm,'rowAtomSeq',localSchm.rowAtomSeq);
        this.$set(this.schm,'fromPERD',localSchm.fromPERD);
        this.$set(this.schm,'toPERD',localSchm.toPERD);
        this.$set(this.schm,'amtOrder',localSchm.amtOrder);
        this.schm.rowAtomSeq = localSchm.rowAtomSeq;
        this.schm.colAtomSeq = localSchm.colAtomSeq;
        _.forEach(this.atoms,
                  ({code})=> {
                    this.$set(this.schm.colConfig,code,{});
                    _.forEach(_.keys(localSchm.colConfig[code]),
                              nk => {
                                this.$set(this.schm.colConfig[code],nk,localSchm.colConfig[code][nk]);
                              });
                  });
        _.forEach(this.atoms,
                  ({code})=> {
                    this.$set(this.schm.rowConfig, code, {});
                    _.forEach(_.keys(localSchm.rowConfig[code]),
                              nk => {
                                this.$set(this.schm.rowConfig[code],nk,localSchm.rowConfig[code][nk]);
                              });
                  });

       _.forEach(this.options.atoms,
                 ({code})=> {
                    this.$set(this.schm.cdtnConfig,code,{});
                    this.$set(this.schm.cdtnConfig[code], 'selected', localSchm.cdtnConfig[code]['selected']);
                  });

        let selectedKeys = _.keys(localSchm.selectedValues);
        _.forEach(this.atoms,
                  ({code})=> {
                    this.$set(this.schm.atomValues,
                              code,
                              localSchm.cdtnConfig[code].selected || localSchm.colConfig[code].selected || localSchm.rowConfig[code].selected
                              ? localSchm.selectedValues[code]
                              : []);
                  });
        this.status.beforeFetchData = true;
        this.getTableData(true);
      }
    }

  },

  created() {
    this.schm.toPERD = this.GET_LOGIN_INFO.fiscalPeriod;
    this.setDefault();
    _.forEach(this.atoms,
              atom => {
                this.$set(this.schm.rowConfig,atom.code,{selected:false,tree:true,isSum:this.options.default.isSum,level:0,nameOnly:false});
                this.$set(this.schm.colConfig,atom.code,{selected:false,tree:true,isSum:this.options.default.isSum,level:0,nameOnly:true});
                this.$set(this.schm.cdtnConfig,atom.code,{selected:false});
                this.$set(this.schm.atomValues,atom.code,[]);
                if(atom.code === 'ACO'){
                  let acoObj = atom;
                  acoObj.list = atom.list.filter(e => {
                    return e.isEnabled === 1;
                  });
                  this.$set(this.atomMap, atom.code, acoObj);
                }else {
                  this.$set(this.atomMap, atom.code, atom);
                }
              });
    if (!this.options.notReloadOnOpen){
      this.restoreData();
    }
  },

  beforeDestroy(){
    if (this.hot){
      this.hot.destroy();
    }
  }
};
