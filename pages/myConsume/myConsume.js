// pages/myConsume/myConsume.js
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
    typeCurr: 0,
    typeList: [{
      title: '充值',
    }, {
      title: '消费',
    }, {
      title: '押金',
    }],
    isRequest: false,
    recordList: [],
    pageNum: 1,
    pageSize: 10,
    isbottom: false,
    urlList: [{
        title: 'wallet/getUserWalletUseLog',
      },
      {
        title: 'wallet/getUserWalletExchangeConsumptionUseLog',
      },
      {
        title: 'wallet/getUserWalletDepositConsumptionUseLog',
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRecordList();
  },
  onShow() {

  },
  selectType(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.setData({
      typeCurr: index,
      isRequest: false
    })
    this.data.pageNum = 1;
    this.data.recordList = [];
    this.data.isbottom = false;
    this.getRecordList();
  },
  getRecordList() {
    let that = this;

    let params = {
      orderByDesc: true,
      // organizationId: wx.getStorageSync("logindata").organizationId,
      organizationId: wx.getStorageSync("selectorganId"),
      currentPage: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    if (this.data.typeCurr == 1) {
      params.organizationId = wx.getStorageSync("selectorganId");
    } else {
      params.organizationId = wx.getStorageSync("logindata").organizationId;
    }

    HTTP({
      url: that.data.urlList[that.data.typeCurr].title,
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      // console.log(res.data);
      let objData = res.data;
      let totalCurr = objData.totalSize;

      let newArr = [];
      for (let i in objData.data) {
        // console.log(i);
        let infoData = objData.data[i];
        infoData.map((item) => {
          item.keyDate = i;
        })
        newArr.push(infoData)
      }
      if (that.data.recordList.length > 0 && newArr.length > 0) {
        if (that.data.recordList[that.data.recordList.length - 1].keyDate == newArr[0].keyDate) {
          // console.log(newArr[0].keyDate);
          // console.log(that.data.recordList.length);
          // console.log('有相等的日期----------');
          let sameArr = that.data.recordList[that.data.recordList.length - 1];
          // console.log(sameArr);
          // console.log(newArr[0]);
          newArr[0] = sameArr.concat(newArr[0]);
          that.data.recordList.splice(that.data.recordList.length - 1, 1);
          // console.log('sameArr----------');
          // console.log(that.data.recordList.length);
        }
      }

      let listData = that.data.recordList.concat(newArr);

      listData.map((item, index) => {
        console.log(item)
        let keyDate = '';
        console.log('item-----------------')
        item.map((items, indexs) => {
          keyDate = items.keyDate;
          if (items.ctime) {
            items.ctimeHour = formats("hh:mm:ss", items.ctime);
          }

          item.keyDate = keyDate;
          // let ctime = String(items.ctime);
          // if (items.ctime && ctime.indexOf('.') == -1) {
          //   items.ctime = formats("YYYY.MM.dd hh:mm", items.ctime);
          // }
        })
      })
     
      let isBtm = totalCurr > listData.length ? false : true;
      that.setData({
        recordList: listData,
        isRequest: true,
      })
      console.log(that.data.recordList);
      this.data.isbottom = isBtm;
    }, err => {
      that.setData({
        isRequest: true,
      })
    });

  },

  onPullDownRefresh: function () {
    this.setData({
      isRequest: false
    })
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