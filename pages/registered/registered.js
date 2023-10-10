const app = getApp();
import {
    globalData
} from "../../utils/global";
import {
    HTTP
} from "../../utils/server";
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        showRegistered: false,
        isGetUserinfo: false,
        logOut: false,
        coverUrl: '',
        appName: '',
        checked:false,
    },
    onLoad: function (options) {
        if (options.logout) {
            this.data.logOut = true;
        } else {
            this.data.logOut = false;
        }
    },
    onShow() {
        this.setCoverUrl()
        let appName = wx.getStorageSync("logindata").appName;
        this.setData({
            appName: appName
        });
        let userInfo = wx.getStorageSync('userInfo')
        if (!userInfo) {
            wx.redirectTo({
                url: "/pages/registeredPre/registeredPre"
            })
        }
    },
    // 获取用户信息
    getUserInfo(e) {
        if (e.detail.errMsg == "getUserInfo:ok") {
            wx.setStorageSync("userInfo", e.detail);
            this.setData({
                isGetUserinfo: true
            });

        } else {
            this.setData({
                showRegistered: true
            })


        }
    },
    selectCheck(){
    this.setData({
        checked:!this.data.checked
    })
    },
    changeChecked(e){
console.log('e',e)
    },
    showMsg(){
        if(!this.data.checked){
            wx.showToast({
            title: '请勾选用户协议',
            icon:"none"
            })
        }
    },
    // 获取用户手机号
    getPhoneNumber(e) {
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            console.log('e', e)
            this.registered(e.detail);
        } else {
            this.setData({
                showRegistered: true
            })
        }
    },
    // 手机号登录注册
    gotomobile(e) {
        // if (e.detail.errMsg == "getUserInfo:ok") {
            wx.setStorageSync("userInfo", e.detail);
            wx.navigateTo({
                url: "/pages/mobilelogin/mobilelogin"
            })

        // }

    },
    // 注册
    registered(detail) {
        HTTP({
            url: "/app/wx/wxRegisterMobile",
            methods: "post",
            data: {
                nickName: wx.getStorageSync("userInfo").userInfo.nickName,
                photo: wx.getStorageSync("userInfo").userInfo.avatarUrl,
                rawData: wx.getStorageSync("userInfo").userInfo.rawData,
                sex: wx.getStorageSync("userInfo").userInfo.gender,
                signature: wx.getStorageSync("userInfo").userInfo.signature,
                encryptedData: detail.encryptedData,
                iv: detail.iv,
                sessionKey: wx.getStorageSync("logindata").sessionKey,
                wxAppId: globalData.appId,
                openId: wx.getStorageSync("logindata").openId
            }
        }).then(res => {
            wx.setStorageSync("logindata", res.data);

            wx.showToast({
                title: `登录成功`,
                icon: 'success',
                duration: 2000
            })
            this.userLogin()

        })
    },
    //获取图片
    setCoverUrl() {
        let logindata = wx.getStorageSync("logindata")
        let functionPicture = logindata.functionPicture
        if (functionPicture) {
            functionPicture.map(item => {
                if (item.functionType == 3) {
                    this.setData({
                        coverUrl: item.coverUrl
                    })

                }
            })

        }
    },
    // 用户登录
    userLogin() {
        wx.login({
            success: res => {
                if (res.code) {
                    HTTP({
                        url: "/app/wx/login",
                        methods: 'post',
                        data: {
                            code: res.code,
                            wxAppId: globalData.appId
                        }
                    }).then(login => {
                        if (login.data.status == 1) {
                            wx.navigateTo({
                                url: `/pages/freezeAccount/freezeAccount`
                            });
                            return;
                        }
                        wx.setStorageSync("logindata", login.data);
                        if (this.data.logOut) {
                            wx.reLaunch({
                                url: '/pages/index/index',
                            })
                        } else {
                            wx.navigateBack({
                                delta: 1
                            });
                        }

                    })
                }
            },
            fail: res => {
                console.log("fail:", res);
            }
        });
    },
    canceldialog() {
        this.setData({
            showRegistered: false
        })
    },
    // 用户协议
    gotouseragreement() {
        wx.navigateTo({
            url: "/pages/myAgreement/myAgreement"
        })

    },
    // 隐私政策
    gotouserconceal() {
        wx.navigateTo({
            url: '/pages/myPolicy/myPolicy'
        })
    }
});