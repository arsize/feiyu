const app = getApp();
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    faqList: [{
        title: "关于我们",
        url: '/pages/myAboutUs/myAboutUs',
      }, {
        title: "用户协议",
        url: '/pages/myAgreement/myAgreement',
      },
      {
        title: "绿色回收金协议",
        url: '/pages/myDepositAgreement/myDepositAgreement',
      },
      {
        title: "充值协议",
        url: '/pages/myTopupAgreement/myTopupAgreement',
      },
      {
        title: "隐私政策",
        url: '/pages/myPolicy/myPolicy',
      },
    ]
  },

  onLoad: function (options) {},

  onShow: function () {},
  showFun(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `${item.url}`
    })

  },

  callcustomer() {
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("kfMobile")
    });
  },
  joinPhone() {
    wx.navigateTo({
      url: `/pages/myModPhone/myModPhone`,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  }
});