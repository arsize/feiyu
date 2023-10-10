// pages/noNetwork/noNetwork.js
Page({
    data: {},


    onLoad: function (options) {

    },

    onShow: function () {
        this.getNet();
    },

    getNet() {
        wx.getNetworkType({
            success: function (res) {
                let networkType = res.networkType;
                if (networkType == "none" || networkType == "unknown") {
                    wx.showToast({
                        title: '网络故障，请稍后再试',
                        icon: "none"
                    })
                } else {
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                }
            }
        });
    },

})
