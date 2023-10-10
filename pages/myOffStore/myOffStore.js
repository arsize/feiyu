// pages/myOffStore/myOffStore.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    curSideBar: 0,
    isAnimation: true,
    listData: [],
    isRequest: false,
  },
  onLoad: function (options) {
    // let point = wx.getStorageSync("point");
    // if (point) {
    //   this.getDataFun(point)
    // } else {
    //   // 未开启定位
    // }
    let that = this;
    this.data.nearestSotreId = wx.getStorageSync("nearestSotreId");

    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        that.getDataFun(res.latitude, res.longitude);
      }
    })

  },
  getDataFun(latitude, longitude) {
    let that = this;
    let selectStoreObj = wx.getStorageSync('selectStoreObj')||{};
    app.printf(selectStoreObj)
    let params = {
      latitude,
      longitude,
      organizationId: wx.getStorageSync("logindata").organizationId
    };
    HTTP({
      url: 'shopBusiness/getBatteryBusinessList',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data;
      objData.map((item) => {
        item.shopBusinessList.map((items) => {

          if (items.id == selectStoreObj.id) {
            items.isSelect = true;
          } else {
            items.isSelect = false;
          }
          if (items.dis) {
            items.diskm = (items.dis / 1000).toFixed(2);
          } else {
            items.diskm = '--';
          }
        })
      })
      app.printf(objData);
      that.setData({
        listData: objData,
        isRequest: true
      })
    }, err => {
      that.setData({
        isRequest: true
      })
    })
  },
  selectSideFun(e) {
    let index = e.currentTarget.dataset.index;
    if (index != this.data.curSideBar) {
      this.setData({
        curSideBar: index
      })
    }
  },

  selectStoreFun(e) {
    app.printf('selectStoreFun');
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    wx.setStorageSync('selectStoreObj', item);
    if (item.id != this.data.nearestSotreId) {

    }
    wx.navigateBack({
      delta: 1
    })
  },

  operationFun(e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    if (index == 0) {
      wx.makePhoneCall({
        phoneNumber: item.busMobile
      })
    } else {
      wx.openLocation({
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        scale: 16,
        name: item.busName,
        address: item.busAddress,
      })
    }
  },

})