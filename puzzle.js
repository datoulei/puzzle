(function($){
  $.fn.puzzle = function(options){
    var _ = {};
    _.$this = this;
    // 默认配置
    var defaultOptions = {
      row: 3,
      col: 3,
      onFinish: function(){
        alert('恭喜完成！耗时：' + (this.costTime * 0.001).toFixed(2) + '秒,共计' + this.stepCount + '步');
      },
      onStart: function() {},
      onStop: function() {},
      onReset: function() {}
    };

    _.chipArray = [];
    _.positionArray = [];
    _.selected;
    _.stepCount = 0;

    // 初始化拼图
    function init(options) {
      var imgSrc = options.src;
      // 判断是否为img
      if(!imgSrc){
        console.error('请确保设置了src');
        return;
      }
      // 创建容器
      var $container = this.addClass('container')
      .css({
        width: options.width + 6,
        height: options.height + 6
      });
      var index = 0,
          chipWidth = options.width / options.row,
          chipHeight = options.height / options.col
      for (var rowIndex = 0; rowIndex < options.row; rowIndex++) {
        for (var colIndex = 0; colIndex < options.col; colIndex++) {
          // 计算位置
          _.positionArray.push({
            left: chipWidth * colIndex,
            top: chipHeight * rowIndex
          });
          // 创建碎片
          var $chip = $('<div/>')
          .addClass('chip')
          .attr({
            id: 'chip_' + index,
            order: index,
            row: rowIndex,
            col: colIndex
          })
          .css({
            'background-image': 'url("' + imgSrc + '")',
            'background-position': (-1 * chipWidth * colIndex) + 'px ' + (-1 * chipHeight * rowIndex) + 'px',
            'background-size': (options.width + 6) + 'px ' + (options.height + 6) + 'px',
            width: chipWidth,
            height: chipHeight
          })
          .css(_.positionArray[index]);
          $container.append($chip);
          _.chipArray.push(index);
          index += 1;
        }
      }
      // $container.appendTo('body');
    }
    // 重置游戏(暂时只支持重置图片)
    _.reset = function(options) {
      var imgSrc = (options && options.src) || this.extendOption.src;
      for (var i = 0, len = this.chipArray.length; i < len; i++){
        var $chip = $('#chip_' + i);
        $chip.css(this.positionArray[i]);
        $chip.css({
          'background-image': 'url("' + imgSrc + '")'
        });
        $chip.attr('order', i);
      }
      _.extendOption.onReset.call(_);
    }
    // 开始游戏
    _.startGame = function() {
      // 数组乱序算法
      if (!Array.prototype.shuffle) {
        Array.prototype.shuffle = function() {
            for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
            return this;
        };
      }
      this.chipArray.shuffle();
      for (var i = 0, len = this.chipArray.length; i < len; i++){
        var $chip = $('#chip_' + this.chipArray[i]);
        $chip.on('click', selectChip)
        $chip.css(this.positionArray[i]);
        $chip.attr('order', i);
      }
      this._startTime = Date.now();
      _.stepCount = 0;
      _.extendOption.onStart.call(_);
    }
    // 结束游戏
    _.stopGame = function () {
      for (var i = 0, len = _.chipArray.length; i < len; i++){
        var $chip = $('#chip_' + i);
        $chip.off('click', selectChip);
      }
      _.extendOption.onStop.call(_);
    }
    // 选中拼图碎片
    function selectChip() {
      if(!_.selected){
        // 第一次选中
        var $chip = $(this);
        $chip.addClass('selected');
        _.selected = $chip.attr('id');
      }else {
        // 交换位置
        var $chip = $(this);
        var $prevChip = $('#' + _.selected);
        $prevChip.removeClass('selected');
        changePosition($chip, $prevChip);
      }
    }
    // 交换位置
    function changePosition($currentChip, $prevChip) {
      var currentChipOrder = $currentChip.attr('order');
      var prevChipOrder = $prevChip.attr('order');

      $currentChip.css(_.positionArray[prevChipOrder]).attr('order', prevChipOrder);
      $prevChip.css(_.positionArray[currentChipOrder]).attr('order', currentChipOrder);
      _.selected = null;
      _.stepCount += 1;
      checkFinish();
    }
    // 检查游戏是否完成
    function checkFinish() {
      for (var i = 0, len = _.chipArray.length; i < len; i++){
        var $chip = $('#chip_' + i);
        if ($chip.attr('order') != i){
          return;
        }
      }
      for (var i = 0, len = _.chipArray.length; i < len; i++){
        var $chip = $('#chip_' + i);
        $chip.off('click', selectChip);
      }
      _.costTime = Date.now() - _._startTime;
      _.extendOption.onFinish.call(_);
    }
    _.extendOption = $.extend(defaultOptions, {
      width: this.width(),
      height: this.height()
    }, options);
    init.call(_.$this, _.extendOption);
    return _;
  };
})(jQuery);
