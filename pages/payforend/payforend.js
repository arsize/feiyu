const app = getApp();
import { formats } from "../../utils/util";
import {
    HTTP
} from "../../utils/server";
import {
    globalData
} from "../../utils/global";
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        payshow: false,
        walletMoney: '',
        principalMoney: 0,
        additionalMoney: 0,
        selectedIndex: 'wx',
        showyouhuiquan: true,
        money: "",
        type: '',
        name: '',
        activeId: '',
        cardsActions: [],
        selectCounpIndex: '0',
        selectCounpItem: '',
        isPay: false,
        depositId: "",
        depositMoney: '',
        activeMoney: '',
        monthly: false
    },
    onLoad(options) {
        console.log(options)
        let money = options.money
        let type = options.type
        let name = options.name
        let activeId = options.activeId
        let depositId = options.depositId
        let depositMoney = options.depositMoney
        let activeMoney = options.activeMoney
        let monthly = options.monthly
        this.setData({
            monthly: monthly,
            money: money,
            type: type,
            name: name,
            activeId: activeId,
            depositId: depositId,
            depositMoney: depositMoney,
            activeMoney: activeMoney,
        })
        if (this.data.money < 0) {
            this.setData({
                selectedIndex: 'ye'
            })
        }
        this.getYouhuiCard()

    },
    onShow() {
        this.getWall()
    },
    // 获取钱包余额
    getWall() {
        HTTP({
            url: 'wallet/getUserWalletInfo',
            methods: 'get',
            data: {},
            loading: true,
        }).then(res => {
            let objData = res.data;
            this.setData({
                walletMoney: objData.money,
                principalMoney: objData.principalMoney,
                additionalMoney: objData.additionalMoney
            })
        },
            (err) => { }
        );
    },
    getYouhuiCard() {
        let money = this.data.money
        HTTP({
            url: "wallet/getUserCouponListByPrice",
            methods: 'get',
            data: {
                type: this.data.type,
                price: money
            },
            loading: true,
        }).then(res => {
            let cardsActions = []
            if (res.data && res.data.length > 0) {
                cardsActions = res.data
                cardsActions.push({
                    name: "暂不使用优惠券",
                    id: ''
                })
                cardsActions.map(item => {
                    if (item.getTime) {
                        item.getTime = formats("yyyy.MM.dd", item.getTime);
                    }
                    if (item.expiredTime) {
                        item.expiredTime = formats("yyyy.MM.dd", item.expiredTime);
                    }
                })
                this.setData({
                    selectCounpItem: cardsActions[0]
                })
            }
            this.setData({
                cardsActions: cardsActions
            })
        })
    },
    // 选择优惠券
    selectCounp(e) {
        let index = e.currentTarget.dataset.index
        let item = e.currentTarget.dataset.item
        if (index == (this.data.cardsActions.length - 1)) {
            this.setData({
                selectCounpIndex: index,
                payshow: false,
                selectCounpItem: ""
            })
        } else {
            this.setData({
                selectCounpIndex: index,
                payshow: false,
                selectCounpItem: item
            })
        }

    },
    // 选择余额支付
    selectyu() {
        this.setData({
            selectedIndex: 'ye',
        })
        // 判断本金是否大于支付金额
        this.checkbenjin()
    },
    checkbenjin() {
        if (this.data.principalMoney >= (this.data.money - (this.data.cardsActions[0] ? this.data.cardsActions[0].discountedPrices : 0)).toFixed(2)) {
            this.setData({
                showyouhuiquan: true
            })
        } else {
            this.setData({
                showyouhuiquan: false
            })
        }
    },
    // 选择微信支付
    selectwx() {
        this.setData({
            selectedIndex: 'wx',
            showyouhuiquan: true
        })
    },
    selectCard() {
        this.setData({
            payshow: true
        })
    },
    onSelect() {
        this.setData({
            payshow: false
        })
    },
    onClose() {
        this.setData({
            payshow: false
        })
    },
    okPayFun() {
        this.setData({
            isPay: !this.data.isPay,
        });
    },
    // 购买套餐
    wxPayGetFrequency() {
        let that = this
        let params = {
            openId: wx.getStorageSync("logindata").openId,
            frequencyCardId: this.data.activeId,
            wxPay: true,
            couponId: this.data.selectCounpItem.id
        };
        wx.showLoading({
            title: "支付中",
            mask: true,
        });
        HTTP({
            url: 'pay/payFrequencyCard',
            methods: 'post',
            data: params,
            loading: true,
        }).then(res => {
            let chooseWXPayInfo = res.data;
            wx.requestPayment({
                nonceStr: chooseWXPayInfo.nonceStr,
                package: chooseWXPayInfo.packageInfo,
                signType: chooseWXPayInfo.signType,
                timeStamp: chooseWXPayInfo.timeStamp,
                paySign: chooseWXPayInfo.paySign,
                success: function (res) {
                    wx.showToast({
                        title: "支付成功",
                        icon: "success",
                        duration: 2000,
                        mask: true,
                    });
                    setTimeout(() => {
                        wx.setStorageSync("comboType", 2);
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000);

                },
                fail: function (res) {
                    that.setData({
                        iswxPay: false,
                    });
                    wx.showToast({
                        title: "支付失败",
                        image: "/images/icon_fail.png",
                        duration: 2000,
                        mask: true,
                    });
                },
            });
        }, (err) => {
            if (err.code == 3008) {
                wx.showToast({
                    title: err.msg,
                    icon: "none",
                    duration: 2000,
                    mask: true
                });

            } else if (err.code == 2008) {
                wx.showToast({
                    title: err.msg,
                    icon: "none",
                    duration: 2000,
                    mask: true
                });

            } else if (err.code == 20003) {
                let option = {
                    status: true,
                    content: "请先缴纳电池绿色回收金",
                    foot: [{
                        text: '去支付',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myPayDeposit/myPayDeposit',
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        })
    },
    // 微信购买押金+套餐
    wxPayDespFreq() {
        let that = this;
        let params = {
            openId: wx.getStorageSync("logindata").openId,
            organizationId: wx.getStorageSync("logindata").organizationId,
            depositId: this.data.depositId,
        };
        if (this.data.activeId) {
            params.frequencyCardId = this.data.activeId
        }
        if (this.data.selectCounpItem) {
            params.couponId = this.data.selectCounpItem.id
        }
        wx.showLoading({
            title: "支付中",
            mask: true
        });
        HTTP({
            url: 'pay/payDeposit',
            methods: 'put',
            data: params,
            loading: false,
        }).then(res => {
            let chooseWXPayInfo = res.data;
            console.log(res)
            if(res.code == 200 && res.data == null){
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                    mask: true
                })
                setTimeout(() => {
                    wx.redirectTo({
                        url: `/pages/myOpenSuccess/myOpenSuccess`,
                    });
                }, 1000);
                return;
            }
            // if(!that.data.money){
            //     wx.redirectTo({
            //         url: `/pages/myOpenSuccess/myOpenSuccess`,
            //     });
            //     return;
            // }
            wx.requestPayment({
                'nonceStr': chooseWXPayInfo.nonceStr,
                'package': chooseWXPayInfo.packageInfo,
                'signType': chooseWXPayInfo.signType,
                'timeStamp': chooseWXPayInfo.timeStamp,
                'paySign': chooseWXPayInfo.paySign,
                'success': function (res) {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2000,
                        mask: true
                    })
                    setTimeout(() => {
                        wx.redirectTo({
                            url: `/pages/myOpenSuccess/myOpenSuccess`,
                        });
                    }, 1000);

                },
                'fail': function (res) {
                    wx.showToast({
                        title: '支付失败',
                        image: '/images/icon_fail.png',
                        duration: 2000,
                        mask: true
                    })
                }
            })

        })
    },
    // 支付按钮
    togoPay() {
        console.log('this.data.selectedIndex', this.data.selectedIndex)
        if (this.data.selectedIndex == "wx") {
            if (this.data.depositId) {
                // 微信支付:购买押金+套餐
                this.wxPayDespFreq()
            } else {
                // 微信支付:购买套餐
                this.wxPayGetFrequency()
            }
        } else if (this.data.selectedIndex == 'ye') {
            // 余额支付
            this.setData({
                isPay: true
            })
        } else {
            wx.showToast({
                title: '请选择支付方式',
                icon: 'none'
            })
            return
        }
    },
    // 余额支付确认
    balanceFun() {
        let that = this;
        that.setData({
            isPay: false,
        });
        let params = {
            openId: wx.getStorageSync("logindata").openId,
            frequencyCardId: this.data.activeId,
            wxPay: false,
        };
        if (this.data.showyouhuiquan) {
            params.couponId = this.data.selectCounpItem.id
        }
        HTTP({
            url: 'pay/payFrequencyCard',
            methods: 'post',
            data: params,
            loading: true,
        }).then(res => {
            wx.showToast({
                title: "支付成功",
                icon: "success",
                duration: 2000,
                mask: true,
            });
            setTimeout(() => {
                console.log('that.data.monthly', that.data.monthly)
                if (that.data.monthly) {
                    wx.setStorageSync("comboType", 2);
                    wx.navigateBack({
                        delta: 2
                    })
                } else {
                    wx.setStorageSync("comboType", 2);
                    wx.navigateBack({
                        delta: 1
                    })
                }
            }, 1000);

        }, err => {

            if (err.code == 3008) {
                wx.showToast({
                    title: err.msg,
                    icon: "none",
                    duration: 2000,
                    mask: true
                });

            } else if (err.code == 2008) {
                wx.showToast({
                    title: err.msg,
                    icon: "none",
                    duration: 2000,
                    mask: true
                });

            }
            else if (err.code == 20003) {
                let option = {
                    status: true,
                    content: "请先缴纳电池绿色回收金",
                    foot: [{
                        text: '去支付',
                        cb: () => {
                            wx.redirectTo({
                                url: '/pages/myPayDeposit/myPayDeposit',
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            else if (err.code == 9003) {
                let option = {
                    status: true,
                    content: "钱包余额不足",
                    foot: [{
                        text: '我知道了',
                        cb: () => {
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        });
    },

})