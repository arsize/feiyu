// pages/myBattery/myBattery.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
import {
  formats,
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRequest: true,
    baseUrlImg: app.globalData.baseUrlImg,
    // 0: 未绑定电池  1已经绑定电池   2吞电池  3.已经绑定电池,未激活电池  4.已经绑定电池,已激活电池  5.退电池  6.退绿色回收金中
    batteryType: -1,
    infoData: {},
    isTip: false,
    refundResList: [{
      cont: '电池不好用',
      isSelect: false
    },
    {
      cont: '系统体验感不佳',
      isSelect: false
    },
    {
      cont: '套餐收费不合理',
      isSelect: false
    },
    {
      cont: '其他原因',
      isSelect: false
    },
    ],
    seconds: 180,
    timer: "",
    timeFlag: false,
    batteryDepositOrderStatus: "",
    realName: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.noteDaFun();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.set,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.getDataFun();



  },

  noteDaFun() {
    let that = this;
    let option = {
      status: true,
      content: '为避免不当操作导致发生安全事故，使用其他充电器将无法为电池充电，当锂电池电量低时，请前往专用的充换电柜换电',
      foot: [{
        text: "我知道了",
        cb: () => {
          that.safetyNoticeFun();
        }
      }]

    }
    app.globalData.emitter.emit("dialogstatus", option)
  },

  // app/wx/safetyNotice
  safetyNoticeFun() {
    let that = this;
    let params = {};
    HTTP({
      url: 'app/wx/safetyNotice',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let logindata = wx.getStorageSync('logindata');
      logindata.isReadSafetyInstruction = true;
      wx.setStorageSync('logindata', logindata);
    }, err => {

    })

  },

  getDataFun() {

    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    let that = this;
    let params = {};
    HTTP({
      url: 'battery/user/batteryInfo',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data;
      let batteryDepositOrderStatus = objData.batteryDepositOrderStatus
      let realName = objData.realName
      wx.setStorageSync('realName', realName)
      wx.setStorageSync('batteryDepositOrderStatus', batteryDepositOrderStatus)
      this.setData({
        batteryDepositOrderStatus: Number(batteryDepositOrderStatus),
        realName: realName
      })
      // 0: 未绑定电池  1已经绑定电池   2吞电池  3.已经绑定电池,未激活电池  4.已经绑定电池,已激活电池  5.退电池  6.退押金中
      //userBindBatteryType  0: 未绑定电池  1已经绑定电池   2吞电池
      if (objData.userBindBatteryType == 0) {

        if (objData.batteryDepositOrderStatus == 2) {
          that.setData({
            batteryType: 6
          })
        } else {
          that.setData({
            batteryType: 0
          })
        }
      } else if (objData.userBindBatteryType == 1) {
        if (objData.batteryDepositOrderStatus == 0) {
          that.setData({
            batteryType: 3
          })
          let isReadSafetyInstruction = wx.getStorageSync('logindata').isReadSafetyInstruction;
          if (!isReadSafetyInstruction) {
            that.noteDaFun();
          }

        } else if (objData.batteryDepositOrderStatus == 1) {
          that.setData({
            batteryType: 4
          })
        } else if (objData.batteryDepositOrderStatus == 2) {
          that.setData({
            batteryType: 6
          })
        }


      } else if (objData.userBindBatteryType == 2) {
        let ctimeOr = objData.boxLockRecord.ctime || 0;
        let nowTime = new Date().getTime() - ctimeOr - 180 * 1000;
        if (nowTime < 0) {
          that.setData({
            seconds: (
              (180 * 1000 - (new Date().getTime() - ctimeOr)) / 1000).toFixed(0),
            timeFlag: true,
          });
          that.data.timer = setInterval(() => {
            that.settimeCharge();
          }, 1000);
        } else {
          that.setData({
            timeFlag: false,
            seconds: 0
          });
        }
        that.setData({
          batteryType: 2
        })
      }

      objData.batteryRentStartTime = objData.batteryRentStartTime ? formats("YYYY.MM.dd", objData.batteryRentStartTime) : '-';
      objData.dataUpdateTime = objData.dataUpdateTime ? formats("YYYY.MM.dd hh:mm:ss", objData.dataUpdateTime) : '';

      that.setData({
        infoData: objData,
        isRequest: true,
      });

    }, err => {
      that.setData({
        isRequest: true,
      });
    })

  },

  // 扫码绑定电池
  scanBattary() {
    let that = this
    wx.scanCode({
      scanType: 'qrCode',
      success(res) {
        let result = res.result
        let option = {
          status: true,
          closeicon: true,
          title: '是否确认绑定',
          content: `电池SN码：${result}`,
          foot: [{
            text: '确认绑定',
            cb: () => {
              HTTP({
                url: 'app/wx/user/bindBattery',
                methods: "get",
                data: {
                  scanCode: result
                }
              }).then(res => {
                that.getDataFun()
              })
            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
    })
  },


  // 底部按钮
  btmBtnFun(e) {
    let type = e.currentTarget.dataset.type;
    switch (type) {
      case "0":
        this.scanBattary()
        // wx.redirectTo({
        //   url: '/pages/exchangeserver/exchangeserver'
        // })
        break;
      case "2":
        this.unlockBattery();
        break;
      case "3":
        if (this.data.infoData.realName) {
          wx.redirectTo({
            url: '/pages/myPayDeposit/myPayDeposit'
          })
        } else {
          wx.redirectTo({
            url: '/pages/myCertification/myCertification'
          })

        }

        break;
      case "7":
        wx.makePhoneCall({
          phoneNumber: wx.getStorageSync("kfMobile")
        });
        break;
      case "8":
        wx.reLaunch({
          url: '/pages/index/index',
        })
        break;
      default:
        break;
    }
  },
  settimeCharge() {
    let that = this;
    if (this.data.seconds <= 0) {
      this.setData({
        timeFlag: false,
      });
      clearInterval(this.data.timer);

    }
    if (this.data.seconds <= 0) {
      this.setData({
        seconds: 0,
      });
    } else {
      this.setData({
        seconds: this.data.seconds - 1,
      });
    }
  },
  unlockBattery() {
    let that = this;
    console.log(this.data.infoData.boxLockRecord);
    console.log('this.data.infoData.boxLockRecord')
    if (!this.data.infoData.boxLockRecord) {
      return;
    }
    let params = {
      boxId: this.data.infoData.boxLockRecord.boxId
    };
    HTTP({
      url: 'cabinet/unlockBattery',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      wx.redirectTo({
        url: `/pages/exchangeEnd/exchangeEnd?errCode=getbattery`,
      })


    }, err => { })

  },

  // 地图导航
  openMap(e) {
    let index = e.currentTarget.dataset.index;
    let latitude, longitude, name, address;
    if (index == 1) {
      latitude = this.data.infoData.shopBusiness.latitude;
      longitude = this.data.infoData.shopBusiness.longitude;
      name = this.data.infoData.shopBusiness.busName;
      address = this.data.infoData.shopBusiness.busAddress;
    } else {
      latitude = this.data.infoData.batteryLatitude;
      longitude = this.data.infoData.batteryLongitude;
      name = this.data.infoData.batterySn;
      address = this.data.infoData.batteryAddress;
    }
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 16,
      name: name,
      address: address,
    })
  },

  // 退电池
  returnFun() {
    this.setData({
      isTip: !this.data.isTip
    })
  },

  refundBatTip() {
    this.data.refundResList.map(item => {
      item.isSelect = false;
    })
    this.setData({
      isTip: !this.data.isTip,
      refundResList: this.data.refundResList
    })
  },
  selectRes(e) {
    // console.log(e.currentTarget.dataset);
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    this.data.refundResList[index].isSelect = !this.data.refundResList[index].isSelect;
    this.setData({
      refundResList: this.data.refundResList
    })


  },
  // 退电池
  goonReturnFun() {
    let selNum = 0,
      curResList = [];
    this.data.refundResList.map(item => {
      if (item.isSelect) {
        selNum++;
        curResList.push(item.cont)
      }
    })
    if (selNum == 0) {
      wx.showToast({
        title: '请先选择退电理由',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }

    // wx.redirectTo({
    //   url: `/pages/myReturnbat/myReturnbat`,
    // })
    // return;

    let params = {
      feedback: curResList.join(','),
      applyForReturnBattery: true
    };
    HTTP({
      url: 'battery/user/appForReturnBattery',
      methods: 'put',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      wx.redirectTo({
        url: `/pages/myReturnbat/myReturnbat`,
      })

    }, err => {
      app.printf(err);
      app.printf('err-----------');
      that.setData({
        isRequest: true
      })
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