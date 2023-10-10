const utils = require("./tools");
/**
 * 蓝牙流程：
 * 1.先初始化蓝牙适配器，
 * 2.获取本机蓝牙适配器的状态，
 * 3.开始搜索，当停止搜索以后在开始搜索，就会触发蓝牙是配置状态变化的事件，
 * 4.搜索完成以后获取所有已经发现的蓝牙设备，就可以将devices中的设备Array取出来，
 * 5.然后就可以得到所有已经连接的设备了
 */
//获取应用实例

var blueToothData = {
  app: "",
  available: false, // 设备可用
  discovering: false, // 搜索状态
  serviceId: "", // 服务Id
  characteristicId: "", // 特征值
  deviceId: "", // mac 地址 （ios的mac地址是UUID，由于隐私保护的原因引起的）
  name: "", // 设备名称
  allData: {},
  waitToSend: {
    index: 1
  },
  temp_HexOrder: '',
  returnPackages: 0,
  tempArrBuf: null,
  returnStrEnd: "",
  readCharacteristicId: "", //读特征值
  writeCharacteristicId: "", //写特征值
  notifyCharacteristicId: "", //通知特征值
  cmd: "",
  recount: 0,
  page: ''
};

function bluetoothInit(app, bluthName, page) {
  var that = blueToothData;
  that.name = bluthName;
  that.app = app;
  that.page = page
  that.cmd = "";
  console.log('start')

  // 蓝牙开始扫描
  startScan();
}

// 蓝牙扫描
function startScan() {
  var that = blueToothData;
  that.tempArrBuf = new Uint8Array(1000);
  console.log("蓝牙开始扫描")
  wx.openBluetoothAdapter({
    success(res) {
      console.log("初始化蓝牙模块 --- 已开启");
      watchBluetoothStateChange();
      searchBluetooth();
    },
    fail(err) {
      console.log("初始化蓝牙模块 --- 未开启");
      watchBluetoothStateChange();
      that.discovering = false
      that.available = false
      if (that.page == 'loading') {
        that.app.globalData.emitter.emit("cabinetReporting", "isoff");
      }
    }
  });
}

/**
 * 监听蓝牙适配器状态变化事件
 */
function watchBluetoothStateChange() {
  let that = blueToothData;
  console.log('准备打开设备监听器')
  wx.onBluetoothAdapterStateChange(res => {
    console.log('打开设备监听器')
    /**
     * 搜索状态
     */
    console.log('discovering', that.discovering)
    console.log('resdiscovering', res.discovering)
    console.log('that.available', that.available)
    console.log('res.available', res.available)
    if (that.discovering != res.discovering) {
      console.log(1)
      that.discovering = res.discovering;
    }
    /**
     * 蓝牙状态
     */
    if (that.available != res.available) {
      that.available = res.available;
      console.log(2)
      if (!res.available) {
        if (that.page == 'loading') {
          console.log(3)
          that.app.globalData.emitter.emit("cabinetReporting", "isoff");

        }
      } else {
        console.log(4)
        if (!res.discovering) {
          console.log(5)
          searchBluetooth();
          if (that.page == 'loading') {
            console.log('xxx', '正在连接蓝牙')
            that.app.globalData.emitter.emit("cabinetReporting", "isconnecting");
          }
        }
      }
    }
  });
}
/**
 * 查找设备
 */
function searchBluetooth() {
  console.log('打开查找设备开关')
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    success(res) {
      console.log("开始查找设备")
      watchBluetoothFound();
      // 20s 停止搜索
      setTimeout(stopSearchBluetooth, 20000);
    }
  });
}
/**
 * 监听寻找到新设备
 */
function watchBluetoothFound() {
  let that = blueToothData;
  wx.onBluetoothDeviceFound(function (res) {
    let device = res.devices[0];
    console.log('监听寻找新设备', device)
    if ((device.name && device.name == that.name) || (device.localName && device.localName == that.name)) {
      that.deviceId = device.deviceId;
      if (that.page == 'loading') {
        that.app.globalData.emitter.emit("cabinetReporting", "isfound");
      }
      connectBluetooth();
      // 连接成功 需要断开蓝牙搜索
      stopSearchBluetooth();
    }
  });
}

/**
 * 停止查找
 */
function stopSearchBluetooth() {
  wx.stopBluetoothDevicesDiscovery({
    success: function (res) {
      printinfo("停止查找设备");
    }
  });
}
//取消蓝牙配对
function offBlueLine() {
  closeConnectBluetooth();
}
/**
 * 连接设备
 */
function connectBluetooth() {
  let that = blueToothData;
  console.log("开始连接设备")
  wx.createBLEConnection({
    deviceId: that.deviceId,
    success(res) {
      that.recount = 0;
      console.log('连接成功设备')
      if (that.page == 'loading') {
        that.app.globalData.emitter.emit("cabinetReporting", "ison"); //触发
      }
      if (that.page == 'index') {
        that.app.globalData.emitter.emit("cabinetReportingIndex", "ison"); //触发
      }
      if (that.page == 'chargeServingBluePage') {
        that.app.globalData.emitter.emit("chargeServingBluePage", "ison"); //触发
      }
      getBluetoothServers();
    },
    fail(err) {
      reConnection();
      console.log('连接失败')
      console.log(err)
    }
  });
}

// 蓝牙超时重连
function reConnection() {
  console.log("蓝牙超时重连")
  let that = blueToothData;
  if (that.recount < 3) {
    connectBluetooth();
  } else {
    closeConnectBluetooth();
    if (that.page == 'loading') {
      that.app.globalData.emitter.emit("cabinetReporting", "isbreak");
    }
  }
  that.recount++;
}

/**
 * 断开连接
 */
function closeConnectBluetooth() {
  let that = blueToothData;
  console.log("准备断开蓝牙")
  // 断开BLE的连接
  wx.closeBLEConnection({
    deviceId: that.deviceId,
    success(res) {
      console.log('断开BLE的连接')
      that.recount = 0;
    }
  });
  // 断开蓝牙的连接 （初始化所有的状态）
  wx.closeBluetoothAdapter({
    success(res) {
      console.log("初始化所有状态", res);
      that.deviceId = "";
      that.serviceId = "";
      that.characteristicId = "";
      that.name = "";
    }
  });
  that.temp_HexOrder = ""
}
/**
 * 获取设备服务
 */
function getBluetoothServers() {
  let that = blueToothData;
  console.log('获取设备服务ID', that.serviceId)
  wx.getBLEDeviceServices({
    deviceId: that.deviceId,
    success(res) {
      that.serviceId = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
      getBluetoothCharacteristics();
    },
    fail: function (err) {
      console.log("getBLEDeviceServices Err:", err);
    }
  });
}
/**
 * 获取设备某个服务特征值列表
 */
function getBluetoothCharacteristics() {
  let that = blueToothData;
  console.log('获取服务特征值列表')
  console.log('that.deviceId', that.deviceId)
  console.log('that.serviceId', that.serviceId)
  wx.getBLEDeviceCharacteristics({
    deviceId: that.deviceId,
    serviceId: that.serviceId,
    success: function (res) {
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i];
        if (item.properties.read) {
          //该特征值是否支持 read 操作
          var log = "该特征值支持 read 操作:" + item.uuid + "\n";
          console.log(log)
          that.readCharacteristicId = item.uuid;
        }
        if (item.properties.write && !item.properties.read) {
          //该特征值是否支持 write 操作
          var log = "该特征值支持 write 操作:" + item.uuid + "\n";
          console.log(log)
          that.writeCharacteristicId = item.uuid;
          wx.setStorageSync('writeCharacteristicId', item.uuid)
        }
        if (item.properties.notify || item.properties.indicate) {
          //该特征值是否支持 notify或indicate 操作
          var log = "该特征值支持 notify 操作:" + item.uuid + "\n";
          console.log(log)
          that.notifyCharacteristicId = item.uuid;
        }
      }
      if (that.notifyCharacteristicId) {
        notifyBluetoothCharacteristicValueChange();
      }
    }
  });
}
/**
 * 启用设备特征值变化时的 notify 功能
 */
function notifyBluetoothCharacteristicValueChange() {
  let that = blueToothData;
  console.log("启用设备特征通知notify")
  wx.notifyBLECharacteristicValueChange({
    deviceId: that.deviceId,
    serviceId: that.serviceId,
    characteristicId: that.notifyCharacteristicId,
    state: true,
    type: "notification",
    success(res) {
      onBLECharacteristicValueChange();
    },
    fail: function (res) {
      printf("notify特征值启动失败");
    }
  });
}

//发送充电指令
function sentOrder(order, cmd) {
  console.log("发送充电指令")
  var that = blueToothData;
  that.allData = order;
  that.cmd = cmd;
  let temp_HexOrder = pacageSendOrder(order, 1)
  that.temp_HexOrder = temp_HexOrder
}
// 发送换电指令
function sentExchangeOrder(order, cmd) {
  console.log("发送换电指令")
  var that = blueToothData;
  that.allData = order;
  that.cmd = cmd;
  let temp_HexOrder = pacageSendOrder(order, 3)
  that.temp_HexOrder = temp_HexOrder
}
// 发送充电状态查询指令
function sentChargSearch(order, cmd) {
  var that = blueToothData;
  that.cmd = cmd;
  let chargStatusHex = pacageSendOrder(order, 2)
  writeBLECharacteristicValue(chargStatusHex)
}
// 发送换电状态查询指令
function sentExchangeSearch(order, cmd) {
  var that = blueToothData;
  that.cmd = cmd;
  let exchangeStatusHex = pacageSendOrder(order, 4)
  writeBLECharacteristicValue(exchangeStatusHex)
}

// 发送取消充电指令
function sentCancelOrder(order, cmd) {
  var that = blueToothData;
  that.cmd = cmd;
  let chargStatusHex = pacageSendOrder(order, 1)
  writeBLECharacteristicValue(chargStatusHex)
}


// 解析发送的指令
function pacageSendOrder(order, type) {
  let unarr
  switch (type) {
    case 1:
      unarr = utils.packageCharging(order)
      break;
    case 2:
      unarr = utils.packageChargStatus(order)
      break;
    case 3:
      unarr = utils.packageExchange(order)
      break;
    case 4:
      unarr = utils.packageExchangeStatus(order)
      break
    default:
      break;
  }

  return unarr
}

//向低功耗蓝牙设备特征值中写入arrbf数据,注意：必须设备的特征值支持write才可以成功调用
function writeBLECharacteristicValue(uintarr) {
  var that = blueToothData;
  console.log("准备写入")
  console.log('deviceId', that.deviceId)
  console.log('serviceId', that.serviceId)
  console.log('characteristicId', that.writeCharacteristicId)
  console.log('value', uintarr.buffer)
  sleep(250)
  wx.writeBLECharacteristicValue({
    deviceId: that.deviceId,
    serviceId: that.serviceId ? that.serviceId : "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    characteristicId: that.writeCharacteristicId ? that.writeCharacteristicId : wx.getStorageSync("writeCharacteristicId"),
    value: uintarr.buffer,
    success(res) {
      var log = "写入成功：" + res.errMsg + "\n";
      that.temp_HexOrder = ""
      console.log('写入成功')
      switchChargingCMD(that.cmd)

    },
    fail(res) {
      var log = "写入失败" + res.errMsg + "\n";
      if (res.errCode == 10006) {
        that.app.globalData.emitter.emit("writeBLECharacteristicValue", "break");
      }

    },
  });
}

// sleep函数
function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

//监听低功耗蓝牙设备的特征值变化。必须先启用notify接口才能接收到设备推送的notification。
function onBLECharacteristicValueChange() {
  var that = blueToothData;
  console.log("正在监听...")
  wx.onBLECharacteristicValueChange(function (res) {
    var uintarr = new Uint8Array(res.value);
    var cmd = uintarr[2];
    console.log('接受到数据', res)
    switch (cmd) {
      case 0:
        if (uintarr[1] == 3) {
          // 电柜主动有json数据要发送到小程序
          undoReturnDataHand(uintarr);
        }
        break;
      case 1:
        if (uintarr[1] > 3) {
          packageArrToString(uintarr, uintarr[4]);
        }
        break;
      case 5:
        // 电柜请求手机端发送数据
        if (that.temp_HexOrder) {
          writeBLECharacteristicValue(that.temp_HexOrder)
        }
        break
      default:
        break;
    }
    return;
  });
}

// 拼装return数据
function packageArrToString(buf, index) {
  var that = blueToothData;

  if (index < that.returnPackages) {
    // 非最后一包
    if (!that.tempArrBuf) {
      that.tempArrBuf = new Uint8Array(1000);
    }
    let len = (buf[1] & 0xff) - 3;
    let offset = (index - 1) * len;
    let _str = "";
    for (let i = 0; i < len; i++) {
      that.tempArrBuf[i + offset] = buf[i + 5];
      _str += String.fromCharCode(buf[i + 5]);
    }
    console.log(index, _str);
  } else {
    // 最后一包
    if (!that.tempArrBuf) {
      that.tempArrBuf = new Uint8Array(1000);
    }
    let len = (buf[1] & 0xff) - 3;
    let offset = (index - 1) * 12;
    let _str = "";
    for (let i = 0; i < len; i++) {
      that.tempArrBuf[i + offset] = buf[i + 5];
      _str += String.fromCharCode(buf[i + 5]);
    }
    console.log(index, _str);
    let dataSize = offset + len;
    let str = "";

    for (var i = 0; i < dataSize; i++) {
      console.log("tempArrBuf", that.tempArrBuf[i]);
      str += String.fromCharCode(that.tempArrBuf[i]);
    }
    console.log(str);
    that.app.globalData.emitter.emit("cabinetConnected", str);
  }
  undoReturnData(index);
}

// 解析硬件主动发送的数据
function undoReturnDataHand(uintarr) {
  var that = blueToothData;
  that.returnPackages = uintarr[4];
  let retrunCall = utils.sendFirstReturnHand();
  setTimeout(() => {
    writeBLECharacteristicValue(retrunCall);
  }, 50);
}

// 请求应答
function undoReturnData(index) {
  console.log("收到回复");
  let retrunCall = utils.sendReturnData(index);
  setTimeout(() => {
    writeBLECharacteristicValue(retrunCall);
  }, 50);
}

// 判断当前发送指令CMD，并触发相应监听
function switchChargingCMD(cmd) {
  var that = blueToothData;
  switch (cmd) {
    case "cmdChargingOrder":
      that.app.globalData.emitter.emit("cmdChargingOrder", true);
      that.cmd = ""
      break;
    case "cmdExchangeOrder":
      that.app.globalData.emitter.emit("cmdExchangeOrder", true);
      that.cmd = ""
      break;
    case "cmdCancelCharging":
      that.app.globalData.emitter.emit("cmdCancelCharging", true);
      that.cmd = ""
      break;

    default:
      break;
  }
}

// 握手响应，timesCount为计数器
function undoFirstHand(uintarr) {
  var that = blueToothData;
  if (utils.undoFirstRequest(uintarr) != "ok") {
    // * 握手失败
    that.timesCount++; //计数
    printf(`握手失败:重发第${that.timesCount}次`);
    if (that.timesCount < that.timesSum) {
      sentOrderZero(); //握手指令重发
    } else {
      that.timesCount = 0; //计数位置0
    }
  } else {
    // * 握手成功
    printf("握手成功");
    let datalength = utils._splitData(that.allData).length;
    that.waitToSend.index = 1; //当前发送第几包
    that.timesCount = 0; //重发计数位置0
    printf(`总共有：${datalength}包`);
    sendNormalData(that.allData, that.waitToSend.index);
  }
}

// 发送数据包
function sendNormalData(order, index) {
  var that = blueToothData;
  var datalength = utils._splitData(that.allData).length;
  if (index <= datalength) {
    var uintarr = utils.sendData(order, index);
    writeBLECharacteristicValue(uintarr);
  }
}

// 蓝牙日志打印函数
function printf(str) {
  var tempFlag = blueToothData.consoleFlag;
  if (tempFlag) {
    console.log(`blueTools:${str}`);
  }
}
function printinfo(str) {
  var tempFlag = blueToothData.consoleFlag;
  if (tempFlag) {
    console.log(`blueToolsinfo:${str}`);
  }
}

module.exports = {
  bluetoothInit: bluetoothInit,
  closeConnectBluetooth: closeConnectBluetooth,
  offBlueLine: offBlueLine,
  sentOrder: sentOrder,
  sentExchangeOrder: sentExchangeOrder,
  sentChargSearch: sentChargSearch,
  sentCancelOrder: sentCancelOrder,
  sentExchangeSearch: sentExchangeSearch,
  sleep: sleep
};
