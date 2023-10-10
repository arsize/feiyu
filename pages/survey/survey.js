import { HTTP } from "../../utils/server";

//Page Object
const app = getApp();
Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        arr1: ["本铃", "台铃", "小刀", "小牛", "雅迪", "爱玛", "绿源", "其他"],
        arr2: ["铅酸", "锂电"],
        arr3: ["不足半年", "1年", "1.5年", "2年", "2.5年", "3年", "3年多", "其他"],
        finish: false,
        actived1: '',
        actived2: '',
        actived3: '',
        getArrs: []
    },
    getarr(e) {
        let item = e.currentTarget.dataset.item
        let index = e.currentTarget.dataset.index
        if (this.data.arr1.includes(item)) {
            this.setData({
                actived1: index
            })
        } else if (this.data.arr2.includes(item)) {
            this.setData({
                actived2: index
            })

        } else if (this.data.arr3.includes(item)) {
            this.setData({
                actived3: index
            })
        }

        if (!this.data.getArrs.includes(item)) {
            this.data.getArrs.push(item)
            this.setData({
                getArrs: this.data.getArrs
            })
        }
        if (this.checkFinish()) {
            this.setData({
                finish: true
            })
        }
        console.log(this.getArrs)
    },
    getarr2(e) {
        let item = e.currentTarget.dataset.item
        let index = e.currentTarget.dataset.index
        if (this.data.arr3.includes(item)) {
            this.setData({
                actived3: index
            })
        }

        if (!this.data.getArrs.includes(item)) {
            this.data.getArrs.push(item)
            this.setData({
                getArrs: this.data.getArrs
            })
        }
        if (this.checkFinish()) {
            this.setData({
                finish: true
            })
        }
        console.log(this.getArrs)

    },
    // develop2
    checkBeforarr(arr) {
        let flag = false
        this.data.getArrs.map(item => {
            if (arr.includes(item)) {
                flag = true
            }
        })
        return flag
    },
    checkFinish() {
        if (this.checkBeforarr(this.data.arr1) && this.checkBeforarr(this.data.arr2) && this.checkBeforarr(this.data.arr3)) {
            return true
        } else {
            return false
        }
    },
    gotoresearch() {
        HTTP({
            url: "app/wx/userResearch",
            methods: 'post',
            data: {
                batteryType: this.data.actived2 == 0 ? 1 : 2,
                electricVehicleBrand: this.data.arr1[this.data.actived1],
                usageTime: this.data.arr3[this.data.actived3]

            }
        }).then(res => {
            wx.showToast({
                title: '提交成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1
                })
            }, 1000);

        })
    }
});