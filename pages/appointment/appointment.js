//Page Object
import {
    HTTP
} from "../../utils/server";
import {
    formats
} from "../../utils/util";

const app = getApp();
Page({
    data: {
        arrivalDate: "",
        businessId: '',
        loading: false,
        userMobilePhone: '',
        userName: '',
        arrivalTime: '',
        selectdata: false,
        flagArr: [true, true, true, true],
        baseUrlImg: app.globalData.baseUrlImg,
        timearr: ['9:00-11:00', '11:00-12:00', '12:00-15:00', '15:00-18:00'],
        currentDate: new Date().getTime(),
        minDate: new Date().getTime(),
        maxDate: new Date().getTime() + 1 * 24 * 60 * 60 * 1000 * 31,
        formatter(type, value) {
            if (type === 'year') {
                return `${value}年`;
            } else if (type === 'month') {
                return `${value}月`;
            }
            return value;
        }

    },
    onLoad(options) {
        let businessId = options.businessId
        this.setData({
            businessId: businessId
        })

    },
    onShow() {
        let userMobilePhone = wx.getStorageSync("logindata").account
        let index = this.confirmTime()
        let arrivalTime = ''
        let arrivalDate = ''
        console.log('index', index)
        if (index) {
            arrivalTime = index
            arrivalDate = formats('yyyy-MM-dd', new Date().getTime())
        } else {
            arrivalTime = '9:00-11:00'
            arrivalDate = formats('yyyy-MM-dd', new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
            this.setData({
                flagArr: [true, true, true, true]
            })
        }
        this.setData({
            userMobilePhone: userMobilePhone,
            arrivalTime: arrivalTime,
            arrivalDate: arrivalDate
        })


        console.log(this.data.arrivalTime)
        console.log(this.data.timearr)

    },
    selecttimefn() {
        this.setData({
            selectdata: true
        })
    },
    inputval1(e) {
        this.setData({
            userName: e.detail.value
        })
    },
    inputval2(e) {
        this.setData({
            userMobilePhone: e.detail.value
        })
    },
    selectCurrentTime(e) {
        let time = e.currentTarget.dataset.item
        console.log('item', time)
        this.setData({
            arrivalTime: time
        })
        console.log(e)

    },
    onClosechargeInfolog() {
        this.setData({
            selectdata: false
        })
    },
    onInput(event) {
    },
    confirmTime() {
        let hours = new Date().getHours()
        console.log(hours)
        if (hours < 11) {
            return '9:00-11:00'
        } else if (hours >= 11 && hours < 12) {
            this.setData({
                flagArr: [false, true, true, true]
            })
            return '11:00-12:00'
        } else if (hours >= 12 && hours < 15) {
            this.setData({
                flagArr: [false, false, true, true]
            })
            return '12:00-15:00'
        } else if (hours >= 15 && hours < 18) {
            this.setData({
                flagArr: [false, false, false, true]
            })
            return '15:00-18:00'
        } else if (hours >= 18 && hours <= 24) {
            this.setData({
                flagArr: [false, false, false, false]
            })
            return false
        }
    },
    onconfirm(e) {
        let tempDate = e.detail
        let now = new Date().getDay()
        let day = new Date(tempDate).getDay()
        if (now == day) {
            let hours = new Date(tempDate).getHours()
            if (11 <= hours && hours < 12) {
                this.setData({
                    flagArr: [false, true, true, true]
                })
                console.log(1)

            } else if (12 <= hours && hours < 15) {
                this.setData({
                    flagArr: [false, false, true, true]
                })
                console.log(2)
            } else if (15 <= hours && hours < 18) {
                this.setData({
                    flagArr: [false, false, false, true]
                })
                console.log(3)
            } else if (hours >= 18) {
                this.setData({
                    flagArr: [false, false, false, false]
                })
                console.log(4)
            }
        } else {
            this.setData({
                flagArr: [true, true, true, true]
            })
        }
        this.setData({
            selectdata: false,
            arrivalDate: formats('yyyy-MM-dd', tempDate)
        })

    },
    oncancel() {
        this.setData({
            selectdata: false
        })
    },
    isPhoneNumber(tel) {
        var reg = /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        return reg.test(tel);
    },
    confirmEnd() {
        if (!this.data.arrivalDate) {
            wx.showToast({
                title: '请选择到店日期',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (!this.data.arrivalTime) {
            wx.showToast({
                title: '请选择到店时段',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (!this.isPhoneNumber(this.data.userMobilePhone)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 2000
            })
            return
        }
        this.setData({
            loading: true
        })


        HTTP({
            url: 'app/wx/userAppointmentShopBusiness',
            methods: 'post',
            data: {
                arrivalDate: this.data.arrivalDate,
                arrivalTime: this.data.arrivalTime,
                businessId: this.data.businessId,
                userMobilePhone: this.data.userMobilePhone,
                userName: this.data.userName
            }
        }).then(res => {
            console.log('预约成功')
            this.setData({
                loading: false
            })
            wx.redirectTo({
                url: '/pages/appointmentInfo/appointmentInfo'
            })
        }, err => {
            this.setData({
                loading: false
            })
        })
    }

});