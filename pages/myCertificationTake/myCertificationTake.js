// pages/myCertification/myCertification.js
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
    param1: '',
    param2: '',
    param3: '',
    param4: '',
    param5: [],
    param6: '',
    desposi: true,
    region: ['广东省', '广州市', '海珠区'],
    idCardParams: {
      front: '',
      back: ''
    }
  },
  onShow() { },

  bindinput(e) {
    let paramObj = e.detail.value;
    let paramCurr = e.target.dataset.param;
    this.setData({
      [paramCurr]: paramObj
    })
  },

  bindRegionChange: function (e) {
    this.setData({
      param5: e.detail.value
    })
  },

  // 图片处理
  chooseImage: function (e) {
    let that = this;
    const currType = e.currentTarget.dataset.type;
    let token = wx.getStorageSync('logindata').appToken;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        for (var f = 0; f < res.tempFilePaths.length; f++) {
          wx.uploadFile({
            url: `${app.globalData.baseUrl}fileUpload/picture`,
            filePath: tempFilePaths[f],
            header: {
              'access_token': token,
              'content-type': "multipart/form-data"
            },
            name: 'file',
            success: function (res) {
              var data = JSON.parse(res.data);
              wx.hideLoading();
              if (Number(data.code) === 200) {
                const currImg = data.data;

                that.setData({
                  idCardParams: {
                    ...that.data.idCardParams,
                    [currType]: currImg
                  },
                })

                if (that.data.idCardParams.back && that.data.idCardParams.front) {
                  that.ocrIdCardOperate()
                }

              } else {
                that.setData({
                  idCardParams: {
                    ...that.data.idCardParams,
                    [currType]: ''
                  },
                })
                wx.showToast({
                  title: data.msg,
                  icon: 'none',
                  duration: 2000,
                  mask: true
                })
              }

            },
            fail: function (res) {
              that.setData({
                idCardParams: {
                  ...that.data.idCardParams,
                  [currType]: ''
                },
              })
              wx.hideLoading();
              wx.showToast({
                title: "上传失败,请重试",
                icon: 'none',
                duration: 2000,
                mask: true
              })

            }
          })
        }
      },
    })
  },

  ocrIdCardOperate() {
    const params = {
      faceImageUrl: this.data.idCardParams.front,
      backImageUrl: this.data.idCardParams.back,
    }

    HTTP({
      url: '/app/wx/ocrIdCard',
      methods: 'get',
      data: params,
      loading: true,
    }).then(res => {
      
      const data = res.data;
      this.setData({
        param1: data && data.name,
        param2: data && data.idnumber,
      })

    }, err => {
      this.setData({
        param1: '',
        param2: '',
        idCardParams: {
          front: '',
          back: ''
        }
      })
      wx.showToast({
        title: err.msg,
        icon: "none",
        duration: 8000,
        mask: true
      })
    })
  },


  // 预览图片
  previewImage: function () {
    wx.previewImage({
      urls: this.data.imagesList
    })
  },


  formSubmit(e) {
    let paramObj = e.detail.value;
    if (!(/^[\u4e00-\u9fa5]{2,4}$/.test(paramObj.param1))) {
      wx.showToast({
        title: '请输入正确的真实姓名',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }
    if (!(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(paramObj.param2))) {

      wx.showToast({
        title: '请输入正确的身份证号码',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }


    if (!paramObj.param3) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;

    }
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(paramObj.param4))) {
      wx.showToast({
        title: '请输入正确的联系电话',
        icon: "none",
        duration: 2000,
        mask: true
      });
      return;
    }
    this.applyFun(paramObj);
  },
  applyFun(paramObj) {
    let that = this;
    let myCenterInfo = wx.getStorageSync('myCenterInfo') || {};
    let logindata = wx.getStorageSync('logindata') || {};
    let params = {
      accountUid: myCenterInfo.userUid,
      organizationId: logindata.organizationId,
      name: paramObj.param1,
      idCard: paramObj.param2,
      emergencyContactName: paramObj.param3,
      emergencyContactMobile: paramObj.param4,
      residentProvince: this.data.param5[0],
      residentCity: this.data.param5[1],
      residentialArea: this.data.param5[2],
      detailedAddress: paramObj.param6,

    }

    HTTP({
      url: 'app/wx/doRealName',
      methods: 'post',
      data: params,
      loading: true,
    }).then(res => {
      wx.showToast({
        title: '提交成功',
        icon: "success",
        duration: 2000,
        mask: true
      })
      let payDepostStatus = wx.getStorageSync('myCenterInfo') ? wx.getStorageSync('myCenterInfo').payDepostStatus : ''
      if (payDepostStatus == 0) {
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/myPayDepositOther/myPayDepositOther',
          })
        }, 1500)
      } else {
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/serviceingSuccess/serviceingSuccess`,
          });
        }, 1500)
      }



    }, err => {
      if (err.code == "50001") {
        wx.showToast({
          title: '真实姓名与身份证号码不匹配，实名认证不通过',
          icon: "none",
          duration: 2000,
          mask: true
        });
      }
    })



  },

})