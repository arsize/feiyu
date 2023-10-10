//Page Object

import { HTTP } from "../../utils/server";

//获取应用实例
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        inputval: '',
        checkSuccess: false
    },
    inputval(val) {
        let mobile = val.detail.value
        this.setData({
            inputval: mobile
        })
        this.checkInputVal()

    },
    checkInputVal() {
        if (this.data.inputval) {
            if (this.isPhoneNumber(this.data.inputval)) {
                this.setData({
                    checkSuccess: true
                })
            } else {
                this.setData({
                    checkSuccess: false
                })
            }
        } else {
            this.setData({
                checkSuccess: false
            })
        }
    },
    checkInputSubmit() {
        if (this.data.inputval) {
            if (this.isPhoneNumber(this.data.inputval)) {
                this.setData({
                    checkSuccess: true
                })

            } else {
                wx.showToast({
                    title: '请输入正确格式的手机号',
                    icon: 'none',
                    duration: 2000
                })
            }
        } else {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none',
                duration: 2000
            })
        }
    },
    isPhoneNumber(tel) {
        var reg = /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        return reg.test(tel);
    },
    getVerification() {
        let organizationId = wx.getStorageSync("logindata").organizationId;
        if (!this.isPhoneNumber(this.data.inputval)) {
            wx.showToast({
                title: '请输入正确格式的手机号',
                icon: 'none',
                duration: 2000
            })
            return
        }
        wx.showLoading({
            title: '请稍后',
        })
        HTTP({
            url: '/app/wx/sendChangeMobilePhoneSms',
            methods: 'post',
            data: {
                mobile: this.data.inputval,
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
            setTimeout(() => {
                wx.redirectTo({
                    url: `/pages/checkverification/checkverification?mobile=${this.data.inputval}`
                })
            }, 1000);

        })
    },
    // 法律条款与隐私政策
    gotouseragreement() {
        wx.navigateTo({
            url: '/pages/myPolicy/myPolicy'
        })
    },
    delmobile() {
        this.setData({
            inputval: ''
        })

    }
});