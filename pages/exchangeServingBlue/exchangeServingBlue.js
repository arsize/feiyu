import { HTTP } from "../../utils/server";
const bluetooth = require("../../utils/blueTooth/bluetooth");
const app = getApp();
//Page Object
Page({
    data: {
        exchangeOrderNo: '',
        seconds: '',
        timer: "",
        exchangeRecordDetail: "",
        baseUrlImg: app.globalData.baseUrlImg
    },
    //options(Object)
    onLoad: function (options) {
        let exchangeOrderNo = options.exchangeOrderNo;
        this.setData({
            exchangeOrderNo: exchangeOrderNo
        });
    },
    onShow() {
        let exchangeOrderNo = this.data.exchangeOrderNo;
        this.getOrderDetail(exchangeOrderNo);
    },
    onHide() {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: ""
            });
        }
    },
    callphone() {
        wx.makePhoneCall({
            phoneNumber: wx.getStorageSync("kfMobile")
        });
    },
    onUnload: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: ""
            });
        }
    },
    openBlueConnect() {
        var that = this;
        let ordersearch = wx.getStorageSync('ordersearch')
        if (ordersearch) {
            bluetooth.sentExchangeSearch(ordersearch, "cmdChargeServingSearch");
        }
        app.globalData.emitter.once("cabinetConnected", (res) => {
            let temp = JSON.parse(res);
            if (temp.action_type == 4) {
                let exchangeOrderNo = this.data.exchangeOrderNo;
                let req = {
                    data: JSON.parse(res),
                    dev_id: that.data.exchangeRecordDetail.cabinetDeviceId,
                    type: 22,
                };
                clearInterval(that.data.timer);
                that.setData({
                    timer: "",
                });
                // 给后台同步柜子信息
                that.pushCabinetInfo(req).then((response) => {
                    if (response) {
                        if (temp.result == 8) {
                            console.log('break')
                        }
                        else if (temp.result == 0 || temp.result == 1) {
                            wx.redirectTo({
                                url:
                                    "/pages/exchangeCompleted/exchangeCompleted?orderId=" +
                                    exchangeOrderNo,
                            });
                        } else {
                            wx.redirectTo({
                                url:
                                    "/pages/exchangeEndBlue/exchangeEndBlue?orderId=" +
                                    exchangeOrderNo
                            });
                        }
                    }
                });
            }
        });
    },
    // 给后台上传柜子信息
    pushCabinetInfo(data) {
        return new Promise((resolv, reject) => {
            HTTP({
                url: 'app/ctl/uploadCabinetInfo',
                methods: 'post',
                data: data
            }).then(res => {
                if (res.code == 200) {
                    resolv(true);
                } else {
                    reject(false);
                }
            })
        });
    },
    getOrderDetail(exchangeOrderNo) {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: exchangeOrderNo,
                type: 0
            }
        }).then(res => {
            this.setData({
                exchangeRecordDetail: res.data.exchangeRecordDetail
            })
            if (res.data.exchangeRecordDetail.exchangeResult == 0 || res.data.exchangeRecordDetail.exchangeResult == 1) {
                clearInterval(this.data.timer);
                wx.reLaunch({
                    url: `/pages/exchangeCompleted/exchangeCompleted?orderId=${exchangeOrderNo}`
                });
                return;
            }
            let seconds =
                res.data.exchangeRecordDetail.validTime -
                parseInt(
                    (new Date().getTime() - res.data.exchangeRecordDetail.ctime) / 1000
                );
            this.setData({
                seconds: seconds > 0 ? seconds : 0
            });
            let exchangeFailResultDesc =
                res.data.exchangeRecordDetail.exchangeFailResultDesc;
            this.openBlueConnect()
            let timer = setInterval(() => {
                this.settimeCharge(exchangeOrderNo, exchangeFailResultDesc);
            }, 1000);
            this.setData({
                timer: timer
            });
        })
    },

    // 轮询换电状态
    settimeCharge(exchangeOrderNo, exchangeFailResultDesc) {
        if (this.data.seconds <= 0) {
            clearInterval(this.data.timer);
            wx.redirectTo({
                url: `/pages/exchangeCompleted/exchangeCompleted?orderId=${exchangeOrderNo}`
            })
            return;
        }
        let temps = this.data.seconds - 1;
        this.setData({
            seconds: temps
        });
        HTTP({
            url: "app/ctl/exchangeResult",
            methods: 'get',
            data: {
                exchangeOrderNo: exchangeOrderNo
            }
        }).then(res => {
            // 跳转
            if (res.data.stopNextStatus) {
                if (res.data.status == 1) {
                    clearInterval(this.data.timer);
                    wx.redirectTo({
                        url: `/pages/exchangeCompleted/exchangeCompleted?orderId=${exchangeOrderNo}`
                    });
                } else {
                    clearInterval(this.data.timer);
                    wx.redirectTo({
                        url: '/pages/exchangeEndBlue/exchangeEndBlue?orderId=' + exchangeOrderNo
                    })
                }
            }
        })
    }
});