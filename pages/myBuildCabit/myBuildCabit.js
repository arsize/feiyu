// pages/myBuildCabit/myBuildCabit.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    currArea: '',
    latitude: '',
    longitude: ''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  selectArea() {
    let that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          currArea: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })
      }

    })
  },

  btmBtnFun() {
    let that = this;
    if (!this.data.currArea) {
      wx.showToast({
        title: '请选择安装地址',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;

    }

    let params = {
      feedback: this.data.currArea,
      latitude: this.data.latitude,
      longitude: this.data.longitude
    };
    HTTP({
      url: 'app/wx/userUrgeToBuildElectricCabinet',
      methods: 'POST',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      wx.showToast({
        title: '提交成功',
        icon: "success",
        duration: 2000,
        mask: true
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1500)
    })
  },
})