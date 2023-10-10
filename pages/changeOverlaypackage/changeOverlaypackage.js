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

    // 获取叠加包列表
    getUserFrequencyCardList() {
        wx.showLoading({
            title: '加载中',
        })
        HTTP({
            url: 'wallet/getAccumulateFrequencyCardList',
            methods: 'get',
            data: {}
        }).then(res => {
            if (res.data) {
                setTimeout(() => {
                    wx.hideLoading()
                }, 1000);
                let frequencyCardList = (res.data && res.data.length > 0) ? res.data : null
                if (frequencyCardList) {
                    frequencyCardList.map(item => {
                        item.monthly = (item.price / item.num).toFixed(2)
                    })
                }
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
                selectItem: "",
                buyComboMoney: 0
            })
        } else {
            this.setData({
                selectItem: item,
                buyComboMoney: item.price
            })
        }

    },
    // 重置
    resetMoney() {
        this.setData({
            buyComboMoney: 0,
        })
    },

    // 去支付
    checkPayFun() {
        if (this.data.selectItem) {
            let name = this.data.selectItem.name
            let activeId = this.data.selectItem.id
            wx.navigateTo({
                url: '/pages/payforend/payforend?money=' + this.data.buyComboMoney + '&type=0' + '&name=' + name + '&activeId=' + activeId + "&monthly=true"
            })
        } else {
            wx.showToast({
                title: '请选择套餐叠加包',
                icon: "none"
            })
        }
    }
})