//获取应用实例
const app = getApp();

Page({
  data: {
    num:0
  },
  onLoad: function (options) {
    let num = options.num
    this.setData({
      num: num
    })
},
  goback() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})