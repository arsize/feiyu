//Page Object
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";

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
        let that = this
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
                clearInterval(that.data.timer);
                that.setData({
                    seconds: 0
                });
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
                    clearInterval(that.data.timer);
                    HTTP({
                        url: "app/ctl/stopCharging",
                        methods: 'put',
                        data: {
                            orderNo: this.data.charingOrderNo
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
            }]

        }
        app.globalData.emitter.emit("dialogstatus", option)
    }
});