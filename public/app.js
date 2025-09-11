// JS для динамических графиков Chart.js
const charts = {};

function fetchPingData() {
    fetch('/api/ping')
        .then(res => res.json())
        .then(data => updateCharts(data));
}

function updateCharts(data) {
    const chartsDiv = document.getElementById('charts');
    chartsDiv.innerHTML = '';
    Object.keys(data).forEach(ip => {
        const block = document.createElement('div');
        block.className = 'chart-block';
        const title = document.createElement('h2');
        title.innerText = ip;
        block.appendChild(title);
        const canvas = document.createElement('canvas');
        canvas.id = 'chart_' + ip;
        block.appendChild(canvas);
        chartsDiv.appendChild(block);
        const times = data[ip].map(e => {
            const d = new Date(e.time);
            return d.toLocaleTimeString() + '\n' + d.toLocaleDateString();
        });
        const delays = data[ip].map(e => e.delay === null ? NaN : e.delay);
        const colors = data[ip].map(e => e.color);
        if (charts[ip]) charts[ip].destroy();
        charts[ip] = new Chart(canvas, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: 'Задержка (мс)',
                    data: delays,
                    borderColor: function(ctx) {
                        const i = ctx.dataIndex;
                        return colors[i];
                    },
                    backgroundColor: 'rgba(0,0,0,0)',
                    pointBackgroundColor: colors,
                    pointRadius: 5,
                    segment: {
                        borderColor: ctx => colors[ctx.p0DataIndex]
                    },
                    spanGaps: true // пропуски для NaN
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Время запуска' },
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    },
                    y: {
                        title: { display: true, text: 'Задержка (мс)' },
                        min: 0
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed.y;
                                if (isNaN(val)) return 'Потеря пакета';
                                if (val > 0) return 'Задержка: ' + val + ' мс';
                                return 'OK';
                            }
                        }
                    }
                }
            }
        });
    });
}

setInterval(fetchPingData, 1000);
window.onload = fetchPingData;
