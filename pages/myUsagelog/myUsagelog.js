// pages/myUsagelog/myUsagelog.js
import {
  HTTP
} from "../../utils/server";
import {
  formats
} from '../../utils/util';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    isRequest: false,
    recordList: [],
    pageNum: 1,
    pageSize: 10,
    isbottom: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow() {
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.getRecordList();
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

  getRecordList() {
    let that = this;
    wx.showLoading({
      title: "加载中",
      mask: true
    });

    let params = {
      orderByDesc: true,
      organizationId: wx.getStorageSync("logindata").organizationId,
      currentPage: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    HTTP({
      url: 'app/ctl/chargingAndExchangeRecord',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      let totalCurr = objData.total;
      let listData = that.data.recordList.concat(objData.records);
      listData.map((item, index) => {
        let ctime = String(item.ctime);
        if (item.ctime && ctime.indexOf('.') == -1) {
          item.ctime = formats("YYYY.MM.dd hh:mm", item.ctime);
          item.ctimeArr = (item.ctime).split(' ');
        }
      })


      let isBtm = totalCurr > listData.length ? false : true;
      that.setData({
        recordList: listData,
        isRequest: true,
      })
      this.data.isbottom = isBtm;
    }, err => {
      that.setData({
        isRequest: true,
      })
    });

  },
  joinDetail(e) {
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/myUseDetail/myUseDetail?orderNo=${item.orderNo}&useType=${item.useType}&chargingStatus=${item.chargingStatus}`
    })
  },


  onPullDownRefresh: function () {
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.getRecordList();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.isbottom) {
      this.data.pageNum++;
      this.getRecordList();
    }
  },

});