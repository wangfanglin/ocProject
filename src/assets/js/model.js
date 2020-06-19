import vue from 'vue';

/**
 *多叉树
 * @class Tree
 */
class Tree {
  static defaultProps = {
    id: 'code',
    label: 'name',
    pid: 'pcode',
    children: 'children'
  };

  constructor(obj) {
    Object.keys(obj).forEach(e => {
      this[e] = obj[e];
    });
  }

  /**
   * 获取树型数据
   */
  static getTree(array, props = Tree.defaultProps) {
    array = _.cloneDeep(array);
    let result = [];
    let ids = array.map(e => {
      return e[props.id];
    });
    function build(node, array, props) {
      let { id, label, pid, children } = props;
      let tree = new Tree(node);
      tree[id] = node[id];
      tree[label] = node[label];
      tree[children] = node[children] || [];
      array.forEach(e => {
        if (e[pid] === tree[id]) {
          tree[children].push(build(e, array, props));
        }
      });
      return tree;
    }
    array.forEach(e => {
      if (!e[props.pid] || !ids.includes(e[props.pid])) {
        let node = build(e, array, props);
        result.push(node);
      }
    });
    return result;
  }

  /**
   * 获取平型数据
   */
  static getArray(tree, props, hasChildren = false) {
    tree = _.cloneDeep(tree);
    let temp = [];
    tree.forEach(e => {
      temp.push(e);
    });
    let result = [];
    while (temp.length > 0) {
      let first = temp.shift();
      result.push(first);
      if (first[props.children] && first[props.children].length > 0) {
        if (hasChildren) {
          temp = first[props.children].concat(temp);
        } else {
          let children = _.cloneDeep(first[props.children]);
          delete first[props.children];
          temp = children.concat(temp);
        }
      }
    }
    return result;
  }

  /**
   * 获取节点级次
   */
  static getNodeLever(tree, props = Tree.defaultProps) {
    let result = {};
    function getLever(tree, level) {
      tree.forEach(e => {
        result[e[props.id]] = level;
        if (e[props.children] && e[props.children].length > 0) {
          getLever(e[props.children], level + 1);
        }
      });
    }
    getLever(tree, 0);
    return result;
  }

  /**
   * 查找节点（广度）
   */
  static findNode(tree, id, props = Tree.defaultProps) {
    let temp = [];
    tree.forEach(e => {
      temp.push(e);
    });
    let result = null;
    while (temp.length > 0) {
      result = temp.shift();
      if (result[props.id] === id) {
        return result;
      }
      if (result[props.children] && result[props.children].length > 0) {
        temp = temp.concat(result[props.children]);
      }
    }
    return null;
  }

  /**
   * 查找节点集合（广度）
   */
  static findNodeList(tree, ids, props = Tree.defaultProps) {
    let temp = [];
    tree.forEach(e => {
      temp.push(e);
    });
    let result = [];
    while (temp.length > 0) {
      let first = temp.shift();
      if (ids.includes(first[props.id])) {
        result.push(first);
      }
      if (first[props.children] && first[props.children].length > 0) {
        temp = temp.concat(first[props.children]);
      }
    }
    return result;
  }

  /**
   * 根据名称查找节点集合（深度）
   */
  static findNodeListByName(tree, name, props = Tree.defaultProps) {
    let temp = [];
    tree.forEach(e => {
      temp.push(e);
    });
    let result = [];
    while (temp.length > 0) {
      let first = temp.shift();
      if (first[props.label].includes(name)) {
        result.push(first);
      }
      if (first[props.children] && first[props.children].length > 0) {
        temp = first[props.children].concat(temp);
      }
    }
    return result;
  }

  /**
   * 根据code模糊查找节点集合（深度）
   */
  static findNodeListByCode(tree, id, props = Tree.defaultProps) {
    let temp = [];
    tree.forEach(e => {
      temp.push(e);
    });
    let result = [];
    while (temp.length > 0) {
      let first = temp.shift();
      if (first[props.id].includes(id)) {
        result.push(first);
      }
      if (first[props.children] && first[props.children].length > 0) {
        temp = first[props.children].concat(temp);
      }
    }
    return result;
  }

  /**
   * 查找节点所有子节点
   */
  static findChildren(tree, id, props = Tree.defaultProps) {
    let result = [];
    let node = Tree.findNode(tree, id, props);
    function getChildren(array, props) {
      let result = [];
      array.forEach(e => {
        result.push(e);
        if (e[props.children] && e[props.children].length > 0) {
          result.push(...getChildren(e[props.children], props));
        }
      });
      return result;
    }
    if (node && node[props.children] && node[props.children].length > 0) {
      result = getChildren(node[props.children], props);
    }
    return result;
  }

  /**
   * 查询节点父节点
   */
  static findParent(tree, id, props = Tree.defaultProps) {
    let result = [];
    let node = Tree.findNode(tree, id, props);
    let array = Tree.getArray(tree, props);
    let ids = array.map(e => {
      return e[props.id];
    });
    function getParent(node, props) {
      let result = [];
      let parentNode = array.find(e => {
        return e[props.id] === node[props.pid];
      });
      if (parentNode) {
        result.push(parentNode);
        if (parentNode[props.pid] && ids.includes(parentNode[props.pid])) {
          result.push(...getParent(parentNode, props));
        }
      }
      return result;
    }
    if (node && (node[props.pid] && ids.includes(node[props.pid]))) {
      result = getParent(node, props);
    }
    return result;
  }

  /**
   * 查找节点级次
   */
  static findNodeLevel(tree, id, props = Tree.defaultProps) {
    let result = null;
    function getLever(tree, id, level) {
      for (let e of tree) {
        if (e[props.id] === id) {
          result = level;
          break;
        }
        if (e[props.children] && e[props.children].length > 0) {
          getLever(e[props.children], id, level + 1);
        }
      }
    }
    getLever(tree, id, 0);
    return result;
  }
}

/**
 * 栈
 * @class Stack
 */
class Stack {
  data;

  constructor() {
    this.data = [];
  }

  /**
   * 向栈内压入一个元素
   * @param {*} value
   * @memberof Stack
   */
  push(value) {
    this.data.push(value);
  }

  /**
   * 把栈顶元素弹出
   * @returns
   * @memberof Stack
   */
  pop() {
    return this.data.pop();
  }

  /**
   * 返回栈顶元素
   * @returns
   * @memberof Stack
   */
  peek() {
    return this.data[this.data.length - 1];
  }

  /**
   * 判断栈是否为空
   * @returns
   * @memberof Stack
   */
  isEmpty() {
    return !this.data.length;
  }

  /**
   * 栈元素个数
   * @returns
   * @memberof Stack
   */
  size() {
    return this.data.length;
  }

  /**
   * 清空栈
   * @memberof Stack
   */
  clear() {
    this.data = [];
  }
}

/**
 * 队列
 * @class Queue
 */
class Queue {
  data;

  constructor() {
    this.data = [];
  }

  /**
   * 向队列尾部添加一个(或多个)新的项
   * @param {*} value
   * @memberof Queue
   */
  enqueue(value) {
    this.data.push(value);
  }

  /**
   * 移除队列的第一(即排在队列最前面的)项，并返回被移除的元素
   * @returns
   * @memberof Queue
   */
  dequeue() {
    return this.data.shift();
  }

  /**
   * 返回队列第一个元素，队列不做任何变动
   * @returns
   * @memberof Queue
   */
  head() {
    return this.data[0];
  }

  /**
   * 返回队列最后一个元素，队列不做任何变动
   * @returns
   * @memberof Queue
   */
  tail() {
    return this.data[this.data.length - 1];
  }

  /**
   * 队列内无元素返回true，否则返回false
   * @returns
   * @memberof Queue
   */
  isEmpty() {
    return !this.data.length;
  }

  /**
   * 返回队列内元素个数
   * @returns
   * @memberof Queue
   */
  size() {
    return this.data.length;
  }

  /**
   * 清空队列
   * @memberof Queue
   */
  clear() {
    this.data = [];
  }
}

/**
 * 观察者模式 (消息发布订阅)
 * @class Observable
 */
class Observable {
  subscribers;

  constructor() {
    this.subscribers = {};
  }

  subscribe(topic, callback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(callback);
    return this;
  }

  unsubscribe(topic, callback) {
    if (!this.subscribers[topic]) {
      return;
    }
    this.subscribers[topic].forEach((e, i, arr) => {
      if (e === callback) {
        arr.splice(i, 1);
      }
    });
    return this;
  }

  publish(topic, ...args) {
    if (!this.subscribers[topic]) {
      return;
    }
    this.subscribers[topic].forEach(e => {
      e(...args);
    });
    return this;
  }
}

/**
 * 树表组件
 * @class DataTransfer
 */
class DataTransfer {
  static treeToArray(data, parent, level, expandedAll) {
    let tmp = [];
    Array.from(data).forEach(e => {
      if (e._expanded === undefined) {
        vue.set(e, '_expanded', expandedAll);
      }
      if (parent) {
        vue.set(e, '_parent', parent);
      }
      let _level = 0;
      if (level !== undefined && level !== null) {
        _level = level + 1;
      }
      vue.set(e, '_level', _level);
      tmp.push(e);
      if (e.children && e.children.length > 0) {
        let children = DataTransfer.treeToArray(
          e.children,
          e,
          _level,
          expandedAll
        );
        tmp = tmp.concat(children);
      }
    });
    return tmp;
  }
}

export { Tree, Stack, Queue, Observable, DataTransfer };
