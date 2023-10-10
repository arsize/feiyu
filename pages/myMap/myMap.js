// pages/myMap/myMap.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
Page({

  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    mapHeight: '100%',
    mapWidth: '100%',
    mapTop: '0',
    point: {
      latitude: '',
      longitude: ''
    },
    nowPoint: '',
    markers: [],
    cabitList: [],
    mapScale: 14,
    serveTypeList: [{
      title: '充电',
    }, {
      title: '换电',
    }, {
      title: '服务网点',
    }],
    serveTypeCurr: 0,
    iscabinet: false,
    nowCabinet: {},
    isStore: false,
    nowStore: {},
    iscabinetList: false,
    chargeCabinetList: [],
    shopBusinessList: [],
    bookAShopBusiness: false,
    bindBattery: false,
    realName: false,
    activateBattery: true,
    indexCurrCab: -1,
    indexCurrSto: -1,
    batteryTypeList: [],
    isBatType: false,
    currBat: -1,
    isMoreCabit: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.type) {
      this.setData({
        serveTypeCurr: options.type
      })
    }
    this.getBatteryTypeByAgentId();

    setTimeout(() => {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          const latitude = res.latitude
          const longitude = res.longitude

          let obj = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          that.setData({
            point: obj
          })
          that.getCityInfo(that.data.point);

        },
        fail(res) {
          let pointCurr = {
            latitude: 22.55329,
            longitude: 113.88308
          }
          that.setData({
            point: pointCurr
          })
          that.positionFun();
        }
      })
    }, 400)
    wx.removeStorageSync('currMapParams');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext("myMap");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (wx.getStorageSync('currMapParams')) {
      let currMapParams = wx.getStorageSync('currMapParams');
      if (currMapParams.serveTypeCurr == 2) {
        this.data.markers.map((item, index) => {
          if (currMapParams.id == item.idCurr) {
            item.width = 31;
            item.height = 31;
            item.iconPath = `/images/icon_store_selected@2x.png`;
          } else {
            item.width = 31;
            item.height = 31;
            if (item.iconPath.indexOf('_selected') != -1) {
              item.iconPath = item.iconPath.split("_selected")[0] + '@2x.png'
            }
          }
        })

        this.setData({
          markers: this.data.markers,
          nowStore: currMapParams,
          isStore: true,
          iscabinet: false,
          isBatType: false,
          serveTypeCurr: 2,

        })
      } else if (currMapParams.serveTypeCurr == 1) {
        this.data.markers.map((item, index) => {
          if (currMapParams.cabinetDid == item.cabinetDid) {
            if (item.serveTypeCurr == 1) {
              item.width = 31;
              item.height = 31;
              if (item.iconPath.indexOf('_selected') == -1) {
                item.iconPath = item.iconPath.split("@")[0] + '_selected@2x.png'
              }
            } else {
              item.width = 31;
              item.height = 31;
              item.iconPath = `/images/icon_store@2x.png`;
            }
            this.setData({
              indexCurrCab: index
            })
          } else {
            if (item.iconPath.indexOf('_selected') != -1) {
              item.width = 31;
              item.height = 31;
              item.iconPath = item.iconPath.split("_selected")[0] + '@2x.png'
            }

          }
        })
        this.setData({
          markers: this.data.markers,
          nowCabinet: currMapParams,
          isStore: false,
          iscabinet: true,
          serveTypeCurr: 1,
        })
        this.getBoxInfoByCabinetId();
      }
    }

    wx.removeStorageSync('currMapParams');
  },

  positionFun() {
    let that = this;
    wx.showModal({
      title: '请授权地理位置',
      content: '需获取您的地理位置以提供更好的充换电服务，请确认授权',
      confirmColor: "#1A6EFF",
      success(res) {
        if (res.confirm) {
          that.regetLocation()
        } else if (res.cancel) {

        }
      }
    })
  },


  regetLocation() {
    let that = this
    wx.openSetting({
      success: function (data) {
        if (data.errMsg == "openSetting:ok") {
          if (data.authSetting["scope.userLocation"] == true) {
            that.getLocations().then(res => {
              let obj = {
                latitude: res.latitude,
                longitude: res.longitude
              }
              that.setData({
                point: obj
              })
              that.getCityInfo(that.data.point);
            })
          }
        }
      }
    })
  },
  getBatteryTypeByAgentId() {
    let that = this;
    let params = {
    }
    HTTP({
      url: 'battery/getBatteryTypeByAgentId',
      methods: 'get',
      data: params,
    }).then(res => {
      let listData = res.data;
      this.setData({
        currBat: 0,
        batteryTypeList: listData ? listData : []
      })
      if (that.data.serveTypeCurr == 1) {
        that.setData({
          isBatType: true
        })
      }
    },
      err => {

      }
    );
  },
  getCityInfo(point) {
    let that = this;
    let params = {
      latitude: point.latitude,
      longitude: point.longitude,
      organizationId: wx.getStorageSync("logindata").organizationId || 2,
    }
    HTTP({
      url: 'cabinet/getCityInfoByOrganizationId',
      methods: 'get',
      data: params,
    }).then(res => {
      let inRegion = res.data ? res.data.inRegion : ''
      that.data.point.latitude = point.latitude
      that.data.point.longitude = point.longitude
      that.data.point.organizationId = inRegion ? inRegion.organizationId : 0
      that.getDataFun(point);
    },
      err => {
        console.log(err);
      }
    );
  },
  getDataFun(point) {
    let that = this;
    let logindata = wx.getStorageSync('logindata')
    if (!logindata.organizationId) {
      wx.reLaunch({
        url: '/pages/loading/loading'
      })
      return
    }
    this.setData({
      cabitList: [],
      markers: [],
      nowCabinet: {},
      indexCurrSto: -1,
      indexCurrCab: -1,
      iscabinet: false,
      iscabinetList: false,
      isStore: false,
      isMoreCabit: false,
    })
    let params = {
      type: this.data.serveTypeCurr,
      latitude: point.latitude,
      longitude: point.longitude,
      organizationId: logindata.organizationId,
      areaOrganizationId: that.data.point.organizationId,
    };
    if (this.data.serveTypeCurr == 1 && this.data.isBatType && this.data.currBat != -1) {
      params.searchBatteryTypeId = this.data.batteryTypeList[this.data.currBat].batteryTypeId
    }
    this.data.paramsCurr = params;
    HTTP({
      url: 'cabinet/map/roundList',
      methods: 'get',
      data: params,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;

      let chargeCabinetList = objData && objData.cabinetList ? objData.cabinetList : [];
      let shopBusinessList = objData && objData.shopBusinessList ? objData.shopBusinessList : [];
      let roundData = [],
        markersNow = [],
        nowcabitList = [];
      if (chargeCabinetList) {
        chargeCabinetList.map((item, index) => {
          item.serveTypeCurr = 1;
          if (item.nearbyPicurl) {
            item.imgList = item.nearbyPicurl.split(',');
          } else {
            item.imgList = [];
          }

        })
      }
      if (shopBusinessList) {
        shopBusinessList.map((item, index) => {
          item.serveTypeCurr = 2;
          if (item.businessPicUrl) {
            item.imgList = item.businessPicUrl.split(',');
          } else {
            item.imgList = [];
          }

        })
      }
      if (this.data.serveTypeCurr == 0) {
        roundData = chargeCabinetList;
      } else if (this.data.serveTypeCurr == 1) {
        roundData = chargeCabinetList;
      } else if (this.data.serveTypeCurr == 2) {
        roundData = shopBusinessList;
      }

      roundData.map((item, index) => {
        item.indexid = index;
        if (item.serveTypeCurr == 1) {
          if (Number(item.userFromDistance) > 1000) {
            item.userFromDistance = (Number(item.userFromDistance) / 1000).toFixed(2);
            item.unit = 'km';
          } else {
            item.unit = 'm';
          }

          let markerObj = {
            id: index,
            iconPath: ``,
            longitude: item.longitude,
            latitude: item.latitude,
            width: 31,
            height: 31,
            serveTypeCurr: item.serveTypeCurr,
            line: item.line,
            cabinetDid: item.cabinetDid
          };

          if (item.line == 1) {
            if (this.data.serveTypeCurr == 0) {
              let canUseChargingPortNum = item.canUseChargingPortNum
              if (canUseChargingPortNum == 0 || canUseChargingPortNum == null) {
                markerObj.iconPath = `/images/icon_cdk0@2x.png`;
              } else if (canUseChargingPortNum == 1) {
                markerObj.iconPath = `/images/icon_cdk1@2x.png`;
              } else if (canUseChargingPortNum == 2) {
                markerObj.iconPath = `/images/icon_cdk2@2x.png`;
              } else if (canUseChargingPortNum == 3) {
                markerObj.iconPath = `/images/icon_cdk3@2x.png`;
              } else if (canUseChargingPortNum == 4) {
                markerObj.iconPath = `/images/icon_cdk4@2x.png`;
              }
            } else {
              let num = item.canUseExchangeBatteryNum
              if (num == 0) {
                markerObj.iconPath = `/images/icon_hdc0@2x.png`;
              } else if (num == 1) {
                markerObj.iconPath = `/images/icon_hdc1@2x.png`;
              } else if (num == 2) {
                markerObj.iconPath = `/images/icon_hdc2@2x.png`;
              } else if (num == 3) {
                markerObj.iconPath = `/images/icon_hdc3@2x.png`;
              } else if (num == 4) {
                markerObj.iconPath = `/images/icon_hdc4@2x.png`;
              } else {
                markerObj.iconPath = `/images/icon_hdc0@2x.png`;
              }
            }
          } else {
            markerObj.iconPath = `/images/icon_lx@2x.png`;
          }

          markersNow.push(markerObj);
        } else {
          if (Number(item.dis) > 1000) {
            item.dis = (Number(item.dis) / 1000).toFixed(2);
            item.unit = 'km';
          } else {
            item.unit = 'm';
          }
          let markerObj2 = {
            id: index,
            iconPath: `/images/icon_store@2x.png`,
            longitude: item.longitude,
            latitude: item.latitude,
            width: 31,
            height: 31,
            serveTypeCurr: item.serveTypeCurr,
            idCurr: item.id
          };

          markersNow.push(markerObj2);
        }

      })
      nowcabitList = roundData;
      that.setData({
        cabitList: nowcabitList,
        markers: markersNow,
        chargeCabinetList,
        shopBusinessList,
        bindBattery: objData ? objData.bindBattery : false,
        bookAShopBusiness: objData ? objData.bookAShopBusiness : false,
        realName: objData ? objData.realName : false,
        activateBattery: objData ? objData.activateBattery : false,
      })

      if (nowcabitList.length > 0) {
        if (that.data.serveTypeCurr == 2) {
          that.data.markers[0].iconPath = `/images/icon_store_selected@2x.png`;
          that.setData({
            markers: that.data.markers,
            nowStore: nowcabitList[0],
            isStore: true,
            indexCurrSto: 0,
            indexCurrCab: -1,
            iscabinet: false,
            nowCabinet: {},
            iscabinetList: false,
            isBatType: false
          })
        } else if (that.data.serveTypeCurr == 1) {
          if (nowcabitList[0].line == 1) {
            let num = nowcabitList[0].canUseExchangeBatteryNum
            if (num == 0) {
              that.data.markers[0].iconPath = `/images/icon_hdc0_selected@2x.png`;
            } else if (num == 1) {
              that.data.markers[0].iconPath = `/images/icon_hdc1_selected@2x.png`;
            } else if (num == 2) {
              that.data.markers[0].iconPath = `/images/icon_hdc2_selected@2x.png`;
            } else if (num == 3) {
              that.data.markers[0].iconPath = `/images/icon_hdc3_selected@2x.png`;
            } else if (num == 4) {
              that.data.markers[0].iconPath = `/images/icon_hdc4_selected@2x.png`;
            } else {
              that.data.markers[0].iconPath = `/images/icon_hdc0_selected@2x.png`;
            }
          } else {
            that.data.markers[0].iconPath = `/images/icon_lx_selected@2x.png`;
          }
          that.setData({
            markers: that.data.markers,
            nowStore: {},
            isStore: false,
            indexCurrSto: -1,
            indexCurrCab: 0,
            iscabinet: true,
            nowCabinet: nowcabitList[0],
            iscabinetList: false,
          })

          that.getBoxInfoByCabinetId();
        } else if (that.data.serveTypeCurr == 0) {
          if (nowcabitList[0].line == 1) {
            let num = nowcabitList[0].canUseChargingPortNum
            if (num == 0) {
              that.data.markers[0].iconPath = `/images/icon_cdk0_selected@2x.png`;
            } else if (num == 1) {
              that.data.markers[0].iconPath = `/images/icon_cdk1_selected@2x.png`;
            } else if (num == 2) {
              that.data.markers[0].iconPath = `/images/icon_cdk2_selected@2x.png`;
            } else if (num == 3) {
              that.data.markers[0].iconPath = `/images/icon_cdk3_selected@2x.png`;
            } else if (num == 4) {
              that.data.markers[0].iconPath = `/images/icon_cdk4_selected@2x.png`;
            } else {
              that.data.markers[0].iconPath = `/images/icon_cdk0_selected@2x.png`;
            }
          } else {
            that.data.markers[0].iconPath = `/images/icon_lx_selected@2x.png`;
          }
          that.setData({
            markers: that.data.markers,
            nowStore: {},
            iscabinet: true,
            isStore: false,
            nowCabinet: nowcabitList[0],
          })

        } else {

          that.setData({
            nowStore: {},
            isStore: false,
            indexCurrSto: -1,
            indexCurrCab: -1,
            iscabinet: false,
            nowCabinet: {},
            iscabinetList: false,
          })
        }
      }
    }, err => {

    });

  },


  // 点击地图
  bindtapMap() {
    return
    this.data.markers.map((item, index) => {

      if (item.serveTypeCurr == 1) {
        item.width = 31;
        item.height = 31;

        if (item.line == 1) {
          item.iconPath = `/images/mapIcon.png`;
        } else {
          item.iconPath = `/images/icon_lx@2x.png`;
        }
      } else {
        item.width = 31;
        item.height = 31;
        item.iconPath = `/images/storeIcon.png`;
      }
    })


    this.setData({
      markers: this.data.markers,
      indexCurrCab: -1,
      indexCurrSto: -1,
      iscabinet: false,
      nowCabinet: {},
      iscabinetList: false,
      isStore: false,
      nowStore: {}
    })
  },

  viewMoreCabitFun() {
    this.setData({
      isMoreCabit: !this.data.isMoreCabit
    })
  },

  viewPic(e) {
    let index = e.currentTarget.dataset.index;
    if (index == 1) {
      wx.previewImage({
        current: this.data.nowCabinet.imgList[0],
        urls: this.data.nowCabinet.imgList
      })
    } else {
      wx.previewImage({
        current: this.data.nowStore.imgList[0],
        urls: this.data.nowStore.imgList
      })

    }

  },


  moreCabitFun() {
    this.setData({
      iscabinetList: true,
      iscabinet: false,
      isStore: false
    })
    this.data.markers.map((item, index) => {
      if (item.serveTypeCurr == 1) {
        item.width = 31;
        item.height = 31;
        if (item.line == 1) {
          // item.iconPath = `/images/mapIcon.png`;
        } else {
          item.iconPath = `/images/icon_lx@2x.png`;
        }
      } else {

        item.width = 31;
        item.height = 31;
        item.iconPath = `/images/icon_store@2x.png`;
      }

    })
    this.setData({
      markers: this.data.markers,
      iscabinetList: true,
      iscabinet: false,
      isStore: false
    })
    console.log(this.data.cabitList);
  },
  oneCabitFun() {
    this.data.markers.map((item, index) => {
      if (this.data.indexCurrCab == index) {
        if (item.serveTypeCurr == 1) {
        } else {
          item.width = 31;
          item.height = 31;
          item.iconPath = `/images/icon_store_@2x.png`;
        }
      } else {
        if (item.serveTypeCurr == 1) {
          item.width = 31;
          item.height = 31;
          if (item.line == 1) {
          } else {
            item.iconPath = `/images/icon_lx@2x.png`;
          }
        } else {
          item.width = 31;
          item.height = 31;
          item.iconPath = `/images/icon_store@2x.png`;
        }
      }
    })
    this.setData({
      markers: this.data.markers,
      iscabinet: true,
      iscabinetList: false,
      isStore: false,
      nowStore: {}
    })
  },

  serveTypeFun(e) {
    let index = e.currentTarget.dataset.index;
    this.data.markers.map((item, index) => {

      if (item.serveTypeCurr == 1) {
        item.width = 31;
        item.height = 31;
        if (item.line == 1) {
        } else {
          item.iconPath = `/images/icon_lx@2x.png`;
        }
      } else {
        item.width = 31;
        item.height = 31;
        item.iconPath = `/images/icon_store@2x.png`;
      }

    })
    if (index == 1) {
      this.setData({
        currBat: -1,
        isBatType: true,
      })
    } else {
      this.setData({
        currBat: -1,
        isBatType: false,
      })
    }
    this.setData({

      markers: this.data.markers,
      serveTypeCurr: index,
      iscabinet: false,
      nowCabinet: {},
      iscabinetList: false,
      isStore: false

    })
    this.getDataFun(this.data.point);
  },

  selectBatFun(e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    this.setData({
      currBat: index,
    })
    this.getDataFun(this.data.point);
  },
  markertap(e) {
    this.data.indexCurrCab = e.markerId;
    let nowInfo = this.data.cabitList[this.data.indexCurrCab];
    this.data.markers.map((item, index) => {
      if (this.data.indexCurrCab == index) {
        if (item.serveTypeCurr == 1) {
          item.width = 31;
          item.height = 31;
          if (item.iconPath.indexOf("_selected") == -1) {
            item.iconPath = item.iconPath.split("@")[0] + "_selected@2x.png"
          }
        } else {
          item.width = 31;
          item.height = 31;
          if (item.iconPath.indexOf("_selected") == -1) {
            item.iconPath = item.iconPath.split("@")[0] + "_selected@2x.png"
          }
        }
      } else {
        if (item.serveTypeCurr == 1) {
          item.width = 31;
          item.height = 31;
          if (item.iconPath.indexOf('_selected') != -1) {
            item.iconPath = item.iconPath.split("_selected")[0] + "@2x.png"
          }
        } else {
          item.width = 31;
          item.height = 31;
          item.iconPath = `/images/icon_store@2x.png`;
        }
      }
    })
    this.setData({
      isStore: false,
      iscabinet: false,
      iscabinetList: false,
      markers: this.data.markers
    })

    if (nowInfo.serveTypeCurr == 1) {
      this.setData({
        nowCabinet: nowInfo,
      })
      this.getBoxInfoByCabinetId();
    } else {
      this.data.indexCurrSto = e.markerId;
      this.setData({
        nowStore: nowInfo,
        isStore: true,

      })
    }
  },


  //   获取详情
  getBoxInfoByCabinetId() {
    let that = this;
    let params = {
      cabinetOrganizationId: this.data.nowCabinet.organizationId,
      cabinetQrCodeDid: this.data.nowCabinet.qrCodeDid,
      cabinetUid: this.data.nowCabinet.cabinetUid,
      organizationId: this.data.point.organizationId,

    };

    HTTP({
      url: 'cabinet/getBoxInfoByCabinetId',
      methods: 'get',
      data: params,
    }).then(res => {
      let objData = res.data;
      let batteryTypeAndNumDtoListCurr = [];

      if (objData.batteryTypeAndNumDtoList && objData.batteryTypeAndNumDtoList.length > 0) {
        objData.batteryTypeAndNumDtoList.map((item) => {
          let obj = {
            batteryTypeName: item.batteryTypeName,
            lowPowerNum: item.lowPowerNum,
            mediumPowerNum: item.mediumPowerNum,
            highPowerNum: item.highPowerNum,
            fullPowerNum: item.fullPowerNum
          }
          batteryTypeAndNumDtoListCurr.push(obj);
        })
        let objName = {
          batteryTypeName: "电池型号",
          lowPowerNum: "<50%",
          mediumPowerNum: "51%~80%",
          highPowerNum: "81%~90%",
          fullPowerNum: ">90%"
        }
        batteryTypeAndNumDtoListCurr.unshift(objName);
      } else {
        batteryTypeAndNumDtoListCurr = [];
      }
      objData.batteryTypeAndNumDtoListCurr = batteryTypeAndNumDtoListCurr;
      that.data.nowCabinet.batteryTypeAndNumDtoList = objData.batteryTypeAndNumDtoList;
      that.data.nowCabinet.batteryTypeAndNumDtoListCurr = objData.batteryTypeAndNumDtoListCurr;
      that.data.nowCabinet.canUseChargingPortNum = objData.canUseChargingPortNum;
      that.data.nowCabinet.chargingPortNum = objData.canUseChargingPortNum;
      that.data.nowCabinet.emptyBoxNum = objData.emptyBoxNum;
      that.setData({
        nowCabinet: that.data.nowCabinet,
        iscabinet: true,
      })
    },
      err => {

      }
    );

  },

  selectCabit(e) {
    this.setData({
      isStore: false,
      iscabinet: false,
      iscabinetList: false,
    })
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.data.markers.map((item, index) => {
      if (this.data.indexCurrCab == index) {
        if (item.serveTypeCurr == 1) {
        } else {
          item.width = 31;
          item.height = 31;
          item.iconPath = `/images/icon_store@2x.png`;
        }
      } else {
        if (item.serveTypeCurr == 1) {

          item.width = 31;
          item.height = 31;
          if (item.line == 1) {
          } else {
            item.iconPath = `/images/icon_lx@2x.png`;
          }
        } else {
          item.width = 31;
          item.height = 31;
          item.iconPath = `/images/icon_store@2x.png`;
        }
      }
    })
    this.setData({
      isStore: false,
      iscabinet: false,
      iscabinetList: false,
      markers: this.data.markers
    })
    this.setData({
      iscabinet: true,
      nowCabinet: nowInfo,
    })
  },
  // 导航
  navigationMap(e) {
    let that = this;
    let curr = e.currentTarget.dataset.curr;

    switch (curr) {
      case '1':
        wx.openLocation({
          latitude: parseFloat(that.data.nowCabinet.latitude),
          longitude: parseFloat(that.data.nowCabinet.longitude),
          scale: 14,
          name: that.data.nowCabinet.cabinetName,
          address: that.data.nowCabinet.cabinetAddress,
        })
        break;
      case '2':
        let item = e.currentTarget.dataset.item;
        wx.openLocation({
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          scale: 14,
          name: item.cabinetName,
          address: item.cabinetAddress,
        })
        break;
      case '3':
        wx.openLocation({
          latitude: parseFloat(that.data.nowStore.latitude),
          longitude: parseFloat(that.data.nowStore.longitude),
          scale: 14,
          name: that.data.nowStore.busName,
          address: that.data.nowStore.busAddress,
        })
        break;

      default:
        break;
    }

  },

  // 预约购车/租电池
  joinPage() {
    if (!this.data.activateBattery) {
      if (!this.data.bindBattery) {
        if (!this.data.bookAShopBusiness) {
          wx.redirectTo({
            url: '/pages/myOrderService/myOrderService',
          })
          return;
        }
      } else {
        if (!this.data.realName) {
          wx.redirectTo({
            url: '/pages/myCertification/myCertification',
          })
        } else {
          wx.redirectTo({
            url: '/pages/myPayDeposit/myPayDeposit',
          })
        }
      }
    }
  },

  //位置变化的时候
  regionchange: function (e) {
    let that = this;
    if (e.type == 'end' && (e.causedBy == 'drag' || e.causedBy == 'update')) {
      that.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: function (res) {
          let latitude = res.latitude;
          let longitude = res.longitude;
          let point = {
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
          };
          that.getCityInfo(point);
        }
      })
    }

  },

  // 更新地图
  refreshFun() {
    this.mapCtx.moveToLocation();
    this.setData({
      mapScale: 14,
    })
  },

  // 搜索地图
  searchFun() {
    let that = this
    wx.chooseLocation({
      success: function (res) {
        that.mapCtx.moveToLocation({
          longitude: res.longitude,
          latitude: res.latitude
        })
        let point = {
          longitude: res.longitude,
          latitude: res.latitude,
        };
        that.getCityInfo(point);

      },
      fail: function (err) {
        wx.showToast({
          title: '请先开启定位',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  listContFun() {
    let paramsCurr = this.data.paramsCurr;
    let obj = {
      serveTypeCurr: this.data.serveTypeCurr
    }
    if (this.data.iscabinet) {
      obj.indexCab = this.data.indexCurrCab;
      paramsCurr = Object.assign(paramsCurr, this.data.nowCabinet);
    } else {
      obj.indexCab = '';
      paramsCurr = Object.assign(paramsCurr, {});
    }
    if (this.data.isStore) {
      obj.indexSto = this.data.indexCurrSto;
      paramsCurr = Object.assign(paramsCurr, this.data.nowStore);
    } else {
      obj.indexSto = '';
      paramsCurr = Object.assign(paramsCurr, {});
    }
    paramsCurr = Object.assign(paramsCurr, obj);
    wx.setStorageSync('mapParams', paramsCurr)
    let point = JSON.stringify(this.data.point)

    wx.navigateTo({
      url: '/pages/myMapList/myMapList?point=' + point
    })
  },

})