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
        baseUrlImg: app.globalData.baseUrlImg,
        status: false,
        selectItem: '电动车售价高',
        cancelArr: ['电动车售价高', "开通流程太麻烦", "不想交押金", "暂时还不想换车", "换电收费高", "预约其他服务网点", "其他原因"],
        infoData: {}
    },
    //options(Object)
    onLoad: function (options) {
        this.getDataFun();
    },
    onReady: function () {

    },

    getDataFun() {
        let that = this;
        let params = {};
        HTTP({
            url: 'app/wx/getUserAppointmentInfo',
            methods: 'get',
            data: params,
            loading: true,
        }).then(res => {
            app.printf(res.data);
            let objData = res.data;
            that.setData({
                infoData: objData,
                isRequest: true,
            });


        })
    },
    // 地图导航
    openMap(e) {
        let item = e.currentTarget.dataset.set
        let latitude = item.latitude
        let longitude = item.longitude
        let name = item.busName
        let address = item.busAddress
        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            scale: 16,
            name: name,
            address: address,
        })
    },
    callphone(e) {
        let item = e.currentTarget.dataset.set
        let phone = item.busMobile
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
    hideexchangeStatus() {
        this.setData({
            status: false
        })
    },

    cancelappoint() {
        // 取消预约
        this.setData({
            status: true
        })

    },
    confirmCancel() {
        this.cancelReservation();
    },

    cancelReservation() {
        let that = this;
        this.setData({
            status: false
        })
        let params = {
            feedback: this.data.selectItem
        };
        HTTP({
            url: 'app/wx/cancelReservation',
            methods: 'post',
            data: params,
            loading: true,
        }).then(res => {
            app.printf(res.data);
            wx.redirectTo({
                url: '/pages/myCannelOppo/myCannelOppo',
            })
        })
    },


    cancelDialog() {
        this.setData({
            status: false
        })
    },
    selectitem(e) {
        let item = e.currentTarget.dataset.item
        this.setData({
            selectItem: item
        })
        console.log(e)
    },
    confirmEnd() {
        wx.reLaunch({
            url: '/pages/index/index'
        })
    }
});