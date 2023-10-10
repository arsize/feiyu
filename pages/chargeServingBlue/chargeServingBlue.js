//Page Object
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
const bluetooth = require("../../utils/blueTooth/bluetooth");
//获取应用实例
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        charingOrderNo: "",
        cabinetdid: "",
        chargingRecordDetail: "",
        chargingStartTime: "",
        seconds: "",
        chargingstatus: ''
    },
    onLoad: function (options) {
        let charingOrderNo = options.charingOrderNo;
        this.setData({
            charingOrderNo: charingOrderNo,
        });
    },
    onShow() {
        let charingOrderNo = this.data.charingOrderNo;
        this.getServing(charingOrderNo);
    },
    onHide() {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: ""
            });
        }
    },
    onUnload: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: ""
            });
        }
    },
    openBlueConnect(charingOrderNo, chargingPortId) {
        var that = this;
        let ordersearch = wx.getStorageSync('ordersearch')
        if (ordersearch) {
            bluetooth.sentChargSearch(ordersearch, "cmdChargeServingSearch");
        }
        app.globalData.emitter.once("cabinetConnected", (res) => {
            let temp = JSON.parse(res);
            if (temp.action_type == 8) {
                let req = {
                    data: JSON.parse(res),
                    dev_id: that.data.chargingRecordDetail.cabinetDeviceId,
                    type: 22,
                };
                clearInterval(this.data.timer);
                that.setData({
                    timer: "",
                });
                // 给后台同步柜子信息
                that.pushCabinetInfo(req).then((response) => {
                    if (response) {
                        if (temp.result == 0) {
                            wx.redirectTo({
                                url:
                                    "/pages/chargeOrderDetail/chargeOrderDetail?charingOrderNo=" +
                                    this.data.charingOrderNo +
                                    "&&type=1",
                            });
                        } else if (temp.result == 5) {
                            wx.redirectTo({
                                url: `/pages/completed/completed?orderId=${this.data.charingOrderNo}`,
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
                    console.log("给后台上传了柜子信息");
                    console.log("data", data);
                    resolv(true);
                } else {
                    reject(false);
                }
            })
        });
    },

    getServing(charingOrderNo) {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: charingOrderNo,
                type: 1
            }
        }).then(res => {
            let time = formats(
                "YYYY.MM.dd hh:mm",
                res.data.chargingRecordDetail.chargingStartTime
            );
            let seconds =
                res.data.chargingRecordDetail.validTime -
                parseInt(
                    (new Date().getTime() -
                        res.data.chargingRecordDetail.chargingStartTime) /
                    1000
                );
            this.setData({
                chargingRecordDetail: res.data.chargingRecordDetail,
                chargingStartTime: time,
                seconds: seconds > 0 ? seconds : 0
            });
            console.log('在这里')
            this.openBlueConnect(charingOrderNo, res.data.chargingRecordDetail.boxProtSn)

            // 开启定时器
            let timer = setInterval(() => {
                console.log("正在轮询...");
                this.settimeCharge(charingOrderNo);
            }, 1000);
            this.setData({
                timer: timer
            });
        })
    },
    // 轮询充电状态
    settimeCharge(charingOrderNo) {
        if (this.data.seconds <= 0) {
            clearInterval(that.data.timer);
            let option = {
                status: true,
                content: "充电器未连接，已取消充电",
                title: '取消充电',
                foot: [{
                    text: '我知道了',
                    cb: () => {
                        wx.reLaunch({
                            url: "/pages/index/index"
                        });
                    }
                }]

            }
            app.globalData.emitter.emit("dialogstatus", option)
            return;
        }
        let temps = this.data.seconds - 1;
        this.setData({
            seconds: temps > 0 ? temps : 0
        });
        HTTP({
            url: 'app/ctl/chargingResult',
            methods: 'get',
            data: {
                charingOrderNo: charingOrderNo
            }
        }).then(res => {
            if (res.data.status == 1) {
                clearInterval(this.data.timer);
                wx.redirectTo({
                    url: "/pages/chargeOrderDetail/chargeOrderDetail?charingOrderNo=" +
                        charingOrderNo + "&type=" + 1
                });
            } else if (res.data.status == -1) {
                clearInterval(this.data.timer);
                this.setData({
                    isCurrentEnd: true,
                    seconds: 0
                });
            } else if (res.data.status == 2) {
                clearInterval(this.data.timer);
                this.setData({
                    seconds: 0
                });
                wx.reLaunch({
                    url: `/pages/completed/completed?orderId=${charingOrderNo}`
                });
            } else {
                console.log("未连接上");
            }
        })
    },

    // 取消充电
    cancelCharge2() {
        let that = this
        let option = {
            status: true,
            content: "确定要取消充电吗",
            title: '取消充电',
            foot: [{
                text: '点错了',
                cb: () => {

                }
            }, {
                text: '确认取消',
                cb: () => {
                    wx.showLoading({
                        title: '请稍后',
                    })
                    HTTP({
                        url: "app/ctl/getCecalChargingCommandV2",
                        methods: "get",
                        data: {
                            orderNo: that.data.charingOrderNo
                        }
                    }).then(res => {
                        if (res.code == 200) {
                            let data = res.data;
                            console.log('即将发送 取消充电指令', res)
                            bluetooth.sentCancelOrder(data, "cmdCancelCharging");
                            app.globalData.emitter.once("cmdCancelCharging", (res) => {
                                HTTP({
                                    url: 'app/ctl/blueStopCharging',
                                    methods: 'put',
                                    data: {
                                        orderNo: that.data.charingOrderNo
                                    }
                                }).then(data => {
                                    clearInterval(this.data.timer);
                                    wx.hideLoading();
                                    wx.showToast({
                                        title: "成功",
                                        icon: "success",
                                    });
                                    wx.navigateTo({
                                        url: `/pages/completed/completed?orderId=${that.data.chargingRecordDetail.orderNo}`,
                                    });
                                }, err => {
                                    console.log('errblueStopCharging', err)
                                    wx.hideLoading();
                                })
                            });
                        } else {
                            wx.hideLoading();
                        }
                    })


                }
            }]

        }
        app.globalData.emitter.emit("dialogstatus", option)
    }
});