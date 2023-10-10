//Page Object
import { HTTP } from "../../utils/server";
import { globalData } from "../../utils/global";
//获取应用实例
const app = getApp();
Page({
  data: {
    baseUrlImg: app.globalData.baseUrlImg,
    model: "",
    lisenner: "",
  },
  onShow() {
    let temp = this.jugeModel(app.getModel());
    this.setData({
      model: temp,
    });
  },
  jugeModel(str) {
    if (str.indexOf("iPhone") != -1 || str.indexOf("iPad") != -1) {
      return "iPhone";
    } else {
      return "Android";
    }
  },
});
