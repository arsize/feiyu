import regeneratorRuntime from '../../utils/runtime.js'
const app = getApp();
import {
  HTTP
} from "../../utils/server";
import {
  formats
} from "../../utils/util";
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    depositDto: {},
    depositList:[],
    frequencyCardList: [],
    totalMoney: 0,
    preTotalMoney: 0,
    counpon: '',
    currCard: -1,
    freType: "",
    exchangeExplain: '',
    haveread: false,
    depositActived:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getDataFun();
  },
  selectBattery(e){
    let item = e.currentTarget.dataset.item;
    wx.setStorageSync('userType', item.depositCategory)
    this.setData({
      depositActived:item.depositId,
      depositDto:item,
      totalMoney:item.depositMoney
    })


  },
  getDataFun() {
    let that = this;
    let params = {};
    HTTP({
      url: 'app/wx/getActivateBatteryData',
      methods: 'get',
      data: params,
      loading: true,
    }).then(async res => {
      let objData = res.data;
      that.setData({
        depositList:objData,
        isRequest: true
      });
      // that.checkFrequencyType(totalMoney)
    }, err => {
      that.setData({
        isRequest: true
      })
    })

  },
  selectFun(e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    this.data.frequencyCardList.map(async (items, indexs) => {
      if (indexs == index) {
        if (this.data.currCard == index) {
          this.data.totalMoney = Number(this.data.depositDto.depositMoney).toFixed(2)
          this.setData({
            currCard: -1,
            totalMoney: this.data.totalMoney,
            preTotalMoney: "",
            counpon: ''
          })
        } else {
          let counpon = await this.getUserCounpon(items.price)
          if (!counpon) {
            this.data.totalMoney = (Number(this.data.depositDto.depositMoney) + items.price).toFixed(2);
            this.setData({
              currCard: indexs,
              totalMoney: this.data.totalMoney
            })
          } else {
            this.data.totalMoney = (Number(this.data.depositDto.depositMoney) + items.price - counpon.discountedPrices).toFixed(2);
            this.setData({
              counpon: counpon.discountedPrices,
              preTotalMoney: (Number(this.data.depositDto.depositMoney) + items.price).toFixed(2),
              currCard: indexs,
              totalMoney: this.data.totalMoney
            })
          }
        }
      }
    })
  },
  selectFunNoPay(e) {
    let dataset = e.currentTarget.dataset.set
    if (dataset == "nopay") {
      this.data.totalMoney = Number(this.data.depositDto.depositMoney).toFixed(2)
      this.setData({
        currCard: 'nopay',
        totalMoney: this.data.totalMoney,
        preTotalMoney: ""
      })
    }
  },
  gotoxieyi() {
    wx.navigateTo({
      url: '/pages/myDepositAgreement/myDepositAgreement',
    })
  },
  // 支付
  rechargeFun() {
    if (!this.data.depositDto.depositId) {
      wx.showToast({
        title: '请选择回收金类型',
        icon: 'none'
      })
      return
    }
    if (!this.data.haveread) {
      wx.showToast({
        title: '请先阅读并同意《电池押金协议》',
        icon: 'none'
      })
      return
    }
    
    let that = this;
    let money =  this.data.totalMoney
    let name = ""
    let activeId = ""
    let depositId = ""
    let depositMoney = ""
    let activeMoney = ""
    if (this.data.currCard == 'nopay') {
      depositId = this.data.depositDto.depositId
      depositMoney = this.data.depositDto.depositMoney
    } else {
      if (this.data.frequencyCardList && this.data.frequencyCardList.length > 0) {
        if (this.data.currCard != -1) {
          name = this.data.frequencyCardList[this.data.currCard].name
          activeId = this.data.frequencyCardList[this.data.currCard].id
          activeMoney = this.data.frequencyCardList[this.data.currCard].price
        }
      }
      depositId = this.data.depositDto.depositId
      depositMoney = this.data.depositDto.depositMoney
    }
    wx.navigateTo({
      url: '/pages/payforend/payforend?money=' + money + '&type=0' + "&depositId=" + depositId + "&depositMoney=" + depositMoney 
    })

  },
  // 获取用户优惠券
  getUserCounpon(money) {
    return new Promise((resolve, reject) => {
      HTTP({
        url: "wallet/getUserCouponListByPrice",
        methods: 'get',
        data: {
          type: 0,
          price: money
        },
        loading: true,
      }).then(res => {
        if (res.data && res.data.length > 0) {
          resolve(res.data[0])
        } else {
          resolve("")
        }
      })
    })
  },

  // 选择
  selectnoteCont() {
    this.setData({
      haveread: !this.data.haveread
    })

  },

  // 获取套餐策略类型
  checkFrequencyType(money) {
    // 套餐类型：0（次卡套餐无限时），1（限时套餐），2（限时套餐无限次），3（包月套餐），4（叠加包套餐）
    HTTP({
      url: 'wallet/getFrequencyCardType',
      methods: "get",
      data: {},
    }).then(res => {
      let freType = res.data
      let totalMoney = (Number(this.data.depositDto.depositMoney)).toFixed(2);
      if (freType == 3 || freType == 4) {
        this.setData({
          currCard: 'nopay',
          totalMoney: totalMoney,
          preTotalMoney: ""
        })
      } else {
        this.setData({
          totalMoney: money
        })
      }
      this.setData({
        freType: freType
      })

    })
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