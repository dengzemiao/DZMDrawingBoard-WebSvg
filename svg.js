// 作者：dengzemiao 2021-11-23

// 命名空间
var NS_SVG = 'http://www.w3.org/2000/svg'
var NS_XLINK = 'http://www.w3.org/1999/xlink'
// 浏览器类型
var BrowserType = getBrowserType()
// Safari 浏览器
var isSafari = BrowserType === 'Safari'
// Firefox 浏览器
var isFirefox = BrowserType === 'Firefox'
// (stroke 笔画对象详细看 function drawStrokeCreate ())

// 画板对象
var svg_db = {
  
  // ====================== 属性
  
  // 画板配置（详细属性搜索 'initOption ()'）
  option: {},
  // 选中笔画准备进行修改(function (stroke, strokeEl) {})
  selectStroke: null,
  // 鼠标按下回调(function (e) {})
  mousedown: null,
  // 鼠标抬起回调(function (e) {})
  mouseup: null,
  // 鼠标移动回调(function (e) {})
  mousemove: null,
  // 承载画板的父元素
  dbEl: null,
  // 画板包装元素
  svgWrapperEl: null,
  // 画板
  svgEl: null,
  // 当前笔画元素
  strokeEl: null,
  // 笔画元素列表
  strokeEls: [],
  // 当前笔画对象
  stroke: null,
  // 笔画对象列表
  strokes: [],
  // 撤销笔画对象列表
  revokeStrokes: [],
  // 恢复笔画对象列表
  recoveryStrokes: [],
  // 文本输入框
  inputEl: null,
  // 文本输入框对象
  inputStroke: null,
  // 当前 hover 在哪个笔画元素上面
  hoverStrokeEl: null,
  // 当前 hover 在哪个笔画元素的操作元素上面
  hoverEditEl: null,
  // 当前 hover 在输入框上面
  hoverInputEl: null,
  // 鼠标监听是否注册
  isMouseRegister: false,
  // 是否正常新建图形过程中
  isNewStroke: false,
  // 位置坐标计算保留几位小数点
  toFixedNumber: 1,
  // 鼠标按下方法(方便移除)
  mouseDownEvent: null,
  // 鼠标抬起方法(方便移除)
  mouseUpEvent: null,
  // 鼠标移动方法(方便移除)
  mouseMoveEvent: null,
  // 鼠标按下移动的最后一次坐标
  mouseLastOffset: null,
  // 窗口尺寸变化方法(方便移除)
  onResizeEvent: null,
  // 按键监听
  onKeydown: null,
  // 编辑鼠标显示状态
  editMouseCursor: null,
  // 编辑笔画对象
  editStroke: null,
  // 编辑笔画对象索引
  editStrokeIndex: null,
  // 笔画对象是否存在修改
  editStatus: false,
  // 编辑对象列表
  editEls: {
    // 注意：1-8 的操作圆圈使用，用不到的为空。
    // 8个操作圆圈顺序为：1.minx/miny、2.maxx/miny、3.minx/maxy、4.maxx/maxy
    //                 5.minx、6.miny、7.maxx、8.maxy
    // 4个操作圆圈顺序为：1.minx/miny、2.maxx/miny、3.minx/maxy、4.maxx/maxy
    // 2个操作圆圈顺序为：1.minx/miny、4.maxx/maxy
    circle1: null,
    circle2: null,
    circle3: null,
    circle4: null,
    circle5: null,
    circle6: null,
    circle7: null,
    circle8: null,
    rect: null
  },

  // ====================== 注册/销毁

  // 初始化配置
  initOption () {
    // 初始对象
    var option = this.copy(this.option)
    // 配置对象,配置对象支持为每个笔画类型进行单独配置,只需要在切换时修改即可
    this.option = {
      // 当前画笔类型
      // ['rect(矩形)', 'line(直线)', 'circle(圆形)' 'ellipse(椭圆)', 'text(文本)', 'brush(画笔)',  'arrow(箭头)']
      strokeType: option.strokeType,
      // 画笔颜色
      strokeColor: option.strokeColor || '#F13E48',
      // 画笔宽度
      strokeWidth: option.strokeWidth || 1,
      // 文本字号
      fontSize: option.fontSize || 14,
      // 字体名称
      fontFamily: option.fontFamily || 'monospace',
      // 文本粗细
      fontWeight: option.fontWeight || 400,
      // 渲染文字行间距（行高 + lineSpace）
      fontLineSpace: option.lineSpace || 5,
      // 最大高度（画板的最大高度尺寸）
      // 有画板的最大高度尺寸 'text(文本)' 才会支持缩放，否则不会进行缩放，比例按 1 处理，其他笔画类型不受影响。
      maxHeight: option.maxHeight || 0,
      // 画板是否可以编辑（整个画板）
      isEdit: option.isEdit || true,
      // 已经绘制好的笔画是否可以编辑（只针对绘制好的笔画，不影响新增笔画）
      isEditStroke: option.isEditStroke || true,
      // 是否填充颜色（箭头类型）
      isFill: option.isFill || true,
      // 显示编辑矩形框（目前支持：'text(文本)' 其他画笔类型不需要支持）
      isShowEditRect: option.isShowEditRect || true,
      // 是否支持窗口缩放 重新调整元素坐标
      isResize: option.isResize || true,
      // 是否键盘删除（删除键）
      isDelete: option.isDelete || true,
      // 是否允许鼠标在编辑或绘制过程中离开画板区域，离开则算停止本次手势，默认不允许
      isAllowLeaveEditArea: option.isAllowLeaveEditArea || false,
      // 文本框贴贴文本内容排版优化（false：原格式，true：优化格式，去除多余的空格）
      isPasteTypesetting: option.isPasteTypesetting || true,
      // 有输入框时，是否在失去焦点的时候进行移除，默认(false)是再次点击画板才会移除
      isInputBlurRemove: option.isInputBlurRemove || false,
      // 输入框边框提示文字
      inputPlaceholder: (typeof option.inputPlaceholder === 'string') ? option.inputPlaceholder : '请输入文字',
      // 输入框在输入过程中文字后面预留宽度，以防输入时字符超过出现换行
      inputOffsetW: option.inputOffsetW || 4,
      // 输入框边框大小（'text(文本)'进入编辑状态后，操作矩形边框宽度）
      inputBoderWidth: option.inputBoderWidth || 1,
      // 输入框边框上线左右离文字的间距（'text(文本)'进入编辑状态后，操作矩形边框内间距）
      inputPadding: option.inputPadding || 5,
      // 输入框边框圆角
      inputBorderRadius: option.inputBorderRadius || 0,
      // 输入框边框样式
      inputBorderStyle: option.inputBorderStyle || 'solid',
      // 进入编辑状态后，操作圆圈边框宽度
      editBoderWidth: option.inputBoderWidth || 1,
      // 进入编辑状态后，操作圆圈的半径
      editRadius: option.editRadius || 4,
      // 进入编辑状态后，操作圆圈的内部圆心填充颜色
      editFillColor: option.editFillColor || '#fff',
      // 创建时鼠标移动多少距离才算正式画笔画，以免点击之后误操作
      effectiveOffset: option.effectiveOffset ||  { x: 2, y: 2 },
      // 新建元素鼠标样式(画板默认鼠标样式)
      editNewCursor: 'crosshair',
      // 移动元素鼠标样式
      editMoveCursor: 'grab'
    }
  },
  // 注册画板
  register (el, w, h) {
    // 失败
    if (!el) { return }
    // 重复
    if (this.dbEl) { return }
    // 记录
    this.dbEl = el
    // 初始化配置
    this.initOption()
    // 创建
    this.svgWrapperEl = document.createElement('div')
    this.svgEl = document.createElementNS(NS_SVG, 'svg')
    // 配置 svg 属性
    this.svgEl.setAttribute('width', '100%')
    this.svgEl.setAttribute('height', '100%')
    this.svgEl.style.userSelect = 'none'
    this.svgEl.style.webkitUserSelect = 'none'
    this.svgEl.style.cursor = this.option.editNewCursor
    // 配置 wrapper 属性
    this.svgWrapperEl.className = 'svg-wrapper'
    this.svgWrapperEl.style.position = 'relative'
    // 宽度
    var wString = `${w}`
    // 是数字
    if (!!Number(wString)) {
      this.svgWrapperEl.style.width = `${wString}px`
    } else if (wString.includes('px') || wString.includes('%')) {
      this.svgWrapperEl.style.width = wString
    } else {
      this.svgWrapperEl.style.width = '100%'
    }
    // 高度
    var hString = `${h}`
    // 是数字
    if (!!Number(hString)) {
      this.svgWrapperEl.style.height = `${hString}px`
    } else if (hString.includes('px') || hString.includes('%')) {
      this.svgWrapperEl.style.height = hString
    } else {
      this.svgWrapperEl.style.height = '100%'
    }
    // 添加
    this.svgWrapperEl.appendChild(this.svgEl)
    this.dbEl.appendChild(this.svgWrapperEl)
    // 注册鼠标监听
    this.mouseRegister()
    // 初始化缩放
    this.onScale()
    // 窗口变化监听
    this.onResizeEvent = () => {
      // 支持监听
      if (this.option.isResize) { this.onScale() }
    }
    window.addEventListener('resize', this.onResizeEvent)
    // 按键监听
    this.onKeydown= (event) => {
      // 支持监听
      if (this.option.isDelete) {
        // 检查是否按下了 Backspace 键
        if (event.key === 'Backspace') {
          this.revoke(this.editStrokeIndex)
        }
      }
    }
    document.addEventListener('keydown', this.onKeydown);
    // 离开画板区域
    this.svgWrapperEl.onmouseout = (e) => {
      // 是否允许检查鼠标离开画板区域
      if (!this.option.isAllowLeaveEditArea) {
        // 鼠标已经移出该元素，也不再子元素范围内
        if (!this.svgWrapperEl.contains(e.toElement)) {
          // 手动抬起鼠标
          this.handleMouseUpEvent()
        }
      }
    }
  },
  // 销毁画板
  destroy () {
    // 存在父视图
    if (this.dbEl) {
      // 移除窗口变化监听
      window.removeEventListener('resize', this.onResizeEvent)
      this.onResizeEvent = null
      // 移除按键监听
      document.removeEventListener('keydown', this.onKeydown)
      this.onKeydown = null
      // 清理辅助组件
      this.clearComponents()
      // 清空画笔
      this.clear()
      // 取消鼠标注册
      this.mouseDownDestroy()
      // 移除画板
      this.dbEl.removeChild(this.svgWrapperEl)
      // 清空配置
      this.option = {}
      // 清空对象
      this.dbEl = null
      this.svgEl = null
      this.svgWrapperEl = null
    }
  },

  // ====================== 操作功能列表

  // 清空画板
  clear () {
    // 是否禁止编辑
    if (!this.option.isEdit) { return }
    // 有画板
    if (this.svgEl) {
      // 移除输入框
      this.inputRemove()
      // 编辑图形移除
      this.drawEditClear()
      // 清空画板
      this.svgEl.innerHTML = ''
      // 清空画笔数据
      this.strokeEls = []
      this.strokes = []
      // 清空笔画数据
      this.mouseUpEventClear(true)
    }
  },
  // 设置画笔类型
  setStrokeType (type) {
    // 设置类型
    this.option.strokeType = type
    // 有画板
    if (this.svgEl) {
      // 清理辅助组件
      this.clearComponents()
    }
  },
  // 设置画板数据
  setStrokes (strokes) {
    // 有画板
    if (this.svgEl) {
      // 清空画板
      this.clear()
      // 便利笔画对象
      (strokes || []).forEach(stroke => {
        // 添加画板笔画
        this.drawCreate(stroke)
      })
      // 清空笔画对象
      this.mouseUpEventClear()
    }
  },
  // 修改了笔画属性进行刷新显示（stroke：必填，strokeEl：可选 isRevoke：是否加入可撤销列表）
  reloadStroke (stroke, strokeEl) {
    // 有编辑数据则修改编辑状态
    if (this.editStroke) { this.editStatus = true }
    // 找到笔画元素
    var strokeEl = strokeEl
    // 没有笔画元素则去便利查找
    if (!strokeEl) {
      // 通过匹配 ID 进行查找
      strokeEl = this.strokeEls.find(item => {
        var id = item.getAttribute('id')
        return id === stroke.id
      })
    }
    // 判断笔画对象是否为文本
    if (stroke.type === 'text') {
      // 判断当前是否有输入框 && 是否跟输入框的笔画对象一致
      if (this.inputEl && this.inputStroke.id === stroke.id) {
        // 更新输入框样式
        this.inputStyleChange(stroke)
        // 刷新坐标
        this.inputSizeChange(stroke)
      } else {
        // 刷新坐标
        this.inputSizeChange(stroke)
        // 更新笔画数据
        this.drawChange(stroke, strokeEl)
        // 更新编辑颜色
        this.drawEditChange(stroke)
      }
    } else {
      // 更新笔画数据
      this.drawChange(stroke, strokeEl)
      // 更新编辑颜色
      this.drawEditChange(stroke)
    }
  },
  // 撤销笔画
  revoke (index) {
    // 是否禁止编辑
    if (!this.option.isEdit) { return }
    // 清理辅助组件
    this.clearComponents()
    // 有撤销列表
    if (this.revokeStrokes.length) {
      // 索引
      var revokeCount = this.revokeStrokes.length
      var count = this.strokes.length
      // 是否指定了笔画
      var lastIndex = revokeCount - 1
      if (!!index || index === 0) {
        lastIndex = index
      }
      // 笔画对象
      var revokeStroke = this.revokeStrokes[lastIndex]
      // 获取当前显示数据
      var stroke = null
      var strokeIndex = null
      this.strokes.some((item, index) => {
        if (item.id === revokeStroke.id) {
          stroke = this.copy(item)
          strokeIndex = index
          return true
        }
        return false
      })
      // 相等表示所有笔画都只剩下最后一笔画数据了
      if (revokeCount === count) {
        // 移除撤销列表
        this.revokeStrokes.splice(lastIndex, 1)
        // 移除笔画对象
        this.strokes.splice(strokeIndex, 1)
        // 移除页面显示
        this.svgEl.removeChild(this.strokeEls[strokeIndex])
        // 移除笔画元素
        this.strokeEls.splice(strokeIndex, 1)
        // 添加到恢复列表
        this.recoveryStrokes.push(stroke)
      } else {
        // 获取元素
        var strokeEl = this.strokeEls.find(item => item.getAttribute('id') === revokeStroke.id)
        // 移除撤销列表
        this.revokeStrokes.splice(lastIndex, 1)
        // 替换到笔画列表
        this.strokes[strokeIndex] = revokeStroke
        // 重新刷新
        this.drawChange(revokeStroke, strokeEl)
        // 添加到恢复列表
        this.recoveryStrokes.push(stroke)
      }
    }
  },
  // 恢复笔画
  recovery () {
    // 是否禁止编辑
    if (!this.option.isEdit) { return }
    // 清理辅助组件
    this.clearComponents()
    // 有恢复列表
    if (this.recoveryStrokes.length) {
      // 索引
      var lastIndex = this.recoveryStrokes.length - 1
      // 笔画对象
      var recoveryStroke = this.recoveryStrokes[lastIndex]
      // 获取当前显示数据
      var stroke = null
      var strokeIndex = null
      this.strokes.some((item, index) => {
        if (item.id === recoveryStroke.id) {
          stroke = this.copy(item)
          strokeIndex = index
          return true
        }
        return false
      })
      // 是否存在当前显示画笔对象,没有则新建
      if (stroke) {
        // 获取元素
        var strokeEl = this.strokeEls.find(item => item.getAttribute('id') === recoveryStroke.id)
        // 移除恢复列表
        this.recoveryStrokes.splice(lastIndex, 1)
        // 替换到笔画列表
        this.strokes[strokeIndex] = recoveryStroke
        // 重新刷新
        this.drawChange(recoveryStroke, strokeEl)
        // 添加到撤销列表
        this.revokeStrokes.push(stroke)
      } else {
        // 移除恢复列表
        this.recoveryStrokes.splice(lastIndex, 1)
        // 新建
        this.drawCreate(recoveryStroke)
        // 加入撤销列表
        this.revokeStrokes.push(recoveryStroke)
        // 清空笔画对象
        this.mouseUpEventClear()
      }
    }
  },
  // 在操作进行操作之前需要清空辅助组件
  clearComponents () {
    // 回调编辑对象
    if (this.selectStroke && this.editStroke) { this.selectStroke() }
    // 文本框失去焦点
    this.inputBlur()
    // 编辑图形移除
    this.drawEditClear()
  },

  // ====================== 手势事件处理

  // 鼠标取消注册监听
  mouseDownDestroy () {
    // 取消注册状态
    this.isMouseRegister = false
    // 移除鼠标按下监听
    this.svgWrapperEl.removeEventListener('mousedown', this.mouseDownEvent)
    // 清空
    this.mouseDownEvent = null
  },
  // 鼠标抬起清空当前画笔数据（isReset：是否重置撤销恢复笔画 isCallback：是否回调）
  mouseUpEventClear (isReset, isCallback = true) {
    // 清空当前笔画元素
    this.strokeEl = null
    this.stroke = null
    // 清空撤销笔画列表
    if (isReset) {
      this.revokeStrokes = this.copy(this.strokes)
      this.recoveryStrokes = []
    }
    // 回调编辑对象
    if (this.selectStroke && isCallback) { this.selectStroke() }
  },
  // 注册鼠标监听
  mouseRegister () {
    // 有画板
    if (this.svgEl) {
      // 激活状态
      if (!this.isMouseRegister) {
        // 修改状态
        this.isMouseRegister = true
        // 按下事件处理
        this.mouseDownEvent = (e) => {
          // 处理事件
          this.handleMouseDownEvent(e)
        }
        // 监听鼠标按下
        this.svgWrapperEl.addEventListener('mousedown', this.mouseDownEvent)
      }
    }
  },
  // 鼠标按下处理
  handleMouseDownEvent (e) {
    // 记录开始坐标
    this.mouseLastOffset = e
    // 处理坐标信息
    var e = this.handleEventOffset(e)
    // 是否禁止编辑
    if (!this.option.isEdit) { return }
    // 输入框有值，则检查按下时鼠标是否在输入框范围内
    this.inputReactCheck(e)
    // 根据情况进行操作
    if (this.hoverEditEl) {
      // 移除输入框
      this.inputClear()
      // 拉伸编辑
      this.mouseDownEventEdit(e)
    } else if (this.hoverInputEl) {
      // 输入框移动
      if (this.option.isEditStroke) { this.mouseDownEventInput(e) }
    } else if (this.hoverStrokeEl) {
      // 移除输入框
      this.inputClear()
      // 笔画整体移动
      if (this.option.isEditStroke) { this.mouseDownEventMove(e) }
    } else {
      // 如果有输入框则返回
      if (this.inputEl) {
        // 移除输入框
        this.inputClear()
        // 停止下一步
        return
      }
      // 如果当前是 'text(文本)' 模式，且存在编辑对象，则先清除，再次点击才能新建
      if (this.option.strokeType === 'text' && this.editStroke) {
        // 手动抬起鼠标清空操作元素
        this.mouseUpEventClear()
        // 如果有未保存的操作，保存清空
        this.drawEditClear()
      } else {
        // 手动抬起鼠标清空操作元素
        this.mouseUpEventClear()
        // 如果有未保存的操作，保存清空
        this.drawEditClear()
        // 新建笔画
        this.mouseDownEventNew(e)
      }
    }
  },
  // 鼠标按下 - 新建
  mouseDownEventNew (e) {
    // 回调
    if (this.mousedown) { this.mousedown(e) }
    // Safari 浏览器处理
    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }
    // 设置状态
    this.isNewStroke = true
    // 开始位置
    var start = e
    // 判断笔画类型
    if (this.option.strokeType === 'text') {
      // 文本
      this.inputCreate(e)
      // 设置鼠标样式
      this.svgEl.style.cursor = this.option.editNewCursor
      // Safari 浏览器处理
      if (isSafari) { this.svgEl.style.pointerEvents = 'auto' }
      // 回调编辑对象
      if (this.selectStroke) { this.selectStroke(this.inputStroke) }
      // 设置状态
      this.isNewStroke = false
    } else {
      // 移除监听
      this.removeMouseEvent()
      // 鼠标抬起
      this.mouseUpEvent = (oe) => {
        // 鼠标抬起处理
        this.handleMouseUpEvent(oe)
      }
      // 鼠标移动
      this.mouseMoveEvent = (oe) => {
        // 处理坐标信息
        var e = this.handleEventOffset(oe)
        // 移动范围
        var x = Math.abs(start.offsetX - e.offsetX)
        var y = Math.abs(start.offsetY - e.offsetY)
        // 有移动范围则生效
        if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {
          // 回调
          if (this.mousemove) { this.mousemove(e) }
          // 没有操作元素才可以进行创建
          if (!this.strokeEl) {
            // 创建笔画对象
            var stroke = this.drawStrokeCreate(start)
            // 创建元素
            this.drawCreate(stroke)
          }
          // 移动调整
          this.drawStrokeChange(e)
        }
      }
      // 添加监听
      this.addMouseEvent()
    }
  },
  // 鼠标按下 - 移动
  mouseDownEventMove (e) {
    // 回调
    if (this.mousedown) { this.mousedown(e) }
    // 设置鼠标样式
    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor
    // 将 hover 元素转成当前操作对象
    this.strokeEl = this.hoverStrokeEl
    // 找到对应的笔画对象
    var strokeID = this.strokeEl.getAttribute('id')
    // Safari 浏览器处理 && 点击元素不是文本（text）
    if (isSafari && !strokeID.includes('text')) { this.svgEl.style.pointerEvents = 'none' }
    // 查找编辑笔画对象
    if (!this.editStroke || this.editStroke.id !== strokeID) {
      // 如果有未保存的操作，先保存清空
      this.drawEditClear()
      // 取得编辑笔画对象
      this.strokes.some((stroke, index) => {
        if (stroke.id === strokeID) {
          this.editStroke = this.copy(stroke)
          this.editStrokeIndex = index
          return true
        }
        return false
      })
      // 添加编辑图形
      this.drawEditCreate()
      // 回调编辑对象
      if (this.selectStroke) { this.selectStroke(this.editStroke, this.strokeEl) }
    }
    // 当前编辑笔画
    var stroke = this.editStroke
    // 开始位置
    var start = e
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 开始/结束坐标换算
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)
    // 移除监听
    this.removeMouseEvent()
    // 鼠标抬起
    this.mouseUpEvent = (oe) => {
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 鼠标抬起处理
      this.handleMouseUpEvent(e)
    }
    // 鼠标移动
    this.mouseMoveEvent = (oe) => {
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 移动范围
      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)
      // 有移动范围则生效
      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {
        // 回调
        if (this.mousemove) { this.mousemove(e) }
        // 有编辑
        this.editStatus = true
        // 移动调整
        var offsetX = e.movementX
        var offsetY = e.movementY
        // 计算位置
        minx += offsetX
        miny += offsetY
        maxx += offsetX
        maxy += offsetY
        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height
        stroke.maxx = maxx / svgSize.width
        stroke.maxy = maxy / svgSize.height
        // 画笔类型
        if (stroke.type === 'brush') {
          // 计算笔画坐标位置
          stroke.locations.forEach(location => {
            var x = this.toFixed(location.x * svgSize.width)
            var y = this.toFixed(location.y * svgSize.height)
            x += offsetX
            y += offsetY
            x /= svgSize.width
            y /= svgSize.height
            location.x = x
            location.y = y
          })
        }
        // 计算位置重新渲染
        this.drawChange(stroke, this.strokeEl)
        this.drawEditChange(stroke)
      }
    }
    // 添加监听
    this.addMouseEvent()
  },
  // 鼠标按下 - 编辑/拉动
  mouseDownEventEdit (e) {
    // 回调
    if (this.mousedown) { this.mousedown(e) }
    // Safari 浏览器处理
    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }
    // 设置鼠标样式
    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor
    // 获取编辑元素
    var stroke = this.editStroke
    var el = this.hoverEditEl
    var id = el.getAttribute('id')
    // 操作类型标识
    var tag = Number(id.split('-')[2])
    // 开始位置
    var start = e
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 开始/结束坐标换算
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)
    // 移除监听
    this.removeMouseEvent()
    // 鼠标抬起
    this.mouseUpEvent = (oe) => {
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 鼠标抬起处理
      this.handleMouseUpEvent(e)
    }
    // 鼠标移动
    this.mouseMoveEvent = (oe) => {
      // 禁止编辑笔画
      if (!this.option.isEditStroke) { return }
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 移动范围
      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)
      // 有移动范围则生效
      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {
        // 回调
        if (this.mousemove) { this.mousemove(e) }
        // 有编辑
        this.editStatus = true
        // 移动调整
        var offsetX = e.movementX
        var offsetY = e.movementY
        // 计算位置，画笔模式不需要单个点移动
        if (id.includes('circle') && stroke.type !== 'brush') {
          // 编辑区分
          if (tag === 1) {
            // minx/miny
            minx += offsetX
            miny += offsetY
          } else if (tag === 2) {
            // maxx/miny
            miny += offsetY
            maxx += offsetX
          } else if (tag === 3) {
            // minx/maxy
            minx += offsetX
            maxy += offsetY
          } else if (tag === 4) {
            // maxx/maxy
            maxx += offsetX
            maxy += offsetY
          } else if (tag === 5) {
            // minx
            minx += offsetX
          } else if (tag === 6) {
            // miny
            miny += offsetY
          } else if (tag === 7) {
            // maxx
            maxx += offsetX
          } else if (tag === 8) {
            // maxy
            maxy += offsetY
          }
        } else {
          // rect
          minx += offsetX
          miny += offsetY
          maxx += offsetX
          maxy += offsetY
        }
        // 重新赋值坐标
        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height
        stroke.maxx = maxx / svgSize.width
        stroke.maxy = maxy / svgSize.height
        // 画笔类型
        if (stroke.type === 'brush') {
          // 计算笔画坐标位置
          stroke.locations.forEach(location => {
            var x = this.toFixed(location.x * svgSize.width)
            var y = this.toFixed(location.y * svgSize.height)
            x += offsetX
            y += offsetY
            x /= svgSize.width
            y /= svgSize.height
            location.x = x
            location.y = y
          })
        }
        // 计算位置重新渲染
        this.drawChange(stroke, this.strokeEl)
        this.drawEditChange(stroke)
      }
    }
    // 添加监听
    this.addMouseEvent()
  },
  // 鼠标按下 - 输入框移动
  mouseDownEventInput (e) {
    // 回调
    if (this.mousedown) { this.mousedown(e) }
    // Safari 浏览器处理
    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }
    // 设置鼠标样式
    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor
    // 输入框笔画对象
    var stroke = this.inputStroke
    // 开始位置
    var start = e
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 开始/结束坐标换算
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    // 移除监听
    this.removeMouseEvent()
    // 鼠标抬起
    this.mouseUpEvent = (oe) => {
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 鼠标抬起处理
      this.handleMouseUpEvent(e)
    }
    // 鼠标移动
    this.mouseMoveEvent = (oe) => {
      // 处理坐标信息
      var e = this.handleEventOffset(oe)
      // 移动范围
      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)
      // 有移动范围则生效
      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {
        // 回调
        if (this.mousemove) { this.mousemove(e) }
        // 有编辑
        this.editStatus = true
        // 移动调整
        var offsetX = e.movementX
        var offsetY = e.movementY
        // 计算位置
        minx += offsetX
        miny += offsetY
        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height
        // 计算位置重新渲染
        this.inputSizeChange(stroke, svgSize)
        this.inputScaleChange()
      }
    }
    // 添加监听
    this.addMouseEvent()
  },
  // 鼠标抬起
  handleMouseUpEvent (e) {
    // 回调
    if (this.mouseup && this.stroke) { this.mouseup(e) }
    // 属于新建元素
    if (this.isNewStroke) {
      // 设置状态
      this.isNewStroke = false
      // 清空当前笔画元素
      if (this.stroke) { this.mouseUpEventClear(true, false) }
    }
    // Safari 浏览器处理
    if (isSafari) { this.svgEl.style.pointerEvents = 'auto' }
    // 设置鼠标样式
    this.svgEl.style.cursor = this.option.editNewCursor
    // 移除鼠标监听
    this.removeMouseEvent()
  },
  // 添加鼠标监听
  addMouseEvent () {
    // 抬起事件
    if (this.mouseUpEvent) {
      // 监听鼠标抬起
      this.svgWrapperEl.addEventListener('mouseup', this.mouseUpEvent)
    }
    // 移动事件
    if (this.mouseMoveEvent) {
      // 监听鼠标移动
      this.svgWrapperEl.addEventListener('mousemove', this.mouseMoveEvent)
    }
  },
  // 移除鼠标监听
  removeMouseEvent () {
    // 抬起事件
    if (this.mouseUpEvent) {
      // 移除鼠标抬起监听
      this.svgWrapperEl.removeEventListener('mouseup', this.mouseUpEvent)
      // 清空
      this.mouseUpEvent = null
    }
    // 移动事件
    if (this.mouseMoveEvent) {
      // 移除鼠标抬起监听
      this.svgWrapperEl.removeEventListener('mousemove', this.mouseMoveEvent)
      // 清空
      this.mouseMoveEvent = null
    }
  },
  // 编辑完成
  mouseDownEventEditSuccess () {
    // 有编辑对象
    if (this.editStroke) {
      // 且编辑过
      if (this.editStatus) {
        // 更新笔画数据，并将老数据添加到撤销列表
        var oldStroke = this.strokes[this.editStrokeIndex]
        this.strokes[this.editStrokeIndex] = this.editStroke
        this.revokeStrokes.push(oldStroke)
        this.editStatus = false
      }
      // 清空
      this.editStrokeIndex = null
      this.editStroke = null
    }
  },

  // ====================== 绘制图形创建/改变

  // 创建绘制图形
  drawStrokeCreate (e) {
    // 笔画对象
    var stroke = null
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 透明颜色
    var transparentColor = 'rgba(255, 255, 255, 0)'
    // 起始坐标
    var x = e.offsetX / svgSize.width
    var y = e.offsetY / svgSize.height
    // 判断绘制类型
    if (['rect', 'line', 'circle', 'ellipse'].includes(this.option.strokeType)) {
      // 多种笔画类型
      stroke = {
        id: `${this.option.strokeType}-${this.uuid()}`,
        type: this.option.strokeType,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y
      }
    } else if (this.option.strokeType === 'text') {
      // 文本
      stroke = {
        id: `${this.option.strokeType}-${this.uuid()}`,
        type: this.option.strokeType,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth, // 设置无效，固定 0
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y,
        text: this.option.inputPlaceholder,
        fontLineSpace: this.option.fontLineSpace,
        fontSize: this.option.fontSize,
        fontWeight: this.option.fontWeight,
        fontFamily: this.option.fontFamily
      }
    } else if (this.option.strokeType === 'brush') {
      // 画笔
      stroke = {
        id: `${this.option.strokeType}-${this.uuid()}`,
        type: this.option.strokeType,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y,
        locations: []
      }
    } else if (this.option.strokeType === 'arrow') {
      // 箭头
      stroke = {
        id: `${this.option.strokeType}-${this.uuid()}`,
        type: this.option.strokeType,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth, // 设置无效，固定 1
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y
      }
    }
    // 返回
    return stroke
  },
  // 操作绘制图形
  drawStrokeChange (e) {
    // 两者都有值才可以继续进行
    if (!this.strokeEl || !this.stroke) { return }
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 判断绘制类型
    if (['rect', 'line', 'circle', 'ellipse', 'arrow'].includes(this.option.strokeType)) {
      // 多种笔画类型
      this.stroke.maxx = e.offsetX / svgSize.width
      this.stroke.maxy = e.offsetY / svgSize.height
      this.drawChange(this.stroke, this.strokeEl)
    } else if (this.option.strokeType === 'brush') {
      // 画笔
      var x = e.offsetX / svgSize.width
      var y = e.offsetY / svgSize.height
      this.stroke.maxx = x
      this.stroke.maxy = y
      this.stroke.locations.push({ x: x, y: y })
      this.drawChange(this.stroke, this.strokeEl)
    }
  },
  // 创建绘制图形
  drawCreate (stroke) {
    // 笔画对象
    var strokeEl = null
    // 判断绘制类型
    if (stroke.type === 'rect') {
      // 矩形
      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'line') {
      // 直线
      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'circle') {
      // 圆形
      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'ellipse') {
      // 椭圆
      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'text') {
      // 文本
      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'brush') {
      // 画笔
      strokeEl = document.createElementNS(NS_SVG, 'path')
    } else if (stroke.type === 'arrow') {
      // 箭头
      strokeEl = document.createElementNS(NS_SVG, 'path')
    }
    // 有笔画对象
    if (strokeEl) {
      // 坐标初始化
      this.drawChange(stroke, strokeEl)
      // 复制与添加到对应属性
      this.strokeEl = strokeEl
      this.strokeEls.push(strokeEl)
      this.stroke = stroke
      this.strokes.push(stroke)
      // 初始化显示
      this.svgEl.append(strokeEl)
      // 文本框添加双击事件
      if (stroke.type === 'text') {
        // 双击事件
        strokeEl.ondblclick = () => {
          // 移除编辑图形
          this.drawEditClear()
          // 是否禁止编辑已绘制笔画
          if (!this.option.isEditStroke) { return }
          // 找到对应的笔画对象
          var strokeID = strokeEl.getAttribute('id')
          // 取得编辑笔画对象
          this.strokes.some(stroke => {
            if (stroke.id === strokeID) {
              this.inputStroke = stroke
              this.stroke = stroke
              return true
            }
            return false
          })
          this.strokeEl = strokeEl
          // 隐藏
          strokeEl.style.display = 'none'
          // 创建输入框
          this.inputCreate()
        }
      }
      // 添加 hover 事件，进入元素
      strokeEl.onmouseover = () => {
        // 是否正在新建，在新建则不需要替换鼠标样式
        if (!this.isNewStroke) {
          // 初始化样式
          strokeEl.style.cursor = this.option.editMoveCursor
          // 设置鼠标样式
          this.editMouseCursor = this.option.editMoveCursor
          // 记录
          this.hoverStrokeEl = strokeEl
        }
      }
      // 离开元素
      strokeEl.onmouseout = () => {
        // 初始化样式
        strokeEl.style.cursor = this.option.editNewCursor
        // 设置鼠标样式
        this.editMouseCursor = null
        // 清空
        this.hoverStrokeEl = null
      }
    }
  },
  // 绘制图形变化
  drawChange (stroke, strokeEl) {
    // 两者都有值才可以继续进行
    if (!stroke || !strokeEl) { return }
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 开始/结束坐标换算
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)
    // 公共属性配置
    strokeEl.setAttribute('id', stroke.id)
    strokeEl.setAttribute('stroke', stroke.stroke)
    strokeEl.setAttribute('stroke-width', stroke.strokeWidth)
    strokeEl.setAttribute('fill', stroke.fill)
    // 判断绘制类型
    if (stroke.type === 'rect') {
      // 矩形
      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      strokeEl.setAttribute('x', x)
      strokeEl.setAttribute('y', y)
      strokeEl.setAttribute('width', width)
      strokeEl.setAttribute('height', height)
    } else if (stroke.type === 'line') {
      // 直线
      strokeEl.setAttribute('x1', minx)
      strokeEl.setAttribute('y1', miny)
      strokeEl.setAttribute('x2', maxx)
      strokeEl.setAttribute('y2', maxy)
    } else if (stroke.type === 'circle') {
      // 圆形
      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var cx = x + width / 2
      var cy = y + height / 2
      var r = Math.max(width, height) / 2
      strokeEl.setAttribute('cx', cx)
      strokeEl.setAttribute('cy', cy)
      strokeEl.setAttribute('r', r)
    } else if (stroke.type === 'ellipse') {
      // 椭圆
      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var cx = x + width / 2
      var cy = y + height / 2
      var rx = width / 2
      var ry = height / 2
      strokeEl.setAttribute('cx', cx)
      strokeEl.setAttribute('cy', cy)
      strokeEl.setAttribute('rx', rx)
      strokeEl.setAttribute('ry', ry)
    } else if (stroke.type === 'text') {
      // 文本 - 处理缩放
      var scale = this.scaleValue(svgSize)
      var fontSize = this.toFixed(stroke.fontSize * scale)
      var fontWeight = fontWeight
      var fontLineSpace = this.toFixed(stroke.fontLineSpace * scale)
      var space = this.toFixed(this.option.inputPadding * scale)
      miny -= space
      // 属性配置
      strokeEl.setAttribute('x', minx)
      strokeEl.setAttribute('y', miny)
      strokeEl.setAttribute('font-size', fontSize)
      strokeEl.setAttribute('font-weight', fontWeight)
      strokeEl.setAttribute('font-family', stroke.fontFamily)
      strokeEl.setAttribute('stroke', stroke.fill)
      strokeEl.setAttribute('stroke-width', 0)
      strokeEl.setAttribute('fill', stroke.stroke)
      // 拼接显示内容
      var innerHTML = ''
      var texts = stroke.text.split('\n')
      texts.forEach(item => {
        // 回车使用全角空格替换，保证格式不变
        innerHTML += `<tspan x="${minx}" dy="${fontSize + fontLineSpace}">${item || '　'}</tspan>`
      })
      strokeEl.innerHTML = innerHTML
    }  else if (stroke.type === 'brush') {
      // 笔画
      var d = `M ${minx} ${miny}`
      stroke.locations.forEach(location => {
        var x = this.toFixed(location.x * svgSize.width)
        var y = this.toFixed(location.y * svgSize.height)
        d += ` Q ${x} ${y} ${x} ${y}`
      })
      strokeEl.setAttribute('d', d)
    } else if (stroke.type === 'arrow') {
      // 箭头
      strokeEl.setAttribute('fill', this.option.isFill ? stroke.stroke : stroke.fill)
      strokeEl.setAttribute('stroke-width', 1)
      // 对角线
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
      // 箭头两侧斜点距离
			var el = Math.min(diagonal * 0.3, 50)
      var al = Math.min(diagonal * 1.0, 25)
      // 初始坐标
      var vertexs = []
			var x1 = minx
      var y1 = miny
      var x2 = maxx
      var y2 = maxy
	    // 计算箭头底边两个点（开始点，结束点，两边角度，箭头角度）
			vertexs[0] = x1
      vertexs[1] = y1
      vertexs[6] = x2
      vertexs[7] = y2
			// 计算起点坐标与 X 轴之间的夹角角度值
			var angle = Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180
			var x = x2 - x1
      var y = y2 - y1
      var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
			if (length < 250) {
        el /= 2
        al /= 2
			} else if (length < 500) {
        el *= length / 500
        al *= length / 500
			}
			vertexs[8] = x2 - el * Math.cos(Math.PI / 180 * (angle + al))
			vertexs[9] = y2 - el * Math.sin(Math.PI / 180 * (angle + al))
			vertexs[4] = x2 - el * Math.cos(Math.PI / 180 * (angle - al))
			vertexs[5] = y2 - el * Math.sin(Math.PI / 180 * (angle - al))
			// 获取另外两个顶点坐标
			x = (vertexs[4] + vertexs[8]) / 2
      y = (vertexs[5] + vertexs[9]) / 2
			vertexs[2] = (vertexs[4] + x) / 2
			vertexs[3] = (vertexs[5] + y) / 2
			vertexs[10] = (vertexs[8] + x) / 2
			vertexs[11] = (vertexs[9] + y) / 2
      // 处理小数点
      vertexs = vertexs.map((vertex) => {
        return this.toFixed(vertex)
      })
      // 绘制箭头
      strokeEl.setAttribute('d', `M ${vertexs[0]} ${vertexs[1]} L ${vertexs[2]} ${vertexs[3]} L ${vertexs[4]} ${vertexs[5]} L ${vertexs[6]} ${vertexs[7]} L ${vertexs[8]} ${vertexs[9]} L ${vertexs[10]} ${vertexs[11]} Z`)
    }
  },
  // 创建编辑图形
  drawEditCreate () {
    // 是否有编辑对象
    if (!this.editStroke) { return }
    // 引用
    var that = this
    // 根据类型绘制
    if (['rect', 'circle', 'ellipse'].includes(this.editStroke.type)) {
      // 8/4 个操作点
      this.editEls.circle1 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle2 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle3 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle4 = document.createElementNS(NS_SVG, 'circle')
      // 圆形只需要 4 个操作点
      if (this.editStroke.type !== 'circle') {
        this.editEls.circle5 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle6 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle7 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle8 = document.createElementNS(NS_SVG, 'circle')
      }
    } else if (['line', 'brush', 'arrow'].includes(this.editStroke.type)) {
      // 2 个操作点
      this.editEls.circle1 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle4 = document.createElementNS(NS_SVG, 'circle')
    }
    // 支持编辑显示矩形框
    if (this.option.isShowEditRect) {
      // 绘制矩形
      if (['text'].includes(this.editStroke.type)) {
        // 矩形
        this.editEls.rect = document.createElementNS(NS_SVG, 'rect')
        // 显示
        this.svgEl.append(this.editEls.rect)
      }
    }
    // 显示
    var els = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8, this.editEls.rect]
    // 便利
    els.forEach(el => {
      // 为空则说明没有创建
      if (!el) { return }
      // 显示
      this.svgEl.append(el)
      // 添加 hover 事件，进入元素
      el.onmouseover = () => {
        // 设置鼠标样式
        this.editMouseCursor = el.style.cursor
        // 记录
        that.hoverEditEl = el
      }
      // 离开元素
      el.onmouseout = () => {
        // 设置鼠标样式
        this.editMouseCursor = null
        // 清空
        this.hoverEditEl = null
      }
    })
    // 手动初始化
    this.drawEditChange(this.editStroke)
  },
  // 编辑图形变化
  drawEditChange (stroke) {
    // 检查是否有值
    if (!stroke) { return }
    // 获取画板宽高
    var svgSize = this.svgSize()
    // 坐标数据
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)
    var radius = this.option.editRadius
    // 操作矩形
    if (this.editEls.rect) {
      // 文本
      if (stroke.type === 'text') {
        // 计算坐标
        // 坐标
        var width = maxx - minx
        var height = maxy - miny
        var scale = this.scaleValue(svgSize)
        var space = this.option.inputPadding * scale
        minx -= space
        miny -= space
        width += 2 * space
        height += 2 * space
        // 基础属性
        this.editEls.rect.setAttribute('id', `edit-rect`)
        this.editEls.rect.setAttribute('stroke', stroke.stroke)
        this.editEls.rect.setAttribute('stroke-width', this.option.inputBoderWidth)
        this.editEls.rect.setAttribute('fill', 'none')
        this.editEls.rect.setAttribute('x', minx)
        this.editEls.rect.setAttribute('y', miny)
        this.editEls.rect.setAttribute('width', width)
        this.editEls.rect.setAttribute('height', height)
        this.editEls.rect.style.cursor = this.option.editMoveCursor
      }
    }
    // 操作圆点
    var circles = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8]
    // 便利
    circles.forEach((circle, index) => {
      // 为空则说明没有创建
      if (!circle) { return }
      // 基础属性
      circle.setAttribute('id', `edit-circle-${index + 1}`)
      circle.setAttribute('stroke', stroke.stroke)
      circle.setAttribute('stroke-width', this.option.editBoderWidth)
      circle.setAttribute('fill', this.option.editFillColor)
    })
    // 定位布局
    // 1
    if (this.editEls.circle1) {
      this.editEls.circle1.setAttribute('cx', minx)
      this.editEls.circle1.setAttribute('cy', miny)
      this.editEls.circle1.setAttribute('r', radius)
      this.editEls.circle1.style.cursor = 'move'
    }
    // 2
    if (this.editEls.circle2) {
      this.editEls.circle2.setAttribute('cx', maxx)
      this.editEls.circle2.setAttribute('cy', miny)
      this.editEls.circle2.setAttribute('r', radius)
    }
    // 3
    if (this.editEls.circle3) {
      this.editEls.circle3.setAttribute('cx', minx)
      this.editEls.circle3.setAttribute('cy', maxy)
      this.editEls.circle3.setAttribute('r', radius)
    }
    // 4
    if (this.editEls.circle4) {
      this.editEls.circle4.setAttribute('cx', maxx)
      this.editEls.circle4.setAttribute('cy', maxy)
      this.editEls.circle4.setAttribute('r', radius)
      this.editEls.circle4.style.cursor = 'move'
    }
    // 5
    if (this.editEls.circle5) {
      this.editEls.circle5.setAttribute('cx', minx)
      this.editEls.circle5.setAttribute('cy', miny + (maxy - miny) / 2)
      this.editEls.circle5.setAttribute('r', radius)
      this.editEls.circle5.style.cursor = 'ew-resize'
    }
    // 6
    if (this.editEls.circle6) {
      this.editEls.circle6.setAttribute('cx', minx + (maxx - minx) / 2)
      this.editEls.circle6.setAttribute('cy', miny)
      this.editEls.circle6.setAttribute('r', radius)
      this.editEls.circle6.style.cursor = 'ns-resize'
    }
    // 7
    if (this.editEls.circle7) {
      this.editEls.circle7.setAttribute('cx', maxx)
      this.editEls.circle7.setAttribute('cy', miny + (maxy - miny) / 2)
      this.editEls.circle7.setAttribute('r', radius)
      this.editEls.circle7.style.cursor = 'ew-resize'
    }
    // 8
    if (this.editEls.circle8) {
      this.editEls.circle8.setAttribute('cx', minx + (maxx - minx) / 2)
      this.editEls.circle8.setAttribute('cy', maxy)
      this.editEls.circle8.setAttribute('r', radius)
      this.editEls.circle8.style.cursor = 'ns-resize'
    }
    // 8/4 个操作点鼠标样式
    if (['rect', 'circle', 'ellipse'].includes(stroke.type)) {
      // 最小x > 最大x 
      if (minx > maxx) {
        if (miny > maxy) {
          this.editEls.circle1.style.cursor = 'nwse-resize'
          this.editEls.circle4.style.cursor = 'nwse-resize'
        } else {
          this.editEls.circle1.style.cursor = 'nesw-resize'
          this.editEls.circle4.style.cursor = 'nesw-resize'
        }
      } else {
        if (miny > maxy) {
          this.editEls.circle1.style.cursor = 'nesw-resize'
          this.editEls.circle4.style.cursor = 'nesw-resize'
        } else {
          this.editEls.circle1.style.cursor = 'nwse-resize'
          this.editEls.circle4.style.cursor = 'nwse-resize'
        }
      }
      // 最小y > 最大y 
      if (miny > maxy) {
        if (minx > maxx) {
          this.editEls.circle2.style.cursor = 'nesw-resize'
          this.editEls.circle3.style.cursor = 'nesw-resize'
        } else {
          this.editEls.circle2.style.cursor = 'nwse-resize'
          this.editEls.circle3.style.cursor = 'nwse-resize'
        }
      } else {
        if (minx > maxx) {
          this.editEls.circle2.style.cursor = 'nwse-resize'
          this.editEls.circle3.style.cursor = 'nwse-resize'
        } else {
          this.editEls.circle2.style.cursor = 'nesw-resize'
          this.editEls.circle3.style.cursor = 'nesw-resize'
        }
      }
    }
  },
  // 编辑图形清空
  drawEditClear () {
    // 编辑完成，保存记录
    this.mouseDownEventEditSuccess()
    // 有画板，移除操作图形元素
    if (this.svgEl) {
      // 列表
      var els = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8, this.editEls.rect]
      // 便利
      els.forEach(el => {
        // 移除显示
        if (el) { this.svgEl.removeChild(el) }
      })
    }
    // 置空
    this.editEls.circle1 = null
    this.editEls.circle2 = null
    this.editEls.circle3 = null
    this.editEls.circle4 = null
    this.editEls.circle5 = null
    this.editEls.circle6 = null
    this.editEls.circle7 = null
    this.editEls.circle8 = null
    this.editEls.rect = null
  },

  // ====================== 文本输入框 input

  // 文本输入框创建
  inputCreate (e) {
    if (!this.inputEl) {
      // 创建笔画对象
      if (!this.inputStroke) { this.inputStroke = this.drawStrokeCreate(e) }
      // 引用
      var stroke = this.inputStroke
      var svgSize = this.svgSize()
      // 创建输入框
      var inputEl = document.createElement('div')
      inputEl.style.position = 'absolute'
      inputEl.style.top = '0px'
      inputEl.style.left = '0px'
      inputEl.style.cursor = this.option.editMoveCursor
      inputEl.style.outline = 'none'
      inputEl.style.wordBreak = 'break-all'
      inputEl.style.whiteSpace = 'normal'
      inputEl.setAttribute('contenteditable', true)
      // 记录
      this.inputEl = inputEl
      // 初始化样式
      this.inputStyleChange(stroke)
      // 添加显示
      this.svgWrapperEl.appendChild(inputEl)
      // 坐标/宽高调整
      this.inputSizeChange(stroke, svgSize)
      // 调整坐标位置
      this.inputScaleChange()
      // 添加 hover 事件，进入元素
      inputEl.onmouseover = () => {
        // 设置鼠标样式
        this.editMouseCursor = inputEl.style.cursor
        // 记录
        this.hoverInputEl = inputEl
      }
      // 离开元素
      inputEl.onmouseout = () => {
        // 设置鼠标样式
        this.editMouseCursor = null
        // 清空
        this.hoverInputEl = null
      }
      // 贴贴
      inputEl.onpaste = () => {
        // 禁止冒泡
        e.preventDefault()
        // 内容
        var text = ''
        // 贴贴数据
        var clp = (e.originalEvent || e).clipboardData
        // 贴贴内容
        if (clp && clp.getData) {
            text = clp.getData('text/plain') || ''
        } else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData('text') || ''
        }
        // 内容不为空
        if (text !== '') {
          // 处理排版样式
          if (this.option.isPasteTypesetting) {
            // 替换内容中间的全角空格为普通空格
            text = text.replaceAll(/　+/, ' ')
            // 移除开头回车空格
            text = text.replaceAll(/^\s+/, '')
            // 将内容中间换行空格替换成换行
            text = text.replaceAll(/\n\s+/, '\n')
            // 替换内容中间多余的空格
            text = text.replaceAll(/ +/, ' ')
          }
          // 数据是否满足指定格式
          if (clp === undefined || clp === null) {
            // 是否有光标位置
            if (window.getSelection) {
              // 有则插入指定位置
              var newNode = document.createElement('span')
              newNode.innerHTML = text
              window.getSelection().getRangeAt(0).insertNode(newNode)
            } else {
              // 没有则直接贴贴
              document.selection.createRange().pasteHTML(text)
            }
            // 内容变换
            this.inputChange(stroke, svgSize)
          } else {
            // 插入内容
            document.execCommand('insertText', false, text)
          }
        }
      }
      // 保证完成创建在处理
      setTimeout(() => {
        // 获取焦点
        inputEl.focus()
        this.selectText(inputEl)
        // 文案输入事件
        inputEl.oninput = () => {
          // 内容变换
          this.inputChange(stroke, svgSize)
        }
        // 失去焦点是否允许移除输入框
        if (this.option.isInputBlurRemove) {
          // 失去焦点事件
          inputEl.onblur = () => {
            // 失去焦点则显示文本
            this.inputBlur()
          }
        }
      }, 0)
    }
  },
  // 输入框样式变化
  inputStyleChange (stroke) {
    // 外壳样式
    this.inputEl.style.padding = `${this.option.inputPadding}px`
    this.inputEl.style.border = `${this.option.inputBoderWidth}px ${this.option.inputBorderStyle} ${stroke.stroke}`
    this.inputEl.style.borderRadius = `${this.option.inputBorderRadius}px`
    // 文本样式
    this.inputEl.style.color = stroke.stroke
    this.inputEl.style.fontSize = `${stroke.fontSize}px`
    this.inputEl.style.fontWeight = stroke.fontWeight
    this.inputEl.style.fontFamily = stroke.fontFamily
    this.inputEl.style.width = this.inputEl.style.fontSize
    this.inputEl.style.lineHeight = `${stroke.fontSize + this.option.fontLineSpace}px`
    // 复原输入框文本
    var texts = (stroke.text || '').split('\n')
    var innerHTML = ''
    texts.forEach(text => {
      // 判断内容
      if (!text.length) {
        // 空行则手动加换行符
        innerHTML += '<div><br/></div>'
      }  else {
        // 非空行加内容
        innerHTML += `<div>${text}</div>`
      }
    })
    // 显示
    this.inputEl.innerHTML = innerHTML
  },
  // 输入框内容变换
  inputChange (stroke, svgSize) {
    // 记录
    stroke.text = this.inputEl.innerHTML
    // 检查是否以 <div> 开头，如果是则需要替换第一个为空
    if (stroke.text.indexOf('<div>') === 0) {
      // 移除开头 <div>
      stroke.text = stroke.text.replace('<div>','')
    }
    // 清空 <br> </div> <span> </span>, 将剩下的 <div> 替换成换行符
    stroke.text = stroke.text.replaceAll('<br>','').replaceAll('</div>','').replaceAll('<span>','').replaceAll('</span>','').replaceAll('<div>','\n')
    // 更新宽高
    this.inputSizeChange(stroke, svgSize)
  },
  // 移除输入框
  inputClear () {
    // 点击画板移除输入框
    if (!this.option.isInputBlurRemove) {
      // 失去焦点则显示文本
      this.inputBlur()
    }
  },
  // 检查鼠标按下时坐标是否在输入框元素内
  inputReactCheck (e) {
    // 输入框有值
    if (this.hoverInputEl) {
      // 输入框范围
      var input = this.hoverInputEl
      var minx = input.offsetLeft
      var miny = input.offsetTop
      var maxx = input.offsetLeft + input.offsetWidth
      var maxy = input.offsetTop + input.offsetHeight
      // 鼠标坐标
      var x = e.offsetX + minx
      var y = e.offsetY + miny
      // 检查按下时是否在元素范围内
      if(x < minx || x > maxx || y < miny || y > maxy){
        // 不在
        this.hoverInputEl = null
        this.hoverStrokeEl = null
      }
    }
  },
  // 文本框失去焦点
  inputBlur () {
    if (this.inputEl) {
      // 是否存在需要修改的文本元素
      if (this.strokeEl) {
        // 修改文本元素
        this.drawChange(this.inputStroke, this.strokeEl)
        this.strokeEl.style.display = 'block'
      } else {
        // 绘制文本元素
        this.drawCreate(this.inputStroke)
      }
      // 移除输入框
      this.inputRemove()
      // 移除当前元素数据
      this.mouseUpEventClear(true)
    }
  },
  // 文本输入框移除
  inputRemove () {
    if (this.inputEl) {
      this.svgWrapperEl.removeChild(this.inputEl)
      this.inputStroke = null
      this.inputEl = null
    }
  },
  // 输入框大小计算
  inputSizeChange (stroke, svgSize) {
    // 必须有值
    if (!stroke) { return }
    // 获取画板宽高
    var svgSize = svgSize || this.svgSize()
    // 没有内容时，默认宽高
    var lineh = stroke.fontSize + this.option.fontLineSpace
    // 当前输入的内容
    var text = stroke.text
    // 创建一个 span
    var span = document.createElement('div')
    // 配置相关属性，保持跟输入框一致，尤其需要注意缩放的数值
    span.style.opacity = 0
    span.style.padding = 0
    span.style.margin = 0
    span.style.display = 'inline-block'
    span.style.fontSize = `${stroke.fontSize}px`
    span.style.fontWeight = stroke.fontWeight
    span.style.fontFamily = stroke.fontFamily
    span.style.wordBreak = 'break-all'
    span.style.whiteSpace = 'normal'
    // 将输入内容分割成行数组
    var texts = text.split('\n')
    // 插入标签元素
    var innerHTML = ''
    // 便利组装
    texts.forEach(text => {
      innerHTML += `<div>${text}</div>`
    })
    // 将回车替换成换行符
    span.innerHTML = innerHTML
    // 添加到页面上才能得到尺寸
    document.body.appendChild(span)
    // 获取 span 的宽高
    var width = span.clientWidth + this.option.inputOffsetW
    var height = texts.length * lineh
    // 移除计算的 span
    document.body.removeChild(span)
    // 如果有输入框则设置宽高
    if (this.inputEl) {
      this.inputEl.style.width = `${width}px`
      this.inputEl.style.height = `${height}px`
    }
    // 计算最大 maxx/maxy
    var scale = this.scaleValue(svgSize)
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    stroke.maxx = (minx + width * scale) / svgSize.width
    stroke.maxy = (miny + height * scale) / svgSize.height
  },
  // 文本输入框缩放
  inputScaleChange () {
    if (this.inputEl && this.inputStroke) {
      // 获取画板宽高
      var stroke = this.inputStroke
      var svgSize = this.svgSize()
      var scale = this.scaleValue(svgSize)
      var space = (this.option.inputPadding + this.option.inputBoderWidth) * scale
      // 开始/结束坐标换算
      var minx = this.toFixed(stroke.minx * svgSize.width) - space
      var miny = this.toFixed(stroke.miny * svgSize.height) - space
      // 缩放
      this.inputEl.style.transform = `scale(${scale})`
      this.inputEl.style.transformOrigin = '0 0'
      this.inputEl.style.left = `${minx}px`
      this.inputEl.style.top = `${miny}px`
    }
  },

  // ====================== 公共辅助函数

  // 网页窗口缩放调整
  onScale () {
    // 清空操作元素
    if (this.editStroke) {
      // 手动抬起鼠标清空操作元素
      this.mouseUpEventClear()
      // 如果有未保存的操作，保存清空
      this.drawEditClear()
    }
    // 组件宽高
    var dbWidth = this.dbEl.clientWidth
    var dbHeight = this.dbEl.clientHeight
    var svgSize = this.svgSize()
    // 获取宽高
    var width = this.svgWrapperEl.style.width
    var height = this.svgWrapperEl.style.height
    // 缩放尺寸
    var rect = this.objectFitSize(dbWidth, dbHeight, svgSize.width, svgSize.height)
    // 必须宽高都是 px 才进行调整宽高适配
    if (width.includes('px') && height.includes('px')) {
      this.svgWrapperEl.style.width = `${this.toFixed(rect.width)}px`
      this.svgWrapperEl.style.height = `${this.toFixed(rect.height)}px`
    }
    // 刷新位置
    this.strokeEls.forEach((strokeEl, index) => {
      // 重新绘制
      this.drawChange(this.strokes[index], strokeEl)
    })
    // 刷新输入框位置
    this.inputScaleChange()
  },
  // 画板宽高
  svgSize () {
    // 获取宽高
    var width = this.svgWrapperEl.style.width
    var height = this.svgWrapperEl.style.height
    // 处理宽高
    if (width.includes('px')) {
      width = Number(width.replace('px', ''))
    } else {
      width = this.svgWrapperEl.clientWidth
    }
    if (height.includes('px')) {
      height = Number(height.replace('px', ''))
    } else {
      height = this.svgWrapperEl.clientHeight
    }
    // 返回
    return { width, height }
  },
  // 获取缩放比例
  scaleValue (svgSize) {
    // 获取画板宽高
    var svgSize = svgSize || this.svgSize()
    // 计算缩放比例，有最大高度则计算缩放比例，没有则按不缩放处理
    return this.option.maxHeight ? this.toFixed(svgSize.height / this.option.maxHeight) : 1
  },
  // 自定义文本框全选内容
  selectText (el) {
    if (document.selection) {
      var range = document.body.createTextRange()
      range.moveToElementText(el)
      range.select()
    } else if (window.getSelection) {
      var range = document.createRange()
      range.selectNodeContents(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  },
  // 生成 uuid
  uuid () {
    // 生成随机字符串
    function S4 () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) }
    // 拼接
    return (S4() + S4() + "" + S4() + "" + S4() + "" + S4() + "" + S4() + S4() + S4())
  },
  // 保留小数点
  toFixed (obj, num) {
    // 保证为数字
    var number = Number(obj || 0)
    // 判断
    if (num === 0) {
      // 保留整数
      return parseInt(number)
    } else {
      // 保留小数点
      return Number(number.toFixed(num || this.toFixedNumber))
    }
  },
  // 将事件坐标进行处理
  handleEventOffset (e) {
    // 坐标数据
    var obj = {
      offsetX: e.offsetX,
      offsetY: e.offsetY,
      movementX: e.offsetX - this.mouseLastOffset.offsetX,
      movementY: e.offsetY - this.mouseLastOffset.offsetY
    }
    // 火狐浏览器处理
    if (isFirefox) {
      obj.offsetX = e.layerX
      obj.offsetY = e.layerY
      obj.movementX = e.layerX - this.mouseLastOffset.layerX
      obj.movementY = e.layerY - this.mouseLastOffset.layerY
    }
    // 记录最后一次坐标
    this.mouseLastOffset = e
    // 返回
    return obj
  },
  // 计算公式（object-fit: cover || contain）
  objectFitSize (cw, ch, w, h, contain = true) {
    // 宽高比例
    var r = w / h
    var cr = cw / ch
    // 当前宽高
    var tw = 0
    var th = 0
    // 模式比例
    var result = contain ? (r > cr) : (r < cr)
    // 比较比例
    if (result) {
      tw = cw
      th = tw / r
    } else {
      th = ch
      tw = th * r
    }
    // 新范围
    return {
      width: tw,
      height: th,
      x: (cw - tw) / 2,
      y: (ch - th) / 2
    }
  },
  // 获取视频(图片)宽高
  viWH (filePath, callback) {
    // 视频地址
    var url = filePath
    // 是否为字符串
    var isString = (typeof url === 'string')
    // 不是字符串
    if (!isString) { url =  URL.createObjectURL(filePath) }
    // 判断文件类型
    if (this.fileIsVideo(filePath)) {
      // 视频
      var video = document.createElement('video')
      // 加载完成
      video.onloadedmetadata = () => {
        // 清除
        if (!isString) { URL.revokeObjectURL(url) }
        // 回调
        if (callback) { callback(video.videoWidth, video.videoHeight) }
      }
      // 配置地址
      video.src = url
      // 加载
      video.load()
    } else if (this.fileIsImage(filePath)) {
      // 图片
      var img = new Image()
      // 配置地址
      img.src = url
      // 加载完成
      img.onload = () => {
        // 清除
        if (!isString) { URL.revokeObjectURL(url) }
        // 回调
        if (callback) { callback(img.width, img.height) }
      };
    } else {
      // 没有找到支持类型
      if (callback) { callback(0, 0) }
    }
  },
  // 是否为图片
  fileIsImage (filePath, isFuzzy = true) {
    // 后缀列表（如果缺少自行补充）
    var types = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff']
    // 返回匹配结果
    return this.fileIsType(filePath, types, isFuzzy)
  },
  // 是否为视频
  fileIsVideo (filePath, isFuzzy = true) {
    // 后缀列表（如果缺少自行补充）
    var types = ['mp4', 'mp3', 'avi', 'wmv', 'mpg', 'mpeg', 'mov', 'rm', 'ram', 'swf', 'flv', 'wma', 'avi', 'rmvb', 'mkv']
    // 返回匹配结果
    return this.fileIsType(filePath, types, isFuzzy)
  },
  // 检查文件后缀是否为存在指定格式列表中（isFuzzy：如果正常匹配失败，是否允许使用模糊匹配二次匹配）
  fileIsType (filePath, types, isFuzzy = true) {
    // 匹配结果
    var isResult = false
    // 路径有值 && 格式列表有值
    if (filePath && filePath.length && types.length) {
      // 文件后缀
      var type = this.fileExtension(filePath)
      // 精确匹配
      isResult = types.indexOf(type.toLowerCase()) !== -1
      // 匹配失败 && 允许模糊匹配
      if (!isResult && isFuzzy) {
        // 匹配是否存在
        types.some(item => {
          // 匹配规则
          var reg = new RegExp(`\\.${item}\\?`, 'i')
          // 匹配结果
          var results = filePath.match(reg) || []
          // 取得结果
          isResult = Boolean(results.length)
          // 返回
          return isResult
        })
      }
    }
    // 返回
    return isResult
  },
  // 获取路径后缀（不带 '.'）
  fileExtension (filePath) {
    // 后缀类型
    var type = ''
    // 路径有值
    if (filePath && filePath.length) {
      // 获取路径中最后一个 '.' 位置
      var index = filePath.lastIndexOf('.')
      // 截取尾部后缀
      type = filePath.substr(index + 1)
    }
    // 返回
    return type
  },
  // 深拷贝 json 对象
  copy (json) {
    // 有数据则进行拷贝
    if (json) { return JSON.parse(JSON.stringify(json)) }
    // 返回空对象
    return {}
  }
}

// 支持全部替换（部分浏览器不自带）
String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2)
}

// 获取浏览器类型
function getBrowserType() {
  // 获取浏览器 userAgent
  var ua = navigator.userAgent

  // 是否为 Opera
  var isOpera = ua.indexOf('Opera') > -1
  // 返回结果
  if (isOpera) { return 'Opera' }

  // 是否为 IE
  var isIE = (ua.indexOf('compatible') > -1) && (ua.indexOf('MSIE') > -1) && !isOpera
  var isIE11 = (ua.indexOf('Trident') > -1) && (ua.indexOf("rv:11.0") > -1)
  // 返回结果
  if (isIE11) { return 'IE11'
  } else if (isIE) {
    // 检测是否匹配
    var re = new RegExp('MSIE (\\d+\\.\\d+);')
    re.test(ua)
    // 获取版本
    var ver = parseFloat(RegExp["$1"])
    // 返回结果
    if (ver == 7) { return 'IE7'
    } else if (ver == 8) { return 'IE8'
    } else if (ver == 9) { return 'IE9'
    } else if (ver == 10) { return 'IE10'
    } else { return "IE" }
  }

  // 是否为 Edge
  var isEdge = ua.indexOf("Edge") > -1
  // 返回结果
  if (isEdge) { return 'Edge' }

  // 是否为 Firefox
  var isFirefox = ua.indexOf("Firefox") > -1
  // 返回结果
  if (isFirefox) { return 'Firefox' }

  // 是否为 Safari
  var isSafari = (ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)
  // 返回结果
  if (isSafari) { return "Safari" }

  // 是否为 Chrome
  var isChrome = (ua.indexOf("Chrome") > -1) && (ua.indexOf("Safari") > -1) && (ua.indexOf("Edge") == -1)
  // 返回结果
  if (isChrome) { return 'Chrome' }

  // 是否为 UC
  var isUC= ua.indexOf("UBrowser") > -1
  // 返回结果
  if (isUC) { return 'UC' }

  // 是否为 QQ
  var isQQ= ua.indexOf("QQBrowser") > -1
  // 返回结果
  if (isQQ) { return 'QQ' }

  // 都不是
  return ''
}