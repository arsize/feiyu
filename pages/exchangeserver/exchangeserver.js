import { HTTP } from "../../utils/server";

//Page Object
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        realName: '',
        functionPicture: '',
        contentUrl: []
    },
    onLoad() {
        wx.showShareMenu();
    },
    onShow() {
        this.getImg()
    },
    getImg() {
        let functionPicture = wx.getStorageSync("logindata").functionPicture
        if (functionPicture) {
            this.setData({
                functionPicture: functionPicture
            })
            functionPicture.map(item => {
                if (item.functionType == 1) {
                    this.setData({
                        contentUrl: item.contentUrl,
                    })

                }
            })

            console.log('contentUrl', this.data.contentUrl)

        }
        this.setData({
            functionPicture: functionPicture
        })
    },

    gotoyuyue() {
        let that = this
        if (this.checkRegistered()) {
            if (this.checkPoint()) {
                HTTP({
                    url: 'app/wx/getUserAppointmentInfo',
                    methods: 'get'
                }).then(res => {
                    if (!res.data) {
                        // NULL 从未预约
                        wx.navigateTo({
                            url: '/pages/myOrderService/myOrderService'
                        })
                    } else {
                        if (res.data.appointmentStatus == 1) {
                            // 预约中
                            wx.navigateTo({
                                url: '/pages/appointmentInfo/appointmentInfo'
                            })
                        } else {
                            // 其他
                            wx.navigateTo({
                                url: '/pages/myOrderService/myOrderService'
                            })
                        }

                    }
                })
            } else {
                // 未定位
                let option = {
                    status: true,
                    title: '请授权地理位置',
                    content: "需获取您的地理位置以提供更好的充换电服务，请确认授权",
                    foot: [{
                        text: '取消',
                        cb: () => {
                        }
                    }, {
                        text: '去授权',
                        cb: () => {
                            that.regetLocation()

                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)


            }
        }

    },

    regetLocation() {
        let that = this
        wx.openSetting({
            success: function (data) {
                if (data.errMsg == "openSetting:ok") {
                    if (data.authSetting["scope.userLocation"] == true) {
                        that.getLocations().then(res => {
                            wx.showToast({
                                title: '定位成功'
                            })

                        })
                    }
                }
            }
        })
    },
    getLocations() {
        let that = this
        return new Promise((resolve, reject) => {
            wx.getLocation({
                type: "gcj02",
                success(res) {
                    let point = {
                        latitude: res.latitude,
                        longitude: res.longitude
                    }
                    wx.setStorageSync("point", point);
                    that.setData({
                        point: point
                    })
                    resolve(res)
                },
                fail(err) {
                    wx.showToast({
                        title: "定位失败",
                        duration: 2000,
                        icon: 'none'
                    });
                    reject(err)
                },
            });
        })
    },

    // 验证是否已定位
    checkPoint() {
        let point = wx.getStorageSync("point")
        if (point) {
            return true
        } else {
            return false
        }
    },
    // 跳转到服务网点
    gotoservercenter() {
        let point = wx.getStorageSync("point")
        point.serveTypeCurr = 2
        wx.redirectTo({
            url: '/pages/myOffStore/myOffStore',
        })
    },

    // 验证是否已注册
    checkRegistered() {
        let logindata = wx.getStorageSync("logindata")
        let userInfo = wx.getStorageSync('userInfo')
        if (logindata.unregistered) {
            if (userInfo) {
                wx.navigateTo({
                    url: "/pages/registered/registered"
                })
            } else {
                wx.navigateTo({
                    url: "/pages/registeredPre/registeredPre"
                })
            }
            return false
        } else {
            return true
        }
    },
});