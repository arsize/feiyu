import regeneratorRuntime from '../../utils/runtime.js'
const app = getApp();
import {
  HTTP
} from "../../utils/server";
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    popshow: false,
    columns: [],
    colum2: null,
    selectorganizationId: null,
    selectshopBusinessId: null,
    selectagentId: null,
    pickSelectArr: null,
    depositDto: {},
    depositList: [],
    frequencyCardList: [],
    totalMoney: 0,
    preTotalMoney: 0,
    counpon: '',
    currCard: -1,
    freType: "",
    exchangeExplain: '',
    haveread: false,
    depositActived: '',
  },

  onShow() {
    this.getShopAndDeposit()
  },
  getShopAndDeposit() {
    let point = wx.getStorageSync('point')
    HTTP({
      url: 'shopBusiness/getShopAndDeposit',
      methods: 'get',
      data: {
        latitude: point.latitude,
        longitude: point.longitude
      },
      loading: true,
    }).then(res => {
      let objData = res.data;
      this.setData({
        cityList: objData.cityList,
        depositList: objData.depositList,
        isRequest: true
      });
      this.handleCityList()
    })
  },
  getVehicleBusinessList(item) {
    let that = this
    return new Promise((resolve, reject) => {
      HTTP({
        url: 'shopBusiness/getShopBusinessByAreaOrganizationId',
        methods: 'get',
        data: {
          OrganizationId: item.organizationId
        },
      }).then(res => {
        resolve(res.data)
      }, err => {
        reject(err)
      })
    })

  },
  handleCityList() {
    let cityList = this.data.cityList
    let colum1 = cityList.map(item => {
      return item.cityName
    })

    this.setData({
      selectorganizationId: cityList[0].organizationId,
      colum2: cityList[0].shopBusinessList ? cityList[0].shopBusinessList : []
    })
    let colum2 = cityList[0].shopBusinessList ? cityList[0].shopBusinessList.map(item => {
      return item.busName
    }) : []
    let columns = []
    columns.push({
      values: colum1,
      className: 'column1',
    })
    columns.push({
      values: colum2,
      className: 'column2',
      defaultIndex: 0,
    })

    const currPickSelect1 = columns[0] && columns[0].values && columns[0].values[0];
    const currPickSelect2 = columns[1] && columns[1].values && columns[1].values[0];
    const currPickSelectArr = [currPickSelect1, currPickSelect2];

    this.data.colum2.map(item => {
      if (item.busName == currPickSelect2) {

        this.setData({
          selectshopBusinessId: item.id,
          selectagentId: item.agentId
        })
      }
    })



    this.setData({
      columns: columns,
      pickSelectArr: currPickSelectArr,

    })
  },
  selectBattery(e) {
    let item = e.currentTarget.dataset.item;
    wx.setStorageSync('userType', item.depositCategory)
    this.setData({
      depositActived: item.depositId,
      depositDto: item,
      totalMoney: item.depositMoney
    })
  },
  onChange(event) {

    let that = this
    const {
      picker,
      value,
    } = event.detail;

    this.data.cityList.map(async item => {
      if (item.cityName == value[0]) {
        let colum2 = await this.getVehicleBusinessList(item)
        that.setData({
          colum2: colum2
        })
        colum2 = colum2 ? colum2.map(item2 => {
          return item2.busName
        }) : []
        this.setData({
          selectorganizationId: item.organizationId,
        })
        picker.setColumnValues(1, colum2);
      }
    })

  },
  onConfirm(event) {
    let that = this
    const {
      value,
    } = event.detail;
    this.setData({
      pickSelectArr: value,
      popshow: false
    })
    if (this.data.colum2) {
      this.data.colum2.map(item => {
        if (item.busName == value[1]) {
          that.setData({
            selectshopBusinessId: item.id,
            selectagentId: item.agentId
          })
        }
      })
    }

  },

  onCancel() {
    this.setData({
      popshow: false
    })

  },
  //选择服务网点
  showPopup() {
    this.setData({
      popshow: true
    })
  },
  onClose() {
    this.setData({
      popshow: false
    })
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
        title: '请选择绿色回收金',
        icon: 'none'
      })
      return
    }
    if (!this.data.pickSelectArr) {
      wx.showToast({
        title: '请选择服务网点',
        icon: 'none'
      })
      return
    }
    if (!this.data.haveread) {
      wx.showToast({
        title: '请先阅读并同意《电池绿色回收金协议》',
        icon: 'none'
      })
      return
    }
    let params = {
      openId: wx.getStorageSync("logindata").openId,
      organizationId: wx.getStorageSync("logindata").organizationId,
      depositId: this.data.depositDto.depositId,
      areaOrganizationId: this.data.selectorganizationId,
      shopBusinessId: this.data.selectshopBusinessId,
      agentId: this.data.selectagentId
    };
    wx.showLoading({
      title: "支付中",
      mask: true
    });

    HTTP({
      url: 'pay/payDeposit',
      methods: 'put',
      data: params,
      loading: false,
    }).then(res => {
      let chooseWXPayInfo = res.data;
      if (this.data.totalMoney <= 0) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000,
          mask: true
        })
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/serviceingSuccess/serviceingSuccess`,
          });
        }, 2000);

        return
      }
      wx.requestPayment({
        'nonceStr': chooseWXPayInfo.nonceStr,
        'package': chooseWXPayInfo.packageInfo,
        'signType': chooseWXPayInfo.signType,
        'timeStamp': chooseWXPayInfo.timeStamp,
        'paySign': chooseWXPayInfo.paySign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/serviceingSuccess/serviceingSuccess`,
            });
          }, 1000);

        },
        'fail': function (res) {
          wx.showToast({
            title: '支付失败',
            image: '/images/icon_fail.png',
            duration: 2000,
            mask: true
          })
        }
      })
    }, err => {
      if (err.code == 6015) {
        // 机柜繁忙
        let option = {
          status: true,
          content: "电柜服务中，请稍后再试",
          foot: [{
            text: '我知道了',
            cb: () => {

            }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
      if (err.code == 7008) {
        // 机柜繁忙
        let option = {
          status: true,
          content: "电柜已离线，请稍后再试",
          foot: [{
            text: '我知道了',
            cb: () => { }
          }]
        }
        app.globalData.emitter.emit("dialogstatus", option)
      }
    })

  },

  // 选择
  selectnoteCont() {
    this.setData({
      haveread: !this.data.haveread
    })

  },
})