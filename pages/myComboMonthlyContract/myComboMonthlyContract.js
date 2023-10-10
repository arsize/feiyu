import {
    HTTP
} from "../../utils/server";
import {
    formats
} from "../../utils/util";
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        buyComboList: [],
        isfold: true,
        selectItem: "",
        buyComboMoney: 0,//应缴金额
        remainingTimes: 0//套餐剩余次数
    },
    onShow() {
        this.getUserFrequencyCardList()
    },
    viewMore(e) {
        let type = e.currentTarget.dataset.type;
        if (type == 1) {
            this.setData({
                isfold: false,
            })
        } else {
            this.setData({
                isfold: true,
            })
        }
    },

    // 获取包月套餐列表
    getUserFrequencyCardList() {
        HTTP({
            url: 'wallet/getFrequencyCardList',
            methods: 'get',
            data: {},
            loading: true,
        }).then(res => {
            if (res.data) {
                let frequencyCardList = res.data.frequencyCardList
                frequencyCardList.map(item => {
                    item.monthly = (item.price / item.num).toFixed(2)
                })
                this.setData({
                    buyComboList: frequencyCardList
                })
            }
        })
    },
    // 套餐点击
    selectcombo(e) {
        let item = e.currentTarget.dataset.item
        if (item.id == this.data.selectItem.id) {
            this.setData({
                selectItem: ""
            })
            this.resetMoney()
        } else {
            this.setData({
                selectItem: item,
                remainingTimes:item.num,
                buyComboMoney:item.price
            })
            console.log(item)
            this.calculateMoney(item)
            this.countFrequencyNum(item)
        }

    },
    // 重置
    resetMoney() {
        this.setData({
            buyComboMoney: 0,
            remainingTimes: 0
        })
    },
    // 获取当月剩余天数
    getMonthAfterDay() {
        let diff = Number((this.getMonthDay() - new Date().getDate()))
        console.log('当月剩余天数', diff)
        return diff
    },
    // 获取当月总天数
    getMonthDay() {
        var date = new Date();
        date.setDate(28)
        date.setMonth(date.getMonth() + 1);
        let lastDay = date.setDate(0);
        let day = new Date(lastDay).getDate()
        console.log('当月总天数', day)
        return Number(day)
    },
    // 计算价格
    calculateMoney(item) {
        let buyComboMoney = ((item.price / item.num) * this.countFrequencyNum(item)).toFixed(2)
        this.setData({
            buyComboMoney: buyComboMoney
        })
    },

    // 计算套餐剩余次数
    countFrequencyNum(item) {
        let remainingTimes = Math.ceil((item.num / this.getMonthDay()) * this.getMonthAfterDay())
        this.setData({
            remainingTimes: remainingTimes
        })
        return remainingTimes
    },

    // 去支付
    checkPayFun() {
        if (this.data.selectItem) {
            let name = this.data.selectItem.name
            let activeId = this.data.selectItem.id
            wx.navigateTo({
                url: '/pages/payforend/payforend?money=' + this.data.buyComboMoney + '&type=0' + '&name=' + name + '&activeId=' + activeId + '&monthly=true'
            })
        } else {
            wx.showToast({
                title: "请选择套餐",
                icon: 'none'
            });
        }
    }
})