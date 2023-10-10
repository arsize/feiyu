// pages/myGoldDeposits/myGoldDeposits.js
import {
  positiveNum,
  checkDigit,
  getBLen,
  pointNum
} from "../../utils/util";
import {
  HTTP
} from "../../utils/server";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    rechargeMoney: "",
    rechargeMoneyCurr: "",
    baseUrlImg: app.globalData.baseUrlImg,
    balanceMoneyStart: wx.getStorageSync("walletMoney") ?
      Number(wx.getStorageSync("walletMoney")) : 0,
    balanceMoney: wx.getStorageSync("walletMoney") ?
      Number(wx.getStorageSync("walletMoney")).toFixed(2) : (0).toFixed(2),
    isFocus: false,
    isProtocol: false,
    currSelect: 0,
    moneyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow: function () {
    this.getGoldsList()
  },

  // 获取金额列表
  getGoldsList() {
    HTTP({
      url: 'wallet/getRechargeAmountList',
      methods: 'get'
    }).then(res => {
      let temparr = []
      if (res.data) {
        res.data.map(key => {
          temparr.push({
            title: key.topUpMoney + "元",
            num: key.topUpMoney,
            subNum: key.givePresentMoney ? key.givePresentMoney : 0
          })
        })
      }
      if (temparr.length > 0) {
        // 金额列表有值
        this.setData({
          moneyList: temparr
        })
        let numcion = temparr.length > 0 ? temparr[temparr.length - 1].num : 0
        let subNum = temparr.length > 0 ? temparr[temparr.length - 1].subNum : 0
        this.setData({
          isStart: true,
          balanceMoneyStart: wx.getStorageSync("walletMoney") ?
            Number(wx.getStorageSync("walletMoney")) : 0,
          balanceMoney: wx.getStorageSync("walletMoney") ?
            Number(wx.getStorageSync("walletMoney") + numcion + subNum).toFixed(2) : (numcion + subNum).toFixed(2),
          currSelect: temparr.length - 1,
          rechargeMoney: temparr.length > 0 ? temparr[temparr.length - 1].num : '',
          rechargeMoneyCurr: temparr.length > 0 ? temparr[temparr.length - 1].num : ''
        })
      } else {
        // 金额列表无值：默认
        let moneyList = [{
          title: "200元",
          num: 200,
          subNum: 0
        },
        {
          title: "100元",
          num: 100,
          subNum: 0
        },
        {
          title: "50元",
          num: 50,
          subNum: 0
        },
        {
          title: "20元",
          num: 20,
          subNum: 0
        },
        {
          title: "10元",
          num: 10,
          subNum: 0
        },
        {
          title: "5元",
          num: 5,
          subNum: 0
        }
        ]
        this.setData({
          moneyList: moneyList
        })
        this.setData({
          rechargeMoney: 5,
          rechargeMoneyCurr: 5,
          balanceMoneyStart: wx.getStorageSync("walletMoney") ?
            Number(wx.getStorageSync("walletMoney")) : 0,
          currSelect: 5,
          balanceMoney: wx.getStorageSync("walletMoney") ?
            Number(wx.getStorageSync("walletMoney") + 5).toFixed(2) : (5).toFixed(2),
          isStart: true
        });

      }

    })
  },
  bindfocusFun(e) {


  },
  bindblurFun(e) {
    console.log('blur')
    if (this.data.currSelect !== -1 && this.data.rechargeMoneyCurr) {
      this.setData({
        // currSelect: -1,
        rechargeMoney: this.data.rechargeMoneyCurr
      })
      // }
      let ignoreCode = [5, 10, 20, 50, 100, 200];
      if (!ignoreCode.includes(this.data.rechargeMoney)) {
        this.setData({
          currSelect: -1,
          rechargeMoneyCurr: 0
        })
      }
    }

  },

  // 遍历判断金额是否有赠送金额
  checkRollGold(val) {
    let temp = 0
    this.data.moneyList.map(item => {
      if (item.num == val) {
        temp = item.subNum ? item.subNum : 0
      }
    })
    return temp
  },

  bindinputFun(e) {
    let value = e.detail.value;
    if (parseFloat(value) == 0) {
      this.setData({
        balanceMoney: (
          parseFloat(wx.getStorageSync("walletMoney") ?
            Number(wx.getStorageSync("walletMoney")) : 0)).toFixed(2)
      })
      return
    }
    if (parseFloat(value) >= 0.01 && parseFloat(value) <= 500) {
      if (checkDigit(value) && pointNum(value) > 2) {
        wx.showToast({
          title: "充值金额最多只能有两位小数点",
          icon: "none",
          duration: 2000,
          mask: true
        });
        this.setData({
          rechargeMoney: "",
          balanceMoney: parseFloat(this.data.balanceMoneyStart).toFixed(2)
        });
        return;
      }

      if ((value > 5 && (value != 10 || value != 20 || value != 50 || value != 100 || value != 200)) || (value != 0 && value < 5)) {
        this.setData({
          currSelect: -1,
          rechargeMoneyCurr: 0,
        })
      }
      let tempbalanceMoney = (
        parseFloat(wx.getStorageSync("walletMoney") ?
          Number(wx.getStorageSync("walletMoney")) : 0) + parseFloat(value) + this.checkRollGold(value)
      ).toFixed(2)
      this.setData({
        rechargeMoney: value,
        balanceMoney: tempbalanceMoney
      });
    } else {
      if (getBLen(value) >= 6) {
        wx.showToast({
          title: "充值金额最小为0.01元，最大为500元",
          icon: "none",
          duration: 2000,
          mask: true
        });
        this.setData({
          rechargeMoney: "",
          balanceMoney: (
            parseFloat(wx.getStorageSync("walletMoney") ?
              Number(wx.getStorageSync("walletMoney")) : 0) + parseFloat(value) + this.checkRollGold(value)
          ).toFixed(2)
        });
      } else {
        if (value != 0 || value == "") {
          this.setData({
            rechargeMoney: "",
            balanceMoney: parseFloat(this.data.balanceMoneyStart)
          });
        }
      }
    }
  },
  selectMoneyFun(e) {
    if (this.data.isFocus == false) {
      this.setData({
        isStart: false,
      })
      let item = e.currentTarget.dataset.item;
      let index = e.currentTarget.dataset.index;
      console.log('item.subNum', item.subNum, item.num, this.data.balanceMoneyStart)
      this.setData({
        rechargeMoney: item.num,
        rechargeMoneyCurr: item.num,
        balanceMoney: (
          parseFloat(this.data.balanceMoneyStart) + parseFloat(item.num) + parseFloat(item.subNum)
        ).toFixed(2),
        currSelect: index
      });
    }
  },

  protocolFun() {
    this.setData({
      isProtocol: !this.data.isProtocol
    });
  },
  joinAgree(e) {
    let index = e.currentTarget.dataset.index;
    let url =
      index == 1 ?
        "/pages/myTopupAgreement/myTopupAgreement" :
        "/pages/myDepositAgreement/myDepositAgreement";
    wx.navigateTo({
      url: url,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    });
  },
  // 支付
  rechargeFun() {
    let that = this;
    if (!this.data.isProtocol) {
      wx.showToast({
        title: "请确认充值金额或勾选充值协议",
        icon: "none",
        duration: 3000,
        mask: true
      });
      return;
    }
    if (!that.data.rechargeMoney) {
      wx.showToast({
        title: "充值金额最小为0.01元，最大为500元",
        icon: "none",
        duration: 3000,
        mask: true
      });
      return;
    }

    let params = {
      openId: wx.getStorageSync("logindata").openId,
      payMoney: parseFloat(that.data.rechargeMoney)
    };
    wx.showLoading({
      title: "支付中",
      mask: true
    });

    HTTP({
      url: 'pay/walletRecharge',
      methods: 'put',
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
            image: "/images/icon_success.png",
            duration: 2000,
            mask: true
          });

          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        },
        fail: function (res) {
          wx.showToast({
            title: "支付失败",
            image: "/images/icon_fail.png",
            duration: 2000,
            mask: true
          });
        }
      });
    }, err => {
      if (err.code == 9005) {
        wx.showToast({
          title: "金额不能小于等于0",
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { }
});