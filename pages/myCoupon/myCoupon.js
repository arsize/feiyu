// pages/myCoupon/myCoupon.js
import {
  HTTP
} from "../../utils/server";
import {
  timestampToDay,
  formats
} from "../../utils/util";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    cardType: [{
        title: "电卡"
      },
      {
        title: "优惠券"
      }
    ],
    currType: 0,
    cardElectric: [{
        title: "我的电卡"
      },
      {
        title: "失效电卡"
      }
    ],
    currElectric: 1,
    isRequest: false,
    recordList: [],
    pageNum: 1,
    pageSize: 8,
    isbottom: false,
  },
  onLoad() {
    this.getRecordList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // this.getUserCoupon();
  },
  getUserCoupon() {
    let that = this;

    let params = {
      organizationId: wx.getStorageSync('logindata').organizationId
    };
    HTTP("/app/wx/userCouponList", params, true).then(
      res => {
        let listData = res.data;
        listData.map((item, index) => {
          // item.validStartTime = item.validStartTime ? formats("YYYY.MM.dd", item.validStartTime) : '';
          // item.validEndTime = item.validEndTime ? formats("YYYY.MM.dd", item.validEndTime) : '';
        });
        console.log(listData);
        that.setData({
          recordList: listData,
          isRequest: true
        });
      },
      err => {
        that.setData({
          isRequest: true
        });
      }
    );
  },

  cardTypeFun(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.setData({
      currType: index
    });
  },

  currElectricFun(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.setData({
      currElectric: index
    });
  },


  getRecordList() {
    let that = this;

    let params = {
      orderByDesc: true,
      organizationId: wx.getStorageSync("logindata").organizationId,
      currentPage: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    HTTP("/app/wx/userCouponList", params, true).then(res => {
      let objData = res.data;
      let totalCurr = objData.total;
      let listData = that.data.recordList.concat(objData.records);
      listData.map((item, index) => {
        item.validStartTime = item.validStartTime ? formats("YYYY.MM.dd", item.validStartTime) : '';
        item.validEndTime = item.validEndTime ? formats("YYYY.MM.dd", item.validEndTime) : '';
      });

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

  onPullDownRefresh: function() {
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