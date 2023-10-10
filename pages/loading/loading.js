import { HTTP } from "../../utils/server";
import { globalData } from "../../utils/global";
//获取应用实例
const app = getApp();
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg
  },
  onLoad: function (options) {
    if (options.q) {
      var scene = decodeURIComponent(options.q);
      var deviceUid = scene.split("deviceUid=")[1];
      wx.setStorageSync("sceneUid", deviceUid);
    }

    wx.login({
      success: res => {
        if (res.code) {
          HTTP({
            url: "app/wx/login",
            methods: 'post',
            data: {
              code: res.code,
              wxAppId: globalData.appId
            }
          }).then(login => {
            if (login.data.status == 1) {
              wx.navigateTo({
                url: `/pages/freezeAccount/freezeAccount`
              });
              return;
            }
            wx.setStorageSync("logindata", login.data);
            wx.setStorageSync("kfMobile", login.data.organizationMobile);
            wx.reLaunch({
              url: "/pages/index/index"
            });
          })
        }
      },
      fail: res => {
        console.log("fail:", res);
      }
    });
  },
});
