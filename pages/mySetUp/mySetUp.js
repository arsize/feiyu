// pages/mySetUp/mySetUp.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
import {
  globalData
} from "../../utils/global";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    faqList: [{
        title: "修改手机号",
        cont: '',
        url: '/pages/myModPhone/myModPhone',
      }

    ],
    logindata: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync("logindata")) {
      let logindata = wx.getStorageSync("logindata");
      logindata.account = logindata.account ?
        logindata.account.replace(logindata.account.slice(3, 7), "****") :
        "";
      this.data.faqList[0].cont = logindata.account;
      this.setData({
        logindata: logindata,
        faqList: this.data.faqList
      });
    }
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
    if (wx.getStorageSync("logindata")) {
      let logindata = wx.getStorageSync("logindata");
      logindata.account = logindata.account ?
        logindata.account.replace(logindata.account.slice(3, 7), "****") :
        "";
      this.data.faqList[0].cont = logindata.account;
      this.setData({
        logindata: logindata,
        faqList: this.data.faqList
      });
    }
  },
  showFun(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `${item.url}`
    })

  },
  logoutFun() {
    let that = this;
    let option = {
      status: true,
      content: "确认要退出账号吗",
      foot: [{
        text: '点错了',
        cb: () => {

        }
      }, {
        text: "确认",
        cb: () => {
          that.wxlogoutFun();
        }
      }]

    }
    app.globalData.emitter.emit("dialogstatus", option)
  },


  wxlogoutFun() {
    let that = this;
    let params = {

    };

    HTTP({
      url: 'app/wx/logout',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      that.loginFun();

    });

  },


  loginFun() {
    wx.login({
      success: res => {
        if (res.code) {
          HTTP({
            url: "/app/wx/login",
            methods: 'post',
            data: {
              code: res.code,
              wxAppId: globalData.appId
            }
          }).then(login => {
            app.printf(login);
            wx.setStorageSync("logindata", login.data);
            if (login.data.status == 1) {
              wx.navigateTo({
                url: `/pages/freezeAccount/freezeAccount`
              });
              return;
            } else {
              wx.reLaunch({
                url: '/pages/registered/registered?logout=true',
              })
            }


          })
        }
      },
      fail: res => {
        console.log("fail:", res);
      }
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