import { HTTP } from "../../utils/server";
import { globalData } from "../../utils/global";
import TouchMoveItem from "../../utils/touchmove"
import regeneratorRuntime from '../../utils/runtime.js'
const touchItem = new TouchMoveItem()
var QQMapWX = require('../../mapAPI/qqmap-wx-jssdk.min');
var qqmapsdk;
const bluetooth = require("../../utils/blueTooth/bluetooth");
//获取应用实例
const app = getApp();
Page({

    data: {
		setting:{
			subKey: app.globalData.qqmapkey,
		},
        baseUrlImg: app.globalData.baseUrlImg,
        subkey: app.globalData.qqmapkey,
        mapDuration: '',
        mapDistance: '',
        mapScale: 14,
        showFirstPage: false,
        isSupportChargerService: false,
        chargerServiceCotent: "",
        isSupportRentalService: false,
        isSupportPowerBean: false,//是否支持电粒
        exchangeServiceCotent: "",
        showLeftSelect: false,
        batteryTypeList: [],//可切换电池类型
        selectBatteryIdArr: [],
        indexChecked: true,
        isAdversi: false,//首页广告弹窗
        showToashbar: false,
        showPointCheck: false,
        appTitle: '',
        logindata: '',
        positionNone: false,
        popUpsCode: "",
        oningExchangeOd: "",
        oningChargOd: "",
        realName: "",
        depost: null,
        popUpsContent: "",
        point: "",//用户定位信息
        sourcelatitude: '',
        sourcelongitude: '',
        centerPoint: '',
        unregistered: false,
        touchend: false,
        showNotice: true,
        homeFloatPicture: "",
        noticeBar: "",
        bottomItemImg: [],
        nearbyCabinet: "",
        chargingRecordDetail: "",
        chargingStartTime: "",
        batteryTypeAndNumDtoList: [],
        polyline: [{
            points: [],
            color: "#666666",
            width: 4,
            arrowLine: true,
        }],
        selectBatteryType: '',
        lowPowerNum: 0,
        mediumPowerNum: 0,
        highPowerNum: 0,
        fullPowerNum: 0,
        selectBatteryNum: 0,
        showCabinet: true,
        noticeIndex: 0,//公告
        blockHeight: 0,//菜单卡片高度
        mapCtx: "",//地图map上下文实例
        mapmoveing: false,
        tempFlag: '',
        cardType: 'module_menu',
        cardItemType: "charge",
        portStatusInfo: [],//充电口信息
        boxStatusInfo: [],//换电仓门信息
        batterySoc: "",//电量
        userBindBatteryType: "",
        showBattey: false,
        connectType: "",
        walletMoney: 0,//钱包余额
        timer: "", //定时器
        markers: [],//地图mark
        bakmarkers: [],//缓存地图mark
        percentArr: ['≦ 50%', '51%~80%', '81%~89%', '≧ 90%'],
        throttleDate: 0,//地图移动节流
        lastDate: '',//充换电切换节流
        beansToBeReceived: '',
        cardMenus: [{
            name: "充电",
            type: "charge"
        }, {
            name: "换电",
            type: "exchange"
        }, {
            name: "租车",
            type: "rental"
        }]
    },
    onLoad: function (options) {
        this.showOrNotPoint()
        wx.showShareMenu();
        this.defaultSelectedType()
        if (wx.getStorageSync('nearestSotreId')) {
            wx.removeStorageSync('nearestSotreId');
            wx.removeStorageSync('selectStoreObj');
        }
        if (options.q) {
            var scene = decodeURIComponent(options.q);
            var deviceUid = scene.split("deviceUid=")[1];
            wx.setStorageSync("sceneUid", deviceUid);
        }
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: app.globalData.qqmapkey
        });
        this.init()
    },
    onReady: function () {
        this.data.mapCtx = wx.createMapContext("myMap");
    },
    onShow() {
        
        // 断开蓝牙
        bluetooth.offBlueLine();
        wx.setStorageSync('isBlueConnected', "")
        this.resetHeight()
        let logindata = wx.getStorageSync('logindata')
        this.setData({
            unregistered: logindata.unregistered
        })
        if (!logindata.unregistered) {
            this.getIsNowCharging();
            this.switchPopMessage()
        }
        
    },
    // 统计
    saveLoginRecord() {
        HTTP({
            url: "app/wx/saveLoginRecord",
            methods: "post",
            data: {}
        }).then(res => {
            console.log('统计...')
        })
    },
    // 初始化
    init() {
        this.checkLoginStatus().then(res => {
            if (res) {
                this.setData({
                    logindata: res
                })
                let sceneUid = wx.getStorageSync("sceneUid");
                if (sceneUid) {
                    this.setData({
                        sceneUid: sceneUid,
                    });
                } else {
                    this.setData({
                        sceneUid: "",
                    });
                }
                this.getUserLoginStats(res)
                this.setAppInfo()
                this.getUserWalletAndPowerBean()
                this.getIsNowCharging();//正在进行中的订单
                this.switchPopMessage()//小象提示
                this.getAdLink()//弹窗广告
                this.showOrNotCheckPoint()//操作指引
                this.getUserBattery()//电量展示
                if (!this.data.showFirstPage) {
                    this.getLocations()//定位坐标点
                }
                this.getBatteryTypeByAgentId()//获取电池类型
            }

        })
    },
    // 获取余额和电粒状态
    getUserWalletAndPowerBean() {
        HTTP({
            url: "wallet/getUserWalletAndPowerBean",
            methods: "get",
            data: {}
        }).then(res => {
            wx.setStorageSync('walletMoney', res.data.money)
            this.setData({
                beansToBeReceived: res.data.beansToBeReceived ? Number(res.data.beansToBeReceived) : 0,
                walletMoney: res.data.money
            })

        })
    },
    resetStatus() {
        this.setData({
            cardMenus: [{
                name: "充电",
                type: "charge"
            }, {
                name: "换电",
                type: "exchange"
            }, {
                name: "租车",
                type: "rental"
            }],
            cardType: 'module_menu',
            polyline: [{
                points: [],
                color: "#666666",
                width: 4,
                arrowLine: true,
            }],
            isMod: false,
            tempFlag: '',
            sourcelatitude: '',
            sourcelongitude: '',
        })
        this.resetHeight()
    },

    // 获取用户登录状态
    getUserLoginStats(logindata) {
        if (!logindata.unregistered) {
            this.setData({
                unregistered: false //已登录
            })
        } else {
            this.setData({
                unregistered: true //未登录
            })
        }
    },
    // 设置小程序标题 && 用户头像
    setAppInfo() {
        let appname = wx.getStorageSync("appname")
        let userPhoto = wx.getStorageSync("userPhoto")
        if (appname && !this.data.showFirstPage) {
            this.setData({
                appTitle: appname,
            })
        }
        if (userPhoto && !this.data.unregistered) {
            this.setData({
                userPhoto: userPhoto,
            })
        }
    },
    // 调用login
    checkLoginStatus() {
        let that = this
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    if (res.code) {
                        HTTP({
                            url: "app/wx/login",
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
                            // 设置统计
                            that.saveLoginRecord()
                            wx.setStorageSync("logindata", login.data);
                            wx.setStorageSync("userType", login.data.userType);
                            that.setStorage(login.data)
                            let showFirstPage = wx.getStorageSync('showFirstPage')
                            if (showFirstPage === "") {
                                // 无缓存
                                if (login.data.isEnableService) {
                                    that.setData({
                                        appTitle: "选择当前服务类型"
                                    })
                                }
                                that.setData({
                                    showFirstPage: login.data.isEnableService,
                                    isSupportChargerService: login.data.isSupportChargerService,
                                    isSupportRentalService: login.data.isSupportRentalService,
                                    isSupportPowerBean: login.data.isSupportPowerBean,
                                    chargerServiceCotent: that.handleServiceCotent('charge', login.data.enableServiceDescription),
                                    exchangeServiceCotent: that.handleServiceCotent("exchange", login.data.enableServiceDescription)
                                })
                                if (!that.data.isSupportChargerService) {
                                    that.data.cardMenus = that.data.cardMenus.filter(item => {
                                        if (item.type != 'charge') {
                                            return true
                                        }
                                    })
                                    that.setData({
                                        cardMenus: that.data.cardMenus,
                                        cardItemType: "exchange"
                                    })

                                }
                                if (!that.data.isSupportRentalService) {
                                    that.data.cardMenus = that.data.cardMenus.filter(item => {
                                        if (item.type != 'rental') {
                                            return true
                                        }
                                    })
                                    that.setData({
                                        cardMenus: that.data.cardMenus
                                    })
                                }

                            } else {
                                // 有缓存

                                if (showFirstPage !== login.data.isEnableService) {
                                    if (login.data.isEnableService) {
                                        that.setData({
                                            appTitle: "选择当前服务类型"
                                        })
                                    }
                                    that.setData({
                                        showFirstPage: login.data.isEnableService,
                                        isSupportChargerService: login.data.isSupportChargerService,
                                        isSupportRentalService: login.data.isSupportRentalService,
                                        isSupportPowerBean: login.data.isSupportPowerBean,
                                        chargerServiceCotent: that.handleServiceCotent('charge', login.data.enableServiceDescription),
                                        exchangeServiceCotent: that.handleServiceCotent("exchange", login.data.enableServiceDescription)
                                    })
                                    if (!that.data.isSupportChargerService) {
                                        that.data.cardMenus = that.data.cardMenus.filter(item => {
                                            if (item.type != 'charge') {
                                                return true
                                            }
                                        })
                                        that.setData({
                                            cardMenus: that.data.cardMenus,
                                            cardItemType: "exchange"
                                        })
                                    }
                                    if (!that.data.isSupportRentalService) {
                                        that.data.cardMenus = that.data.cardMenus.filter(item => {
                                            if (item.type != 'rental') {
                                                return true
                                            }
                                        })
                                        that.setData({
                                            cardMenus: that.data.cardMenus
                                        })
                                    }

                                } else {
                                    that.setData({
                                        isSupportChargerService: login.data.isSupportChargerService,
                                        isSupportRentalService: login.data.isSupportRentalService,
                                        isSupportPowerBean: login.data.isSupportPowerBean,
                                        chargerServiceCotent: that.handleServiceCotent('charge', login.data.enableServiceDescription),
                                        exchangeServiceCotent: that.handleServiceCotent("exchange", login.data.enableServiceDescription)
                                    })
                                    if (!that.data.isSupportChargerService) {
                                        that.data.cardMenus = that.data.cardMenus.filter(item => {
                                            if (item.type != 'charge') {
                                                return true
                                            }
                                        })
                                        that.setData({
                                            cardMenus: that.data.cardMenus,
                                            cardItemType: "exchange"
                                        })
                                    }
                                    if (!that.data.isSupportRentalService) {
                                        that.data.cardMenus = that.data.cardMenus.filter(item => {
                                            if (item.type != 'rental') {
                                                return true
                                            }
                                        })
                                        that.setData({
                                            cardMenus: that.data.cardMenus
                                        })
                                    }
                                }
                            }
                            that.swiperNoticeBar(login.data)
                            resolve(login.data)
                        })
                    }
                },
                fail: err => {
                    reject(false)
                }
            });
        })
    },
    // 处理充换电cotent
    handleServiceCotent(type, enableServiceDescription) {
        let str = enableServiceDescription
        let charge = ''
        let exchange = ""
        if (str) {
            charge = str.split("##")[0]//中文逗号
            exchange = str.split("##")[1]
            if (type == 'charge') {
                return charge
            } else if (type == 'exchange') {
                return exchange
            }
        } else {
            return ""
        }
    },
    // 默认选择具体是换电还是充电
    defaultSelectedType() {
        let type = wx.getStorageSync('typeselected')
        if (type && type != 'rental') {
            this.setData({
                cardItemType: type
            })
        }
    },

    // 查询用户电池电量信息
    getUserBattery() {
        HTTP({
            url: 'battery/user/batteryInfo',
            methods: 'get'
        }).then(res => {
            let selectBatteryIdArr = []
            if (res.data.batteryTypeId) {
                selectBatteryIdArr.push(res.data.batteryTypeId)
            }
            this.setData({
                batterySoc: res.data.batterySoc,
                batteryTypeId: res.data.batteryTypeId,
                userBindBatteryType: res.data.userBindBatteryType,
                connectType: res.data.connectType,
                showBattey: true,
                selectBatteryIdArr: selectBatteryIdArr,
                depost: res.data.batteryDepositOrderStatus,
            });
            wx.setStorageSync('batteryDepositOrderStatus', res.data.batteryDepositOrderStatus)
            wx.setStorageSync('realName', res.data.realName)
        })
    },
    // 首页获取用户定位信息
    getLocations() {
        let that = this
        wx.getLocation({
            type: "gcj02",
            success(res) {
                let point = {
                    latitude: res.latitude,
                    longitude: res.longitude
                }
                wx.setStorageSync("point", point);
                that.setData({
                    point: point,
                    centerPoint: point,
                    positionNone: false
                })
                that.getCityInfo(point)
            },
            fail(err) {
                that.setData({
                    positionNone: true
                })

            },
        })
    },
    // 根据经纬度和ID获取用户最近的地区信息
    getCityInfo(location) {
        console.log("***************************  getCityInfo  ********************************")
        if (!wx.getStorageSync("logindata")) {
            return false
        }
        HTTP({
            url: 'cabinet/getCityInfoByOrganizationId',
            methods: 'get',
            data: {
                latitude: location.latitude,
                longitude: location.longitude,
                organizationId: wx.getStorageSync("logindata").organizationId
            }
        }).then(res => {
            let inRegion = res.data ? res.data.inRegion : ''
            let point = {
                latitude: location.latitude,
                longitude: location.longitude,
                organizationId: inRegion ? inRegion.organizationId : 0
            };
            wx.setStorageSync("point", point);
            wx.setStorageSync("cityName", res.data.inRegion.cityName);
            wx.setStorageSync("selectorganId", res.data ? res.data.inRegion.organizationId : 0);
            this.getMapCabinet(point);

        }, err => {
        })
    },
    // 地理位置重新授权
    regetLocation() {
        let that = this
        wx.openSetting({
            success: function (data) {
                if (data.errMsg == "openSetting:ok") {
                    if (data.authSetting["scope.userLocation"] == true) {
                        that.getLocations()
                    }
                }
            }
        })
    },
    setStorage(logindata) {
        if (logindata.appName) {
            wx.setStorageSync('appname', logindata.appName)
        }
        if (logindata.organizationMobile) {
            wx.setStorageSync("kfMobile", logindata.organizationMobile);
        }
        if (logindata.userPhoto) {
            wx.setStorageSync("userPhoto", logindata.userPhoto);
        }
    },
    // 上下轮播公告
    swiperNoticeBar(login) {
        let logindata = login
        let noticeBar = logindata.announcementContent
        let tempNoticeArr = []
        if (noticeBar) {
            tempNoticeArr = noticeBar.split(';')
            if (tempNoticeArr.length > 0) {
                this.setData({
                    noticeBar: tempNoticeArr
                })
                if (globalData.timerswiperNoticeBar) {
                    clearInterval(globalData.timerswiperNoticeBar)
                }
                globalData.timerswiperNoticeBar = setInterval(() => {
                    this.setData({
                        noticeIndex: this.data.noticeIndex + 70
                    })
                    if (this.data.noticeIndex == this.data.noticeBar.length * 70) {
                        this.setData({
                            noticeIndex: 0
                        })
                    }
                }, 6000);

            }
        }
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
    collspanCabinet() {
        this.setData({
            showCabinet: !this.data.showCabinet
        })
    },
    setInitTouchHight(val) {
        touchItem.setBlockHeight(val)
        this.setData({
            blockHeight: touchItem.getStaticHeight()
        })
    },
    touchstartFn(e) {
        console.log(e)
        console.log('触发了start')
        let clientY = e.touches[0].clientY
        touchItem.initTouchY(clientY)
        this.setData({
            touchend: false
        })
        return
    },
    bindtapmove() {
        console.log("触发tap")
    },

    // move触摸计算
    touchmoveFn(e) {
        let clientY = e.touches[0].clientY
        let blockHeight = touchItem.updateHeight(clientY)
        this.setData({
            blockHeight: blockHeight
        })
        return
    },
    touchendFn() {
        console.log("触发了end")
        touchItem.touchEnd()
        this.setData({
            touchend: true,
            blockHeight: touchItem.newHeight,
        })
        return
    },
    // 前往个人中心
    gotomy() {
        wx.navigateTo({
            url: '/pages/my/my',
        })
    },
    // TODO：
  // 立即租取电
  gotoRentel() {
    if (!this.data.realName) {
      wx.navigateTo({
        url: '/pages/myCertificationTake/myCertificationTake',
      })

    } else {
      if (this.data.depost == 0) {
        wx.navigateTo({
          url: '/pages/myPayDepositOther/myPayDepositOther',
        })
      } else if (this.data.depost == 1) {
        wx.navigateTo({
          url: '/pages/cameraScanTake/cameraScanTake',
        })
      } else if (this.data.depost == 2) {
        wx.showToast({
          title: '押金退还中',
          icon: 'none'
        })
      }
    }

  },
  
        // 前往开通服务页面
        gotoopenservice() {
          wx.navigateTo({
              url: '/pages/exchangeserver/exchangeserver'
          })
      },
    // 服务-我要充电
    gotoCharge() {
        this.setData({
            showFirstPage: false,
            cardItemType: "charge"
        })
        this.switchPopMessage()
        wx.setStorageSync("showFirstPage", true)
        this.setAppInfo()
        this.getLocations()

    },
    gotoExchange() {
        this.setData({
            showFirstPage: false,
            cardItemType: "exchange"
        })
        this.switchPopMessage()
        wx.setStorageSync("showFirstPage", true)
        this.setAppInfo()
        this.getLocations()
    },
    closeMod() {
        this.setData({
            isMod: false
        })
    },
    closeTap() {
        this.setData({
            isMod: false
        })
    },
    // 搜索地图
    async searchFun() {
        let that = this
        await this.checkLocationAgent()
        wx.chooseLocation({
            success: function (res) {
                that.data.mapCtx.moveToLocation({
                    longitude: res.longitude,
                    latitude: res.latitude
                })
                let point = {
                    longitude: res.longitude,
                    latitude: res.latitude,
                };
                that.getCityInfo(point);
            },
            fail: function (err) {
                console.log('err', err)
            }
        });

    },
    // 客服
    gotoKF() {
        wx.navigateTo({
            url: '/pages/myService/myService',
        })
    },
    // 我的电粒
    goMyEle() {
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: "/pages/myElectricbeans/myElectricbeans",
            });
        }
    },
    // 我的电池
    goMyBattle() {
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: '/pages/myBattery/myBattery'
            })
        }
    },
    // 查看订单详情
    gotoorderdetail() {
        let order = this.data.chargingRecordDetail.orderNo
        wx.navigateTo({
            url: "/pages/chargeOrderDetail/chargeOrderDetail?charingOrderNo=" +
                order + "&type=" + 1
        });

    },
    // 钱包余额
    goMyyue() {
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: "/pages/myWallet/myWallet",
            });;
        }
    },
    // 浮窗广告
    gotoAdLinkFloat() {
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: '/pages/indexAdLink/indexAdLink',
            })
        }

    },
    // 关闭公告提示框
    closeNoticeBlock() {
        this.setData({
            showNotice: false
        })
    },
    // 关闭弹窗广告
    closeAdversi() {
        this.setData({
            isAdversi: false
        })
    },
    // 判断是否展示右上角关注指引
    showOrNotPoint() {
        let showToashbarIndex = wx.getStorageSync('showToashbarIndex')
        if (!showToashbarIndex) {
            wx.setStorageSync('showToashbarIndex', 1)
        } else {
            if (showToashbarIndex == 1) {
                this.setData({
                    showToashbar: true
                })
                setTimeout(() => {
                    this.setData({
                        showToashbar: false
                    })
                    wx.setStorageSync('showToashbarIndex', 'off')
                }, 3000);
            }
        }
    },
    // 判断是否展示操作指引页
    showOrNotCheckPoint() {
        let showPointCheck = wx.getStorageSync('showPointCheck')
        if (!showPointCheck) {
            this.setData({
                showPointCheck: true
            })
        }
    },
    //跳转广告H5外链
    gotoAdLink() {
        this.setData({
            isAdversi: false
        })
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: '/pages/indexAdLink/indexAdLink',
            })
        }
    },
    // 展示电池型号选择
    showLeftSelectFn() {
        if (this.data.showLeftSelect) {
            this.setData({
                showLeftSelect: false
            })
        } else {
            this.setData({
                showLeftSelect: true
            })
        }

    },
    // 跳转公告列表
    gotonotice() {
        if (this.checkRegistered()) {
            wx.navigateTo({
                url: '/pages/announcement/announcement',
            })
        }
    },
    // 关闭操作指引窗口
    closepopwindows() {
        this.setData({
            showPointCheck: false
        })
        wx.setStorageSync('showPointCheck', true)
        // 首页广告弹窗
        this.getAdLinkFirst()
    },
    // 第一次进来小程序获取首页广告弹窗
    getAdLinkFirst() {
        let logindata = wx.getStorageSync("logindata");
        HTTP({
            url: "app/wx/getAdverts",
            methods: 'get',
            data: {
                organizationId: logindata.organizationId
            }
        }).then(res => {
            if (res.data) {
                this.setData({
                    isAdversi: true,
                    adObject: res.data
                })
                wx.setStorageSync('adid', res.data.id)
                wx.setStorageSync('adObject', res.data)
            }
        })
    },
    // 非第一次进小程序获取首页广告弹窗
    getAdLink() {
        let logindata = wx.getStorageSync("logindata");
        let adid = wx.getStorageSync('adid')
        HTTP({
            url: "app/wx/getAdverts",
            methods: 'get',
            data: {
                organizationId: logindata.organizationId
            }
        }).then(res => {
            console.log("广告弹窗res",res);
            if (res.data) {
                if (adid) {
                    if (adid != res.data.id) {
                        this.setData({
                            isAdversi: true,
                            adObject: res.data
                        })
                        wx.setStorageSync('adid', res.data.id)
                        wx.setStorageSync('adObject', res.data)
                    }
                }
                this.setData({
                    homeFloatPicture: res.data.homeFloatPicture
                })
                wx.setStorageSync('adObject', res.data)
            } else {
                this.setData({
                    isAdversi: false,
                })
            }
        })
    },
    // 图片预览
    showBottomImg() {
        wx.previewImage({
            current: this.data.bottomItemImg[0], // 当前显示图片的http链接
            urls: this.data.bottomItemImg // 需要预览的图片http链接列表
        })
    },
    // 选择充换电服务
    selectCardType(e) {
        if (this.throttle()) {
            console.log("会触发充换电选择服务")
            let that = this
            let item = e.currentTarget.dataset.item
            if (item.type == this.data.cardItemType) {
                return
            }
            this.setData({
                mapmoveing: true
            })
            setTimeout(() => {
                this.setData({
                    mapmoveing: false
                })
            }, 500);

            wx.setStorageSync('typeselected', item.type)
            if (item.type == 'rental') {
                wx.navigateTo({
                    url: '/pages/rentalPage/rentalPage',
                })
            } else {
                this.setData({
                    cardItemType: item.type
                })
                this.switchPopMessage()//切换pop
                this.getIsNowCharging2();//正在进行的订单
                if (item.type == 'charge') {
                    this.setData({
                        selectBatteryIdArr: [],
                        showLeftSelect: false
                    })
                    if (this.data.chargingRecordDetail) {
                        this.setInitTouchHight(480)
                        touchItem.setMaxHeight(760)
                        touchItem.setMinHeight(480)
                    }
                } else if (item.type == "exchange") {
                    let temp = []
                    if (this.data.batteryTypeId) {
                        temp.push(this.data.batteryTypeId)
                    }
                    if (this.data.chargingRecordDetail) {
                        this.setInitTouchHight(480)
                        touchItem.setMaxHeight(630)
                        touchItem.setMinHeight(480)
                    }
                    this.setData({
                        selectBatteryIdArr: temp
                    })
                }
                this.data.mapCtx.getCenterLocation({
                    success: function (res) {
                        let point = {
                            latitude: res.latitude,
                            longitude: res.longitude
                        }
                        that.getCityInfo(point)
                    },
                    fail: function () {
                        console.log("定位失败")
                    }
                })
            }
        }
    },
    // 第三方location
    gotodaohang() {
        let nearbyCabinet = this.data.nearbyCabinet
        wx.openLocation({
            latitude: nearbyCabinet.latitude,
            longitude: nearbyCabinet.longitude,
            scale: 16,
            name: nearbyCabinet.cabinetName,
            address: nearbyCabinet.cabinetAddress
        })

    },
    // #########################充电倒计时##################################
    // 正在进行中的订单
    getIsNowCharging() {
        HTTP({
            url: 'app/ctl/checkBeforeCharge',
            methods: 'get',
            data: {
                queryOnChagingOrder: true
            }
        }).then(res => {
            let orderNum = res.data.onCharginOrderNo;
            if (orderNum) {
                this.getOrderDetail(orderNum);
                this.setData({
                    cardItemType: 'charge'
                })
                this.switchPopMessage()
            } else {
                this.setData({
                    chargingRecordDetail: "",
                });

            }
        })
    },
    // 正在进行中的订单2
    getIsNowCharging2() {
        HTTP({
            url: 'app/ctl/checkBeforeCharge',
            methods: 'get',
            data: {
                queryOnChagingOrder: true
            }
        }).then(res => {
            let orderNum = res.data.onCharginOrderNo;
            if (orderNum) {
                this.getOrderDetail(orderNum);
            } else {
                this.setData({
                    chargingRecordDetail: "",
                });

            }
        })
    },
    // ----------------------获取电池类型----------------------
    getBatteryTypeByAgentId() {
        HTTP({
            url: 'battery/getBatteryTypeList',
            methods: 'get',
            data: {
                organizationId: wx.getStorageSync('logindata').organizationId
            },
        }).then(res => {
            let listData = res.data;
            this.setData({
                batteryTypeList: listData ? listData : []
            })
        },
            err => {

            }
        );
    },
    selectBatter(e) {
        let that = this
        if (this.throttle()) {
            let thebattery = e.currentTarget.dataset.item
            let tempArr = this.data.selectBatteryIdArr
            if (tempArr.includes(thebattery.batteryTypeId)) {
                let arr = tempArr.filter((item) => {
                    if (item != thebattery.batteryTypeId) {
                        return true
                    }
                })
                this.setData({
                    selectBatteryIdArr: arr
                })
            } else {
                tempArr.push(thebattery.batteryTypeId)
                this.setData({
                    selectBatteryIdArr: tempArr
                })
            }
            this.data.mapCtx.getCenterLocation({
                success: function (res) {
                    let point = {
                        latitude: res.latitude,
                        longitude: res.longitude
                    }
                    that.getCityInfo(point)
                },
                fail: function () {
                    console.log("定位失败")
                }
            })
        }
    },

    getOrderDetail(orderNum) {
        HTTP({
            url: 'app/ctl/chargingAndExchangeRecordDetail',
            methods: 'get',
            data: {
                orderNo: orderNum,
                type: 1,
            }
        }).then(res => {
            // 1充电中，0待连接
            if (res.data.chargingRecordDetail.chargingStatus == 1) {
                this.setData({
                    chargingRecordDetail: res.data.chargingRecordDetail,
                });
                if (this.data.chargingRecordDetail.chargingStartTime) {
                    this.setData({
                        chargingStartTime: res.data.chargingRecordDetail.chargingStartTime,
                    });
                    if (this.data.timer) {
                        clearInterval(this.data.timer);
                    }
                    this.changeTimeToTime(this.data.chargingStartTime);
                }
            }
            if (this.data.chargingRecordDetail && this.data.cardItemType == 'charge') {
                this.setInitTouchHight(500)
                touchItem.setMaxHeight(760)
                touchItem.setMinHeight(500)
            }
        })
    },

    // -------------------------pop信息------------------------------------
    switchPopMessage() {
        HTTP({
            url: "app/wx/appIndex",
            methods: 'get',
            data: {
                type: this.data.cardItemType == 'exchange' ? 0 : this.data.cardItemType == 'charge' ? 1 : 2
            }
        }).then(res => {
            this.setData({
                popUpsCode: res.data.popUpsCode,
                realName: res.data.realName
            })
            this.handlePopMessage(res)
        }, err => {
            console.log('app/wx/appIndex', err)
        })
    },
    // 处理pop信息
    handlePopMessage(res) {
        let code = res.data.popUpsCode
        switch (code) {
            case 1:
                this.setData({
                    popUpsContent: '你还未开通换电服务'
                })
                break;
            case 3:
                this.setData({
                    popUpsContent: '请前往已预约的服务网点开通换电服务'
                })
                break;
            case 4:
                this.setData({
                    popUpsContent: '你已领取电池，激活电池后即可使用换电服务'
                })
                break;
            case 5:
                this.setData({
                    popUpsContent: '暂未购买套餐，点击购买'
                })
                break;
            case 6:
                this.setData({
                    popUpsContent: '因操作异常，电池已被吞并'
                })
                break;
            case 7:
                this.setData({
                    popUpsContent: '电池电量低，请尽快更换电池'
                })
                break;
            case 8:
                this.setData({
                    oningChargOd: res.data.order,
                    tempFlag: 8
                })
                break
            case 9:
                this.setData({
                    popUpsContent: '你已提交换电订单，请尽快完成换电操作',
                    oningExchangeOd: res.data.order
                })
                break;
            case 11:
                this.setData({
                    popUpsContent: '你已缴纳充电费用，请尽快连接充电器',
                    oningChargOd: res.data.order,
                    tempFlag: 11
                })
                break
            case 12:
                this.setData({
                    popUpsContent: '绿色回收金已退还,预计1~7个工作日到账'
                })
                break;
            case 13:
                this.setData({
                    popUpsContent: '你已申请退电，请前往指定的服务网点退还电池'
                })
                break;
            case 14:
                this.setData({
                    popUpsContent: '请实名认证后再进行换电操作'
                })
                break;
            default:
                this.setData({
                    popUpsContent: '',
                })
                break;
        }

    },
    // pop信息跳转
    gotoopen() {
        let popUpsCode = this.data.popUpsCode
        switch (popUpsCode) {
            case 1:
                // 未开通服务
                wx.navigateTo({
                    url: '/pages/exchangeserver/exchangeserver'
                })
                break;
            case 3:
                // 门店未绑定电池
                wx.navigateTo({
                    url: '/pages/appointmentInfo/appointmentInfo'
                })
                break;
            case 4:
                // 未缴纳押金
                if (this.data.realName) {
                    wx.navigateTo({
                        url: '/pages/myPayDeposit/myPayDeposit'
                    })
                } else {
                    wx.navigateTo({
                        url: '/pages/myCertification/myCertification'
                    })
                }
                break;
            case 5:
                // 未购买套餐
                wx.setStorageSync("comboType", 2)
                wx.navigateTo({
                    url: '/pages/myCombo/myCombo'
                })
                break;
            case 6:
                // 电池被吞
                wx.navigateTo({
                    url: '/pages/myBattery/myBattery'
                })

                break;
            case 9:
                // 存在进行中的换电订单
                wx.navigateTo({
                    url: '/pages/exchangeServing/exchangeServing?exchangeOrderNo=' + this.data.oningExchangeOd
                })

                break;
            case 11:
                // 存在待连接充电订单
                if (this.data.blueChargeFlag) {
                    wx.navigateTo({
                        url: '/pages/chargeServingBlue/chargeServingBlue?charingOrderNo=' + this.data.oningChargOd
                    })
                } else {
                    wx.navigateTo({
                        url: '/pages/chargeServing/chargeServing?charingOrderNo=' + this.data.oningChargOd
                    })
                }
                break;
            case 12:
                // 押金正在退回
                wx.navigateTo({
                    url: '/pages/myBattery/myBattery'
                })
                break;
            case 13:
                // 押金正在退回
                wx.navigateTo({
                    url: '/pages/myReturnbat/myReturnbat'
                })
                break;
            case 14:
                // 进行实名认证
                wx.navigateTo({
                    url: '/pages/myCertification/myCertification'
                })
                break;

            default:
                break;
        }

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
    // 检查是否开启了定位授权
    checkLocationAgent() {
        let that = this
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.userLocation']) {
                        let option = {
                            status: true,
                            title: '请授权地理位置',
                            content: "需获取您的地理位置以提供更好的充换电服务，请确认授权",
                            foot: [{
                                text: '取消',
                                cb: () => { }
                            }, {
                                text: '去授权',
                                cb: () => {
                                    that.regetLocation()

                                }
                            }]
                        }
                        app.globalData.emitter.emit("dialogstatus", option)
                        reject(true)
                    } else {
                        resolve(true)
                    }
                }
            })
        })
        // ------------------扫码----------------------------
    },
    async scanBtn(e) {
        let that = this
        console.log("*****************开始调试************************")
        console.log('this.data.cardItemType', this.data.cardItemType)
        console.log('进入扫码充电1', e)
        if (this.checkRegistered()) {
            console.log('进入扫码充电2')
            await this.checkLocationAgent()
            console.log('进入扫码充电3')
            if (this.data.popUpsCode == 1 || this.data.popUpsCode == 2) {
                console.log('进入扫码充电4')
                this.setData({
                    isMod: true
                })
                return
            }
            if (this.data.cardItemType == 'exchange') {
                console.log('进入扫码充电5')

                this.scanExchangeBtn()
            } else if (this.data.cardItemType == 'charge') {
                console.log('进入扫码充电6')
                this.scanChargeBtn()
            }
        }
    },
    scanChargeBtn() {
        let that = this
        console.log('进入扫码充电7')
        console.log('this.data.popUpsCode', this.data.popUpsCode)
        if (this.data.popUpsCode == 11) {
            // 有带连接订单
            let option = {
                status: true,
                content: "你已缴纳充电费用，请尽快连接充电器",
                foot: [{
                    text: '查看订单',
                    cb: () => {
                        wx.navigateTo({
                            url: '/pages/chargeServing/chargeServing?charingOrderNo=' + this.data.oningChargOd
                        })
                    }
                }, {
                    text: '知道了',
                    cb: () => { }
                }]

            }
            app.globalData.emitter.emit("dialogstatus", option)
        } else {
            console.log('进入扫码充电8')
            HTTP({
                url: 'app/ctl/checkBeforeCharge',
                methods: 'get',
                data: {
                    queryOnChagingOrder: true
                }
            }).then(res => {
                console.log('进入扫码充电9')
                console.log('res.data.onCharginOrderNo', res.data.onCharginOrderNo)
                console.log('this.data.sceneUid', this.data.sceneUid)
                if (res.data.onCharginOrderNo) {
                    let option = {
                        status: true,
                        content: "你有正在进行中的充电订单，暂不可使用充电服务",
                        foot: [{
                            text: '知道了',
                            cb: () => { }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                    return
                } if (this.data.sceneUid) {
                    let selectCabinet = {
                        cabinetid: this.data.sceneUid,
                        cabinettype: 1,
                    };
                    wx.setStorageSync("selectCabinet", selectCabinet);
                    that.getCabinetInfo()
                } else {
                    wx.navigateTo({
                        url: '/pages/cameraScan/cameraScan?type=charge',
                    })
                }
            }, err => {
                // 钱包已欠费
                if (err.code == 9003) {
                    let option = {
                        status: true,
                        closeicon: true,
                        content: `你已欠费（${this.data.walletMoney}元），请充值后使用`,
                        foot: [{
                            text: '立即充值',
                            cb: () => {
                                wx.navigateTo({
                                    url: '/pages/myGoldDeposits/myGoldDeposits'
                                })
                            }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                }
                if (err.code == 2007) {
                    let option = {
                        status: true,
                        content: "你有正在进行中的换电订单，暂不可使用充电服务",
                        foot: [{
                            text: '知道了',
                            cb: () => { }
                        }, {
                            text: '查看订单',
                            cb: () => {
                                wx.navigateTo({
                                    url: '/pages/exchangeServing/exchangeServing?exchangeOrderNo=' + err.data
                                })
                            }
                        }]

                    }
                    app.globalData.emitter.emit("dialogstatus", option)

                }
            })
        }


    },
    scanExchangeBtn() {
        let that = this
        let organizationId = wx.getStorageSync("selectorganId");
        HTTP({
            url: 'app/ctl/checkBeforeExchange',
            methods: 'get',
            data: {
                areaOrganizationId: organizationId
            }
        }).then(res => {
            if (this.data.sceneUid) {
                let selectCabinet = {
                    cabinetid: this.data.sceneUid,
                    cabinettype: 0,
                };
                wx.setStorageSync("selectCabinet", selectCabinet);
                that.getCabinetInfo()
            } else {
                wx.navigateTo({
                    url: '/pages/cameraScan/cameraScan?type=exchange',
                })
            }

        }, err => {
            // 用户无可用套餐且不支持单次余额换电
            if (err.code == 2010 || err.code == 2011) {
                let option = {
                    status: true,
                    closeicon: true,
                    content: `你暂无可用换电套餐，请购买后再进行换电`,
                    foot: [{
                        text: '去购买套餐',
                        cb: () => {
                            // 未购买套餐
                            wx.setStorageSync("comboType", 2)
                            wx.navigateTo({
                                url: '/pages/myCombo/myCombo'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            // 钱包已欠费
            if (err.code == 9003) {
                let option = {
                    status: true,
                    closeicon: true,
                    content: `你已欠费（${this.data.walletMoney}元），请充值后使用`,
                    foot: [{
                        text: '立即充值',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myGoldDeposits/myGoldDeposits'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            // 钱包已欠费
            if (err.code == 9007) {
                let option = {
                    status: true,
                    closeicon: true,
                    content: `账户已欠费，请充值后再使用`,
                    foot: [{
                        text: '立即充值',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myGoldDeposits/myGoldDeposits'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 1009) {
                let option = {
                    status: true,
                    content: "请实名认证后再进行换电操作",
                    foot: [{
                        text: '稍后再说',
                        cb: () => { }
                    }, {
                        text: '实名认证',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myCertification/myCertification'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 40002) {
                let option = {
                    status: true,
                    content: "开通换电服务，立享10秒换电",
                    foot: [{
                        text: '再想想',
                        cb: () => { }
                    }, {
                        text: '了解一下',
                        cb: () => {
                            wx.navigateTo({
                                url: "/pages/exchangeserver/exchangeserver"
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 20007) {
                let option = {
                    status: true,
                    content: "您有绿色回收金正在退回,无法进行换电操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => { }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 2008) {
                let option = {
                    status: true,
                    content: "各城市的电池/套餐不通用，你需要开通此城市的换电服务才可在此机柜操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => { }
                    }, {
                        text: '联系客服',
                        cb: () => {
                            wx.makePhoneCall({
                                phoneNumber: wx.getStorageSync("kfMobile")
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 2009) {
                let option = {
                    status: true,
                    content: "开通换电服务，立享10秒换电",
                    foot: [{
                        text: '再想想',
                        cb: () => { }
                    }, {
                        text: '了解一下',
                        cb: () => {
                            wx.navigateTo({
                                url: "/pages/exchangeserver/exchangeserver"
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 20003) {
                let option = {
                    status: true,
                    content: "你已领取电池，激活电池后即可使用换电服务",
                    foot: [{
                        text: '稍后再说',
                        cb: () => { }
                    }, {
                        text: '去激活电池',
                        cb: () => {
                            if (that.data.realName) {
                                wx.navigateTo({
                                    url: '/pages/myPayDeposit/myPayDeposit'
                                })
                            } else {
                                wx.navigateTo({
                                    url: '/pages/myCertification/myCertification'
                                })
                            }
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 2007) {
                let option = {
                    status: true,
                    content: "你已提交换电订单，请尽快完成换电操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => { }
                    }, {
                        text: '查看订单',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/exchangeServing/exchangeServing?exchangeOrderNo=' + err.data
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 2006) {
                let option = {
                    status: true,
                    content: "你有正在进行中的充电订单，暂不可使用换电服务",
                    foot: [{
                        text: '我知道了',
                        cb: () => { }
                    }, {
                        text: '查看订单',
                        cb: () => {
                            if (that.data.tempFlag == 11) {
                                // 带连接
                                wx.navigateTo({
                                    url: '/pages/chargeServing/chargeServing?charingOrderNo=' + that.data.oningChargOd
                                })
                            } else if (that.data.tempFlag == 8) {
                                // 充电中
                                wx.navigateTo({
                                    url: "/pages/chargeOrderDetail/chargeOrderDetail?charingOrderNo=" +
                                        that.data.oningChargOd + "&type=" + 1
                                })
                            }

                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 40008) {
                let option = {
                    status: true,
                    content: "你的电池已被吞并，请取出吞并电池后再进行换电服务",
                    foot: [{
                        text: '稍后再说',
                        cb: () => { }
                    }, {
                        text: '查看详情',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myBattery/myBattery'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }

        })

    },
    // --------------------结束充电------------------------
    endcharge() {
        let that = this
        let option = {
            status: true,
            content: "确定要结束充电吗？",
            foot: [{
                text: '点错了',
                cb: () => { }
            }, {
                text: '确认结束',
                cb: () => {
                    wx.showLoading({
                        title: '请稍后',
                    })
                    HTTP({
                        url: 'app/ctl/stopCharging',
                        methods: 'put',
                        data: {
                            orderNo: that.data.chargingRecordDetail.orderNo
                        }
                    }).then(res => {
                        wx.hideLoading();
                        wx.navigateTo({
                            url: `/pages/completed/completed?orderId=${that.data.chargingRecordDetail.orderNo}`,
                        });
                    }, err => {
                        if (err.code == 7009) {
                            let option = {
                                status: true,
                                content: "设备、uqKey不匹配",
                                foot: [{
                                    text: '我知道了',
                                    cb: () => {

                                    }
                                }]
                            }
                            app.globalData.emitter.emit("dialogstatus", option)
                        }
                        if (err.code == 7008) {
                            // 柜子离线，开始用蓝牙
                            let bluthName = wx.getStorageSync("bluthName");
                            //如果蓝牙断开，重连
                            if (bluthName) {
                                bluetooth.bluetoothInit(app, bluthName, 'index');
                                app.globalData.emitter.once("cabinetReportingIndex", (res) => {
                                    if (res == "ison") {
                                        HTTP({
                                            url: "app/ctl/getCecalChargingCommandV2",
                                            methods: "get",
                                            data: {
                                                orderNo: that.data.chargingRecordDetail.orderNo
                                            }
                                        }).then(blue => {
                                            if (blue.code == 200) {
                                                let data = blue.data;
                                                wx.hideLoading();
                                                bluetooth.sentCancelOrder(data, "cmdCancelCharging");
                                                app.globalData.emitter.once("cmdCancelCharging", cancel => {
                                                    HTTP({
                                                        url: 'app/ctl/blueStopCharging',
                                                        methods: 'put',
                                                        data: {
                                                            orderNo: that.data.chargingRecordDetail.orderNo
                                                        }
                                                    }).then(data => {
                                                        wx.hideLoading();
                                                        wx.showToast({
                                                            title: "成功",
                                                            icon: "success",
                                                        });

                                                        wx.navigateTo({
                                                            url: `/pages/completed/completed?orderId=${that.data.chargingRecordDetail.orderNo}`,
                                                        });
                                                    }, err => {
                                                        let isBlueConnected = wx.getStorageSync('isBlueConnected')
                                                        wx.hideLoading();
                                                    })
                                                });
                                            }
                                        }, err => {
                                            console.log('errgetCecalChargingCommand', err)
                                            wx.hideLoading();
                                        })
                                    }
                                });
                            }



                        }

                    })

                }
            }]

        }
        app.globalData.emitter.emit("dialogstatus", option)

    },


    // ··················获取机柜信息························
    getCabinetInfo() {
        let selectCabinet = wx.getStorageSync("selectCabinet")
        HTTP({
            url: "cabinet/getCabinetInfoByScan",
            methods: 'post',
            data: {
                cabinetId: selectCabinet.cabinetid,
                type: selectCabinet.cabinettype
            }
        }).then(res => {
            if (res.code == 200) {
                if (res.data.powerOff && selectCabinet.cabinettype == 1) {
                    // 断电
                    let option = {
                        status: true,
                        content: "该电柜已停电暂不提供服务，请前往其他电柜",
                        foot: [{
                            text: '我知道了',
                            cb: () => {

                            }
                        }]
                    }
                    app.globalData.emitter.emit("dialogstatus", option)
                    return
                }
                if (res.data.cabinetOnline) {
                    // 柜子在线
                    if (selectCabinet.cabinettype == 0) {
                        // 换电
                        wx.navigateTo({
                            url: '/pages/exchangeinfo/exchangeinfo'
                        })
                    } else if (selectCabinet.cabinettype == 1) {
                        // 充电
                        wx.navigateTo({
                            url: '/pages/chargeinfo/chargeinfo'
                        })
                    }

                } else {
                    // 柜子离线
                    if (this.data.blueStatus) {
                        // 蓝牙已经连接
                        if (selectCabinet.cabinettype == 0) {
                            // 换电
                            wx.navigateTo({
                                url: '/pages/exchangeinfoBlue/exchangeinfoBlue'
                            })
                        } else if (selectCabinet.cabinettype == 1) {
                            // 充电
                            wx.navigateTo({
                                url: '/pages/chargeinfoBlue/chargeinfoBlue'
                            })
                        }

                    } else {
                        wx.navigateTo({
                            url: '/pages/blueconnectloading/blueconnectloading?cabinetDeviceId=' + res.data.cabinetDeviceId
                        })
                    }

                }
            }
        }, err => {
            if (err.code == 6020) {
                let option = {
                    status: true,
                    content: "此电柜不支持充电服务，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6019) {
                let option = {
                    status: true,
                    content: "暂无可用充电口，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6004) {
                let option = {
                    status: true,
                    content: "暂无此电柜信息，请扫描其他二维码"
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6007) {
                let option = {
                    status: true,
                    content: "机柜维护中，暂不可提供服务，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近机柜',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 20003) {
                let option = {
                    status: true,
                    content: "你已领取电池，请缴纳绿色回收金激活电池",
                    foot: [{
                        text: '稍后再说',
                        cb: () => {

                        }
                    }, {
                        text: '去激活电池',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myCertification/myCertification'
                            })
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 2008) {
                let option = {
                    status: true,
                    content: "因各城市的电池/套餐不通用，你需要开通此城市的换电服务才可在此机柜操作",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '联系客服',
                        cb: () => {
                            wx.makePhoneCall({
                                phoneNumber: wx.getStorageSync("kfMobile"),
                                success: function (res) {
                                    console.log('call success')

                                },
                                fail: function (err) {
                                    console.log('call fail')

                                }
                            });
                        }
                    }]

                }
                app.globalData.emitter.emit("dialogstatus", option)

            }
            if (err.code == 6015) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "电柜服务中，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6010) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "充电口繁忙，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6017) {
                // 机柜繁忙
                let option = {
                    status: true,
                    content: "机柜升级中，请稍后再试",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 40014) {
                let option = {
                    status: true,
                    content: "你的电池型号与柜内电池不匹配，请前往其他电柜",
                    foot: [{
                        text: '我知道了',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6006) {
                // 暂无空仓
                let option = {
                    status: true,
                    content: "暂无空仓，请前往其他机柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => {

                        }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
            if (err.code == 6008) {
                // 暂无满电仓
                let option = {
                    status: true,
                    content: "暂无可用电池，请前往其他机柜或者稍后再来",
                    foot: [{
                        text: '稍后再试',
                        cb: () => { }
                    }, {
                        text: '查看附近电柜',
                        cb: () => {
                            wx.navigateTo({
                                url: '/pages/myMap/myMap?type=1'
                            })
                        }
                    }]
                }
                app.globalData.emitter.emit("dialogstatus", option)
            }
        })
    },
    // 广告跳转
    gotoadvertisement() {
        wx.navigateTo({
            url: '/pages/exchangeserver/exchangeserver'
        })
    },
    // ------------------显示推荐电柜------------------------
    async showCabinetDetail() {
        let that = this
        await this.checkLocationAgent()
        this.data.mapCtx.getCenterLocation({
            success: function (e) {
                let latitude = e.latitude
                let longitude = e.longitude
                that.getNearbyCabinet({
                    latitude: latitude,
                    longitude: longitude
                })
            },
            fail: function () {
                console.log("定位失败")
            }
        })


    },
    // 获取用户十公里最近的机柜信息
    getNearbyCabinet(point) {
        let logindata = wx.getStorageSync("logindata");
        let param = {
            latitude: point.latitude,
            longitude: point.longitude,
            organizationId: logindata.organizationId,
            supportCharger: this.data.cardItemType == "charge",
        }
        if (this.data.selectBatteryIdArr && this.data.selectBatteryIdArr.length > 0) {
            param.batteryTypes = this.data.selectBatteryIdArr
        }
        HTTP({
            url: '/cabinet/getNearbyCabinetV3',
            methods: 'post',
            loading: true,
            data: param
        }).then(res => {
            if (res.data) {
                this.setData({
                    cardType: "module_cabinet"
                })
                if (this.data.cardItemType == 'charge') {
                    let line = res.data.line
                    let lineoffset = 0
                    if (line == 0) {
                        lineoffset += 40
                    }
                    this.setInitTouchHight(480 + lineoffset)
                    touchItem.setMaxHeight(750 + lineoffset)
                    touchItem.setMinHeight(480 + lineoffset)
                } else if (this.data.cardItemType == 'exchange') {
                    let offset = 68 * (res.data.batteryTypeAndNumDtoList ? res.data.batteryTypeAndNumDtoList.length : 0)
                    let strset = 0
                    let addresslen = res.data.cabinetAddress ? res.data.cabinetAddress.length : 0
                    let line = res.data.line
                    let lineoffset = 0
                    if (res.data.boxStatusInfo && res.data.boxStatusInfo.length > 4) {
                        // 8舱柜
                        strset += 85
                        offset += 85
                    }
                    if (addresslen >= 20) {
                        // 地址文字换行
                        strset += 50
                        offset += strset
                    }
                    if (line == 0) {
                        lineoffset += 40
                    }
                    this.setInitTouchHight(420 + strset + lineoffset)
                    touchItem.setMaxHeight(760 + offset + lineoffset)
                    touchItem.setMinHeight(420 + strset + lineoffset)
                }
                let temparr = res.data ? res.data.batteryTypeAndNumDtoList : []
                this.handlePortBoxInfo(res.data)
                this.setData({
                    nearbyCabinet: res.data,
                    batteryTypeAndNumDtoList: res.data ? temparr : []
                })
                // 画轨迹
                this.handleDirection(point, {
                    type: 'direction',
                    latitude: res.data.latitude,
                    longitude: res.data.longitude,
                    nearbyPicurl: res.data.nearbyPicurl,
                    canUseChargingPortNum: res.data.canUseChargingPortNum,
                    canUseExchangeBatteryNum: res.data.canUseExchangeBatteryNum
                })
                if (res.data && res.data.nearbyPicurl) {
                    this.setData({
                        bottomItemImg: res.data.nearbyPicurl.split(',')
                    })
                }
            } else {
                wx.showToast({
                    title: '附近暂无可用电柜',
                    icon: 'none'
                })
            }

        }, err => {
        })
    },
    // 休眠函数
    sleep(time) {
        let now = new Date().getTime()
        return new Promise((resolve, reject) => {
            while (true) {
                if (new Date().getTime() - now > time) {
                    break
                }
            }
            resolve(true)
        })
    },
    throttle() {
        let nowDate = new Date().getTime();
        if (nowDate - this.data.lastDate > 500) {
            this.setData({
                lastDate: nowDate,
            });
            return true;
        } else {
            this.setData({
                lastDate: nowDate,
            });
            return false;
        }
    },
    //地图轨迹连接
    handleDirection(point1, point2) {
        var _this = this;
        qqmapsdk.direction({
            mode: 'bicycling',
            from: {
                latitude: point1.latitude,
                longitude: point1.longitude
            },
            to: {
                latitude: point2.latitude,
                longitude: point2.longitude
            },
            success: function (res) {
                var ret = res;
                var coors = ret.result.routes[0].polyline, pl = [];
                var kr = 1000000;
                for (var i = 2; i < coors.length; i++) {
                    coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
                }
                for (var i = 0; i < coors.length; i += 2) {
                    pl.push({ latitude: coors[i], longitude: coors[i + 1] })
                }
                _this.setData({
                    latitude: pl[0].latitude,
                    longitude: pl[0].longitude,
                    mapDuration: res.result.routes[0].duration,
                    mapDistance: res.result.routes[0].distance,
                    polyline: [{
                        points: pl,
                        color: "#666666",
                        width: 4,
                        arrowLine: true,
                    }]
                })
                _this.resetMarksAfterDirection(point1, point2)
            },
            fail: function (error) {
                _this.resetMarksAfterDirection(point1, point2)
                console.error(error);
            },
            complete: function (res) {
                console.log(res);
            }
        });
    },
    // 画完轨迹之后清理marker
    resetMarksAfterDirection(point1, point2) {
        let markers = []
        let that = this
        this.setData({
            markers: [],
        })
        if (point2.type == "direction") {
            if (this.data.cardItemType == "charge") {
                switch (point2.canUseChargingPortNum) {
                    case 0:
                        markers[0] = {
                            id: 0,
                            iconPath: '../../images/map/' + 'v3_index_map00.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }
                        break;
                    case 1:
                        markers[0] = {
                            id: 1,
                            iconPath: '../../images/map/' + 'v3_index_map9.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 2:
                        markers[0] = {
                            id: 2,
                            iconPath: '../../images/map/' + 'v3_index_map10.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 3:
                        markers[0] = {
                            id: 3,
                            iconPath: '../../images/map/' + 'v3_index_map11.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 4:
                        markers[0] = {
                            id: 4,
                            iconPath: '../../images/map/' + 'v3_index_map12.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    default:
                        break;
                }

            } else if (this.data.cardItemType == "exchange") {
                switch (point2.canUseExchangeBatteryNum) {
                    case 0:
                        markers[0] = {
                            id: 5,
                            iconPath: '../../images/map/' + 'v3_index_map0.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }
                        break;
                    case 1:
                        markers[0] = {
                            id: 6,
                            iconPath: '../../images/map/' + 'v3_index_map5.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }

                        }

                        break;
                    case 2:
                        markers[0] = {
                            id: 7,
                            iconPath: '../../images/map/' + 'v3_index_map6.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 3:
                        markers[0] = {
                            id: 8,
                            iconPath: '../../images/map/' + 'v3_index_map7.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 4:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_map8.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 5:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-5.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 6:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-6.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 7:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-7.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 8:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-8.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 9:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-9.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 10:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-10.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 11:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-11.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    case 12:
                        markers[0] = {
                            id: 9,
                            iconPath: '../../images/map/' + 'v3_index_mape-12.png',
                            latitude: point2.latitude,
                            longitude: point2.longitude,
                            width: 42,
                            height: 40,
                            item: point2,
                            label: {
                                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                                color: "#fff",
                                bgColor: "#000",
                                anchorX: app.globalData.sysinfo.platform == 'ios' ? 0 : -50,
                                anchorY: -69,
                                borderRadius: 12,
                                padding: 5,
                                textAlign: 'center',
                                fontSize: 12
                            }
                        }

                        break;
                    default:
                        break;
                }

            }

        } else if (point2.type == 'reverse') {

            markers = []
            point2.label = {
                content: this.data.mapDistance ? this.changeMtoKm(this.data.mapDistance) + ' 骑行' + this.data.mapDuration + '分钟' : '已选择',
                color: "#fff",
                bgColor: "#000",
                anchorY: -69,
                borderRadius: 12,
                padding: 5,
                textAlign: 'center',
                fontSize: 12
            }
            if (app.globalData.sysinfo.platform == 'ios') {
                point2.label.anchorX = 0
            } else {
                point2.label.anchorX = -50
            }
            markers[0] = point2
        }
        markers[1] = {
            id: 100,
            iconPath: '../../images/map/' + 'mapcenter.png',
            latitude: point1.latitude,
            longitude: point1.longitude,
            width: 20,
            height: 29
        }
        this.setData({
            markers: markers,
        })
    },
    changeMtoKm(str) {
        let temp = 0
        if (str) {
            let num = Number(str)
            if (num > 1000) {
                temp = (num / 1000).toFixed(2) + 'km'
            } else {
                temp = num + 'm'
            }
        }
        return temp
    },
    // 处理充电口和仓门信息
    handlePortBoxInfo(nearbyCabinet) {
        let portStatusMap = nearbyCabinet.portStatusMap
        let boxStatusMap = nearbyCabinet.boxStatusMap
        let portStatusInfo = []
        let boxStatusInfo = []
        Object.keys(portStatusMap).map(key1 => {
            portStatusInfo.push({
                id: key1,
                status: portStatusMap[key1]
            })
        })
        Object.keys(boxStatusMap).map(key2 => {
            boxStatusInfo.push({
                id: key2,
                status: boxStatusMap[key2]
            })
        })
        this.setData({
            portStatusInfo: portStatusInfo,
            boxStatusInfo: boxStatusInfo
        })
    },
    // 点击markert画轨迹
    async markertap(e) {
        if (this.data.cardType == 'module_cabinet') {

            return
        }
        let that = this
        var id = e.markerId
        let item = ''
        this.data.markers.map(key => {
            if (id === key.id) {
                item = key
            }
        })
        let point2 = {
            type: "reverse",
            latitude: item.latitude,
            longitude: item.longitude,
            iconPath: item.iconPath,
            width: item.width,
            height: item.height,
            id: item.id,
            item: item.item
        }
        let nearbyPicurl = item.item.nearbyPicurl
        if (nearbyPicurl) {
            this.setData({
                bottomItemImg: nearbyPicurl.split(',')
            })
        }
        await this.getBoxInfoByCabinetId(item);
        if (this.data.cardItemType == 'charge') {
            let line = item.item.line
            let poweroff = item.item.powerOff
            let lineoffset = 0
            let poweroffset = 0
            if (line == 0 && !poweroff) {
                lineoffset += 40
            }
            if (poweroff) {
                poweroffset += 40
            }
            this.setInitTouchHight(480 + lineoffset + poweroffset)
            touchItem.setMaxHeight(750 + lineoffset + poweroffset)
            touchItem.setMinHeight(480 + lineoffset + poweroffset)
        } else if (this.data.cardItemType == 'exchange') {
            let offset = 68 * (this.data.batteryTypeAndNumDtoList ? this.data.batteryTypeAndNumDtoList.length : 0)
            let strset = 0
            let addresslen = item.item.cabinetAddress ? item.item.cabinetAddress.length : 0
            let line = item.item.line
            let lineoffset = 0
            let poweroff = item.item.powerOff
            let poweroffset = 0
            let boxStatusInfo = this.data.boxStatusInfo ? this.data.boxStatusInfo.length : 0
            if (boxStatusInfo > 4) {
                // 8舱柜
                strset += 85
                offset += 85
            }
            if (addresslen >= 20) {
                // 地址文字换行
                strset += 50
                offset += strset
            }
            if (line == 0) {
                lineoffset += 40
            }
            if (poweroff) {
                poweroffset += 40
            }
            this.setInitTouchHight(420 + strset + lineoffset + poweroffset)
            touchItem.setMaxHeight(760 + offset + lineoffset + poweroffset)
            touchItem.setMinHeight(420 + strset + lineoffset + poweroffset)
        }

        this.setData({
            cardType: "module_cabinet"
        })
        that.data.mapCtx.getCenterLocation({
            type: 'gcj02',
            success: function (res) {
                let latitude = res.latitude;
                let longitude = res.longitude;
                let point1 = {
                    longitude: parseFloat(longitude),
                    latitude: parseFloat(latitude),
                };
                that.handleDirection(point1, point2)
            }
        })
    },
    // 根据机柜ID查详情
    getBoxInfoByCabinetId(item) {
        let that = this;
        let nowCabinet = item.item
        let params = {
            cabinetOrganizationId: nowCabinet.organizationId,
            cabinetQrCodeDid: nowCabinet.qrCodeDid,
            cabinetUid: nowCabinet.cabinetUid
        };
        if (this.data.selectBatteryIdArr && this.data.selectBatteryIdArr.length > 0) {
            params.searchBatteryTypeId = this.data.selectBatteryIdArr.join(",")
        }
        return new Promise((resolve, reject) => {
            HTTP({
                url: 'cabinet/getBoxInfoByCabinetId',
                methods: 'get',
                data: params,
            }).then(res => {
                this.setData({
                    nearbyCabinet: res.data,
                    batteryTypeAndNumDtoList: res.data.batteryTypeAndNumDtoList
                })
                this.handlePortBoxInfo(res.data)
                resolve(true)
            }, err => { reject(false) });
        })



    },
    // --------------------------utils工具函数-----------------------------
    // 两个经纬度之间的直线距离（km）
    getDistance(lat1, lng1, lat2, lng2) {
        var radLat1 = lat1 * Math.PI / 180.0;
        var radLat2 = lat2 * Math.PI / 180.0;
        var a = radLat1 - radLat2;
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;// EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    },
    resetHeight() {
        if (this.data.chargingRecordDetail && this.data.cardItemType == 'charge') {
            this.setInitTouchHight(480)
            touchItem.setMaxHeight(760)
            touchItem.setMinHeight(480)
        } else {
            this.setInitTouchHight(480)
            touchItem.setMaxHeight(630)
            touchItem.setMinHeight(480)
        }

    },
    getRandom() {
        let pre = parseInt(Math.random() * 10000)
        return pre
    },
    // 充电计时器
    changeTimeToTime(time) {
        let difftime = new Date().getTime() - time;
        let tempTime = 0;
        let timer = setInterval(() => {
            tempTime += 1000;
            this.formatDuring(difftime + tempTime);
        }, 1000);
        this.setData({
            timer: timer,
        });
    },
    formatDuring(mss) {
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((mss % (1000 * 60)) / 1000);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        let chargingAllTime = hours + ":" + minutes + ":" + seconds;
        this.setData({
            chargingAllTime: chargingAllTime,
        });
    },
    //-------------------地图部分----------------------------
    // 地图移动
    regionchange(e) {
        console.log('会触发一次地图移动', e)
        let that = this
        if (e.causedBy == "gesture" && e.type == "begin") {
            this.setData({
                mapmoveing: true
            })

        } else if (e.type == "end" || e.causedBy == "scale") {
            this.setData({
                mapmoveing: false
            })
        }

        if (this.data.cardType != "module_cabinet") {
            // 置换point
            if (e.type == 'end' && (e.causedBy == 'drag' || e.causedBy == 'update')) {
                if (!(this.data.sourcelatitude && this.data.sourcelongitude)) {
                    // 获取中心初始值
                    that.data.mapCtx.getCenterLocation({
                        type: 'gcj02',
                        success: function (res) {
                            let latitude = res.latitude;
                            let longitude = res.longitude;
                            let point = {
                                longitude: parseFloat(longitude),
                                latitude: parseFloat(latitude),
                            };
                            that.setData({
                                centerPoint: point,
                                sourcelatitude: parseFloat(latitude),
                                sourcelongitude: parseFloat(longitude),
                            })
                        }
                    })
                } else {
                    // 计算距离差值
                    that.data.mapCtx.getCenterLocation({
                        type: 'gcj02',
                        success: function (res) {
                            let latitude = res.latitude;
                            let longitude = res.longitude;
                            let point = {
                                longitude: parseFloat(longitude),
                                latitude: parseFloat(latitude),
                            };
                            let sourcelatitude = that.data.sourcelatitude
                            let sourcelongitude = that.data.sourcelongitude
                            console.log('sourcelatitude', sourcelatitude)
                            console.log('sourcelongitude', sourcelongitude)
                            let distance = that.getDistance(latitude, longitude, sourcelatitude, sourcelongitude)
                            console.log('此次移动距离上次点', distance + '公里')

                            if (distance > 1.5) {
                                that.setData({
                                    centerPoint: point,
                                    sourcelatitude: parseFloat(latitude),
                                    sourcelongitude: parseFloat(longitude),
                                })
                                that.getCityInfo(point);
                            }


                        }
                    })
                }

            }
        }
    },
    // 点击地图触发
    tapMapFn(e) {
        console.log("会触发一次地图点击", e)
        if (this.data.cardType != 'module_cabinet') {
            return
        }
        if (this.throttle()) {
            if (e.type == "tap" && e.target.id == "myMap") {
                this.resetHeight()
                this.setData({
                    markers: [],
                    cardType: "module_menu",
                    polyline: [{
                        points: [],
                        color: "#666666",
                        width: 4,
                        arrowLine: true,
                    }]
                }),
                    this.setData({
                        markers: this.data.bakmarkers,
                        showLeftSelect: false
                    })
            }
        }

    },
    // 刷新地图定位点
    async refreshFun() {
        await this.checkLocationAgent()
        this.data.mapCtx.moveToLocation();
        this.setData({
            mapScale: 14,
        })


    },
    // 获取地图机柜数据
    getMapCabinet(point) {
        let logindata = wx.getStorageSync('logindata')
        if (!logindata.organizationId) {
            wx.reLaunch({
                url: '/pages/loading/loading'
            })
            return
        }
        let params = {
            type: this.data.cardItemType == "charge" ? 0 : 1,
            latitude: point.latitude,
            longitude: point.longitude,
            organizationId: logindata.organizationId,
            areaOrganizationId: point.organizationId,
        }
        if (this.data.cardItemType == 'exchange' && this.data.selectBatteryIdArr && this.data.selectBatteryIdArr.length > 0) {
            params.searchBatteryTypeId = this.data.selectBatteryIdArr.join(",")
        }
        HTTP({
            url: "cabinet/map/roundList",
            methods: 'get',
            data: params
        }).then(res => {
            this.handleMarks(res.data.cabinetList)
        })
    },
    handleMarks(cabinets) {
        let markers = []
        if (cabinets) {
            cabinets.map((item, index) => {
                if (this.data.cardItemType == "charge") {
                    // 充电
                    if (item.powerOff) {
                        // 电柜断电
                        markers.push({
                            id: index,
                            iconPath: '../../images/map/' + 'v3_index_map_noele.png',
                            latitude: item.latitude,
                            longitude: item.longitude,
                            width: 42,
                            height: 40,
                            item: item
                        })
                    } else if (!item.line) {
                        // 电柜离线
                        markers.push({
                            id: index,
                            iconPath: '../../images/map/' + 'v3_index_map13.png',
                            latitude: item.latitude,
                            longitude: item.longitude,
                            width: 42,
                            height: 40,
                            item: item
                        })
                    } else {
                        switch (item.canUseChargingPortNum) {
                            case 0:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map00.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 1:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map9.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 2:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map10.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 3:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map11.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 4:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map12.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;

                            default:
                                break;
                        }

                    }


                } else if (this.data.cardItemType = "exchange") {
                    // 换电
                    if (item.powerOff) {
                        // 电柜断电
                        markers.push({
                            id: index,
                            iconPath: '../../images/map/' + 'v3_index_map_noele.png',
                            latitude: item.latitude,
                            longitude: item.longitude,
                            width: 42,
                            height: 40,
                            item: item
                        })
                    } else if (!item.line) {
                        // 电柜离线
                        markers.push({
                            id: index,
                            iconPath: '../../images/map/' + 'v3_index_map_blue.png',
                            latitude: item.latitude,
                            longitude: item.longitude,
                            width: 42,
                            height: 40,
                            item: item
                        })
                    } else {
                        switch (item.canUseExchangeBatteryNum) {
                            case 0:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map0.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 1:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map5.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 2:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map6.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 3:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map7.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 4:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_map8.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 5:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-5.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 6:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-6.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 7:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-7.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 8:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-8.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 9:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-9.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 10:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-10.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 11:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-11.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;
                            case 12:
                                markers.push({
                                    id: index,
                                    iconPath: '../../images/map/' + 'v3_index_mape-12.png',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    width: 42,
                                    height: 40,
                                    item: item
                                })
                                break;

                            default:
                                break;
                        }

                    }

                }
            })
            this.setData({
                markers: [],
            })
            this.data.bakmarkers = markers
            this.setData({
                markers: markers,
            })
        }
    }
})