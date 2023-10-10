// pages/myMapList/myMapList.js
const app = getApp();
import {
  HTTP
} from "../../utils/server";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    switchBarList: [{
      title: '全部类型电柜',
      id: 0
    }, {
      title: '服务网点',
      id: 1
    },],
    curSwitchBar: 0,
    point: wx.getStorageSync('mapParams'),
    batteryTypeList: [],
    shopBusinessList: [],
    currBat: 0,
    currCabit: -1,
    currStore: -1,
    isRequest: false,
    recordList: [],
    pageNum: 1,
    pageSize: 5,
    isbottom: false,
    nowPoint: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let point = options.point
    if (point) {
      this.setData({
        nowPoint: JSON.parse(point)
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.point = wx.getStorageSync('mapParams');
    if (this.data.point.serveTypeCurr == 2) {
      this.setData({
        curSwitchBar: 1
      })
    }
    this.setData({
      currCabit: -1
    })
    this.getBatteryTypeByAgentId();
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.getRecordList(this.data.point);
  },

  selectBar(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    if (this.data.curSwitchBar == index) return;
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.setData({
      curSwitchBar: index,
      currBat: 0,
      recordList: [],
      isRequest: false
    })
    this.getRecordList(this.data.point);
  },


  getBatteryTypeByAgentId() {
    let that = this;
    let params = {

    }
    HTTP({
      url: 'battery/getBatteryTypeByAgentId',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let listData = res.data;
      listData.map((item) => {
        if (item.batteryTypeName) {
          item.batteryTypeName = `内置${item.batteryTypeName}`
        }
      })
      let obj = {
        batteryTypeId: -1,
        batteryTypeName: "全部类型电柜"
      }
      listData.unshift(obj);

      that.setData({
        batteryTypeList: listData
      })
      console.log(that.data.batteryTypeList);
    },
      err => {
        let obj = {
          batteryTypeId: -1,
          batteryTypeName: "全部电柜"
        }
        that.data.batteryTypeList.unshift(obj);
        that.setData({
          batteryTypeList: that.data.batteryTypeList
        })
      }
    );
  },

  bindChangeBatteryType(e) {
    this.setData({
      currBat: e.detail.value
    })
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.setData({
      recordList: [],
      isRequest: false
    })
    this.getRecordList(this.data.point);

  },


  getRecordList(point) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    let that = this;
    let params = {
      type: this.data.curSwitchBar + 1,
      latitude: this.data.nowPoint.latitude,
      longitude: this.data.nowPoint.longitude,
      organizationId: wx.getStorageSync("logindata").organizationId,
      areaOrganizationId: this.data.nowPoint.organizationId,
      currentPage: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    if (this.data.currBat > 0) {
      params.searchBatteryTypeId = this.data.batteryTypeList[this.data.currBat].batteryTypeId;
    }

    HTTP({
      url: 'cabinet/map/mapRoundListByPage',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      let objData = res.data;
      let totalCurr = 8;
      let listData = [];
      if (that.data.curSwitchBar == 0) {
        totalCurr = objData.cabinetList.total;
        let cabinetList = objData.cabinetList.records ? objData.cabinetList.records : [];
        listData = that.data.recordList.concat(cabinetList);
        let currIndex = -1,
          add = 0;
        listData.map((item, index) => {
          item.serveTypeCurr = 1;
          if (item.nearbyPicurl) {
            item.imgList = item.nearbyPicurl.split(',');
          } else {
            item.imgList = [];
          }
          if (that.data.point.cabinetDid) {
            if (item.cabinetDid == that.data.point.cabinetDid) {
              add++;
              currIndex = index;
            }
          }
        })
        if (add > 0) {
          that.setData({
            currCabit: currIndex
          })
        } else {
          that.setData({
            currCabit: -1
          })
        }
      } else {
        totalCurr = objData.shopBusinessList.total;
        let shopBusinessList = objData.shopBusinessList.records ? objData.shopBusinessList.records : [];
        listData = that.data.recordList.concat(shopBusinessList);
        let currIndex = -1,
          add = 0;
        listData.map((item, index) => {
          item.serveTypeCurr = 2;
          if (item.businessPicUrl) {
            item.imgList = item.businessPicUrl.split(',');
          } else {
            item.imgList = [];
          }
          if (item.id == that.data.point.id) {
            that.setData({
              currStore: index
            })
          } else {
            that.setData({
              currStore: -1
            })
          }
        })

      }

      listData.map((item, index) => {
        if (item.serveTypeCurr == 1) {
          if (Number(item.userFromDistance) > 1000) {
            item.userFromDistance = (Number(item.userFromDistance) / 1000).toFixed(2);
            item.unit = 'km';
          } else {
            item.unit = 'm';
          }

        } else {
          if (Number(item.dis) > 1000) {
            item.dis = (Number(item.dis) / 1000).toFixed(2);
            item.unit = 'km';
          } else {
            item.unit = 'm';
          }

        }

      })

      let isBtm = totalCurr > listData.length ? false : true;
      that.setData({
        recordList: listData,
        isRequest: true,
      })
      this.data.isbottom = isBtm;

      // that.setData({
      //   recordList: roundData,
      //   isRequest: true
      // })
      console.log(that.data.recordList);

    }, err => {

    });

  },

  selectBat(e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    this.setData({
      currCabit: index,
    })
    wx.setStorageSync('currMapParams', item);

    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
      wx.removeStorageSync('mapParams');
    }, 300)

  },


  selectStore(e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    this.setData({
      currStore: index,
    })
    wx.setStorageSync('currMapParams', item);

    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
      wx.removeStorageSync('mapParams');
    }, 300)

  },

  // 导航
  navigationMap(e) {
    let that = this;
    // console.log('navigationMap-----------------');
    // console.log(e);
    let curr = e.currentTarget.dataset.curr;
    let item = e.currentTarget.dataset.item;
    switch (curr) {
      case '2':
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
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          scale: 14,
          name: item.busName,
          address: item.busAddress,
        })
        break;

      default:
        break;
    }

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

  onPullDownRefresh: function () {
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.getRecordList(this.data.point);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.isbottom) {
      this.data.pageNum++;
      this.getRecordList(this.data.point);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})