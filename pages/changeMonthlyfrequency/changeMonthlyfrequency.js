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
        alreadyChangeFrequencyCard: [],
        frequencyCardList: [],
        selectItem: ''
    },
    onShow() {
        this.getChangeFrequencyCardList()
    },

    getChangeFrequencyCardList() {
        HTTP({
            url: "wallet/getChangeFrequencyCardList",
            methods: 'get',
            data: {}
        }).then(res => {
            if (res.data.alreadyChangeFrequencyCard) {
                res.data.alreadyChangeFrequencyCard.monthly = (res.data.alreadyChangeFrequencyCard.frequencyCardPrice / res.data.alreadyChangeFrequencyCard.frequencyCardNum).toFixed(2)
            }
            let frequencyCardList = res.data.frequencyCardList ? res.data.frequencyCardList : []
            frequencyCardList.map(item => {
                item.monthly = (item.price / item.num).toFixed(2)
            })
            this.setData({
                alreadyChangeFrequencyCard: res.data.alreadyChangeFrequencyCard,
                frequencyCardList: res.data.frequencyCardList
            })
        })
    },
    // 套餐点击
    selectcombo(e) {
        let item = e.currentTarget.dataset.item
        if (item.id == this.data.selectItem.id) {
            this.setData({
                selectItem: ""
            })
        } else {
            this.setData({
                selectItem: item
            })
        }
    },
    // 套餐确认变更弹窗
    confirmChange() {
        console.log('this.data.selectItem', this.data.selectItem)
        if (this.data.selectItem) {
            let option = {
                status: true,
                content: "套餐变更将于下个月生效，确认要变更吗？",
                foot: [{
                    text: '再想想',
                    cb: () => {
                    }
                },
                {
                    text: '确认',
                    cb: () => {
                        this.userChangeFrequencyCard()
                    }
                }]

            }
            app.globalData.emitter.emit("dialogstatus", option)
        } else {
            wx.showToast({
                title: '请选择可变更套餐',
                icon: 'none'
            })
        }

    },
    userChangeFrequencyCard() {
        HTTP({
            url: "wallet/userChangeFrequencyCard",
            methods: 'get',
            data: {
                frequencyCardId: this.data.selectItem.id
            }
        }).then(res => {
            if (res.code == 200) {
                wx.redirectTo({
                    url: '/pages/changeFrequencySuccess/changeFrequencySuccess',
                })
            }

        })
    }


})