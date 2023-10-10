// pages/myOpenSuccess/myOpenSuccess.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    logindata: wx.getStorageSync("logindata"),
    isShow: false,
    seconds: 5,
    timer: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      logindata: wx.getStorageSync("logindata")
    })
    this.data.timer = setInterval(() => {
      this.settimeCharge();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  settimeCharge() {
    let that = this;

    if (this.data.seconds <= 0) {
      this.setData({
        seconds: 0
      });
      clearInterval(this.data.timer);
      this.succFun();
    } else {
      this.setData({
        seconds: this.data.seconds - 1,
      });
    }

  },
  succFun() {
    wx.redirectTo({
      url: '/pages/myBattery/myBattery',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})