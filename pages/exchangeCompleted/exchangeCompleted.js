//Page Object
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
//获取应用实例
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        orderId: "",
        exchangeRecordDetail: "",
        ctime: '',
        money: ''
    },
    //options(Object)
    onLoad: function (options) {
        let orderId = options.orderId;
        this.setData({
            orderId: orderId
        });
        this.getDetailInfo();
    },
    getDetailInfo() {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                type: 0,
                orderNo: this.data.orderId
            }
        }).then(res => {
            let ctime = formats(
                "YYYY.MM.dd hh:mm",
                res.data.exchangeRecordDetail.ctime
            );
            this.setData({
                exchangeRecordDetail: res.data.exchangeRecordDetail,
                ctime: ctime
            });
        })
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
    gohome() {
        wx.reLaunch({
            url: "/pages/index/index"
        });
    },
    gotoshouqu() {
        wx.redirectTo({
            url: "/pages/myElectricbeans/myElectricbeans",
        });
    }
});