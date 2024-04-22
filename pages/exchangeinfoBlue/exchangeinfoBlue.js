import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
const bluetooth = require("../../utils/blueTooth/bluetooth");
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        cabinetType: 1,
        exchangeFee: '',
        exchangeinfolog: false,
        exchangelogChecked: false,
        background: ['demo-text-1'],
        cabinetinfo: '',
        cabinetBoxInfoList: '',
        takeEffectTime: '',
        loseEffectTime: '',
        logshow: '',
        exchangeJTCount: '',
        logshowNum: 1,
        exchangeJT: '',
        prompt: [],
        btnloading: true,
        recommendStatus: '',
        userFrequencyCardRecord: ''//换电套餐信息
    },
    onHide() {
        if (wx.getStorageSync("sceneUid")) {
            wx.removeStorageSync("sceneUid")
        }
    },
    onShow() {
        this.getExchangeJT()
        let temp = wx.getStorageSync("exchangelogChecked")
        let logshowNum = wx.getStorageSync("logshowNum")
        this.setData({
            exchangelogChecked: temp,
            logshowNum: logshowNum
        })
        if (!temp) {
            this.setData({
                exchangeinfolog: true
            })
        } else {
            this.setData({
                exchangeinfolog: false
            })
        }
        this.getCabinetInfo()
        let option = {
            status: true,
            content: "蓝牙充换电服务中，为保障正常服务请保持屏幕常亮",
            foot: [{
                text: '我知道了',
                cb: () => {
                }
            }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
    },
    // 获取换电阶梯收费
    getExchangeJT() {
        HTTP({
            url: "app/ctl/getFeeExchange",
            methods: 'get',
            data: {}
        }).then(res => {
            if (res.data) {
                this.setData({
                    exchangeJT: res.data.feeExchangeList
                })
            }

        })
    },
    handlePromt(promt) {
        return promt ? promt.split("#") : ''
    },
    getCabinetInfo() {
        let selectCabinet = wx.getStorageSync("selectCabinet")
        HTTP({
            url: "cabinet/getCabinetInfoByScan",
            methods: 'post',
            data: {
                cabinetId: selectCabinet.cabinetid,
                type: selectCabinet.cabinettype
            }
        }).then(res => {
            let cabinetinfo = res.data
            if (wx.getStorageSync("sceneUid")) {
                wx.removeStorageSync("sceneUid")
            }
            console.log('blue cabinetinfo.userExchangeCount', cabinetinfo.userExchangeCount)
            this.setData({
                cabinetinfo: cabinetinfo,
                cabinetBoxInfoList: cabinetinfo.cabinetBoxInfoList,
                exChangeBatteryFee: cabinetinfo.exChangeBatteryFee,
                userFrequencyCardRecord: cabinetinfo.userFrequencyCardRecord,
                exchangeJTCount: cabinetinfo.userExchangeCount,
                prompt: this.handlePromt(cabinetinfo.prompt),
                recommendStatus: cabinetinfo.recommendStatus
            })
            if (this.data.userFrequencyCardRecord) {
                let takeEffectTime = formats('yyyy-MM-dd', this.data.userFrequencyCardRecord.takeEffectTime)
                let loseEffectTime = formats('yyyy-MM-dd', this.data.userFrequencyCardRecord.loseEffectTime)
                this.setData({
                    takeEffectTime: takeEffectTime,
                    loseEffectTime: loseEffectTime
                })
            }

        }, err => {
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
                    content: "暂无此电柜信息，请扫描其他二维码",
                    foot: [{
                        text: '我知道了',
                        cb: () => {
                            wx.navigateBack({
                                delta: 1
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
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6006) {
                // 暂无空仓
                let option = {
                    status: true,
                    content: "暂无空仓，请前往其他电柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap'
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
                    content: "暂无满电仓，请前往其他机柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 40014) {
                // 暂无满电电池或空仓
                let option = {
                    status: true,
                    content: "你的电池型号与柜内电池不匹配，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myMap/myMap'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }

        })
    },
    gotoadvertisement() {
        wx.setStorageSync("comboType", 1);
        wx.navigateTo({
            url: '/pages/myCombo/myCombo'
        })
    },
    openInfo() {
        this.setData({
            exchangeinfolog: true
        })
    },
    gotobalance() {
        wx.setStorageSync("walletMoney", this.data.cabinetinfo.money ? this.data.cabinetinfo.money : 0)
        wx.navigateTo({
            url: '/pages/myGoldDeposits/myGoldDeposits'
        })
    },
    notishi() {
        this.setData({
            logshow: false
        })
        if (this.data.logshow) {
            wx.setStorageSync("logshow", false)
        } else {
            wx.setStorageSync("logshow", true)
        }
    },
    closedialog() {
        this.setData({
            logshow: false
        })
        this.gofororder()
    },
    gofororderBeforDialog() {
        let logshow = wx.getStorageSync("logshow")
        let temp = Number(this.data.logshowNum) + 1
        this.setData({
            logshowNum: temp
        })
        wx.setStorageSync('logshowNum', temp)
        if (logshow) {
            this.setData({
                logshow: false
            })
        } else {
            this.setData({
                logshow: true
            })
        }
        if (!this.data.logshow || this.data.logshowNum > 3) {
            this.gofororder()
        }

    },
    gofororder() {
        let that = this
        let organizationId = wx.getStorageSync("selectorganId");
        wx.showLoading({
            title: "请稍后",
        });
        this.setData({
            btnloading: false
        })
        HTTP({
            url: 'app/ctl/checkBeforeExchange',
            methods: 'get',
            data: {
                areaOrganizationId: organizationId
            }
        }).then(res => {
            HTTP({
                url: 'app/ctl/getExchangeCommandV2',
                methods: 'get'
            }).then(res => {
                let data = res.data;
                console.log('换电蓝牙指令',data)
                bluetooth.sentExchangeOrder(data.data, "cmdExchangeOrder");
                app.globalData.emitter.once("cmdExchangeOrder", (response) => {
                    if (response) {
                        //数据发送结束
                        HTTP({
                            url: 'app/ctl/blueExchangeCharging',
                            methods: 'post',
                            loading: true,
                            data: {
                                orderNo: data.orderNo,
                                cabinetdid: that.data.cabinetinfo.cabinetDid
                            }

                        }).then(res => {
                            this.setData({
                                btnloading: true
                            })
                            wx.hideLoading();
                            wx.redirectTo({
                                url:
                                    "/pages/exchangeServingBlue/exchangeServingBlue?exchangeOrderNo=" +
                                    data.orderNo
                            });
                            that.setData({
                                canBtn: true,
                            });
                        }, err => {
                            this.setData({
                                btnloading: true
                            })
                        })
                    }
                });
                app.globalData.emitter.once("writeBLECharacteristicValue", (res) => {
                    wx.navigateTo({
                        url: '/pages/blueconnectloading/blueconnectloading?cabinetDeviceId=' + that.data.cabinetinfo.cabinetDid + '&back=true'
                    })
                })

            }, err => {
                wx.hideLoading();
                // 钱包已欠费
                if (err.code == 9007) {
                    let option = {
                        status: true,
                        closeicon: true,
                        content: `账户已欠费，请充值后再使用`,
                        foot: [{
                            text: '立即充值',
                            cb: () => {
                                wx.navigateTo({
                                    url: '/pages/myGoldDeposits/myGoldDeposits'
                                })
                            }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                }
            })
        }, err => {
            if (err.code == 1021) {
                let data = err.data
                let start = formats('MM月dd日', data.startTime)
                let end = formats('MM月dd日', data.endTime)
                let option = {
                    status: true,
                    content: `你正在休假中（${start}-${end}），暂不可进行换电`,
                    foot: [{
                        text: '我知道了',
                        cb: () => {}
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 40008) {
                let option = {
                    status: true,
                    content: "你的电池已被吞并，请取出吞并电池后再进行换电服务",
                    foot: [{
                        text: '稍后再说',
                        cb: () => {
                        }
                    }, {
                        text: '查看详情',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myBattery/myBattery'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            // 换电钱包余额不足
            if (err.code == 9003) {
                // 钱包余额不够
                let option = {
                    status: true,
                    closeicon: true,
                    content: `余额不足，请充值后使用`,
                    foot: [{
                        text: '立即充值',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myGoldDeposits/myGoldDeposits'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 20007) {
                let option = {
                    status: true,
                    content: "您有押金正在退回,无法进行换电操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => { }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
        })

    },
    onClosechargeInfolog() {
        this.setData({
            exchangeinfolog: false
        })
    },
    exchangelogChange(e) {
        let temp = e.detail.value
        wx.setStorageSync("exchangelogChecked", temp)
    },
    openInfo() {
        this.setData({
            exchangeinfolog: true
        })
    },
    onClosechargeInfolog() {
        this.setData({
            exchangeinfolog: false
        })
    },
});