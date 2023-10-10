// pages/myOrderService/myOrderService.js
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
    isRequest: false,
    isNear: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.printf('onLoad');
    let that = this;

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
    let that = this;
    if (wx.getStorageSync('selectStoreObj')) {
      let objData = wx.getStorageSync('selectStoreObj');
      if (objData.dis) {
        objData.diskm = (objData.dis / 1000).toFixed(2);
      } else {
        objData.diskm = '--'
      }
      if (objData.id === wx.getStorageSync('nearestSotreId')) {
        this.setData({
          isNear: true
        })
      } else {
        this.setData({
          isNear: false
        })
      }

      this.setData({
        objData: objData,
        isRequest: true
      })
    } else {
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success(res) {
          that.getDataFun(res.latitude, res.longitude);
        },
        fail(res) {
          app.printf('fail-----------');
          app.printf(res)
          wx.showToast({
            title: "定位失败,将为您展示默认位置信息",
            duration: 2000,
            icon: "none"
          });
          let pointCurr = {
            latitude: 22.55329,
            longitude: 113.88308
          }
          that.getDataFun(pointCurr.latitude, pointCurr.longitude);
        }
      })
    }
  },
  getDataFun(latitude, longitude) {
    let that = this;
    let params = {
      latitude,
      longitude,
      organizationId: wx.getStorageSync("logindata").organizationId
    };

    HTTP({
      url: 'shopBusiness/getLatelyBatteryBusiness',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      if (objData.dis) {
        objData.diskm = (objData.dis / 1000).toFixed(2);
      } else {
        objData.diskm = '--'
      }
      wx.setStorageSync('nearestSotreId', objData.id);
      wx.setStorageSync('selectStoreObj', objData);
      that.setData({
        objData: objData,
        isRequest: true,
        isNear: true,
      })


    }, err => {
      app.printf(err);
      app.printf('err-----------');
      that.setData({
        isRequest: true
      })
    })

  },

  serviceFun() {
    wx.navigateTo({
      url: '/pages/myOffStore/myOffStore',
    })
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

  // 下一步
  btmFun() {
    wx.redirectTo({
      url: `/pages/appointment/appointment?businessId=${this.data.objData.id}`,
    })
    // wx.redirectTo({
    //   url: `/pages/appointment/appointment?businessId=${this.data.objData.id}`,
    // })
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