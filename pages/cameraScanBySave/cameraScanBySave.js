import {
  HTTP
} from "../../utils/server";
//获取应用实例
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext()
let animation = wx.createAnimation({});

Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    flash: "off",
    animation: '',
    type: '',
    imgposition: -420,
    timer: null,
    istrue: false
  },
  // 打开手电筒
  openlight() {
    this.setData({
      flash: this.data.flash == 'on' ? 'off' : 'on'
    })
  },
  goback() {
    wx.navigateBack({
      delta: 1
    })
  },
  onHide() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }

  },
  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },
  // 初始化完成
  initdone() {
    this.setData({
      istrue: true
    })
  },
  donghua() {
    let that = this
    let time = setInterval(() => {
      if (that.data.imgposition >= 460) {
        that.setData({
          imgposition: -460
        })
      } else {
        let temp = that.data.imgposition + 10
        that.setData({
          imgposition: temp
        })
      }

    }, 50);
    this.setData({
      timer: time
    })
  },
  error() {
    wx.showToast({
      title: '摄像头未授权',
      icon: 'none'
    });
  },

  throttle() {
    let nowDate = new Date().getTime();
    if (nowDate - this.data.lastDate > 1000) {
      this.setData({
        lastDate: nowDate,
      });
      return true;
    } else {
      this.setData({
        lastDate: nowDate,
      });
      return false;
    }
  },
  // scan
  scansuccess(e) {
    let qrcode = e.detail.result
    let cabinetId = "";
    if (qrcode.indexOf("deviceUid") != -1) {
      cabinetId = qrcode.split("deviceUid=")[1];
    } else {
      cabinetId = qrcode;
    }

    this.getCabinetInfo(cabinetId)
  },
  // 获取机柜信息
  getCabinetInfo(cabinetId) {
    HTTP({
      url: "cabinet/getCabinetInfoByScan",
      methods: 'post',
      data: {
        cabinetId: cabinetId,
        type: 0
      }
    }).then(res => {
      console.log('res',res)
      wx.setStorageSync("saveCabinetId", cabinetId);
      wx.navigateBack({
        delta: 1
      })
    },err=>{
      let option = {
        status: true,
        content: err.msg,
        foot: [{
          text: '我知道了',
          cb: () => {

          }
        }]
      }
      app.globalData.emitter.emit("dialogstatus", option)
    })
  },
  // 输入电柜id
  inputcabinetid() {

  },

})