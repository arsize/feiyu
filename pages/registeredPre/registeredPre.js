const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        appName: ''
    },
    onLoad: function (options) {
        let appName = wx.getStorageSync('logindata').appName
        this.setData({
            appName: appName
        })
    },
    // 获取用户信息
    getUserInfo(e) {
        if (e.detail.errMsg == "getUserInfo:ok") {
            wx.setStorageSync("userInfo", e.detail);
            wx.redirectTo({
                url: '/pages/registered/registered?logout=true'
            })
        }
    },
})