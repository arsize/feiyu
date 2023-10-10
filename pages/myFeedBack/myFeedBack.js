import {
  HTTP
} from "../../utils/server";
const app = getApp();
Page({
  data: {
    noteMaxLen: 200, //备注最多字数
    detail: '',
    imagesList: [],
    currentNoteLen: 0,
  },

  onLoad: function (options) { },
  onReady() { },
  onShow: function () {

  },
  selectOpinion(e) {
    let curId = e.currentTarget.dataset.index;
    this.setData({
      detail: '',
      currentNoteLen: 0
    });
  },

  detailBlur(e) {
    this.setData({
      detail: e.detail.value
    });
  },


  bindWordLimit: function (e) {
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > this.data.noteMaxLen) return;
    this.setData({
      currentNoteLen: len,
      detail: e.detail.value
    });
  },


  // 图片处理
  chooseImage: function () {
    let that = this;
    let token = wx.getStorageSync('logindata').appToken

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
              if (data.code == '200') {
                var imgs = that.data.imagesList;
                imgs.push(data.data);
                if (imgs.length > 3) {
                  wx.showToast({
                    title: '最多只能添加1张',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                  })

                  imgs.splice(3, imgs.length)
                  that.setData({
                    imagesList: imgs,
                  })
                } else {
                  that.setData({
                    imagesList: imgs,
                    imgCount: imgs.length
                  })
                }
              } else {
                wx.showToast({
                  title: data.message,
                  icon: 'none',
                  duration: 2000,
                  mask: true
                })
              }

            },
            fail: function (res) {
              wx.hideLoading();
              console.log('res', res)
              wx.showToast({
                title: '上传失败',
                image: '/image/icon_fail.png',
                duration: 2000,
                mask: true
              })
            }

          })

        }


      },
    })
  },
  // 预览图片
  previewImage: function () {
    wx.previewImage({
      urls: this.data.imagesList
    })


  },
  // 删除图片
  delete: function (e) {
    let index = e.currentTarget.dataset.index;
    let images = this.data.imagesList;
    images.splice(index, 1);
    this.setData({
      imagesList: images,
      imgCount: images.length
    })

  },



  formSubmitReg(e) {
    let that = this;
    let detail = e.detail.value.detail;
    if (!detail) {
      // wx.showToast({
      //   title: '请描述意见详情',
      //   icon: 'none',
      //   duration: 2000,
      //   mask: true
      // })
      return;
    }
    let params = {
      feedback: e.detail.value.detail,
      imgUrl: that.data.imagesList.join(',')
    }
    HTTP({
      url: 'app/wx/feedback',
      methods: 'POST',
      data: params,
      loading: true,
    }).then(res => {
      app.printf(res.data);
      let objData = res.data;
      wx.showToast({
        title: '提交成功',
        icon: "success",
        duration: 2000,
        mask: true
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1500)


    })



  }




})