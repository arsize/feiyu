// 模拟请求发送数据
var mdata1 = new ArrayBuffer(8);
mdata1[0] = 0x26; //&帧头
mdata1[1] = 0x03; //命令码+数据长度:3字节
mdata1[2] = 0x00; //命令码
mdata1[3] = 0x00; //要发送的数据包数
mdata1[4] = 0x02; //要发送的数据包数，2个包
mdata1[5] = 0xc0; //crc
mdata1[6] = 0x63; //crc
mdata1[7] = 0x23; //#帧尾

// 模拟请求应答
var mdata2 = new ArrayBuffer(7);
mdata2[0] = 0x26; //&帧头
mdata2[1] = 0x02; //命令码+数据长度:2字节
mdata2[2] = 0x00; //命令码
mdata2[3] = 0x01; //数据：可以接收
mdata2[4] = 0x11; //crc
mdata2[5] = 0xc0; //crc
mdata2[6] = 0x23; //#帧尾

// 模拟发送数据 第一帧
var mdata3 = new ArrayBuffer(20);
mdata3[0] = 0x26; //&帧头
mdata3[1] = 0x0f; //命令码+数据长度:15字节
mdata3[2] = 0x01; //命令码
mdata3[3] = 0x00; //数据块编号
mdata3[4] = 0x01; //数据块编号：1
mdata3[5] = 0x7b; //{
mdata3[6] = 0x22; //"
mdata3[7] = 0x6e; //n
mdata3[8] = 0x61; //a
mdata3[9] = 0x6d; //m
mdata3[10] = 0x65; //e
mdata3[11] = 0x22; //"
mdata3[12] = 0x3a; //:
mdata3[13] = 0x22; //"
mdata3[14] = 0x7a; //z
mdata3[15] = 0x79; //y
mdata3[16] = 0x68; //h
mdata3[17] = 0xde; //crc
mdata3[18] = 0x6f; //crc
mdata3[19] = 0x23; //#帧尾

// 模拟发送数据 第二帧
var mdata4 = new ArrayBuffer(10);
mdata4[0] = 0x26; //&帧头
mdata4[1] = 0x05; //命令码+数据长度:5字节
mdata4[2] = 0x01; //命令码
mdata4[3] = 0x00; //数据块编号
mdata4[4] = 0x02; //数据块编号：2
mdata4[5] = 0x22; //"
mdata4[6] = 0x7d; //}
mdata4[7] = 0x44; //crc
mdata4[8] = 0xcf; //crc
mdata4[9] = 0x23; //#帧尾

// 模拟请求应答
var mdata5 = new ArrayBuffer(8);
mdata5[0] = 0x26; //&帧头
mdata5[1] = 0x05; //命令码+数据长度:3字节
mdata5[2] = 0x01; //命令码
mdata5[3] = 0x00; //当前收到的数据编号
mdata5[4] = 0x01; //当前收到的数据编号,编号1
mdata5[5] = 0x90; //crc
mdata5[6] = 0xe8; //crc
mdata5[7] = 0x23; //#帧尾

const cabinetInfo = [
  {
    at: "1576809685825",
    dev_id: "2200000106",
    orderCode: "f446549d760e",
    status: "1",
    type: "22",
    data: {
      action_type: 0,
      cabinet_current: "12.1",
      cabinet_rssi: 50,
      cabinet_temp: "36.5",
      cabinet_vol: "28.32",
      electric_meter: "32.56",
      box_info: [
        {
          sn: "xxxxxxxx",
          soc: 66,
          box_sn: 1,
          temp: "36.4",
          door_status: 0
        }
      ],
      port_info: [
        {
          port_charge_status: 0,
          port_sn: 6
        }
      ],
      sim_iccid: "sim iccid"
    }
  }
];

const offline = {
  at: "1509354301289",
  dev_id: "3000000001",
  status: "0",
  type: "2"
  
};

const checkorderstatus = {
  action_type: 3,
  order: "",
  flag: 1,
  box_port_sn:5
};

var mdata = {
  mdata1,
  mdata2,
  mdata3,
  mdata4,
  mdata5,
  cabinetInfo,
  offline,
  checkorderstatus
};

module.exports = mdata;
