//Page Object
//获取应用实例
const bluetooth = require("../../utils/blueTooth/bluetooth");
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        connectStatus: 'noconnect',
        cabinetDeviceId: '',
        cabinetid: '',
        type: '',
        back: false
    },
    onLoad: function (options) {
        let cabinetDeviceId = options.cabinetDeviceId
        let back = options.back
        this.setData({
            cabinetDeviceId: cabinetDeviceId,
            back: back
        })

    },
    onShow() {
        let selectCabinet = wx.getStorageSync("selectCabinet")
        this.setData({
            cabinetid: selectCabinet.cabinetid,
            type: selectCabinet.cabinettype
        })
    },
    startconnect() {
        let that = this
        wx.showLoading({
            title: '配对中',
        })
        let cabinetDeviceId = this.data.cabinetDeviceId;
        let bluthName = "Wondware" + cabinetDeviceId.slice(4, 10);
        wx.setStorageSync("bluthName", bluthName);
        bluetooth.bluetoothInit(app, bluthName, 'loading');
        app.globalData.emitter.removeAllListeners("cabinetReporting")
        app.globalData.emitter.on("cabinetReporting", function (res) {
            console.log('监听到', res)
            if (res == "isconnecting") {
                // 蓝牙正在连接
                that.setData({
                    connectStatus: 'isconnecting'
                })
                wx.hideLoading()
                wx.setStorageSync('isBlueConnected', "")
            } else if (res == "isoff") {
                // 蓝牙未开启
                that.setData({
                    connectStatus: 'isoff'
                })
                wx.hideLoading()
                wx.setStorageSync('isBlueConnected', "isoff")

            } else if (res == "ison") {
                // 蓝牙已连接
                that.setData({
                    connectStatus: 'ison'
                })
                wx.hideLoading()
                wx.showToast({
                    title: '配对成功',
                    image: '',
                    duration: 1500,
                    mask: false
                });
                wx.setStorageSync('isBlueConnected', "ison")
                if (that.data.back) {
                    wx.navigateBack({
                        delta: 1
                    })
                } else {
                    if (that.data.type == 0) {
                        // 换电
                        wx.redirectTo({
                            url: "/pages/exchangeinfoBlue/exchangeinfoBlue"
                        })
                    } else if (that.data.type == 1) {
                        // 充电
                        wx.redirectTo({
                            url: "/pages/chargeinfoBlue/chargeinfoBlue"
                        })
                    }
                }
            } else if (res == "isbreak") {
                // 蓝牙连接失败
                that.setData({
                    connectStatus: 'isbreak'
                })
                wx.setStorageSync('isBlueConnected', "isbreak")
                let option = {
                    status: true,
                    title: '蓝牙配对失败',
                    content: "配对失败，请稍后再试或前往其他电柜",
                    foot: [{
                        text: '取消配对',
                        cb: () => {
                            bluetooth.offBlueLine();
                            wx.setStorageSync('isBlueConnected', "")
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }, {
                        text: '重试',
                        cb: () => {
                            that.startconnect()
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            } else if (res == "isfound") {
                // 蓝牙已找到，正在连接
                that.setData({
                    connectStatus: 'isfound'
                })
                wx.setStorageSync('isBlueConnected', "isfound")
                wx.hideLoading()
            }
        });
    },
    gotoblueinfopage() {
        wx.navigateTo({
            url: "/pages/blueInfoPage/blueInfoPage"
        })
    },
    gobackhome() {
        wx.navigateBack({
            delta: 1
        });
    },
    // 未开启蓝牙，取消蓝牙配对
    cancelMatch() {
        bluetooth.offBlueLine();
        // app.globalData.isBlueConnected = "";
        wx.setStorageSync('isBlueConnected', "")
        wx.navigateBack({
            delta: 1
        });
    }
});