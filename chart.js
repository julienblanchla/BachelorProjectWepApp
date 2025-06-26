// chart.js
import Chart from 'chart.js/auto';

/**
 * A linear chart with N axes (e.g. X, Y, Z).
 */
export class LineChart {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string[]} axisLabels Curve labels (['X','Y','Z'])
   * @param {number} maxPoints Max number of points displayed
   */
  constructor(canvas, axisLabels, maxPoints = 100) {
    this.max = maxPoints;
    const datasets = axisLabels.map(label => ({
      label,
      data: Array(this.max).fill(0),
      tension: 0.3,
      borderWidth: 2,
      fill: false
    }));

    this.chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: Array(this.max).fill(''),
        datasets
      },
      options: {
        animation: false,
        scales: {
          x: { display: false },
          y: {
            suggestedMin: -2,
            suggestedMax: 2,
            title: { display: true, text: 'g' }
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  /**
   * Add a new value for each axis and shift.
   * @param {number[]} values
   */
  update(values) {
    this.chart.data.datasets.forEach((ds, idx) => {
      ds.data.push(values[idx]);
      if (ds.data.length > this.max) ds.data.shift();
    });
    this.chart.update('none');
  }
}


/**
 * A simple gauge based on a doughnut (e.g. temperature, humidity, CO₂).
 */
export class GaugeChart {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} min Min scale
   * @param {number} max Max scale
   * @param {string} title Title to display
   */
  constructor(canvas, min, max, title) {
    this.min = min;
    this.max = max;

    this.chart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: [title, ''],
        datasets: [{
          data: [0, max - min],
          backgroundColor: ['#3e95cd', '#eee'],
          hoverBackgroundColor: ['#3e95cd', '#eee'],
          borderWidth: 0
        }]
      },
      options: {
        rotation: -90 * Math.PI / 180,
        circumference: 180 * Math.PI / 180,
        cutout: '70%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          title: {
            display: true,
            text: title
          }
        }
      }
    });
  }

  /**
   * Update the gauge.
   * @param {number} value
   */
  update(value) {
    const v = Math.max(this.min, Math.min(value, this.max));
    this.chart.data.datasets[0].data = [v - this.min, this.max - v];
    this.chart.update('none');
  }
}
