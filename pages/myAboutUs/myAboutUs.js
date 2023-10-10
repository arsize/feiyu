// pages/myAboutUs/myAboutUs.js
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
    name1: '官方网站',
    count1: '',
    name2: '联系电话',
    count2: '',
    name3: '电子邮箱',
    count3: '',
    logo: '',
    wxmpName: '',
    companyIntroduction: ''
  },

  onLoad: function (options) {
  },
  onShow() {
    let logindata = wx.getStorageSync("logindata")
    let organizationId = logindata.organizationId
    if (!organizationId) {
      wx.reLaunch({
        url: '/pages/loading/loading'
      })
      return
    }
    HTTP({
      url: 'app/wx/getCompanyInfo',
      methods: 'get',
      data: {
        organizationId: organizationId
      },
      loading: true,
    }).then(res => {
      this.setData({
        count1: res.data.companyWeb ? res.data.companyWeb : '--',
        count2: res.data.contactNumber ? res.data.contactNumber : '--',
        count3: res.data.email ? res.data.email : '--',
        logo: res.data.logoUrl ? res.data.logoUrl : this.data.baseUrlImg + 'logo_applet@2x.png',
        wxmpName: res.data.wxmpName ? res.data.wxmpName : '--',
        companyIntroduction: res.data.companyIntroduction ? res.data.companyIntroduction : '--'

      })

    })

  }

})