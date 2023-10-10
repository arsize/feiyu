import { HTTP } from "../../utils/server";

const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        cabinetType: 1,
        balancestatus: false,
        chargeinfolog: false,
        chargelogChecked: false,
        chargingFee: '',
        chargingTime: '',
        selectTime: -1,
        tempIds: "",
        selectChargPort: '',
        canBtn: false,
        cabinetBoxPortInfoList: [],
        cabinetid: '',
        totalMoney: 0,
    },
    onHide() {
        if (wx.getStorageSync("sceneUid")) {
            wx.removeStorageSync("sceneUid")
        }
    },
    onShow() {
        let temp = wx.getStorageSync("chargelogChecked")
        this.setData({
            chargelogChecked: temp
        })
        if (!temp) {
            this.setData({
                chargeinfolog: true
            })
        } else {
            this.setData({
                chargeinfolog: false
            })
        }
        this.setData({
            balancestatus: false
        })
        this.getCabinetInfo()
        this.getChargeTime()
        this.getModuleId()

    },
    getCabinetInfo() {
        let selectCabinet = wx.getStorageSync("selectCabinet")
        this.setData({
            cabinetid: selectCabinet.cabinetid
        })
        HTTP({
            url: "cabinet/getCabinetInfoByScan",
            methods: 'post',
            loading: true,
            data: {
                cabinetId: selectCabinet.cabinetid,
                type: selectCabinet.cabinettype
            }
        }).then(res => {
            this.setData({
                cabinetinfo: res.data,
                cabinetBoxPortInfoList: res.data.cabinetBoxPortInfoList
            })
            if (wx.getStorageSync("sceneUid")) {
                wx.removeStorageSync("sceneUid")
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
            if (err.code == 6010) {
                let option = {
                    status: true,
                    content: "充电口繁忙，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {
                            that.getCabinetInfo()
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 40014) {
                let option = {
                    status: true,
                    content: "柜中可用电池类型不匹配",
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

        })
    },
    getChargeTime() {
        HTTP({
            url: 'fee/chargeStandard',
            methods: 'get',
            data: {
                areaOrganizationId: wx.getStorageSync("selectorganId")
            }
        }).then(res => {
            let chargingFee = res.data.chargingFee
            let chargingTime = res.data.chargingFee ? res.data.chargingFee.chargingTime : []
            this.setData({
                chargingFee: chargingFee,
                chargingTime: chargingTime,
            })
            if (chargingTime.length > 0) {
                if (this.data.selectTime) {
                    this.setData({
                        selectTime: this.data.selectTime
                    })
                } else {
                    this.setData({
                        selectTime: -1
                    })
                }

            }

        })
    },
    // 选择充电口
    selectChargPort(e) {
        let item = e.currentTarget.dataset.set
        this.setData({
            selectChargPort: item,
            canBtn: true
        })
    },
    // 选择充电时间
    selectTime(e) {
        let item = e.currentTarget.dataset.item
        let money = 0
        if (item != -1) {
            money =
                ((item * 60) / this.data.chargingFee.unit) *
                this.data.chargingFee.moneyPerHours;
        }
        this.setData({
            selectTime: item,
            totalMoney: money
        })
    },

    //判断余额是否充足
    judgYue() {
        let money = this.data.cabinetinfo.money
        let topMoney = ''
        if (this.data.cabinetinfo.userResearch && !this.data.cabinetinfo.userResearch.hasItBeenTried) {
            // 有免费充电机会
            topMoney = 0
        } else {
            // 没有免费充电机会
            if (this.data.selectTime == -1) {
                // 选择封顶
                topMoney = this.data.chargingFee.topMoney
            } else {
                // 选择其他
                if (this.data.totalMoney > this.data.chargingFee.topMoney) {
                    // 计算值大于封顶值
                    topMoney = this.data.chargingFee.topMoney
                } else {
                    // 计算值小于封顶值
                    topMoney = this.data.totalMoney
                }

            }
        }
        if (money < topMoney) {
            this.setData({
                balancestatus: true,
                canBtn: true
            })
            return false
        } else {
            return true
        }
    },


    // 获取模板id
    getModuleId() {
        HTTP({
            url: 'app/wx/getSubscribeTemplate',
            methods: 'get',
            data: {
                openId: wx.getStorageSync("logindata").openId,
                appId: app.globalData.appId,
                subType: 1,
                accountUid: wx.getStorageSync("logindata").uid
            }
        }).then(info => {
            if (info.data.length > 0) {
                this.setData({
                    tempIds: info.data[0],
                });
            }
        })
    },
    // 未选择充电口时：开始充电
    checkgofororder() {
        if (!this.data.selectChargPort) {
            wx.showToast({
                title: "请选择充电口",
                icon: "none",
                duration: 2000,
            });
            return
        }

    },
    gofororder() {
        let that = this
        this.setData({
            canBtn: false
        })
        if (
            this.data.tempIds &&
            typeof wx.requestSubscribeMessage === "function"
        ) {
            if (!this.judgYue()) {
                // 余额不足
                return
            }
            wx.requestSubscribeMessage({
                tmplIds: [`${that.data.tempIds}`],
                success(res) {
                    HTTP({
                        url: 'app/ctl/startCharging',
                        methods: 'post',
                        loading: true,
                        data: {
                            cabinetdid: that.data.cabinetid,
                            chargingPortId: that.data.selectChargPort,
                            chargingTime: that.data.selectTime
                        }
                    }).then(res => {
                        wx.redirectTo({
                            url:
                                "/pages/chargeServing/chargeServing?charingOrderNo=" +
                                res.data.orderNo
                        });
                    }, err => {
                        that.setData({
                            canBtn: true
                        })
                        if (err.code == 9003) {
                            // 充电钱包余额不足
                            that.setData({
                                balancestatus: true,
                            })
                        }
                        if (err.code == 6018) {
                            let option = {
                                status: true,
                                content: "充电口被禁用，请稍后再试",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.getCabinetInfo()
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }

                        if (err.code == 6010) {
                            let option = {
                                status: true,
                                content: "充电口繁忙，请稍后再试",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.getCabinetInfo()
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        if (err.code == 7009) {
                            let option = {
                                status: true,
                                content: "设备、uqKey不匹配",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.setData({
                                            canBtn: true
                                        })
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        // 蓝牙假在线情况无法下单——>跳转蓝牙流程
                        if (err.code == 7008) {
                            // 设备离线
                            wx.redirectTo({
                                url: '/pages/blueconnectloading/blueconnectloading?cabinetDeviceId=' + that.data.cabinetinfo.cabinetDeviceId
                            })

                        }

                    })
                },
                fail(err) {
                    HTTP({
                        url: 'app/ctl/startCharging',
                        methods: 'post',
                        loading: true,
                        data: {
                            cabinetdid: that.data.cabinetid,
                            chargingPortId: that.data.selectChargPort,
                            chargingTime: that.data.selectTime
                        }
                    }).then(res => {
                        wx.redirectTo({
                            url:
                                "/pages/chargeServing/chargeServing?charingOrderNo=" +
                                res.data.orderNo
                        });
                    }, err => {
                        that.setData({
                            canBtn: true
                        })
                        if (err.code == 9003) {
                            // 充电钱包余额不足
                            that.setData({
                                balancestatus: true,
                                canBtn: true
                            })
                        }
                        if (err.code == 6018) {
                            let option = {
                                status: true,
                                content: "充电口被禁用，请稍后再试",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.getCabinetInfo()
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        if (err.code == 7009) {
                            let option = {
                                status: true,
                                content: "设备、uqKey不匹配",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.setData({
                                            canBtn: true
                                        })
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        if (err.code == 6010) {
                            let option = {
                                status: true,
                                content: "充电口繁忙，请稍后再试",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {
                                        that.getCabinetInfo()
                                    }
                                }]

                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        // 蓝牙假在线情况无法下单——>跳转蓝牙流程
                        if (err.code == 7008) {
                            // 设备离线
                            wx.redirectTo({
                                url: '/pages/blueconnectloading/blueconnectloading?cabinetDeviceId=' + that.data.cabinetinfo.cabinetDeviceId
                            })

                        }

                    })
                }
            })
        } else {
            HTTP({
                url: 'app/ctl/startCharging',
                methods: 'post',
                data: {
                    cabinetdid: that.data.cabinetid,
                    chargingPortId: that.data.selectChargPort,
                    chargingTime: that.data.selectTime
                }
            }).then(res => {
                wx.redirectTo({
                    url:
                        "/pages/chargeServing/chargeServing?charingOrderNo=" +
                        res.data.orderNo
                });
            }, err => {
                that.setData({
                    canBtn: true
                })
                if (err.code == 9003) {
                    // 充电钱包余额不足
                    that.setData({
                        balancestatus: true,
                        canBtn: true
                    })
                }
                if (err.code == 7009) {
                    let option = {
                        status: true,
                        content: "设备、uqKey不匹配",
                        foot: [{
                            text: '我知道了',
                            cb: () => {
                                that.setData({
                                    canBtn: true
                                })
                            }
                        }]

                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                }
                if (err.code == 6018) {
                    let option = {
                        status: true,
                        content: "充电口被禁用，请稍后再试",
                        foot: [{
                            text: '我知道了',
                            cb: () => {
                                that.getCabinetInfo()
                            }
                        }]

                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                }
                if (err.code == 6010) {
                    let option = {
                        status: true,
                        content: "充电口繁忙，请稍后再试",
                        foot: [{
                            text: '我知道了',
                            cb: () => {
                                that.getCabinetInfo()
                            }
                        }]

                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                }
                if (err.code == 7008) {
                    // 设备离线
                    wx.redirectTo({
                        url: '/pages/blueconnectloading/blueconnectloading?cabinetDeviceId=' + that.data.cabinetinfo.cabinetDeviceId
                    })

                }

            })

        }
    },
    openInfo() {
        this.setData({
            chargeinfolog: true
        })
    },
    closedialogconfirm() {
        this.setData({
            balancestatus: false
        })
    },
    onClosechargeInfolog() {
        this.setData({
            chargeinfolog: false
        })
    },
    chargelogChange(e) {
        let temp = e.detail.value
        wx.setStorageSync("chargelogChecked", temp)

    },
    gotobalance() {
        this.setData({
            balancestatus: false
        })
        wx.setStorageSync("walletMoney", this.data.cabinetinfo.money ? this.data.cabinetinfo.money : 0)
        wx.navigateTo({
            url: '/pages/myGoldDeposits/myGoldDeposits'
        })

    },
    gotoresearch() {
        wx.navigateTo({
            url: '/pages/survey/survey'
        })
    },
    closeMask() {
        if (this.data.balancestatus) {
            this.setData({
                balancestatus: false
            })
        }
    }
});