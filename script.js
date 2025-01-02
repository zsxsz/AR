let priceChart;
let currentInterval = 1;

// Function to format numbers
function formatNumber(num, decimals = 2) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (USD)',
                data: [],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                },
                y: {
                    position: 'right',
                    ticks: {
                        callback: value => '$' + value.toFixed(2)
                    }
                }
            }
        }
    });
}

// Function to update coin data
async function updateCoinData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/arweave?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
        const data = await response.json();
        
        // Update price
        document.getElementById('price').textContent = data.market_data.current_price.usd.toFixed(4);
        
        // Update 24h change
        const change24h = data.market_data.price_change_percentage_24h;
        const change24hElement = document.getElementById('change24h');
        change24hElement.textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        change24hElement.className = change24h >= 0 ? 'positive' : 'negative';
        
        // Update market stats
        document.getElementById('marketCap').textContent = '$' + formatNumber(data.market_data.market_cap.usd);
        document.getElementById('volume24h').textContent = '$' + formatNumber(data.market_data.total_volume.usd);
        
        // Update time
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to update chart data
async function updateChartData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/arweave/market_chart?vs_currency=usd&days=${currentInterval}`);
        const data = await response.json();
        
        const prices = data.prices;
        const labels = prices.map(price => {
            const date = new Date(price[0]);
            if (currentInterval === 1) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (currentInterval <= 7) {
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        });
        
        priceChart.data.labels = labels;
        priceChart.data.datasets[0].data = prices.map(price => price[1]);
        priceChart.update();
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

// Add interval button listeners
document.querySelectorAll('.interval-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.interval-btn.active').classList.remove('active');
        button.classList.add('active');
        currentInterval = parseInt(button.dataset.days);
        updateChartData();
    });
});

// Initialize everything
initChart();
updateCoinData();
updateChartData();

// Auto refresh every 10 seconds
setInterval(() => {
    updateCoinData();
    updateChartData();
}, 10000);
