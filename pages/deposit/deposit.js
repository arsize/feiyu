//获取应用实例
const app = getApp();

Page({
  data:{

  },
  showdilog(){
    let option = {
      status: true,
      contentType:'array',
      title: '确认在换电柜000023进行寄存？',
      content: [
        '1.把电池放入空仓内；',
        '2.插好电池插头；',
        '3.关闭仓门；'
      ],
      foot: [{
        text: '取消',
        cb: () => {}
      }, {
        text: '确认',
        cb: () => {
   
        }
      }]
    }
    app.globalData.emitter.emit("dialogstatus", option)
  }
})