// dashboard.js
import SensorService from './sensorService.js';
import { SensorData }   from './sensorData.js';
import { LineChart, GaugeChart } from './chart.js'; // Changed from './charts.js' to './chart.js'

export class Dashboard {
  /**
   * @param {Object} opts
   * @param {string} opts.apiUrl
   * @param {number} opts.intervalMs
   */
  constructor({ apiUrl, intervalMs = 1000 }) {
    this.service = new SensorService(apiUrl);
    this.intervalMs = intervalMs;

    // Get <canvas> elements from DOM
    this.accelCanvas   = document.getElementById('accelChart');
    this.tempCanvas    = document.getElementById('tempGauge');
    this.humCanvas     = document.getElementById('humGauge');
    this.co2Canvas     = document.getElementById('co2Gauge');
    this.tvocCanvas    = document.getElementById('tvocGauge');

    // Instantiate charts
    this.accelChart = new LineChart(this.accelCanvas, ['X', 'Y', 'Z'], 100);
    this.tempGauge  = new GaugeChart(this.tempCanvas, -10, 50, 'Temp °C');
    this.humGauge   = new GaugeChart(this.humCanvas, 0, 100, 'Hum %');
    this.co2Gauge   = new GaugeChart(this.co2Canvas, 400, 2000, 'CO₂ ppm');
    this.tvocGauge  = new GaugeChart(this.tvocCanvas, 0, 600, 'TVOC ppb');
  }

  /** Start polling */
  start() {
    this.timer = setInterval(() => this.refresh(), this.intervalMs);
  }

  /** Stop polling */
  stop() {
    clearInterval(this.timer);
  }

  /** Fetch and update all charts */
  async refresh() {
    const raw = await this.service.fetchAll();
    if (!raw) return;
    const data = SensorData.fromJSON(raw);

    this.accelChart.update([data.accel.x, data.accel.y, data.accel.z]);
    this.tempGauge.update(data.temp);
    this.humGauge.update(data.hum);
    this.co2Gauge.update(data.aq.CO2);
    this.tvocGauge.update(data.aq.TVOC);
  }
}
