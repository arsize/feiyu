// pages/myReturnbat/myReturnbat.js
import {
  HTTP
} from "../../utils/server";
import {
  formats
} from '../../utils/util';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    isRequest: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getDataFun();
    // wx.getLocation({
    //   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    //   success(res) {
    //     that.getDataFun(res.latitude, res.longitude);
    //   }
    // })
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

  },
  getDataFun() {
    let that = this;
    let params = {

    };

    HTTP({
      url: 'battery/user/batteryInfo',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data.shopBusiness;
      // if (objData && objData.serviceTime) {
      //   objData.serviceTime = objData.serviceTime ? formats("YYYY.MM.dd", objData.serviceTime) : '-';
      // }
      // if (objData.diskm) {
      //   objData.diskm = (objData.dis / 1000).toFixed(2);
      // } else {
      //   objData.diskm = '--'
      // }

      that.setData({
        objData: objData,
        isRequest: true
      })


    });

  },

  operationFun(e) {
    let index = e.currentTarget.dataset.index;
    if (index == 0) {
      wx.makePhoneCall({
        phoneNumber: this.data.objData.busMobile
      })
    } else {
      wx.openLocation({
        latitude: parseFloat(this.data.objData.latitude),
        longitude: parseFloat(this.data.objData.longitude),
        scale: 16,
        name: this.data.objData.busName,
        address: this.data.objData.busAddress,
      })
    }
  },
  // 联系客服
  callcustomer() {
    // console.log('callcustomer----------');
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("kfMobile")
    })
  },
  cannelFun() {
    app.printf('cannelFun')
    let that = this;
    let option = {
      status: true,
      content: "确认要取消退电吗",
      foot: [{
        text: '点错了',
        cb: () => {

        }
      }, {
        text: "确认",
        cb: () => {
          that.appForReturnBattery();
        }
      }]

    }
    app.globalData.emitter.emit("dialogstatus", option)
   
  },

  appForReturnBattery() {
    let params = {
      applyForReturnBattery: false
    };

    HTTP({
      url: 'battery/user/appForReturnBattery',
      methods: 'put',
      data: params,
      loading: true,
    }).then(res => {
      wx.redirectTo({
        url: `/pages/myBattery/myBattery`,
      })


    });

  },

  // 退电
  returnFun() {
    wx.navigateTo({
      url: `/pages/myQrcode/myQrcode`,
    })
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