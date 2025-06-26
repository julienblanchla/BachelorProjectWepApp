// sensorService.js
export default class SensorService {
  /**
   * @param {string} apiUrl The URL of your /properties/count/ endpoint
   */
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * Fetches and returns raw JSON from the sensor.
   * @returns {Promise<Object|null>}
   */
  async fetchAll() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('SensorService.fetchAll error:', err);
      return null;
    }
  }
}
