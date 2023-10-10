import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        active: 0,
        selectindex: null,
        couponList: [],
        pageSize: 20,
        current: 1,
        couponStatus: 0,
        totalPages: ""
    },
    onLoad() {
        this.getData()
    },
    getData() {
        HTTP({
            url: "wallet/getUserCouponList",
            methods: "get",
            data: {
                status: this.data.couponStatus,
                pageSize: this.data.pageSize,
                currentPage: this.data.current
            }
        }).then(res => {
            let listData = this.data.couponList.concat(res.data.records);

            listData.forEach(item => {
                if (item.getTime) {
                    item.getTime = formats("yyyy-MM-dd", item.getTime);
                }
                if (item.expiredTime) {
                    console.log('dd')
                    let now = new Date().getTime()
                    // 小于1天
                    if (item.expiredTime - now < 86400000) {
                        item.rollTime = this.getRemainderTime(item.expiredTime)
                        console.log('rollTime', item.rollTime)
                    }
                    item.expiredTime = formats("yyyy-MM-dd", item.expiredTime);
                }
            });
            this.setData({
                couponList: listData,
                totalPages: res.data.pages
            });
            console.log('couponList', this.data.couponList)

        })
    },
    // 时间戳之差
    getRemainderTime(datatime) {
        var s1 = datatime,
            s2 = new Date().getTime()
        let runTime = parseInt((s1 - s2) / 1000)
        let hour = Math.floor(runTime / 3600)
        runTime = runTime % 3600;
        let minute = Math.floor(runTime / 60);
        return hour + ' 小时 ' + minute + ' 分'
    },
    reset() {
        this.setData({
            couponList: [],
            current: 1,
            totalPages: ''
        })
    },
    changetabs(e) {
        let title = e.detail.title
        switch (title) {
            case "可使用":
                this.setData({
                    couponStatus: 0
                })
                break;
            case "已使用":
                this.setData({
                    couponStatus: 2
                })
                break
            case "已过期":
                this.setData({
                    couponStatus: 1
                })
                break
            default:
                break;
        }
        this.reset()
        this.getData()
    },
    showdetail(e) {
        let index = e.currentTarget.dataset.set
        if (this.data.selectindex === index) {
            this.setData({
                selectindex: null
            })
        } else {
            this.setData({
                selectindex: index
            })
        }
    },
    onReachBottom() {
        let current = this.data.current;
        if (current < this.data.totalPages) {
            this.setData({
                current: this.data.current + 1
            });
            this.getData();
        } else {
            wx.showToast({
                title: "没有更多了",
                icon: "none"
            });
        }
    },
    // 去使用
    gotouse() {
        let batteryDepositOrderStatus = wx.getStorageSync("batteryDepositOrderStatus")
        let type = 2
        if (batteryDepositOrderStatus == 1 || batteryDepositOrderStatus == 4) {
            wx.setStorageSync("comboType", 2);
            wx.navigateTo({
                url: `/pages/myCombo/myCombo?currType=${type}`
            });
        } else {
            wx.setStorageSync("comboType", 6);
            wx.navigateTo({
                url: `/pages/myCombo/myCombo?currType=${type}`
            });
        }
    }

})