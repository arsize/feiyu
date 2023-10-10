import {
    HTTP
} from "../../utils/server";
//获取应用实例
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext()
let animation = wx.createAnimation({});
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        flash: "off",
        animation: '',
        type: '',
        imgposition: -420,
        timer: null,
        istrue: false
    },
    onLoad: function (options) {
        let type = options.type
        this.setData({
            type: type
        })
    },
    // 打开手电筒
    openlight() {
        this.setData({
            flash: this.data.flash == 'on' ? 'off' : 'on'
        })
    },
    goback() {
        wx.navigateBack({
            delta: 1
        })
    },
    onHide() {
        if (this.data.timer) {
            clearInterval(this.data.timer)
        }

    },
    onUnload() {
        if (this.data.timer) {
            clearInterval(this.data.timer)
        }
    },
    // 初始化完成
    initdone() {
        this.setData({
            istrue: true
        })
    },
    donghua() {
        let that = this
        let time = setInterval(() => {
            if (that.data.imgposition >= 460) {
                that.setData({
                    imgposition: -460
                })
            } else {
                let temp = that.data.imgposition + 10
                that.setData({
                    imgposition: temp
                })
            }

        }, 50);
        this.setData({
            timer: time
        })
    },
    error() {
        wx.showToast({
            title: '摄像头未授权',
            icon: 'none'
        });
    },
    // 输入电柜id
    inputcabinetid() {
        wx.redirectTo({
            url: '/pages/transitInputTake/transitInputTake',
        })
    },
    // scan
    scansuccess(e) {
        let that = this
        this.setData({
            fangx: false
        })
        let qrcode = e.detail.result
        let cabinetId = "";
        if (qrcode.indexOf("deviceUid") != -1) {
            cabinetId = qrcode.split("deviceUid=")[1];
        } else {
            cabinetId = qrcode;
        }
        let selectCabinet = {
            cabinetid: cabinetId,
        };
        wx.setStorageSync("takeCabinet", selectCabinet);
        that.getCabinetInfo()
    },
    throttle() {
        let nowDate = new Date().getTime();
        if (nowDate - this.data.lastDate > 1000) {
            this.setData({
                lastDate: nowDate,
            });
            return true;
        } else {
            this.setData({
                lastDate: nowDate,
            });
            return false;
        }
    },
    // 获取机柜信息
    getCabinetInfo() {
        let selectCabinet = wx.getStorageSync("takeCabinet")
        HTTP({
            url: "cabinet/getCabinetBatteryInfo",
            methods: 'get',
            data: {
                cabinetCode: selectCabinet.cabinetid,
            }
        }).then(res => {
            if (res.code == 200) {
                if (res.data.powerOff && selectCabinet.cabinettype == 1) {
                    // 断电
                    let option = {
                        status: true,
                        content: "该电柜已停电暂不提供服务，请前往其他电柜",
                        foot: [{
                            text: '我知道了',
                            cb: () => {

                            }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                    return
                }
                if (res.data.cabinetOnline) {
                    // 柜子在线
                    // 换电
                    wx.setStorageSync('takeData', res.data)
                    wx.redirectTo({
                        url: '/pages/takePages/takePages'
                    })
                } else {
                    // 柜子离线
                    let option = {
                        status: true,
                        content: "该电柜已离线，请前往其他电柜",
                        foot: [{
                            text: '我知道了',
                            cb: () => {

                            }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                    return

                }
            }
        }, err => {
            if (err.code == 7008) {
                let option = {
                    status: true,
                    content: "该电柜已离线，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6023) {
                let option = {
                    status: true,
                    content: "此电柜维护中，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6013) {
                let option = {
                    status: true,
                    content: "此电柜暂无可用电池，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6020) {
                let option = {
                    status: true,
                    content: "此电柜不支持充电服务，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6019) {
                let option = {
                    status: true,
                    content: "暂无可用充电口，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6004) {
                let option = {
                    status: true,
                    content: "暂无此电柜信息，请扫描其他二维码"
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6007) {
                let option = {
                    status: true,
                    content: "电柜维护中，暂不可提供服务，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 2008) {
                let option = {
                    status: true,
                    content: "因各城市的电池/套餐不通用，你需要开通此城市的换电服务才可在此机柜操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '联系客服',
                        cb: () => {
                            wx.makePhoneCall({
                                phoneNumber: wx.getStorageSync("kfMobile"),
                                success: function (res) {
                                    console.log('call success')

                                },
                                fail: function (err) {
                                    console.log('call fail')

                                }
                            });
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 6015) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "电柜服务中，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6010) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "充电口繁忙，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6017) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "机柜升级中，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 40014) {
                let option = {
                    status: true,
                    content: "你的电池型号与柜内电池不匹配，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6006) {
                // 暂无空仓
                let option = {
                    status: true,
                    content: "暂无空仓，请前往其他机柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6008) {
                // 暂无满电仓
                let option = {
                    status: true,
                    content: "暂无可用电池，请前往其他机柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => {}
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        })
    },
});