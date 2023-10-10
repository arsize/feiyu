
const app = getApp();
Page({
    data: {
        srcurl: ''
    },
    onLoad: function (options) {
        let token = wx.getStorageSync("logindata").appToken
        let organizationId = wx.getStorageSync("logindata").organizationId
        let adObject = wx.getStorageSync('adObject')
        let randomtime = new Date().getTime()
        let baseUrl = adObject.jumpConnection
        console.log("baseUrl",baseUrl);
        let srcurl = `${baseUrl}?token=${token}&randomtime=${randomtime}&organizationId=${organizationId}`
        console.log('h5外链地址：', srcurl)
        this.setData({
            srcurl: srcurl
        })
    },
})