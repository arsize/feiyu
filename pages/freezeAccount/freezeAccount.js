const app = getApp();
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg
  },
  //options(Object)
  onLoad: function(options) {
    wx.hideHomeButton({
      success: res => {}
    });
  },
  gotohome() {
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("kfMobile")
    });
  }
});
