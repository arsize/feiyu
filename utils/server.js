import {
  globalData
} from "./global";
const API_BASE_URL = globalData.baseUrl;
// 接口封装
const HTTP = (options) => {
  let {
    url,
    methods,
    loading,
    data
  } = options

  let header = {
    language: "zh",
    "content-type": "application/json"
  };
  let token = wx.getStorageSync("logindata").appToken;

  if (token) {
    header.access_token = token;
  }
  if (loading) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
  }
  return new Promise((resolve, reject) => {
    console.log('11')
    console.log('url', url)
    console.log('methods', methods)

    wx.request({
      url: API_BASE_URL + url,
      header: header,
      method: methods,
      data: data,
      success: res => {
        if (loading) {
          wx.hideLoading();
        }
        if (res.data.code == 200) {
          resolve(res.data);
        } else {
          reject(res.data);
          let ignoreCode = [0, 6023, 6013, 2010, 6020, 6006, 9003, 20003, 3008, 1015, 4002, 2007, 6015, 40005, 6004, 40002, 7006, 2006, 6009, 50001, 40008, 7008, 6010, 2008, 6008, 9005, 20007, 40014, 6017, 6007, 6010, 7009, 1009, 6018, 2009, 130002, 2011, 6019]
          if (!ignoreCode.includes(res.data.code)) {
            if (res.data.code == 1003) {
              // token失效
              wx.reLaunch({
                url: '/pages/loading/loading'
              })

            } else {
              if (res.data.msg) {
                wx.showToast({
                  title: res.data.msg,
                  icon: "none",
                  duration: 2000,
                  mask: true
                });
              }

            }

          }

        }
      },
      fail: err => {
        console.log('err', err)
        if (loading) {
          wx.hideLoading();
        }
        checkNetWorkStatu();
        wx.showToast({
          title: "请稍后再试",
          icon: "none",
          duration: 2000,
          mask: true
        });
        reject(err);
      }
    });
  });
};

// 判断是否有网络
const checkNetWorkStatu = function () {
  console.log("触发到这里了")
  wx.getNetworkType({
    success: function (res) {
      let networkType = res.networkType;
      wx.hideLoading();
      console.log('networkType', networkType)
      if (networkType == "none") {
        wx.reLaunch({
          url: "/pages/noNetwork/noNetwork"
        });
      } else if (networkType == "unknown") {
        //未知的网络类型
        wx.reLaunch({
          url: "/pages/noNetwork/noNetwork"
        });
      } else {}
    }
  });
};

export {
  HTTP
};