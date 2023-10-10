// pages/myDeposit/myDeposit.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    isRequest: true,
    depositType: -2,
    depositMoney: 0.00,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    // depositType  绿色回收金状态：-1（未缴纳）、0（已经缴纳）、1（正在退回绿色回收金）、2（绿色回收金已退回）
    if (options.depositType) {
      this.setData({
        depositType: options.depositType,
        depositMoney: Number(options.depositMoney).toFixed(2)
      })
    }
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

  btmBtnFun() {
    wx.redirectTo({
      url: '/pages/myBattery/myBattery'
    })

  },
  joinPage() {
    wx.navigateTo({
      url: '/pages/myDepositAgreement/myDepositAgreement',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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