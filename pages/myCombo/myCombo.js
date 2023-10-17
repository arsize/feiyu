// pages/myCombo/myCombo.js
import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
const app = getApp();

Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    isProtocol:false,
    isExplain: false,
    // 1：购买套餐  2.我的套餐  3.升级套餐  4.缴纳押金   5.该地区暂无套餐  6.没有绑定电池  7.退押金中
    // comboType: 1,
    comboType: wx.getStorageSync("comboType"),
    rechargeMoney: 0,
    batteryType:'',
    userCouponList:[],
    userCouponNameIndex:-1,
    userCouponNameList:[],
    buyComboList: [],
    buyComboListS: [],
    buyComboListE: [],
    buyComboCurr: -1,
    buyComboMoney: 0,
    isRequest: false,
    iswxPay: false,
    isPay: false,
    rechargedialogShow: false,
    comboDetail: {},
    lastDate: 0,
    myCenterInfo: wx.getStorageSync("myCenterInfo"),
    isfold: true,
    currType: 0,
    freType: "",
    frequencyCardCategory: "",
    userType: wx.getStorageSync("userType"),
    batteryDepositOrderStatus:Number(wx.getStorageSync("batteryDepositOrderStatus")),
  },

  onLoad: function (options) {
    if (options.currType) {
      this.data.currType = options.currType;
    }
  },

  onShow: function () {
    this.setData({
      isRequest: false,
      comboType: wx.getStorageSync("comboType"),
      myCenterInfo: wx.getStorageSync("myCenterInfo"),
      userType: wx.getStorageSync("userType"),
    });
    this.checkFrequencyType();

    if (this.data.comboType == 1) {
      wx.setNavigationBarTitle({
        title: "购买套餐",
      });
      this.getFrequencyCardList();
    } else if (this.data.comboType == 2) {
      wx.setNavigationBarTitle({
        title: "我的套餐",
      });
      this.getUserFrequencyCardList();
    } else if (this.data.comboType == 3) {
      wx.setNavigationBarTitle({
        title: "升级套餐",
      });
      this.setData({
        comboDetail: wx.getStorageSync("comboDetail"),
      });
      this.getUpgradeFrequencyCardList();
    } else if (
      this.data.comboType == 4 ||
      this.data.comboType == 6 ||
      this.data.comboType == 7
    ) {
      if (this.data.currType == 1) {
        wx.setNavigationBarTitle({
          title: "购买套餐",
        });
      } else {
        wx.setNavigationBarTitle({
          title: "我的套餐",
        });
      }

      this.setData({
        isRequest: true,
      });

      let content = "";
      // if (this.data.comboType == 4 || this.data.comboType == 6) {
      if (Number(wx.getStorageSync("batteryDepositOrderStatus"))!==1&& (this.data.comboType == 4 || this.data.comboType == 6)) {
        if (this.data.comboType == 4) {
          content = "暂不能购买套餐，请先开通换电服务";
        } else if (this.data.comboType == 6) {
          content = "暂不能购买套餐，请先开通换电服务";
        }
        let option = {
          status: true,
          content: content,
          clickBlackType: "goBack",
          foot: [
            {
              text: "我知道了",
              cb: () => {
                wx.navigateBack({
                  delta: 1,
                });
              },
            },
          ],
        };
        app.globalData.emitter.emit("dialogstatus", option);
      }
    } else if (this.data.comboType == 5) {
      wx.setNavigationBarTitle({
        title: "购买套餐",
      });
      this.setData({
        isRequest: true,
      });
    }
  },
  // 获取套餐类型（是否包月策略）
  checkFrequencyType() {
    // 套餐类型：0（次卡套餐无限时），1（限时套餐），2（限时套餐无限次），3（包月套餐），4（叠加包套餐）
    HTTP({
      url: "wallet/getFrequencyCardType",
      methods: "get",
      data: {},
    }).then((res) => {
      let freType = res.data;
      this.setData({
        freType: freType,
      });
    });
  },
  // 变更包月套餐
  changeMonthlyfrequency() {
    wx.navigateTo({
      url: "/pages/changeMonthlyfrequency/changeMonthlyfrequency",
    });
  },
  //  购买套餐列表
  getFrequencyCardList() {
    let that = this;
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    that.setData({
      buyComboList: [],
      isfold: true,
      buyComboListE: [],
      buyComboListS: [],
    });
    let params = {};
    HTTP({
      url: "wallet/getFrequencyCardList",
      methods: "get",
      data: params,
      loading: true,
    }).then(
      (res) => {
        let objData = res.data;
        let activityFrequencyCardList = objData.activityFrequencyCardList || [];
        let frequencyCardList = objData.frequencyCardList || [];
        let listdata = activityFrequencyCardList.concat(frequencyCardList);

        if (listdata.length > 0) {
          listdata.map((item, index) => {
            if (item.activityType == 2) {
              if (item.num != 0 && item.num != -1) {
                item.times = Number(item.price / item.num).toFixed(2);
              } else {
                item.times = -1;
              }
            }
            if (index < 3) {
              that.data.buyComboListS.push(item);
            }
          });
          if (listdata.length > 3) {
            that.data.buyComboListE = listdata;
          } else {
            that.data.buyComboListS = listdata;
            that.data.buyComboListE = listdata;
          }

          this.data.buyComboObj = listdata[0];
          this.setData({
            buyComboCurr: 0,
            buyComboMoney: listdata[0].price,
          });
        }

        
        const userCouponListCurr = objData.userCouponList.map((item)=>item.name)

        console.log("userCouponListCurr",userCouponListCurr)
        that.setData({
          buyComboList: listdata,
          buyComboListE: that.data.buyComboListE,
          batteryType:objData.batteryType,
          isRequest: true,
          userCouponList:objData.userCouponList,
          userCouponNameList:userCouponListCurr

        });
      },
      (err) => {
        that.setData({
          isRequest: true,
        });
      }
    );
  },

  bindPickerChangeCoupon: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      userCouponNameIndex: e.detail.value
    })
  },


  viewMore(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        isfold: false,
        buyComboList: this.data.buyComboListE,
      });
    } else {
      this.setData({
        isfold: true,
        buyComboList: this.data.buyComboListS,
      });
    }
  },
  selectbuyCombo(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.data.buyComboObj = item;
    this.setData({
      buyComboCurr: index,
      buyComboMoney: item.price,
    });
  },

  //   我的套餐列表
  getUserFrequencyCardList() {
    let that = this;
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    that.setData({
      buyComboList: [],
      isfold: true,
      buyComboListE: [],
      buyComboListS: [],
    });
    let params = {};

    HTTP({
      url: "wallet/getUserFrequencyCardList",
      methods: "get",
      data: params,
      loading: true,
    }).then(
      (res) => {
        let listdata = res.data;
        if (listdata.length > 0) {
          listdata.map((item, index) => {
            if (item.loseEffectTime) {
              item.loseEffectTime = formats("YYYY.MM.dd", item.loseEffectTime);
            } else {
              item.loseEffectTime = "--";
            }
            if (item.takeEffectTime) {
              item.takeEffectTime = formats("YYYY.MM.dd", item.takeEffectTime);
            } else {
              item.takeEffectTime = "--";
            }
            if (index < 3) {
              that.data.buyComboListS.push(item);
            }
          });
          if (listdata.length > 3) {
            that.data.buyComboListE = listdata;
          } else {
            that.data.buyComboListS = listdata;
            that.data.buyComboListE = listdata;
          }
        }
        that.setData({
          buyComboList: that.data.buyComboListS,
          buyComboListE: that.data.buyComboListE,
          isRequest: true,
          frequencyCardCategory:
            that.data.buyComboListS.length > 0
              ? that.data.buyComboListS[0].frequencyCardCategory
              : "",
        });
      },
      (err) => {
        that.setData({
          isRequest: true,
        });
      }
    );
  },
  //   升级套餐列表
  getUpgradeFrequencyCardList() {
    let that = this;
    that.setData({
      buyComboList: [],
    });
    let params = {
      frequencyCardId: this.data.comboDetail.frequencyCardId,
    };
    HTTP("/wallet/getUpgradeFrequencyCardList", params, true).then(
      (res) => {
        let listdata = res.data;
        if (listdata.length > 0) {
          listdata.map((item, index) => {
            let money = item.price;
            item.priceStart = money;
            item.price =
              item.price - Number(that.data.comboDetail.frequencyCardPrice);
          });

          this.data.buyComboObj = listdata[0];
          this.setData({
            buyComboCurr: 0,
            buyComboMoney: listdata[0].price,
          });
        }
        that.setData({
          buyComboList: listdata,
          isRequest: true,
        });
      },
      (err) => {
        that.setData({
          isRequest: true,
        });
      }
    );
  },
  knowExplain() {
    this.setData({
      isExplain: !this.data.isExplain,
    });
  },

  joinDetail(e) {
    let item = e.currentTarget.dataset.item;
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

  btnFun(e) {
    let type = e.currentTarget.dataset.type;
    wx.setStorageSync("comboType", type);
    this.setData({
      isRequest: false,
      comboType: type,
    });
    switch (type) {
      case "1":
        if (this.data.comboType == 1) {
          wx.setNavigationBarTitle({
            title: "购买套餐",
          });
          this.getFrequencyCardList();
        }

        break;
      case "2":
        break;
      case "3":
        break;
      case "4":
        if (this.throttle()) {
          if (this.data.myCenterInfo.payDepostStatus == 2) {
            wx.redirectTo({
              url: `/pages/myBattery/myBattery`,
            });
          } else {
            wx.redirectTo({
              url: `/pages/myOpenServ/myOpenServ`,
            });
          }
        }

        break;

      default:
        break;
    }
  },

  // 购买套餐叠加包
  btnFunDieJia() {
    wx.navigateTo({
      url: "/pages/changeOverlaypackage/changeOverlaypackage",
    });
  },
  closeDialog() {
    this.setData({
      rechargedialogShow: false,
    });
  },

  protocolFun() {
    this.setData({
      isProtocol: !this.data.isProtocol
    });
  },
  joinAgree(){
    wx.navigateTo({
      url: "/pages/myAgreement/myAgreement"
  })
  },

  // 去支付
  checkPayFun() {

if(!this.data.isProtocol){
  wx.showToast({
    title: "请先勾选协议",
    icon: "none",
    duration: 2000,
    mask: true,
  });
  return;
}

    let that = this;
    let name = this.data.buyComboList[this.data.buyComboCurr].name;
    let activeId = this.data.buyComboList[this.data.buyComboCurr].id;
    const couponId = this.data.userCouponList[Number(this.data.userCouponNameIndex)]&&this.data.userCouponList[Number(this.data.userCouponNameIndex)].id;
    
    wx.navigateTo({
      url:
        "/pages/payforend/payforend?money=" +
        this.data.buyComboMoney +
        "&type=0" +
        "&name=" +
        name +
        "&activeId=" +
        activeId+
        "&couponId=" +
        couponId,
    });
  },
  topupFun() {
    wx.navigateTo({
      url: "/pages/myGoldDeposits/myGoldDeposits",
    });
  },
  weChatpayment() {
    this.rechargeFun();
  },
  // 支付
  rechargeFun() {
    let that = this;
    this.setData({
      rechargedialogShow: false,
    });
    let openId = wx.getStorageSync("logindata").openId;
    let params = {
      openId: wx.getStorageSync("logindata").openId,
      frequencyCardId: this.data.buyComboList[this.data.buyComboCurr].id,
      wxPay: true,
    };
    wx.showLoading({
      title: "支付中",
      mask: true,
    });
    that.setData({
      iswxPay: true,
    });
    HTTP({
      url: "pay/payFrequencyCard",
      methods: "post",
      data: params,
      loading: true,
    }).then(
      (res) => {
        let chooseWXPayInfo = res.data;
        wx.requestPayment({
          nonceStr: chooseWXPayInfo.nonceStr,
          package: chooseWXPayInfo.packageInfo,
          signType: chooseWXPayInfo.signType,
          timeStamp: chooseWXPayInfo.timeStamp,
          paySign: chooseWXPayInfo.paySign,
          success: function (res) {
            that.setData({
              iswxPay: false,
            });
            wx.showToast({
              title: "支付成功",
              icon: "success",
              duration: 2000,
              mask: true,
            });
            setTimeout(() => {
              let type = 2;
              wx.setStorageSync("comboType", type);
              that.setData({
                isRequest: false,
                comboType: type,
              });
              wx.setNavigationBarTitle({
                title: "我的套餐",
              });
              that.getUserFrequencyCardList();
            }, 2000);
          },
          fail: function (res) {
            that.setData({
              iswxPay: false,
            });
            wx.showToast({
              title: "支付失败",
              image: "/images/icon_fail.png",
              duration: 2000,
              mask: true,
            });
          },
        });
      },
      (err) => {
        that.setData({
          iswxPay: false,
        });
        if (err.code == 3008) {
          wx.showToast({
            title: err.msg,
            icon: "none",
            duration: 2000,
            mask: true,
          });
        } else if (err.code == 2008) {
          wx.showToast({
            title: err.msg,
            icon: "none",
            duration: 2000,
            mask: true,
          });
        }
      }
    );
  },

  okPayFun() {
    this.setData({
      isPay: !this.data.isPay,
    });
  },
  // 余额支付
  balanceFun() {
    let that = this;
    that.setData({
      isPay: false,
    });
    let openId = wx.getStorageSync("logindata").openId;
    let params = {
      openId: wx.getStorageSync("logindata").openId,
      frequencyCardId: this.data.buyComboList[this.data.buyComboCurr].id,
      wxPay: false,
    };
    HTTP({
      url: "pay/payFrequencyCard",
      methods: "post",
      data: params,
      loading: true,
    }).then(
      (res) => {
        wx.showToast({
          title: "支付成功",
          icon: "success",
          duration: 2000,
          mask: true,
        });
        setTimeout(() => {
          let type = 2;
          wx.setStorageSync("comboType", type);
          that.setData({
            isRequest: false,
            comboType: type,
          });
          wx.setNavigationBarTitle({
            title: "我的套餐",
          });
          that.getUserFrequencyCardList();
        }, 2000);
      },
      (err) => {
        if (err.code == 3008) {
          wx.showToast({
            title: err.msg,
            icon: "none",
            duration: 2000,
            mask: true,
          });
        } else if (err.code == 2008) {
          wx.showToast({
            title: err.msg,
            icon: "none",
            duration: 2000,
            mask: true,
          });
        }
      }
    );
  },

  btmBtnFun(e) {
    let type = e.currentTarget.dataset.type;
    switch (type) {
      case "4":
        let content = "";
        let textR = "";
        if (this.data.comboType == 4) {
          content = "暂不能购买套餐，请先缴纳押金激活电池。";
          textR = "去激活电池";
        } else {
          content = "暂不能购买套餐，请先开通换电服务";
          textR = "开通服务";
        }
        let option = {
          status: true,
          content: content,
          foot: [
            {
              text: "稍后再说",
              cb: () => {
                wx.navigateBack({
                  delta: 1,
                });
              },
            },
            {
              text: textR,
              cb: () => {
                if (this.data.comboType == 4) {
                  wx.redirectTo({
                    url: "/pages/myBattery/myBattery",
                  });
                } else {
                  wx.redirectTo({
                    url: "/pages/exchangeserver/exchangeserver",
                  });
                }
              },
            },
          ],
        };
        app.globalData.emitter.emit("dialogstatus", option);

        break;

      case "2":
        // if (this.data.freType == 3 || this.data.freType == 4) {
        // 包月套餐
        if (this.data.userType == 1) {
          wx.redirectTo({
            url: "/pages/myComboMonthlyContract/myComboMonthlyContract",
          });
          return;
        }
        // }

        this.setData({
          isRequest: false,
          comboType: 1,
        });
        wx.setNavigationBarTitle({
          title: "购买套餐",
        });
        this.getFrequencyCardList();
        break;
      case "7":
        wx.redirectTo({
          url: "/pages/myBattery/myBattery",
        });
        break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      rechargedialogShow: false,
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      rechargedialogShow: false,
    });
  },
});
