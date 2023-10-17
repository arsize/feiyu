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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  toscan() {
    this.getUserHasCardOperate()
  },

  getUserHasCardOperate() {

    HTTP({
      url: '/app/wx/getUserHasCard',
      methods: 'get',
      data: {},
      loading: true,
    }).then(res => {

      const data = res.data;
      if (String(data) === "null") {

        let option = {
          status: true,
          content: "您暂未购买套餐，无法取电",
          foot: [{
              text: "返回首页",
              cb: () => {
                wx.reLaunch({
                  url: '/pages/index/index',
                })
              },
            },
            {
              text: "前往购买",
              cb: () => {
                wx.setStorageSync("comboType", 1);
                wx.redirectTo({
                  url: '/pages/myCombo/myCombo',
                })
              },
            },
          ],
        };
        app.globalData.emitter.emit("dialogstatus", option);

      } else {
        wx.redirectTo({
          url: '/pages/cameraScanTake/cameraScanTake',
        })
      }


    }, err => {

      wx.showToast({
        title: err.msg,
        icon: "none",
        duration: 2000,
        mask: true
      })
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