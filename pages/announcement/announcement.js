import { HTTP } from "../../utils/server";
import { formats } from "../../utils/util";
Page({
    data: {
        listData: [],
        totalPages: "",
        current: 1,
        size: 5,
        totalNum: "",

    },
    onLoad: function (options) {
        this.getAnnouncement()
    },
    onShow() {

    },
    getAnnouncement() {
        let logindata = wx.getStorageSync('logindata')
        if (!logindata.organizationId) {
            wx.reLaunch({
                url: '/pages/loading/loading'
            })
            return
        }
        HTTP({
            url: `app/wx/getAnnouncementList?organizationId=${logindata.organizationId}`,
            methods: 'post',
            data: {
                currentPage: this.data.current,
                pageSize: this.data.size,
            }
        }).then(res => {
            let data = res.data;
            if (data) {
                let listData = this.data.listData.concat(res.data.records);

                listData.forEach(item => {
                    if (item.publishTime) {
                        item.publishTime = formats("yyyy-MM-dd hh:mm", item.publishTime);
                    }
                });
                console.log('listData', listData)

                this.setData({
                    listData: listData,
                    totalPages: data.pages
                });
            }
        }, err => {

        })
    },
    gotodetail(e) {
        let detail = e.currentTarget.dataset.item
        wx.navigateTo({
            url: '/pages/announcementdetail/announcementdetail',
            success: function (res) {
                res.eventChannel.emit('acceptDataFromAnnouncement', detail)
            }
        })

    },
    onReachBottom() {
        let current = this.data.current;
        if (current < this.data.totalPages) {
            this.setData({
                current: this.data.current + 1
            });
            this.getAnnouncement();
        } else {
            wx.showToast({
                title: "没有更多了",
                icon: "none"
            });
        }
    }
})