const mod = require("./modeData");

// 封装请求发送指令0x00
function firstHand(obj) {
  let packages = _splitData(obj).length;
  let unarr = new Uint8Array(8);
  unarr[0] = 0x26;
  unarr[1] = 0x03;
  unarr[2] = 0x00;
  unarr[3] = 0x00;
  unarr[4] = packages;
  let crc = _modBusCRC16(unarr, 1, 4);
  unarr[5] = (crc >> 8) & 0xff;
  unarr[6] = crc & 0xff;
  unarr[7] = 0x23;
  return unarr;
}

// 解析第一次请求应答0x00
function undoFirstRequest(buf) {
  if (!_crcCheck(buf)) {
    return "lost";
  }
  if (!buf[3]) {
    return "ok";
  } else {
    console.log("refuse:", buf[3]);
    return "refuse";
  }
}

function sendFirstReturnHand() {
  let unarr = new Uint8Array(7);
  let tempArr = new Uint8Array(3);
  tempArr[0] = 0x02;
  tempArr[1] = 0x00;
  tempArr[2] = 0x00;

  unarr[0] = 0x26;
  unarr[1] = 0x02;
  unarr[2] = 0x00;
  unarr[3] = 0x00;
  let crc = _modBusCRC16(unarr, 1, 3);
  unarr[4] = (crc >> 8) & 0xff;
  unarr[5] = crc & 0xff;
  unarr[6] = 0x23;
  return unarr;
}

function sendReturnData(index) {
  let unarr = new Uint8Array(8);
  let tempArr = new Uint8Array(4);
  tempArr[0] = 0x03;
  tempArr[1] = 0x01;
  tempArr[2] = 0x00;
  tempArr[3] = index;

  unarr[0] = 0x26;
  unarr[1] = 0x03;
  unarr[2] = 0x01;
  unarr[3] = 0x00;
  unarr[4] = index;
  let crc = _modBusCRC16(tempArr, 0, 3);
  unarr[5] = (crc >> 8) & 0xff;
  unarr[6] = crc & 0xff;
  unarr[7] = 0x23;
  return unarr;
}

// 封装需要发送数据,命令码0x01
function sendData(obj, index) {
  let packages = _splitData(obj);
  if (index == packages.length) {
    // 最后一包
    let len = packages[index - 1].split("").length + 8;
    let unarr = new Uint8Array(len);
    unarr[0] = 0x26;
    unarr[1] = packages[index - 1].split("").length + 3;
    unarr[2] = 0x01;
    unarr[3] = 0x00;
    unarr[4] = index; //数据块编号
    // 数据内容
    for (let i = 5; i < 5 + (len - 8); i++) {
      unarr[i] = packages[index - 1].split("")[i - 5].charCodeAt();
    }
    // crc
    let crc = _modBusCRC16(unarr, 1, len - 4);
    unarr[len - 3] = (crc >> 8) & 0xff;
    unarr[len - 2] = crc & 0xff;
    unarr[len - 1] = 0x23;
    return unarr;
  } else {
    let unarr = new Uint8Array(20);
    unarr[0] = 0x26;
    unarr[1] = 0x0f;
    unarr[2] = 0x01;
    unarr[3] = 0x00;
    unarr[4] = index; //数据块编号
    // 数据内容
    for (let i = 5; i < 17; i++) {
      unarr[i] = packages[index - 1].split("")[i - 5].charCodeAt();
    }
    // crc
    let crc = _modBusCRC16(unarr, 1, 16);
    unarr[17] = (crc >> 8) & 0xff;
    unarr[18] = crc & 0xff;
    unarr[19] = 0x23;

    return unarr;
  }
}
// 解析第二次请求应答
function undoSecondRequest(buf) {
  if (!_crcCheck(buf)) {
    return "lost";
  }
  let index = buf[3]; //?数据编号
  return index;
}

// crc验证
function _crcCheck(buf) {
  let calcrc = _modBusCRC16(buf, 1, buf.byteLength - 4);
  let remotecrc =
    ((buf[buf.byteLength - 3] & 0xff) << 8) + (buf[buf.byteLength - 2] & 0xff);
  if (calcrc == remotecrc) {
    return true;
  } else {
    return false;
  }
}

// json数据切分 step步长，return:Array
function _splitData(obj, step = 12) {
  let objstr = JSON.stringify(obj);
  let num = parseInt(objstr.length / step);
  let arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(objstr.slice(i * step, i * step + step));
  }
  if (objstr.slice(num * step)) {
    arr.push(objstr.slice(num * step));
  }
  return arr;
}
//  _modBusCRC16 校验算法
function _modBusCRC16(data, startIdx, endIdx) {
  var crc = 0xffff;
  do {
    if (endIdx <= startIdx) {
      break;
    }
    if (data.length <= endIdx) {
      break;
    }
    for (var i = startIdx; i <= endIdx; i++) {
      var byte = data[i] & 0xffff;
      for (var j = 0; j < 8; j++) {
        crc = (byte ^ crc) & 0x01 ? (crc >> 1) ^ 0xa001 : crc >> 1;
        byte >>= 1;
      }
    }
  } while (0);
  return ((crc << 8) | (crc >> 8)) & 0xffff;
}
// 字符串转ArrayBuffer
function _str2arraybf(str) {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    if (val === "") {
      val = str.charCodeAt(i).toString(16);
    } else {
      val += "," + str.charCodeAt(i).toString(16);
    }
  }
  return new Uint8Array(
    val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  ).buffer;
}

// 字符串转byte
function stringToBytes(str) {
  var strArray = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    strArray[i] = str.charCodeAt(i);
  }
  const array = new Uint8Array(strArray.length);
  strArray.forEach((item, index) => (array[index] = item));
  return array.buffer;
}

// ArrayBuffer转16进制字符串示例
function ab2hext(buffer) {
  var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ("00" + bit.toString(16)).slice(-2);
  });
  return hexArr.join("");
}

//
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

//16进制转字符串
function hexToString(str) {
  var trimedStr = str.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x"
      ? trimedStr.substr(2)
      : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}

/*微信app版本比较*/
function versionCompare(ver1, ver2) {
  var version1pre = parseFloat(ver1);
  var version2pre = parseFloat(ver2);
  var version1next = parseInt(ver1.replace(version1pre + ".", ""));
  var version2next = parseInt(ver2.replace(version2pre + ".", ""));
  if (version1pre > version2pre) return true;
  else if (version1pre < version2pre) return false;
  else {
    if (version1next > version2next) return true;
    else return false;
  }
}

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// 封装下发充电指令
function packageCharging(mudata) {
  let unarr = new Uint8Array(mudata.length + 6);
  unarr[0] = 0x26;
  unarr[1] = mudata.length + 1;
  unarr[2] = 0x07
  mudata.map((item, index) => {
    unarr[index + 3] = item
  })
  let crc = _modBusCRC16(unarr, 1, mudata.length + 2);
  unarr[unarr.length - 3] = (crc >> 8) & 0xff;
  unarr[unarr.length - 2] = crc & 0xff;
  unarr[unarr.length - 1] = 0x23;
  return unarr
}

// 封装下发换电指令
function packageExchange(mudata) {
  let unarr = new Uint8Array(mudata.length + 6);
  unarr[0] = 0x26;
  unarr[1] = mudata.length + 1;
  unarr[2] = 0x06
  mudata.map((item, index) => {
    unarr[index + 3] = item
  })
  let crc = _modBusCRC16(unarr, 1, mudata.length + 2);
  unarr[unarr.length - 3] = (crc >> 8) & 0xff;
  unarr[unarr.length - 2] = crc & 0xff;
  unarr[unarr.length - 1] = 0x23;
  return unarr
}
function packageExchangeStatus(mudata) {
  let unarr = new Uint8Array(mudata.length + 6);
  unarr[0] = 0x26;
  unarr[1] = mudata.length + 1;
  unarr[2] = 0x09
  mudata.map((item, index) => {
    unarr[index + 3] = item
  })
  let crc = _modBusCRC16(unarr, 1, mudata.length + 2);
  unarr[unarr.length - 3] = (crc >> 8) & 0xff;
  unarr[unarr.length - 2] = crc & 0xff;
  unarr[unarr.length - 1] = 0x23;
  return unarr
}

function packageChargStatus(mudata) {
  let unarr = new Uint8Array(mudata.length + 6);
  unarr[0] = 0x26;
  unarr[1] = mudata.length + 1;
  unarr[2] = 0x08
  mudata.map((item, index) => {
    unarr[index + 3] = item
  })
  let crc = _modBusCRC16(unarr, 1, mudata.length + 2);
  unarr[unarr.length - 3] = (crc >> 8) & 0xff;
  unarr[unarr.length - 2] = crc & 0xff;
  unarr[unarr.length - 1] = 0x23;
  return unarr
}

module.exports = {
  stringToBytes: stringToBytes,
  ab2hext: ab2hext,
  hexToString: hexToString,
  versionCompare: versionCompare,
  inArray: inArray,
  firstHand: firstHand,
  sendData: sendData,
  str2arraybf: _str2arraybf,
  undoSecondRequest: undoSecondRequest,
  undoFirstRequest: undoFirstRequest,
  _splitData: _splitData,
  sendFirstReturnHand: sendFirstReturnHand,
  ab2str: ab2str,
  sendReturnData: sendReturnData,
  packageCharging: packageCharging,
  packageExchange: packageExchange,
  packageExchangeStatus: packageExchangeStatus,
  packageChargStatus: packageChargStatus
};
