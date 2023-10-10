// pages/myService/myService.js
const app = getApp();
let baseUrlImgCurr = app.globalData.baseUrlImg;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    faqListAll: [
      [{
        title: '电池被吞了怎么办？',
        isShow: false,
        listCont: ['如果充换电失败或者电池被吞，切勿自行按压仓门试图打开取出电池，此时应联系客服人员请求帮助，并提供被吞电池电柜ID、仓位号及电池SN码。任何其他特殊情况请联系运维人员。'],
      }, {
        title: '拿错电池/电池不属于你，怎么办？',
        isShow: false,
        listCont: ['请联系客服人员，将你的用户账号以及拿错的电池SN码告知客服，我们将会为你重新绑定电池。', '在小程序点击“我的”进入个人中心页面-->点击“我的电池”进入我的电池页面后可查看属于自己的电池SN码与实物SN码是否相符。'],
      }, {
        title: '如何更改号码？',
        isShow: false,
        listCont: ['在小程序页面点击“我的”进入个人中心页面-->点击“设置”进入设置页面-->点击“修改手机号”，在修改页面的输入框内输入手机号及验证码-->点击确认修改即修改完成。'],

      }, {
        title: '如何租用电池？',
        isShow: false,
        listCont: ['在小程序页面点击“我的”进入个人中心页面-->点击“我的电池”进入我的电池页面后点击“开通服务”-->进入缴纳电池绿色回收金页面后点击“确认开通”并缴纳电池绿色回收金及首月租金-->前往线下服务门店向工作人员出示个人二维码以获取并绑定电池。'],
      }, ],
      [{
          title: '如何充电？',
          isShow: false,
          listCont: ['用户可选择自带充电器使用线充服务：', '将自带充电器插入空闲的插座-->点击小程序首页上的“扫码充电”，扫描电柜上的二维码-->选择对应的充电仓位、电池类型、电池电压后点击“开始充电”-->开始充电，充电完成后支付充电费用。'],

        },
        {

          title: '如何换电？',
          isShow: false,
          listCont: ['点击小程序首页上的“扫码换电”，扫描电柜上的二维码-->空仓门打开，放入空电池并连接好内置电源线后关闭仓门-->电池检测成功后会为你打开一个有满电池的仓门-->取出满电池后关闭仓门即可。'],
        }, {
          title: '如何退电？',
          isShow: false,
          listCont: ['若不再使用电池，可以退回电池取回电池绿色回收金。', '在小程序页面点击“我的”进入个人中心页面-->点击“我的电池”进入我的电池页面后点击“退电池”-->携带电池前往小程序退电池页面所提示的退电门店-->将电池退给门店工作人员并向其出示个人二维码以解绑电池-->退电成功，退电成功后电池月租停止计费，此后可申请退回绿色回收金。'],
        }, {
          title: '如何退绿色回收金？',
          isShow: false,
          listCont: ['退电成功后在我的电池页面点击“退绿色回收金”进入退绿色回收金页面-->点击“继续退绿色回收金”-->提交申请后，系统会将绿色回收金原路返回至您的帐户。', '绿色回收金退回到帐时间会根据您选择的支付方式所对应的银行或第三方支付的处理流程不同而有所差别，通常情况下，退款到账需要1～7个工作日到账。绿色回收金是您使用本换电服务的前提之一，一旦退款成功您将无法享用本换电服务。'],


        }
      ]
    ],
    faqList: [{
      title: '电池被吞了怎么办？',
      isShow: false,
      listCont: ['如果充换电失败或者电池被吞，切勿自行按压仓门试图打开取出电池，此时应联系客服人员请求帮助，并提供被吞电池电柜ID、仓位号及电池SN码。任何其他特殊情况请联系运维人员。'],
    }, {
      title: '拿错电池/电池不属于你，怎么办？',
      isShow: false,
      listCont: ['请联系客服人员，将你的用户账号以及拿错的电池SN码告知客服，我们将会为你重新绑定电池。', '在小程序点击“我的”进入个人中心页面-->点击“我的电池”进入我的电池页面后可查看属于自己的电池SN码与实物SN码是否相符。'],
    }, {
      title: '如何更改号码？',
      isShow: false,
      listCont: ['在小程序页面点击“我的”进入个人中心页面-->点击“更多”进入更多页面-->点击“修改手机号”，在修改弹窗的输入框内输入手机号及验证码-->点击确认修改即修改完成。'],

    }, {
      title: '如何租用电池？',
      isShow: false,
      listCont: ['在小程序页面点击“我的”进入个人中心页面-->点击“我的电池”进入我的电池页面后点击“开通服务”-->进入缴纳电池绿色回收金页面后点击“确认开通”并缴纳电池绿色回收金及首月租金-->前往线下服务门店向工作人员出示个人二维码以获取并绑定电池。'],
    }, ],
    curr: 0,
    menuList: [{
        title: "充电问题",
        img: `${baseUrlImgCurr}icon_cont_charge@2x.png`,
        url: "/pages/myCoupon/myCoupon",
      },
      {
        title: "换电问题",
        img: `${baseUrlImgCurr}icon_cont_swap@2x.png`,
        url: "/pages/myUsagelog/myUsagelog",
      },
      {
        title: "充值问题",
        img: `${baseUrlImgCurr}icon_cont_recharge@2x.png`,
        url: "/pages/myMap/myMap",
      },
      {
        title: "套餐问题",
        img: `${baseUrlImgCurr}icon_cont_package@2x.png`,
        url: "/pages/myService/myService",
      },
      {
        title: "绿色回收金问题",
        img: `${baseUrlImgCurr}icon_cont_yajin@2x.png`,
        url: "/pages/myMore/myMore",
      },
    ],
    answerList: [],
    isScroll: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      faqList: this.data.faqListAll[0]
    })
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

  },
  joinPageFeed() {
    wx.navigateTo({
      url: '/pages/myFeedBack/myFeedBack'
    })
  },
  joinPage() {
    wx.navigateTo({
      url: '/pages/myBuildCabit/myBuildCabit'
    })
  },
  changeFun() {
    app.printf('changeFun');
    if (this.data.curr >= 1) {
      this.data.curr = 0;
    } else {
      this.data.curr++;
    }
    this.setData({
      faqList: this.data.faqListAll[this.data.curr]
    })
    console.log(this.data.faqListAll[this.data.curr]);

  },
  showFun(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.data.answerList.push(item);
    this.setData({
      answerList: this.data.answerList,
      isScroll: true
    })
    this.pageScrollToBottom();
    // this.data.faqList.map((item, indexs) => {
    //   if (index == indexs) {
    //     item.isShow = !item.isShow;
    //   } else {
    //     item.isShow = false;
    //   }
    // })
    // this.setData({
    //   faqList: this.data.faqList
    // })
  },
  pageScrollToBottom() {
    wx.createSelectorQuery().select('.pageCont').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      app.printf(rect);
      wx.pageScrollTo({
        scrollTop: rect.bottom
      })
    }).exec()
  },

  toTopFun() {
    wx.pageScrollTo({
      scrollTop: 0
    })
    this.setData({
      isScroll: false
    })
  },

  joinMenu(e) {

  },
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("kfMobile")
    });
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