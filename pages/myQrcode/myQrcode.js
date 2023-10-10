// pages/myQrcode/myQrcode.
var QRCode = require('../../utils/weapp-qrcode.js')
var qrcode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myCenterInfo: wx.getStorageSync("myCenterInfo"),
    logindata: wx.getStorageSync("logindata"),
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      logindata: wx.getStorageSync("logindata")
    })
    wx.showLoading({
      title: "加载中",
      mask: true
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.qrcodeFun();
  },
  qrcodeFun() {
    qrcode = new QRCode('canvas', {
      // usingIn: this,
      text: wx.getStorageSync("myCenterInfo").userUid,
      // image: 'http://gaastest.wondware.com/rechargeMinipImg/noBatteryIcon.png',
      width: 200,
      height: 200,
      // colorDark: "#1a6eff",
      colorDark: "#000",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
    setTimeout(() => {
      this.setData({
        isShow: true
      })
      wx.hideLoading();
    }, 300);
  },

  // 长按保存
  saveQrFun: function() {
    console.log('save')
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          qrcode.exportImage(function(path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
            })
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})