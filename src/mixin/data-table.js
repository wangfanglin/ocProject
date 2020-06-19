import util from '../assets/js/util';
import { LOCAL_STORAGE } from '../store/service/storage-service';

/**
 * 分页混合
 * @type {{data(): *, methods: {handleSizeChange(*): void, handleCurrentPageChange(): void}, mounted(): void}}
 */
const pagination = {
  data() {
    return {
      page: {
        currentPage: 1, //当前页
        pageSize: 200, //每页条数
        total: 0, //数据总条数,
        sizes: [50, 100, 200, 500, 1000] //可选条目数
      },
      pageData: []
    };
  },
  created(){
    this.page.pageSize = this.getPageSize();
  },
  methods: {
    getPageSize(){
      let pageSize = LOCAL_STORAGE.get(this.$route.name + 'pageSize');
      if (util.isEmpty(pageSize)){
        return 200;
      }
      return pageSize;
    },
    handleSizeChange(val) {
      LOCAL_STORAGE.set(this.$route.name + 'pageSize', val);
      this.page.pageSize = val;
      this.page.currentPage = 1;
      this.getTableData();
    },
    handleCurrentPageChange(val) {
      this.page.currentPage = val;
      this.getTableData();
    }
  },
  computed: {
    tableData() {
      return util.isNotEmpty(this.pageData) ? this.pageData : [];
    }
  }
};

/**
 * 表格大数据量加载混合必须参数
 */
const loadmoreMethod = {
  data() {
    return {
      el:null,//存储当前的指令元素
      scrollTop:'',//当前滚动条的位置
      currentStartIndex: 0,//起始索引
      currentEndIndex: 20,//结束索引
    };
  },
  methods: {
    handelLoadmore (currentStartIndex, currentEndIndex) {
      this.currentStartIndex = currentStartIndex;
      this.currentEndIndex = currentEndIndex;
    },
  },
  computed: {
    // 格式化数据源
    filteredData () {
      //dataSource:当前表格的数据源，大家尽量保持一致
      return this.dataSource.filter((item, index) => {
        if (index < this.currentStartIndex) {
          return false;
        } else if (index > this.currentEndIndex) {
          return false;
        } else {
          return true;
        }
      });
    }
  },
  activated(){
    if(this.el){
      const selectWrap = this.el.querySelector('.el-table__body-wrapper');
      setTimeout(() => {
        selectWrap.scrollTop = this.scrollTop;
      },500);
    }
  },
};

export {
  pagination,
  loadmoreMethod
};
