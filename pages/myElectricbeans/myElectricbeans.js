
const app = getApp();
Page({
  data: {
    srcurl: ''
  },
  onLoad: function (options) {

  },
  onShow() {
    let token = wx.getStorageSync("logindata").appToken
    let randomtime = new Date().getTime()
    let baseUrl = app.globalData.h5baseUrl
    let srcurl = `${baseUrl}powerlongback/electricbeans/#/?token=${token}&randomtime=${randomtime}`
    console.log('srcurl', srcurl)
    this.setData({
      srcurl: srcurl
    })
    this.onLoad()
  }

})