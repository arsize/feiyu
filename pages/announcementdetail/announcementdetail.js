Page({
    data: {
        announcementDetail: ''
    },
    onLoad: function (options) {
        let that = this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('acceptDataFromAnnouncement', function (data) {
            if (data.announcementPictureUrl) {
                data.announcementPictureUrl = that.checkLastFont(data.announcementPictureUrl).split(',')
            }
            that.setData({
                announcementDetail: data
            })
        })
    },
    checkLastFont(str) {
        let temp = str
        temp = (temp.substring(temp.length - 1) == ',') ? temp.substring(0, temp.length - 1) : temp;
        return temp
    }

})