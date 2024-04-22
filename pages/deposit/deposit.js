//获取应用实例
const app = getApp();
import {
  HTTP
} from "../../utils/server";

Page({
  data: {
    status: '', //是否已存放电池
    saveCount: 0, //已存放次数
    freeCount: 3, //免费次数
    freeDay: '',
    saveDay: ''

  },
  onShow() {
    this.getScanStatus()
    let saveCabinetId = wx.getStorageSync('saveCabinetId')
    if (saveCabinetId) {
      let option = {
        status: true,
        contentType: 'array',
        title: '确认在换电柜000023进行寄存？',
        content: [
          '1.把电池放入空仓内；',
          '2.插好电池插头；',
          '3.关闭仓门；'
        ],
        foot: [{
          text: '取消',
          cb: () => {}
        }, {
          text: '确认',
          cb: () => {
            HTTP({
              url: `/userSaveInfo/startSave`,
              methods: 'post',
              data: {
                cabinetUid: saveCabinetId
              }
            }).then(res => {
              if (res.code === 200) {
                wx.redirectTo({
                  url: '/pages/depositSuccess/depositSuccess?num=' + 3,
                })
              }
            }, err => {
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

          }
        }]
      }
      app.globalData.emitter.emit("dialogstatus", option)
    }
  },
  onHide() {
    wx.removeStorageSync("saveCabinetId");
  },
  onUnload() {
    wx.removeStorageSync("saveCabinetId");
  },
  getScanStatus() {
    HTTP({
      url: `/userSaveInfo/getSaveInfo`,
      methods: 'get',
    }).then(res => {
      console.log('res', res)
      if (res.data) {
        this.setData({
          status: res.data.status,
          saveCount: res.data.saveCount,
          saveDay: res.data.saveDay,
          freeCount: res.data.freeCount,
          freeDay: res.data.freeDay
        })
      }
    })
  },
  // 扫码寄存
  scanToSave() {
    wx.navigateTo({
      url: '/pages/cameraScanBySave/cameraScanBySave',
    })





  }
})