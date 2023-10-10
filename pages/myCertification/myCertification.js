// pages/myCertification/myCertification.js
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
    param1: '',
    param2: '',
    param3: '',
    param4: '',
    param5: [],
    param6: '',
    desposi: true,
    region: ['广东省', '广州市', '海珠区'],
    batteryDepositOrderStatus: ''
  },
  onShow() {
    // 0未缴纳押金 1：已缴纳 2：正在退回
    let batteryDepositOrderStatus = wx.getStorageSync('batteryDepositOrderStatus')
    this.setData({
      batteryDepositOrderStatus: batteryDepositOrderStatus
    })
  },

  bindinput(e) {
    let paramObj = e.detail.value;
    let paramCurr = e.target.dataset.param;
    this.setData({
      [paramCurr]: paramObj
    })
  },

  bindRegionChange: function (e) {
    this.setData({
      param5: e.detail.value
    })
  },

  formSubmit(e) {
    app.printf('formSubmit-----------');
    let paramObj = e.detail.value;
    app.printf(paramObj)
    if (!(/^[\u4e00-\u9fa5]{2,4}$/.test(paramObj.param1))) {
      wx.showToast({
        title: '请输入正确的真实姓名',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }
    if (!(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(paramObj.param2))) {

      wx.showToast({
        title: '请输入正确的身份证号码',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }


    if (!paramObj.param3) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;

    }
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(paramObj.param4))) {
      wx.showToast({
        title: '请输入正确的联系电话',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }
    this.applyFun(paramObj);
  },
  applyFun(paramObj) {
    let that = this;
    let myCenterInfo = wx.getStorageSync('myCenterInfo') || {};
    let logindata = wx.getStorageSync('logindata') || {};
    let params = {
      accountUid: myCenterInfo.userUid,
      organizationId: logindata.organizationId,
      name: paramObj.param1,
      idCard: paramObj.param2,
      emergencyContactName: paramObj.param3,
      emergencyContactMobile: paramObj.param4,
      residentProvince: this.data.param5[0],
      residentCity: this.data.param5[1],
      residentialArea: this.data.param5[2],
      detailedAddress: paramObj.param6,

    }

    HTTP({
      url: 'app/wx/doRealName',
      methods: 'post',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      wx.showToast({
        title: '提交成功',
        icon: "success",
        duration: 2000,
        mask: true
      })

      setTimeout(() => {
        if (that.data.batteryDepositOrderStatus == 0) {
          wx.redirectTo({
            url: '/pages/myPayDeposit/myPayDeposit',
          })
        } else if (that.data.batteryDepositOrderStatus == 1) {
          wx.redirectTo({
            url: `/pages/myOpenSuccess/myOpenSuccess`,
          });
        }
      }, 1500)

    }, err => {
      app.printf(err);
      app.printf('err-----------');
      if (err.code == "50001") {
        wx.showToast({
          title: '真实姓名与身份证号码不匹配，实名认证不通过',
          icon: "none",
          duration: 2000,
          mask: true
        });
      }
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