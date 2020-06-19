export default {

  isOperator(value) {
    var operatorString = '+-*/()';
    return operatorString.indexOf(value) > -1;
  },

  getPrioraty(value) {
    switch (value) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    default:
      return 0;
    }
  },

  //判断加减乘除的优先级
  prioraty(o1, o2) {
    return this.getPrioraty(o1) <= this.getPrioraty(o2);
  },

  dal2Rpn(exp) {
    //输入栈
    var inputStack = [];
    //输出栈
    var outputStack = [];
    //输出队列
    var outputQueue = [];
    //临时数字栈
    var numQueue = [];

    for (var i = 0, len = exp.length; i < len; i++) {
      var cur = exp[i];
      if (this.isNumChar(cur)){
        numQueue.push(cur);
      }else{
        if (numQueue.length > 0){
          inputStack.push(numQueue.join(''));
          numQueue.splice(0,numQueue.length);
        }
        if (cur != ' ') {
          inputStack.push(cur); //+-*/() 数字，逐个添加到末尾
        }
      }
    }
    if (numQueue.length > 0){
      inputStack.push(numQueue.join(''));
    }

    //处理字符和数字
    while (inputStack.length > 0) {

      //shift 顶部取得一项后移除，unshift 顶部推入
      cur = inputStack.shift();

      //如果是符号 -->  + - * / ( )
      if (this.isOperator(cur)) {
        if (cur == '(') {
          //push 从尾部推入一项
          outputStack.push(cur);
        } else if (cur == ')') {
          //pop 从尾部取得一项，之后移出
          var po = outputStack.pop();
          while (po != '(' && outputStack.length > 0) {
            outputQueue.push(po);
            po = outputStack.pop();
          }
          if (po != '(') {
            throw '错误：没有匹配';
          }
        } else { //符号时，处理 + - * /
          while (this.prioraty(cur, outputStack[outputStack.length - 1])
                 && outputStack.length > 0) {
            outputQueue.push(outputStack.pop());
          }
          outputStack.push(cur);
        }
      } else { //是数字的时候，推入数字
        outputQueue.push(new Number(cur));
      }
    }

    if (outputStack.length > 0) {
      if (outputStack[outputStack.length - 1] == ')'
          || outputStack[outputStack.length - 1] == '(') {
        throw '错误：没有匹配';
      }
      while (outputStack.length > 0) {
        outputQueue.push(outputStack.pop());
      }
    }
    return this.evalRpn(outputQueue);
  },

  /**
   * 定义 evalRpn() 函数，输出堆栈的长度不小于2的时候，进行计算
   */
  evalRpn(queue) {
    var outputStack = [];
    while (queue.length > 0) {
      var cur = queue.shift();

      if (!this.isOperator(cur)) {
        outputStack.push(cur);
      } else {
        //如果输出堆栈长度小于 2
        if (outputStack.length < 2) {
          throw '无效堆栈长度';
        }
        var second = outputStack.pop();
        var first = outputStack.pop();

        outputStack.push(this.getResult(first, second, cur));
      }
    }

    if (outputStack.length != 1) {
      throw '不正确的运算';
    } else {
      return outputStack[0];
    }
  },

  /**
   * 进行加减乘除计算之后，对其值进行操作，当浮点数的小数位超过两位时，只保留两位小数点
   */
  getResult(first, second, operator){
    var result = 0;
    switch (operator) {
    case '+':
      result = first + second;
      break;
    case '-':
      result = first - second;
      break;
    case '*':
      result = first * second;
      break;
    case '/':
      result = first / second;
      break;
    default:
      return 0;
    }
    return result;
  },

  //是否数字字符
  isNumChar(c){
    return c === '.' ||
      c === '0' ||
      c === '1' ||
      c === '2' ||
      c === '3' ||
      c === '4' ||
      c === '5' ||
      c === '6' ||
      c === '7' ||
      c === '8' ||
      c === '9';
  },

  /**
   * 按键是否是数字键
   * @param keyCode
   * @return Boolen
   */
  isNumKey(event){
    if (event.shiftKey){ return false; }
    if (event.code.startsWith('Digit')){
      return true;
    }
    let num = Number(event.keyCode || event.which);
    return num >= 48 && num <= 57 || num >= 96 && num <= 105;
  },
  /**
   * 按键是否是小数点键
   * @param keyCode
   * @return Boolen
   */
  isPointKey(num){
    return num === 110 || num === 190;
  },
  /**
   * 按键是否是加减乘除
   * @param keyCode
   * @return Boolen
   */
  isJjccKey(event){
    let num = Number(event.keyCode || event.which);
    return num === 106 || num === 107 || num === 109 || num === 111 || num === 187 && event.shiftKey
      || num === 189 || num === 191 || num === 56;
  },
  /**
   * 按键是否是括号
   */
  isKh(event){
    if (!event.shiftKey){ return false; }
    let num = Number(event.keyCode || event.which);
    return num === 57 || num === 48;
  },
  /**
   * 左箭头、右箭头、Home、End、Delete、Backspace键
   * @param keyCode
   * @return Boolen
   */
  isDirectionKey(event){
    let num = Number(event.keyCode || event.which);
    return num === 8 || num === 35 || num === 36 || num === 18 || num === 37 || num === 39 || num ===46;
  },
  /**
   * 是否空格键
   * @param 键盘事件
   * @return Boolean
   */
  isSpaceKey(event){
    return event.code === 'Space';
  },
  /**
   * 是否等号键
   * @param event 键盘事件
   * @return Boolean
   */
  isEqualKey(event){
    let num = Number(event.keyCode || event.which);
    return (num === 187 && !event.shiftKey) || (event.code === 'Equal' && !event.shiftKey);
  },
  /**
   * 是否回车键
   * @param event 键盘事件
   * @return Boolean
   */
  isEnterOrTabKey(event){
    return event.key === 'Enter' || event.key === 'Tab';
  },
  /**
   * 是否数学运算相关的键:数字、小数点、加减乘除
   * @param event
   * @return boolean
   */
  isMathKey(event){
    let num = Number(event.keyCode || event.which);
    return this.isNumKey(event) || this.isPointKey(num) || this.isJjccKey(event) || this.isDirectionKey(event) || this.isKh(event);
  },
  /**
   * 上、下、左、右箭头
   */
  isArrowKey(event){
    let num = Number(event.keyCode || event.which);
    return num === 38 || num === 40 || num === 37 || num === 39;
  },
  isCopyKey(event) {
    return event.ctrlKey && event.key === 'c';
  },
  isPasteKey(event) {
    return event.ctrlKey && event.key === 'v';
  }
};
