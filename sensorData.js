// sensorData.js
export class SensorData {
  /**
   * @param {Object} params
   * @param {{x:number,y:number,z:number}} params.accelerometer
   * @param {number} params.temperature
   * @param {number} params.humidity
   * @param {{CO2:number,TVOC:number}} params.air_quality
   * @param {string} params.air_qualityalert
   * @param {string} params.humidityalert
   * @param {string} params.motionalert
   * @param {string} params.timestamp
   */
  constructor({ accelerometer, temperature, humidity, air_quality, air_qualityalert, humidityalert, motionalert, timestamp }) {
    this.accel = accelerometer;
    this.temp  = temperature;
    this.hum   = humidity;
    this.aq    = air_quality;
    this.aqAlert     = air_qualityalert;
    this.humAlert    = humidityalert;
    this.motionAlert = motionalert;
    this.ts = new Date(timestamp);
  }

  /**
   * Factory for conversion from raw JSON.
   * @param {Object} json
   * @returns {SensorData}
   */
  static fromJSON(json) {
    return new SensorData(json);
  }
}
