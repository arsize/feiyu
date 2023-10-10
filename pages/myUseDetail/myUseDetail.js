// pages/myUseDetail/myUseDetail.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
import {
  formats,
  formateSeconds
} from "../../utils/util";
let chtimer = '';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    // 0换电 1充电
    currType: -1,
    linkData: {
      orderNo: "",
      useType: -1,
      chargingStatus: -2,
    },
    chargingRecordDetail: {},
    exchangeRecordDetail: {},
    isRequest: false,
    chargeStatus: false,
    seconds: 0,
    timer: "",
    timeFlag: false,
    appName: "",
    chtimer: "",
    chargingAllTime: '00:00:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.orderNo) {
      let obj = {
        orderNo: options.orderNo,
        useType: options.useType,
        chargingStatus: options.chargingStatus,
      };
      if (obj.useType == 1) {
        wx.setNavigationBarTitle({
          title: "充电记录详情",
        });
      } else {
        wx.setNavigationBarTitle({
          title: "换电记录详情",
        });
      }
      this.setData({
        linkData: obj,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDataFun();
    let appName = wx.getStorageSync("logindata").appName;
    this.setData({
      appName: appName,
    });
  },

  getDataFun(isTimer) {
    let that = this;
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    let params = {
      orderNo: this.data.linkData.orderNo,
      type: this.data.linkData.useType,
    };
    HTTP({
      url: 'app/ctl/chargingAndExchangeRecordDetail',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      let chargingRecordDetail = objData.chargingRecordDetail;
      let exchangeRecordDetail = objData.exchangeRecordDetail;
      chargingRecordDetail
        ?
        (chargingRecordDetail.chargingStartTimeOr =
          chargingRecordDetail && chargingRecordDetail.chargingStartTime ?
            chargingRecordDetail.chargingStartTime :
            "") :
        "";
      chargingRecordDetail
        ?
        (chargingRecordDetail.ctime =
          chargingRecordDetail && chargingRecordDetail.ctime ?
            formats(
              "YYYY.MM.dd hh:mm",
              chargingRecordDetail.ctime
            ) :
            "") :
        "";
      chargingRecordDetail
        ?
        (chargingRecordDetail.chargingEndTime =
          chargingRecordDetail && chargingRecordDetail.chargingEndTime ?
            formats(
              "YYYY.MM.dd hh:mm",
              chargingRecordDetail.chargingEndTime
            ) :
            "") :
        "";

      chargingRecordDetail
        ?
        chargingRecordDetail.costCharingTimeChend =
        chargingRecordDetail && chargingRecordDetail.costCharingTime ?
          formateSeconds(chargingRecordDetail.costCharingTime * 60) :
          "00:00:00" :
        "";
      chargingRecordDetail
        ?
        (chargingRecordDetail.chargingInstructionsList =
          chargingRecordDetail && chargingRecordDetail.chargingInstructions ?
            chargingRecordDetail.chargingInstructions :
            "") :
        "";
      exchangeRecordDetail
        ?
        (exchangeRecordDetail.ctime =
          exchangeRecordDetail && exchangeRecordDetail.ctime ?
            formats("YYYY.MM.dd hh:mm", exchangeRecordDetail.ctime) :
            "") :
        "";

      if (!isTimer) {
        if (that.data.linkData.useType == 1) {
          if (
            chargingRecordDetail.chargingStatus == 0 ||
            chargingRecordDetail.chargingStatus == 1
          ) {
            let ctimeOr = chargingRecordDetail.chargingStartTime;
            let nowTime =
              new Date().getTime() -
              ctimeOr -
              Number(chargingRecordDetail.validTime) * 1000;
            console.log(ctimeOr);
            console.log(new Date().getTime());
            console.log(nowTime);
            console.log('nowTime--------222222222--------');
            if (nowTime < 0) {
              that.setData({
                seconds: (
                  ((Number(chargingRecordDetail.validTime) + 15) * 1000 -
                    (new Date().getTime() - ctimeOr)) /
                  1000
                ).toFixed(0),

                timeFlag: true,
              });
              console.log('seconds---------------')
              that.data.timer = setInterval(() => {
                that.settimeCharge();

              }, 1000);
            } else {
              that.setData({
                timeFlag: false,
              });
            }
          }
        } else {
          if (exchangeRecordDetail.exchangeStatus == 0) {
            let ctimeOr = Number(exchangeRecordDetail.ctime);
            let nowTime =
              new Date().getTime() -
              ctimeOr -
              Number(exchangeRecordDetail.validTime) * 1000;
            console.log(ctimeOr);
            console.log(new Date().getTime());
            console.log(nowTime);
            console.log('nowTime------1111111111----------');
            if (nowTime < 0) {
              that.setData({
                seconds: (
                  (Number(exchangeRecordDetail.validTime) * 1000 -
                    (new Date().getTime() - ctimeOr)) /
                  1000
                ).toFixed(0),

                timeFlag: true,
              });
              console.log(that.data.seconds)
              that.data.timer = setInterval(() => {
                that.settimeCharge();
              }, 1000);
            } else {
              that.setData({
                timeFlag: false,
              });
            }
          }
        }

      }

      if (chargingRecordDetail && chargingRecordDetail.chargingStatus) {
        that.data.linkData.chargingStatus =
          chargingRecordDetail.chargingStatus;
      }
      app.printf(that.data.linkData)

      // if (chargingRecordDetail && (chargingRecordDetail.chargingStatus == 0 || chargingRecordDetail.chargingStatus == 1) && chargingRecordDetail.chargingStartTime) {
      if (chargingRecordDetail && chargingRecordDetail.chargingStatus == 1 && chargingRecordDetail.chargingStartTime) {
        console.log(chargingRecordDetail.chargingStartTime);
        console.log('chargingRecordDetail.chargingStartTime');
        this.changeTimeToTime(chargingRecordDetail.chargingStartTime);
      } else {
        that.setData({
          chargingAllTime: '00:00:00'
        })
      }
      that.setData({
        chargingRecordDetail: chargingRecordDetail,
        exchangeRecordDetail: exchangeRecordDetail,
        linkData: that.data.linkData,
        isRequest: true,
      });

    },
      (err) => {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 2000);
      }
    );
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

  settimeCharge() {
    let that = this;
    console.log(this.data.seconds);
    console.log('---------------settimeChargesettimeChargesettimeCharge')
    if (this.data.seconds <= 0) {
      this.setData({
        seconds: 0,
        timeFlag: false,
      });
      clearInterval(this.data.timer);
      if (chtimer) {
        clearInterval(chtimer);
      }
      this.getDataFun(true);

    } else {
      console.log('倒计时')
      this.setData({
        seconds: this.data.seconds - 1,
      });
    }

  },
  joinFeedBack() {
    wx.redirectTo({
      url: '/pages/myFeedBack/myFeedBack',
    })
  },
  joinIndex() {
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },


  operationCharging(isPop) {
    let that = this;
    let accountUid = wx.getStorageSync("logindata").uid;
    let cabinetUid = wx.getStorageSync("cabinetSelected").uid;
    let charingOrderNo = that.data.linkData.orderNo;

  },



  // 充电计时器
  changeTimeToTime(time) {
    console.log(time)
    console.log('time----------------')
    let difftime = new Date().getTime() - time;
    let tempTime = 0;
    chtimer = setInterval(() => {
      tempTime += 1000;
      this.formatDuring(difftime + tempTime);
    }, 1000);
    // this.setData({
    //   chtimer: timer,
    // });
    console.log('changeTimeToTime=============');
  },
  formatDuring(mss) {
    console.log(mss);
    app.printf('formatDuring');
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = parseInt((mss % (1000 * 60)) / 1000);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    // console.log(`正在充电计时：${hours}：${minutes}:${seconds}`);
    let chargingAllTime = hours + ":" + minutes + ":" + seconds;
    this.setData({
      chargingAllTime: chargingAllTime,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log('onHide')
    clearInterval(this.data.timer);
    clearInterval(chtimer);

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log('onUnload')
    clearInterval(this.data.timer);
    clearInterval(chtimer);

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});