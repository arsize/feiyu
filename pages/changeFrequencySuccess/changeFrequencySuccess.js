const app = getApp();

Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg
    },
    succFun() {
        wx.navigateBack({
            delta: 2
        })

    }
})