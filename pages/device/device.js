const app = getApp()
Page({
  data: {
    inputText: 'mootek',
    receiveText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)
  },
  Send: function () {
    var that = this
    if (that.data.connected) {
      var buffer = new ArrayBuffer(that.data.inputText.length)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i < that.data.inputText.length; i++) {
        dataView[i] = that.data.inputText.charCodeAt(i)
      }

      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[0].uuid,
        characteristicId: that.data.characteristics[1].uuid,
        value: buffer,
        success: function (res) {
          console.log('发送指令成功:'+ res.errMsg)
          wx.showModal({
            title: '数据发送成功',
            content: ''
          })        
        },
        fail: function (res) {
          // fail
          //console.log(that.data.services)
          console.log('message发送失败:' +  res.errMsg)
          wx.showToast({
            title: '数据发送失败，请稍后重试',
            icon: 'none'
          })
        }       
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.services)
        that.setData({
          services: res.services
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[0].uuid,
          success: function (res) {
            console.log(res.characteristics)
            that.setData({
              characteristics: res.characteristics
            })
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: options.connectedDeviceId,
              serviceId: that.data.services[0].uuid,
              characteristicId: that.data.characteristics[0].uuid,
              success: function (res) {
                console.log('启用notify成功：' + that.data.characteristics[0].uuid)
                console.log(JSON.stringify(res));
                that.onBLECharacteristicValueChange();
              },
              fail: function () {
                console.log('开启notify失败' + that.characteristicId)
              }
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })

  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onBLECharacteristicValueChange: function() {
    var that = this;
      wx.onBLECharacteristicValueChange(function(res) {
      var receiveText = app.buf2string(res.value)
      console.log('监听低功耗蓝牙设备的特征值变化事件成功');
      console.log(app.buf2string(res.value));
      that.setData({
        receiveText: receiveText
      })
    })
  }
})

