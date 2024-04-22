//Page Object
const app = getApp();
let baseUrlImgCurr = app.globalData.baseUrlImg;
import {
  HTTP
} from "../../utils/server";
import {
  formats
} from "../../utils/util";
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    logindata: wx.getStorageSync("logindata") || {},
    supportPowerBean: false,
    isRequest: false,
    realName: null,
    depost: null,
    selfServiceFetchElectricity: null,
    haselectronic: true,
    infoData: "",
    isRecommendStatus: false,
    lastDate: 0,
    coverUrl: '',
    userPhoto: '',
    menuList: [{
        title: "使用记录",
        img: `${baseUrlImgCurr}v4_my_icon_cont_syjl@2x.png`,
        url: "/pages/myUsagelog/myUsagelog",
      },
      // {
      //   title: "服务网点",
      //   img: `${baseUrlImgCurr}v4_my_icon_cont_wddt@2x.png`,
      //   url: "/pages/myMapList/myMapList",
      // },
      {
        title: "寄存",
        img: `${baseUrlImgCurr}jicun.png`,
        url: "/pages/deposit/deposit",
      },
      {
        title: "客服中心",
        img: `${baseUrlImgCurr}v4_my_icon_cont_kezx@2x.png`,
        url: "/pages/myService/myService",
      },
      {
        title: "优惠券",
        img: `${baseUrlImgCurr}icon_cont_kfzx@2x.png`,
        url: "/pages/couponlist/couponlist",
      },
      {
        title: "公告消息",
        img: `${baseUrlImgCurr}v4_my_icon_cont_info@2x.png`,
        url: "/pages/announcement/announcement",
      },
      {
        title: "我的车辆",
        img: `${baseUrlImgCurr}myCar_Group_21@2x.png`,
        url: "/pages/myCar/myCar",
      },
      {
        title: "设置",
        img: `${baseUrlImgCurr}v4_my_icon_cont_sz@2x.png`,
        url: "/pages/mySetUp/mySetUp",
      },
      {
        title: "更多",
        img: `${baseUrlImgCurr}v4_my_icon_cont_gd@2x.png`,
        url: "/pages/myMore/myMore",
      },
    ],
    batRentList: [],
  },
  onLoad: function (options) {
    if (wx.getStorageSync('nearestSotreId')) {
      wx.removeStorageSync('nearestSotreId');
      wx.removeStorageSync('selectStoreObj');
    }
  },
  onShow() {
    if (wx.getStorageSync('userPhoto')) {
      this.setData({
        userPhoto: wx.getStorageSync('userPhoto')
      })
    }
    if (wx.getStorageSync("logindata")) {
      let logindata = wx.getStorageSync("logindata");
      this.setData({
        supportPowerBean: logindata.isSupportPowerBean
      })
      this.setCoverUrl(logindata)
      logindata.account = logindata.account ?
        logindata.account.replace(logindata.account.slice(3, 7), "****") :
        "";
      this.setData({
        logindata: logindata,
      });
    } else {
      this.setData({
        logindata: {},
      });
    }
    if (this.data.logindata.unregistered) {
      this.setData({
        isRequest: true,
      });
    } else {
      this.getDataFun();
    }
  
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
  // 设置个人中心banner封面图
  setCoverUrl(logindata) {
    let functionPicture = logindata.functionPicture
    if (functionPicture) {
      functionPicture.map(item => {
        if (item.functionType == 2) {
          this.setData({
            coverUrl: item.coverUrl
          })

        }
      })

    }
  },
  // 跳转到服务网点
  gotoservercenter() {
    wx.redirectTo({
      url: '/pages/myOffStore/myOffStore'
    })
  },
  // 立即租取电
  gotoRentel() {
    if (!this.data.realName) {
      wx.navigateTo({
        url: '/pages/myCertificationTake/myCertificationTake',
      })

    } else {
      if (this.data.depost == 0) {
        wx.navigateTo({
          url: '/pages/myPayDepositOther/myPayDepositOther',
        })
      } else if (this.data.depost == 1) {
        wx.navigateTo({
          url: '/pages/cameraScanTake/cameraScanTake',
        })
      } else if (this.data.depost == 2) {
        wx.showToast({
          title: '押金退还中',
          icon: 'none'
        })
      }
    }

  },
  getDataFun() {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    let that = this;
    let params = {};
    HTTP({
      url: 'app/wx/userCenter',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data;
      objData.walletMoney = Number(objData.walletMoney).toFixed(2);
      that.setData({
        infoData: objData,
        isRequest: true,
        selfServiceFetchElectricity: objData.selfServiceFetchElectricity,
        realName: objData.realName,
        depost: objData.payDepostStatus,
        isRecommendStatus: res.data.recommendStatus
      });

      wx.setStorageSync("myCenterInfo", objData);
      wx.setStorageSync('batteryDepositOrderStatus', objData.payDepostStatus)
    })

  },
  joinRegister() {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.navigateTo({
        url: "/pages/registered/registered"
      })
    } else {
      wx.navigateTo({
        url: "/pages/registeredPre/registeredPre"
      })
    }
  },



  joinMyqr() {
    if (this.data.logindata.unregistered) {
      let userInfo = wx.getStorageSync('userInfo')
      if (this.throttle()) {
        if (userInfo) {
          wx.navigateTo({
            url: "/pages/registered/registered"
          })
        } else {
          wx.navigateTo({
            url: "/pages/registeredPre/registeredPre"
          })
        }
      }

      return;
    }
    wx.navigateTo({
      url: "/pages/myQrcode/myQrcode",
    });
  },
  saveQrFun() {},
  // 我的电粒
  gotoelectric(e) {
    if (this.data.logindata.unregistered) {
      let userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        wx.navigateTo({
          url: "/pages/registered/registered"
        })
      } else {
        wx.navigateTo({
          url: "/pages/registeredPre/registeredPre"
        })
      }
      return;
    } else {
      if (this.throttle()) {
        wx.navigateTo({
          url: "/pages/myElectricbeans/myElectricbeans",
        });
      }
    }

  },
  gotomycoins(e) {
    if (this.data.logindata.unregistered) {

      if (this.throttle()) {
        let userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
          wx.navigateTo({
            url: "/pages/registered/registered"
          })
        } else {
          wx.navigateTo({
            url: "/pages/registeredPre/registeredPre"
          })
        }
      }

      return;
    } else {
      let index = Number(e.currentTarget.dataset.index);
      switch (index) {
        case 0:
          if (this.throttle()) {
            wx.navigateTo({
              url: "/pages/myWallet/myWallet",
            });
          }

          break;
        case 1:
          // 我的电池
          // payDepostStatus 0：未缴纳，1：已经缴纳, 2:正在退回押金
          if (this.data.infoData.payDepostStatus == 1) {
            if ((!this.data.infoData.userAppointment) || (this.data.infoData.userAppointment && this.data.infoData.userAppointment.appointmentStatus != 1)) {
              if (this.data.infoData.applyForReturnBattery == 1) {
                if (this.throttle()) {
                  wx.navigateTo({
                    url: "/pages/myReturnbat/myReturnbat",
                  });
                }
              } else {
                if (this.throttle()) {
                  wx.navigateTo({
                    url: "/pages/myBattery/myBattery"
                  });
                }
              }
            } else if (this.data.infoData.userAppointment && this.data.infoData.userAppointment.appointmentStatus == 1) {

              if (this.data.infoData.userAppointment.appointmentStatus == 1) {
                this.getDataFunAgain();

              } else {
                if (this.data.infoData.applyForReturnBattery == 1) {
                  if (this.throttle()) {
                    wx.navigateTo({
                      url: "/pages/myReturnbat/myReturnbat",
                    });
                  }
                } else {
                  if (this.throttle()) {
                    wx.navigateTo({
                      url: "/pages/myBattery/myBattery"
                    });
                  }
                }
              }

            }
          } else {
            if ((!this.data.infoData.userAppointment) || (this.data.infoData.userAppointment && this.data.infoData.userAppointment.appointmentStatus != 1)) {
              if (this.data.infoData.applyForReturnBattery == 1) {
                if (this.throttle()) {
                  wx.navigateTo({
                    url: "/pages/myReturnbat/myReturnbat",
                  });
                }
              } else {
                if (this.throttle()) {
                  wx.navigateTo({
                    url: "/pages/myBattery/myBattery"
                  });
                }
              }
            } else if (this.data.infoData.userAppointment && this.data.infoData.userAppointment.appointmentStatus == 1) {

              if (this.data.infoData.userAppointment.appointmentStatus == 1) {
                this.getDataFunAgain();

              } else {
                if (this.data.infoData.applyForReturnBattery == 1) {
                  if (this.throttle()) {
                    wx.navigateTo({
                      url: "/pages/myReturnbat/myReturnbat",
                    });
                  }
                } else {
                  if (this.throttle()) {
                    wx.navigateTo({
                      url: "/pages/myBattery/myBattery"
                    });
                  }
                }
              }

            }
          }
          break;
        case 2:
          if (this.throttle()) {
            wx.navigateTo({
              url: "/pages/myCoupon/myCoupon",
            });
          }

          break;

        default:
          break;
      }
    }
  },

  getDataFunAgain() {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    let that = this;
    let params = {};
    HTTP({
      url: 'app/wx/userCenter',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data;
      objData.walletMoney = Number(objData.walletMoney).toFixed(2);
      that.setData({
        infoData: objData,
        isRecommendStatus: res.data.recommendStatus
      });
      if (that.data.infoData.userAppointment.appointmentStatus == 1) {
        wx.navigateTo({
          url: '/pages/appointmentInfo/appointmentInfo',
        })

      } else {
        if (that.data.infoData.applyForReturnBattery == 1) {

          wx.navigateTo({
            url: "/pages/myReturnbat/myReturnbat",
          });

        } else {
          wx.navigateTo({
            url: "/pages/myBattery/myBattery"
          });
        }
      }
    })
  },



  joinCombo(e) {
    if (this.data.logindata.unregistered) {
      if (this.throttle()) {
        let userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
          wx.navigateTo({
            url: "/pages/registered/registered"
          })
        } else {
          wx.navigateTo({
            url: "/pages/registeredPre/registeredPre"
          })
        }
      }
      return;
    } else {
      if(!this.data.infoData.payDepost){
        wx.navigateTo({
          url: "/pages/myCertificationTake/myCertificationTake"
        });
      }else{
        let type = e.currentTarget.dataset.type;
        // payDepostStatus 0：未缴纳，1：已经缴纳, 2:正在退回押金
        if (this.data.infoData.payDepostStatus == 0) {
          wx.setStorageSync("comboType", 4);
          if (this.throttle()) {
            wx.navigateTo({
              url: `/pages/myCombo/myCombo?currType=${type}`
            });
          }
        } else if (this.data.infoData.payDepostStatus == 2) {
          wx.setStorageSync("comboType", 7);
          if (this.throttle()) {
            wx.navigateTo({
              url: `/pages/myCombo/myCombo?currType=${type}`
            });
          }
        } else {
          wx.setStorageSync("comboType", type);
          if (this.throttle()) {
            wx.navigateTo({
              url: "/pages/myCombo/myCombo"
            });
          }
        }
      }

  
      // if (this.data.infoData.bindBattery) {
      //   // payDepostStatus 0：未缴纳，1：已经缴纳, 2:正在退回押金
      //   if (this.data.infoData.payDepostStatus == 0) {
      //     wx.setStorageSync("comboType", 4);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: `/pages/myCombo/myCombo?currType=${type}`
      //       });
      //     }
      //   } else if (this.data.infoData.payDepostStatus == 2) {
      //     wx.setStorageSync("comboType", 7);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: `/pages/myCombo/myCombo?currType=${type}`
      //       });
      //     }
      //   } else {
      //     wx.setStorageSync("comboType", type);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: "/pages/myCombo/myCombo"
      //       });
      //     }
      //   }
      // } else {
      //   if (this.data.infoData.payDepostStatus == 0) {
      //     wx.setStorageSync("comboType", 4);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: `/pages/myCombo/myCombo?currType=${type}`
      //       });
      //     }
      //   } else if (this.data.infoData.payDepostStatus == 2) {
      //     wx.setStorageSync("comboType", 7);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: `/pages/myCombo/myCombo?currType=${type}`
      //       });
      //     }
      //   } else {
      //     wx.setStorageSync("comboType", 6);
      //     if (this.throttle()) {
      //       wx.navigateTo({
      //         url: `/pages/myCombo/myCombo?currType=${type}`
      //       });
      //     }
      //     // app.printf(type);
      //     // wx.setStorageSync("comboType", type);
      //     // if (this.throttle()) {
      //     //   wx.navigateTo({
      //     //     url: "/pages/myCombo/myCombo"
      //     //   });
      //     // }
      //   }

      // }

    }
  },
  joinSet() {
    if (this.data.logindata.unregistered) {
      let userInfo = wx.getStorageSync('userInfo')
      if (this.throttle()) {
        if (userInfo) {
          wx.navigateTo({
            url: "/pages/registered/registered"
          })
        } else {
          wx.navigateTo({
            url: "/pages/registeredPre/registeredPre"
          })
        }
      }
      return;
    }
    wx.navigateTo({
      url: '/pages/mySetUp/mySetUp',
    })
  },
  joinPage(e) {
    let item = e.currentTarget.dataset.item;
    if (item.url == "/pages/myMore/myMore") {

      if (this.throttle()) {
        wx.navigateTo({
          url: `${item.url}`,
        });
      }
    } else if (item.url == "/pages/myMapList/myMapList") {
      // 跳转服务网点
      this.gotoservercenter()
    } else {
      if (this.data.logindata.unregistered) {
        let userInfo = wx.getStorageSync('userInfo')
        if (this.throttle()) {
          if (userInfo) {
            wx.navigateTo({
              url: "/pages/registered/registered"
            })
          } else {
            wx.navigateTo({
              url: "/pages/registeredPre/registeredPre"
            })
          }
        }
        return;
      }
      if (item.url) {

        if (this.throttle()) {
          wx.navigateTo({
            url: `${item.url}`,
          });
        }

      }
    }



  },
});