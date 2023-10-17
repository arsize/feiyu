import {
  HTTP
} from "../../utils/server";
const app = getApp();
Page({
  data: {
    cabinetType: '',
    cabitnetArr: ["", "", "", "", "", ""],
    inputValue: "",
    hasCabinetId: false,
    focusIndex: 0,
    autofocus: true,
    blueStatus: '',
    baseUrlImg: app.globalData.baseUrlImg,
  },
  onShow() {
    this.setData({
      cabitnetArr: ["", "", "", "", "", ""],
      focusIndex: 0
    })
  },

  selectBlockItem(el) {
    let focusIndex = el.currentTarget.dataset.index;
    this.setData({
      focusIndex: focusIndex,
      autofocus: true,
    });
  },
  inputchange(e) {
    let temp = e.detail.value;
    let tempArr = this.data.cabitnetArr;
    let tempfocusIndex = this.data.focusIndex;
    let focusIndex = 0;
    if (temp) {
      if (tempfocusIndex >= 5) {
        focusIndex = tempfocusIndex;
      } else {
        focusIndex = tempfocusIndex + 1;
      }
    } else {
      if (tempfocusIndex <= 0) {
        focusIndex = tempfocusIndex;
      } else {
        focusIndex = tempfocusIndex - 1;
      }
    }
    tempArr[this.data.focusIndex] = temp;
    this.setData({
      inputValue: "",
    });
    this.setData({
      cabitnetArr: tempArr,
    });
    this.setData({
      focusIndex: focusIndex,
    });

    if (this.checkArrToStr(tempArr)) {
      this.hasCabinetId();
      this.setData({
        autofocus: false,
      });
    }
  },
  checkArrToStr(arr) {
    return arr.every((item) => {
      return item != "";
    });
  },

  hasCabinetId() {
    let cabinetid = this.data.cabitnetArr.join("")
    wx.setStorageSync("takeCabinet", {
      cabinetid: cabinetid,
    })
    this.getCabinetInfo()


  },
  getCabinetInfo() {
    let that = this
    let selectCabinet = wx.getStorageSync("takeCabinet")
    HTTP({
      url: "cabinet/getCabinetBatteryInfo",
      methods: 'get',
      data: {
        cabinetCode: selectCabinet.cabinetid,
      }
    }).then(res => {
      if (res.code == 200) {
        if (res.data.powerOff) {
          // 断电
          let option = {
            status: true,
            content: "该电柜已停电暂不提供服务，请前往其他电柜",
            foot: [{
              text: '我知道了',
              cb: () => {

              }
            }]
          }
          app.globalData.emitter.emit("dialogstatus", option)
          return
        }
        if (res.data.cabinetOnline) {
          // 柜子在线
          // 换电
          wx.setStorageSync('takeData', res.data)
          wx.redirectTo({
            url: '/pages/takePages/takePages'
          })
        } else {
          // 柜子离线
          let option = {
            status: true,
            content: "该电柜已离线，请前往其他电柜",
            foot: [{
              text: '我知道了',
              cb: () => {

              }
            }]
          }
          app.globalData.emitter.emit("dialogstatus", option)
          return

        }
      }
    }, err => {

      if (err.code == 6013) {
        let option = {
          status: true,
          content: "此电柜暂无可用电池，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }

      if (err.code == 7008) {
        let option = {
          status: true,
          content: "该电柜已离线，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6020) {
        let option = {
          status: true,
          content: "此电柜不支持充电服务，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6023) {
        let option = {
          status: true,
          content: "此电柜维护中，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6019) {
        let option = {
          status: true,
          content: "暂无可用充电口，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6004) {
        let option = {
          status: true,
          content: "暂无此电柜信息，请检查后重新输入",
          foot: [{
            text: '我知道了',
            cb: () => {
              that.setData({
                cabitnetArr: ["", "", "", "", "", ""],
                focusIndex: 0,
                autofocus: true,
              })

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6007) {
        let option = {
          status: true,
          content: "电柜维护中，暂不可提供服务，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }, {
            text: '查看附近电柜',
            cb: () => {
              wx.navigateTo({
                url: '/pages/myMap/myMap'
              })
            }
          }]

        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6010) {
        // 机柜繁忙
        let option = {
          status: true,
          content: "充电口繁忙，请稍后再试",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6017) {
        // 机柜繁忙
        let option = {
          status: true,
          content: "机柜升级中，请稍后再试",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 20003) {
        let option = {
          status: true,
          content: "你已领取电池，请缴纳押金激活电池",
          foot: [{
            text: '稍后再说',
            cb: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          }, {
            text: '去激活电池',
            cb: () => {
              wx.navigateTo({
                url: '/pages/myCertification/myCertification'
              })
            }
          }]

        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 2008) {
        let option = {
          status: true,
          content: "因各城市的电池/套餐不通用，你需要开通此城市的换电服务才可在此机柜操作",
          foot: [{
            text: '我知道了',
            cb: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          }, {
            text: '联系客服',
            cb: () => {
              wx.makePhoneCall({
                phoneNumber: wx.getStorageSync("kfMobile"),
                success: function (res) {
                  console.log('call success')

                },
                fail: function (err) {
                  console.log('call fail')

                }
              });
            }
          }]

        }
        app.globalData.emitter.emit("dialogstatus", option)

      }
      if (err.code == 6015) {
        // 机柜繁忙
        let option = {
          status: true,
          content: "电柜服务中，请稍后再试",
          foot: [{
            text: '我知道了',
            cb: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 40014) {
        // 暂无满电电池或空仓
        let option = {
          status: true,
          content: "你的电池型号与柜内电池不匹配，请前往其他电柜",
          foot: [{
            text: '我知道了',
            cb: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          }, {
            text: '查看附近电柜',
            cb: () => {
              wx.redirectTo({
                url: '/pages/myMap/myMap'
              })
            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6006) {
        // 暂无空仓
        let option = {
          status: true,
          content: "暂无空仓，请前往其他机柜或者稍后再来",
          foot: [{
            text: '稍后再试',
            cb: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          }, {
            text: '查看附近电柜',
            cb: () => {
              wx.redirectTo({
                url: '/pages/myMap/myMap'
              })
            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 6008) {
        // 暂无满电仓
        let option = {
          status: true,
          content: "暂无可用电池，请前往其他机柜或者稍后再来",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
    })
  },

});