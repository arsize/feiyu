// pages/myWallet/myWallet.js
const app = getApp();
let baseUrlImgCurr = app.globalData.baseUrlImg;
import {
  HTTP
} from "../../utils/server";
import {
  formats
} from "../../utils/util";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    money: 0,
    time1: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    let money = options.money
    let time1 = formats('yyyy-MM-dd hh:mm:ss', new Date().getTime())
    this.setData({
      money: money,
      time1: time1
    })

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