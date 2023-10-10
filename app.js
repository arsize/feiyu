import { globalData } from "./utils/global";
const EventEmitter2 = require("./miniprogram_npm/eventemitter2/index").EventEmitter2;
const emitter = new EventEmitter2();

App({
  onLaunch: function () {
    this.globalData.sysinfo = wx.getSystemInfoSync();
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      console.log("更新失败")
    })
  },
  onHide: function () {
    wx.removeStorageSync("sceneUid");
  },

  getModel: function () {
    //获取手机型号
    return this.globalData.sysinfo["model"];
  },
  getWxVersion: function () {
    //获取微信版本号
    return this.globalData.sysinfo["version"];
  },
  getSystem: function () {
    //获取操作系统版本
    return this.globalData.sysinfo["system"];
  },
  getPlatform: function () {
    //获取客户端平台
    return this.globalData.sysinfo["platform"];
  },
  getSDKVersion: function () {
    //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"];
  },


  //toast提示
  toastTips: function (txt) {
    wx.showToast({
      title: txt,
    });
  },
  //toast提示，可以设置等待时长
  toastTips1: function (txt, time) {
    wx.showToast({
      title: txt,
      duration: time,
    });
  },
  toastTips2: function (txt) {
    wx.showToast({
      title: txt,
      icon: "loading",
    });
  },

  //弹窗提示
  showModal: function (txt) {
    wx.showModal({
      title: "提示",
      content: txt,
      showCancel: false,
    });
  },
  //弹窗提示,有确认按钮
  showModal1: function (txt) {
    wx.showModal({
      title: "提示",
      content: txt,
      showCancel: false,
      confirmText: "确定",
    });
  },
  //loading
  showLoading: function (txt) {
    wx.showLoading({
      title: txt,
    });
  },
  // 日志打印
  printf: function (msg) {
    if (globalData.openLog) {
      console.log(msg)
    }
  },

  globalData: Object.assign(
    {
      sysinfo: null,
      timerswiperNoticeBar:'',
      dialogListen: '',
      isBlueConnected: "",
      emitter: emitter, //全局订阅函数
    },
    globalData
  )
});
