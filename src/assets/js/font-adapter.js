export default {

  /**
   * 给定内容和字体，计算需要占用的宽度
   */
  contentWidth(content,fontSize){
    let cal = $('#word-cal');
    if (cal.length === 0){
      $(document.documentElement).append('<span id="word-cal"></span>');
    }
    cal = $('#word-cal');
    cal.css('fontSize',fontSize);
    cal.text(content);
    return cal.width();
  },

  /**
   * 计算容器的宽度
   */
  containerWidth(containerQueryStr){
    return $(containerQueryStr).width();
  },

  /**
   * 判断给定内容放在容器里是否会溢出
   */
  isOverflow(containerQueryStr,content){
    return this.contentWidth(content,$(containerQueryStr).css('fontSize')) > this.containerWidth(containerQueryStr);
  },
  /**
   * 根据显示的科目名称长度，计算合适的字体大小，以不要溢出
   * $nextTick的原因是有点元素是v-if刚刚创建的，还在虚拟dom里，jquery取不到，放到$nextTick就保证jquery能取到
   */
  autoSize(txt,containerQueryStr,maxFontSize = '1em'){
    let cal = $('#word-cal');
    if (cal.length === 0){
      $(document.documentElement).append('<span id="word-cal"></span>');
    }
    cal = $('#word-cal');
    cal.css('fontSize',maxFontSize);
    let fontSizeS = cal.css('fontSize');
    let fontSize = parseInt(fontSizeS.substring(0,fontSizeS.indexOf('p')));
    cal.text(txt);
    let containerWidth = this.containerWidth();
    while (cal.width() >= containerWidth && fontSize > 1){
      fontSize = fontSize -1;
      cal.css('fontSize',fontSize + 'px');
    }
    if (fontSize === 1){
      let containerHeight = $(containerQueryStr).innerHeight();
      if (cal.height() * 2 <= containerHeight){
        return {'fontSize': fontSize + 'px',
                'lineHeight': cal.height() + 'px'};
      }
    }
    return {'fontSize': fontSize + 'px'};
  },

  autoSizeWithWidth(txt,containerWidth,maxFontSize = '1em'){
    let cal = $('#word-cal');
    if (cal.length === 0){
      $(document.documentElement).append('<span id="word-cal"></span>');
    }
    cal = $('#word-cal');
    cal.css('fontSize',maxFontSize);
    let fontSizeS = cal.css('fontSize');
    let fontSize = parseInt(fontSizeS.substring(0,fontSizeS.indexOf('p')));
    cal.text(txt);
    while (cal.width() >= containerWidth && fontSize > 1){
      fontSize = fontSize -1;
      cal.css('fontSize',fontSize + 'px');
    }
    return {'fontSize': fontSize + 'px'};
  }
};
