//Page Object
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
//获取应用实例
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        chargingRecordDetail: "",
        costCharingTime: '',
        chargingStartTime: '',
        chargingEndTime: ''
    },
    onLoad: function (options) {
        let orderId = options.orderId;
        this.setData({
            orderId: orderId
        });
        this.getOrderDetail();

    },
    copy(e) {
        wx.setClipboardData({
            data: e.currentTarget.dataset.set,
            success: function (res) {
                wx.showToast({
                    title: '复制成功',
                });
            }
        });
    },
    getOrderDetail() {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: this.data.orderId,
                type: 1
            }
        }).then(res => {
            let chargingStartTime = formats(
                "YYYY.MM.dd hh:mm",
                res.data.chargingRecordDetail.chargingStartTime
            );
            let chargingEndTime = formats(
                "YYYY.MM.dd hh:mm",
                res.data.chargingRecordDetail.chargingEndTime
            );
            this.setData({
                chargingRecordDetail: res.data.chargingRecordDetail,
                chargingStartTime: chargingStartTime,
                chargingEndTime: chargingEndTime,
                costCharingTime: Math.ceil(res.data.chargingRecordDetail.costCharingTime / 60)
            });
        })
    },
    gotoback() {
        wx.reLaunch({
            url: '/pages/index/index'
        })
    }
});