import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
//获取应用实例
const app = getApp();
const bluetooth = require("../../utils/blueTooth/bluetooth");
//Page Object
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        charingOrderNo: '',
        seconds: "",
        type: '',
        chargingAllTime: "",
        timer: '',
        timer2: '',
        flag: false
    },
    onLoad: function (options) {
        let charingOrderNo = options.charingOrderNo;
        let type = options.type
        this.setData({
            charingOrderNo: charingOrderNo,
            type: type
        });
    },
    // myCombo
    gotomyCombo() {
        wx.redirectTo({
            url: '/pages/myCombo/myCombo',
        })
    },
    gohome() {
        wx.reLaunch({
            url: '/pages/index/index',
        })
    },
    onShow() {
        this.getOrderDetail();
        let isBlueConnected = wx.getStorageSync('isBlueConnected')
        if (isBlueConnected == 'ison') {
            this.setData({
                flag: true
            })
        } else {
            this.setData({
                flag: false
            })
        }
    },
    onHide: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: "",
            });
        }
        if (this.data.timer2) {
            clearInterval(this.data.timer2);
            this.setData({
                timer2: "",
            });
        }

    },
    onUnload: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.setData({
                timer: "",
            });
        }
        if (this.data.timer2) {
            clearInterval(this.data.timer2);
            this.setData({
                timer2: "",
            });
        }
    },
    getOrderDetail() {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: this.data.charingOrderNo,
                type: this.data.type
            }
        }).then(res => {
            let time = formats(
                "YYYY.MM.dd hh:mm",
                res.data.chargingRecordDetail.chargingStartTime
            );
            let seconds =
                res.data.chargingRecordDetail.validTime -
                parseInt(
                    (new Date().getTime() - res.data.chargingRecordDetail.ctime) / 1000
                );
            this.setData({
                detailInfo: res.data.chargingRecordDetail,
                seconds: seconds > 0 ? seconds : 0,
                time: time,
            });
            this.changeTimeToTime(res.data.chargingRecordDetail.chargingStartTime);
            let timer = setInterval(() => {
                console.log("继续轮询...");
                this.settimeCharge(this.data.charingOrderNo);
            }, 1000);
            this.setData({
                timer: timer,
            });
        })
    },

    settimeCharge(charingOrderNo) {
        let that = this
        if (this.data.seconds <= 0) {
            if (this.data.detailInfo.chargingStatus == 0) {
                this.confirmmsg();
                return;
            } else {
                clearInterval(this.data.timer);
            }
        }
        let temps = this.data.seconds - 1;
        this.setData({
            seconds: temps > 0 ? temps : 0,
        });
        HTTP({
            url: 'app/ctl/chargingResult',
            methods: 'get',
            data: {
                charingOrderNo: charingOrderNo
            }
        }).then(res => {
            // 充电中-跳转
            if (res.data.status == 2) {
                this.getSuccessOrder();
            } else if (res.data.status == -1) {
                clearInterval(this.data.timer);
                this.setData({
                    seconds: 0
                });
                wx.reLaunch({
                    url: `/pages/completed/completed?orderId=${that.data.charingOrderNo}`,
                });

            }
        })
    },
    getSuccessOrder() {
        let that = this
        clearInterval(this.data.timer);
        this.setData({
            seconds: 0,
        });
        wx.reLaunch({
            url: `/pages/completed/completed?orderId=${that.data.charingOrderNo}`,
        });


    },

    cancelCharge2() {
        let that = this
        let option = {
            status: true,
            content: "确定要取消充电吗",
            foot: [{
                text: '点错了',
                cb: () => {
                }
            }, {
                text: '确认取消',
                cb: () => {
                    let isBlueConnected = wx.getStorageSync('isBlueConnected')
                    clearInterval(that.data.timer);
                    if (isBlueConnected == 'ison') {
                        // 蓝牙取消
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
                                        wx.reLaunch({
                                            url: `/pages/completed/completed?orderId=${that.data.charingOrderNo}`,
                                        });
                                    }, err => {
                                        wx.hideLoading();
                                    })
                                });
                            } else {
                                wx.hideLoading();
                            }
                        })

                    } else {
                        HTTP({
                            url: "app/ctl/stopCharging",
                            methods: 'put',
                            data: {
                                orderNo: that.data.charingOrderNo
                            }
                        }).then(res => {
                            wx.reLaunch({
                                url: "/pages/index/index"
                            });
                        },
                            err => {
                                wx.reLaunch({
                                    url: "/pages/index/index"
                                });
                            })
                    }

                }
            }]

        }
        app.globalData.emitter.emit("dialogstatus", option)


    },
    changeTimeToTime(time) {
        let difftime = new Date().getTime() - time;
        let tempTime = 0;
        let timer2 = setInterval(() => {
            tempTime += 1000;
            this.formatDuring(difftime + tempTime);
        }, 1000);
        this.setData({
            timer2: timer2,
        });
    },
    formatDuring(mss) {
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((mss % (1000 * 60)) / 1000);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        let chargingAllTime = hours + ":" + minutes + ":" + seconds;
        this.setData({
            chargingAllTime: chargingAllTime,
        });
    },
    gotoliaojie() {
        wx.navigateTo({
            url: '/pages/exchangeserver/exchangeserver',
        })
    }
});