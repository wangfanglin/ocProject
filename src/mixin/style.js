import util from '../assets/js/util';

/**
 * 显示区高度
 * @type {{data(): *, methods: {handleResizeWindow(): void}, mounted(): void, beforeDestroy(): void}}
 */
const innerHeight = {
  data() {
    return {
      innerHeight: 0
    };
  },
  methods: {
    handleResizeWindow() {
      this.innerHeight = window.innerHeight;
    }
  },
  mounted() {
    this.innerHeight = window.innerHeight;
    util.addEvent(window, 'resize', this.handleResizeWindow);

  },
  beforeDestroy() {
    util.removeEvent(window, 'resize', this.handleResizeWindow);
  }
};

/**
 * 显示区宽度
 * @type {{data(): *, methods: {handleResizeWindow(): void}, mounted(): void, beforeDestroy(): void}}
 */
const innerWidth = {
  data() {
    return {
      innerWidth: 0
    };
  },
  methods: {
    handleResizeWindowWidth() {
      this.innerWidth = window.innerWidth;
    }
  },
  mounted() {
    this.innerWidth = window.innerWidth;
    util.addEvent(window, 'resize', this.handleResizeWindowWidth);
  },
  beforeDestroy() {
    util.removeEvent(window, 'resize', this.handleResizeWindowWidth);
  }
};

/**
 * 表格表头单元格
 */
const TABLE_HEADER_CELL_STYLE = {
  color: '#303133',
  fontWeight: '500',
  backgroundColor: '#f5f7fa',
  height: '35px',
  padding: '0',
  borderBottomColor: '#ccc'
};

/**
 * 表格单元格
 */
const TABLE_CELL_STYLE = {
  padding: '5px 0',
};

export {
  innerHeight,
  innerWidth,
  TABLE_HEADER_CELL_STYLE,
  TABLE_CELL_STYLE
}
