// pages/myWallet/myWallet.js
const app = getApp();
let baseUrlImgCurr = app.globalData.baseUrlImg;
import {
  HTTP
} from "../../utils/server";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    menuList: [{
        title: "押金",
        img: `${baseUrlImgCurr}icon_cont_cash@2x.png`,
        url: "/pages/myDeposit/myDeposit",
      },
      {
        title: "消费明细",
        img: `${baseUrlImgCurr}icon_cont_record@2x.png`,
        url: "/pages/myConsume/myConsume",
      },
    ],
    infoData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDataFun();
  },

  getDataFun() {
    // wx.showLoading({
    //   title: "加载中",
    //   mask: true,
    // });
    let that = this;
    let params = {};
    HTTP({
      url: 'wallet/getUserWalletInfo',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      wx.setStorageSync("walletMoney", objData.money);
      wx.setStorageSync("walletInfo", objData);
      that.setData({
        infoData: objData,
        isRequest: true,
      });


    }, err => {
      that.setData({
        isRequest: true,
      });
    })

  },

  joinRecharge() {
    wx.navigateTo({
      url: '/pages/myGoldDeposits/myGoldDeposits',
    })
  },
  joinPage(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    if (index == 0) {
      if (this.data.infoData.depositType == -1 || this.data.infoData.depositType == 2) {
        return;
      }
      wx.navigateTo({
        url: `${item.url}?depositType=${this.data.infoData.depositType}&depositMoney=${this.data.infoData.depositMoney}`,
      });
    } else {
      wx.navigateTo({
        url: `${item.url}`,
      });
    }
    //   if (this.throttle()) {
    //     if (index == 0) {
    //       wx.navigateTo({
    //         url: `${item.url}?depositType=${this.data.infoData.depositType}&depositMoney=${this.data.infoData.depositMoney}`,
    //       });
    //     } else {
    //       wx.navigateTo({
    //         url: `${item.url}`,
    //       });
    //     }
    // }
  },
  throttle() {
    let nowDate = new Date().getTime();
    if (nowDate - this.data.lastDate > 1000) {
      this.setData({
        lastDate: nowDate,
      });
      return true;
    } else {
      this.setData({
        lastDate: nowDate,
      });
      return false;
    }
  },

  tixianBtn() {
    let option = {
      status: true,
      content: "仅支持提现充值本金，确认要全部提现吗？",
      foot: [{
        text: '确认提现',
        cb: () => {
          HTTP({
            url: "/wallet/applyRefund",
            methods: 'get',
            data: {}
          }).then(res => {
            wx.showToast({
              title: '提现成功',
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/myWallet_sc/myWallet_sc?money=' + this.data.infoData.principalMoney,
              })
            }, 1500);
          }, err => {
            wx.showToast({
              title: '提现失败',
              icon: "none"
            })
          })

        }
      }]
    }
    app.globalData.emitter.emit("dialogstatus", option)

  },
  tixianBtn_none() {
    let option = {
      status: true,
      content: "充值本金为零，暂不可以提现",
      foot: [{
        text: '我知道了',
        cb: () => {}
      }]
    }
    app.globalData.emitter.emit("dialogstatus", option)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})