// pages/myModPhone/myModPhone.js
import {
  HTTP
} from "../../utils/server";
let timer = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneValue: '',
    codeValue: '',
    second: 0,
    phone: '',
    code: '',
    hasCode: '获取验证码',
    isPhone: false,
    phoneFoucs: false,
    isBind: false,
    myphone: ''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let myphone = wx.getStorageSync("logindata").account
    this.setData({
      myphone: myphone
    })


  },
  phoneInput(e) {
    if ((/^1(3|4|5|6|7|8|9)\d{9}$/.test(e.detail.value))) {
      this.setData({
        phone: e.detail.value,
        isPhone: true
      })
    } else {
      this.setData({
        isPhone: false
      })
    }
  },
  phoneBlur(e) {
    // this.getPhone(e.detail.value);
  },

  phoneConfirm(e) {
    this.getPhone(e.detail.value);
  },

  getPhone(phone) {
    // if ((/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))) {
    //   this.setData({
    //     phone: phone,
    //     isPhone: true
    //   })
    // } else {
    //   this.setData({
    //     phone: '',
    //     isPhone: false
    //   })
    //   wx.showToast({
    //     title: '输入正确的手机号',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   })
    // }
  },
  getCode() {
    let that = this;

    if ((/^1(3|4|5|6|7|8|9)\d{9}$/.test(that.data.phone)) && that.data.isPhone) {
      if (that.data.phone != that.data.myphone) {
        let nowData = {
          // mobileAreaCode: 86,
          mobile: that.data.phone,
          organizationId: wx.getStorageSync("logindata").organizationId,
          type: 2
        }
        this.sendSms(nowData);
      } else {
        wx.showToast({
          title: '请输入新的手机号',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      }



    } else {
      wx.showToast({
        title: '请先输入手机号',
        icon: 'none',
        duration: 2000,
        mask: true
      })

    }
  },

  sendSms(params) {
    let that = this;
    // HTTP("/app/wx/sendChangeMobilePhoneSms", params, true).then(res => {
    HTTP({
      url: 'app/wx/sendChangeMobilePhoneSms',
      methods: 'post',
      data: params,
      loading: true,
    }).then(res => {
      wx.showToast({
        title: '验证码已经发送',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      that.setData({
        second: 60,
        hasCode: '获取验证码'
      })
      timer = setInterval(function () {
        if (parseInt(that.data.second) > 0) {
          that.data.second--;
          that.setData({
            second: that.data.second
          })
        } else {
          clearInterval(timer);
        }
      }, 1000);
    });




  },


  codeInput(e) {
    this.setData({
      code: e.detail.value
    })

  },
  codeBlur(e) {
    // this.getCodeV(e.detail.value);
  },

  codeConfirm(e) {
    this.getCodeV(e.detail.value);
  },
  getCodeV(codeNum) {
    if (codeNum.length < 4) {
      this.setData({
        code: ''
      })
      wx.showToast({
        title: '输入正确的验证码',
        icon: 'none',
        duration: 1000,
        mask: true
      })
    } else {
      this.setData({
        code: codeNum
      })
    }
  },

  formSubmitReg(e) {

    // console.log('formSubmitReg-------------------')

    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(e.detail.value.phoneNum))) {
      this.setData({
        code: '',
        phone: ''
      })
      wx.showToast({
        title: '输入正确的手机号',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }
    if (!e.detail.value.codeNum) {
      this.setData({
        code: '',
        // phone: ''
      })
      wx.showToast({
        title: '输入正确的验证码',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }


    let nowDataF = {
      // mobileAreaCode: 86,
      checkCode: e.detail.value.codeNum,
      mobile: e.detail.value.phoneNum,
      organizationId: wx.getStorageSync("logindata").organizationId,
      type: 2
    }
    let nowDataS = {
      // mobileAreaCode: 86,
      // smsCode: e.detail.value.codeNum,
      oldMobile: this.data.myphone,
      newMobile: e.detail.value.phoneNum
    }
    this.checkSms(nowDataF, nowDataS);
  },

  checkSms(nowDataF, nowDataS) {
    let that = this;
    // HTTP("/app/wx/checkSms", nowDataF, true).then(res => {
    HTTP({
      url: 'app/wx/checkSms',
      methods: 'post',
      data: nowDataF,
      loading: true,
    }).then(res => {
      wx.showLoading({
        title: "加载中",
        mask: true
      });

      that.changeMobilePhone(nowDataS);
    });

  },


  changeMobilePhone(nowData) {

    let currPhone = nowData.newMobile.replace(nowData.newMobile.slice(3, 7), "****");

    // HTTP("/app/wx/changeMobilePhone", nowData, true).then(res => {
    HTTP({
      url: 'app/wx/changeMobilePhone',
      methods: 'put',
      data: nowData,
      loading: true,
    }).then(res => {
      let logindata = wx.getStorageSync('logindata');
      logindata.account = nowData.newMobile;
      wx.setStorageSync("logindata", logindata);
      // wx.setStorageSync("account", nowData.newMobile);
      wx.showToast({
        title: '修改成功',
        // image: '/images/icon_success.png',
        icon: "success",
        mask: true
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
        // wx.reLaunch({
        //   url: '/pages/index/index'
        // })
        // wx.redirectTo({
        //   url: '/pages/loading/loading',
        // })

      }, 2000)


    });

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