//Page Object
const app = getApp();
let baseUrlImgCurr = app.globalData.baseUrlImg;
import {
    HTTP
} from "../../utils/server";
import {
    formats
} from "../../utils/util";

Page({
    data: {
        baseUrlImg: app.globalData.baseUrlImg,
        carinfo: '',
        isbind: ''
    },
    onShow() {
        this.getData()
    },
    getData() {
        HTTP({
            url: 'app/wx/user/getBindVehicle',
            methods: 'get',
            data: {}
        }).then(res => {
            let item = res.data
            if (item) {
                item.timeToSell = formats(
                    "YYYY.MM.dd hh:mm",
                    item.timeToSell
                );
                this.setData({
                    isbind: true
                })
            } else {
                this.setData({
                    isbind: false
                })
            }
            this.setData({
                carinfo: item
            })
        }, err => {
            console.log(err)
            if (err.code == 1015) {
                wx.reLaunch({
                    url: '/pages/loading/loading',
                })
            }
        })
    },
    scanbind() {
        let that = this
        wx.scanCode({
            scanType: 'qrCode',
            success(res) {
                let result = res.result
                let option = {
                    status: true,
                    closeicon: true,
                    title: '是否确认绑定',
                    content: `车辆编码：${result}`,
                    foot: [{
                        text: '确认绑定',
                        cb: () => {
                            HTTP({
                                url: 'app/wx/user/bindVehicle',
                                methods: "get",
                                data: {
                                    scanCode: result
                                }
                            }).then(res => {
                                that.getData()
                            }, err => {
                                if (err.code == 130002) {
                                    wx.showToast({
                                        title: '该车辆尚未入库，请联系门店处理',
                                        icon: 'none'
                                    })
                                }
                                if (err.code == 1015) {
                                    wx.reLaunch({
                                        url: '/pages/loading/loading',
                                    })
                                }
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        })
    }
});