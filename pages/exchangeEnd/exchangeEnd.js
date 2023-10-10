//Page Object
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
//获取应用实例
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        cabinetid: '',
        errCode: '',
        times: 20,
        timer: '',
        orderId: '',
        exchangeRecordDetail: '',
        isreopen: true,
        isgetbattery: true
    },
    onLoad: function (options) {
        let orderId = options.orderId
        let errCode = options.errCode
        this.setData({
            orderId: orderId,
            errCode: errCode
        })
    },
    onShow() {
        if (this.data.orderId) {
            this.getExchangeResult()
            this.getDetailInfo()
        } else {
            this.servering()
        }

    },
    getExchangeResult() {
        HTTP({
            url: 'app/ctl/exchangeResult',
            methods: 'get',
            data: {
                exchangeOrderNo: this.data.orderId
            }
        }).then(res => {
            if (this.data.errCode != 100) {
                this.setData({
                    errCode: res.data.status
                })
            }

            this.servering()
        })
    },
    getDetailInfo() {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: this.data.orderId,
                type: 0
            }
        }).then(res => {
            this.setData({
                exchangeRecordDetail: res.data.exchangeRecordDetail
            })
        })
    },
    servering() {
        let that = this
        let timer = setInterval(() => {
            that.changeTimes()
        }, 1000);
        this.setData({
            timer: timer
        })


    },
    changeTimes() {
        let that = this
        if (that.data.times < 1) {
            clearInterval(that.data.timer)
            return
        }
        let temp = this.data.times - 1
        this.setData({
            times: temp
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
    // 重新换电
    reexchange() {
        let that = this
        that.gofororder()

    },
    gophone() {
        wx.makePhoneCall({
            phoneNumber: wx.getStorageSync("kfMobile")
        });
    },

    // 重开仓门
    restartopen() {
        HTTP({
            url: 'cabinet/reopenTheDoor',
            methods: "get",
            data: {
                exchangeOrderNo: this.data.orderId
            }
        }).then(res => {
            wx.showToast({
                title: '操作成功'
            })
            this.setData({
                isreopen: false
            })
        })

    },
    gohome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },

    // 取吞并电池
    getbattery() {
        HTTP({
            url: 'cabinet/unlockBattery',
            methods: 'get',
            data: {
                order: this.data.orderId
            }
        }).then(res => {
            wx.showToast({
                title: "成功"
            })
            this.setData({
                errCode: 'getbattery',
                isgetbattery: false
            })
        })

    },
    gofororder() {
        let organizationId = wx.getStorageSync("selectorganId");
        HTTP({
            url: 'app/ctl/checkBeforeExchange',
            methods: 'get',
            data: {
                areaOrganizationId: organizationId
            }
        }).then(res => {
            wx.redirectTo({
                url:
                    "/pages/exchangeinfo/exchangeinfo"
            });
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
            if (err.code == 7008) {
                let option = {
                    status: true,
                    content: "电柜已离线，请稍后再试",
                    foot: [{
                        text: '知道了',
                        cb: () => {
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        })

    },
});