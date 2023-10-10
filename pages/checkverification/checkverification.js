//Page Object
//获取应用实例
import { HTTP } from "../../utils/server";
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        inputval: '',
        checkSuccess: false,
        premobile: '',
        aftermobile: '',
        timeover: 60,
        timer: ''
    },
    onLoad(options) {
        let premobile = options.mobile || ''
        let aftermobile = premobile.split("")
        aftermobile = aftermobile.map((item, index) => {
            if (index == 3 || index == 4 || index == 5 || index == 6) {
                return item = '*'
            } else {
                return item
            }
        })
        this.setData({
            premobile: premobile,
            aftermobile: aftermobile.join('')
        })
    },
    onHide() {
        if (this.data.timer) {
            clearInterval(this.data.timer)
            this.setData({
                timeover: 60
            })
        }
    },
    onUnload() {
        if (this.data.timer) {
            clearInterval(this.data.timer)
            this.setData({
                timeover: 60
            })
        }
    },
    restartget() {
        wx.showLoading({
            title: '请稍后',
        })
        let organizationId = wx.getStorageSync("logindata").organizationId;
        HTTP({
            url: '/app/wx/sendChangeMobilePhoneSms',
            methods: 'post',
            data: {
                mobile: this.data.premobile,
                type: 1,
                organizationId: organizationId
            }
        }).then(res => {
            wx.hideLoading()
            wx.showToast({
                title: "验证码已发送",
                icon: 'success',
                duration: 2000
            })
            this.setData({
                timeover: 60
            })
            this.timeover()
        })

    },
    onShow() {
        this.timeover()
    },
    gotologin() {
        let logindata = wx.getStorageSync("logindata")
        let userInfo = wx.getStorageSync("userInfo")
        HTTP({
            url: 'app/wx/mobileRegister',
            methods: 'post',
            data: {
                sessionKey: logindata.sessionKey,
                appId: app.globalData.appId,
                avatar: userInfo.userInfo.avatarUrl,
                nickName: userInfo.userInfo.nickName,
                openId: logindata.openId,
                organizationId: logindata.organizationId,
                phone: this.data.premobile,
                checkCode: this.data.inputval
            }
        }).then(res => {
            wx.setStorageSync("logindata", res.data);
            wx.showToast({
                title: '注册成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                wx.reLaunch({
                    url: "/pages/index/index"
                })
            }, 1000);
        })
    },

    // 定时器
    timeover() {
        let time = setInterval(() => {
            if (this.data.timeover <= 1) {
                clearInterval(this.data.timer)
                this.setData({
                    timeover: 0
                })
                return
            }
            let temp = this.data.timeover - 1
            this.setData({
                timeover: temp
            })
        }, 1000);
        this.setData({
            timer: time
        })
    },
    changeTime() {

    },
    inputval(val) {
        let mobile = val.detail.value
        this.setData({
            inputval: mobile
        })
        this.checkInputVal()
    },
    checkInputVal() {
        if (!this.data.inputval) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none',
                duration: 2000
            })
            this.setData({
                checkSuccess: false
            })
        } else {
            this.setData({
                checkSuccess: true
            })
        }
    },
    isPhoneNumber(tel) {
        var reg = /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        return reg.test(tel);
    },
    // 隐私政策
    gotouseragreement() {
        wx.navigateTo({
            url: '/pages/myPolicy/myPolicy'
        })
    },
    delmobile() {
        this.setData({
            inputval: '',
            checkSuccess: false
        })

    }
});