import { HTTP } from "../../utils/server";

const app = getApp();
//Page Object
Page({
    data: {
        exchangeOrderNo: '',
        seconds: '',
        timer: "",
        exchangeRecordDetail: "",
        returnBox: '',
        borrowBox: '',
        baseUrlImg: app.globalData.baseUrlImg
    },
    //options(Object)
    onLoad: function (options) {
        let exchangeOrderNo = options.exchangeOrderNo;
        console.log('exchangeOrderNo', exchangeOrderNo)
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
            //100超时
            clearInterval(this.data.timer);
            wx.redirectTo({
                url: `/pages/exchangeEnd/exchangeEnd?orderId=${exchangeOrderNo}&errCode=${'100'}`
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
            this.setData({
                returnBox: res.data.returnBox,
                borrowBox: res.data.borrowBox
            })
            if (res.data.stopNextStatus) {
                if (res.data.status == 1) {
                    clearInterval(this.data.timer);
                    wx.redirectTo({
                        url: `/pages/exchangeCompleted/exchangeCompleted?orderId=${exchangeOrderNo}`
                    });
                } else {
                    clearInterval(this.data.timer);
                    // wx.redirectTo({
                    //     url: '/pages/exchangeEnd/exchangeEnd?cabinetid=' + this.data.exchangeRecordDetail.cabinetDid + '&code=' + res.data.status
                    // })
                    wx.redirectTo({
                        url: '/pages/exchangeEnd/exchangeEnd?orderId=' + exchangeOrderNo
                    })
                }
            }
        })
    }
});