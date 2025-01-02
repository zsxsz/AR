let priceChart;
let solPriceChart;
let usdtPriceChart;
let currentInterval = 1;
let solCurrentInterval = 1;
let usdtCurrentInterval = 1;
let currentCrypto = null;

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
    if (priceChart) {
        priceChart.destroy();
    }
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
                        maxRotation: 0,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        display: true
                    },
                    ticks: {
                        callback: value => '$' + value.toFixed(2)
                    }
                }
            }
        }
    });
}

// Initialize Solana chart
function initSolChart() {
    const ctx = document.getElementById('solPriceChart').getContext('2d');
    if (solPriceChart) {
        solPriceChart.destroy();
    }
    solPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (USD)',
                data: [],
                borderColor: '#00FFA3',
                backgroundColor: 'rgba(0, 255, 163, 0.1)',
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
                        maxRotation: 0,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        display: true
                    },
                    ticks: {
                        callback: value => '$' + value.toFixed(2)
                    }
                }
            }
        }
    });
}

// Initialize USDT chart
function initUsdtChart() {
    const ctx = document.getElementById('usdtPriceChart').getContext('2d');
    if (usdtPriceChart) {
        usdtPriceChart.destroy();
    }
    usdtPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (IDR)',
                data: [],
                borderColor: '#26A17B',
                backgroundColor: 'rgba(38, 161, 123, 0.1)',
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
                            return 'Rp' + context.parsed.y.toLocaleString('id-ID');
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
                        maxRotation: 0,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        display: true
                    },
                    ticks: {
                        callback: value => 'Rp' + value.toLocaleString('id-ID')
                    }
                }
            }
        }
    });
}

// Function to update all coin data
async function updateAllCoinData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=arweave,solana,tether&vs_currencies=usd,idr&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
        const data = await response.json();
        
        // Update Arweave data
        document.getElementById('price').textContent = data.arweave.usd.toFixed(4);
        const arweaveChange24h = data.arweave.usd_24h_change;
        const arweaveChange24hElement = document.getElementById('change24h');
        arweaveChange24hElement.textContent = `${arweaveChange24h >= 0 ? '+' : ''}${arweaveChange24h.toFixed(2)}%`;
        arweaveChange24hElement.className = arweaveChange24h >= 0 ? 'positive' : 'negative';
        document.getElementById('marketCap').textContent = '$' + formatNumber(data.arweave.usd_market_cap);
        document.getElementById('volume24h').textContent = '$' + formatNumber(data.arweave.usd_24h_vol);
        
        // Update Solana data
        document.getElementById('solPrice').textContent = data.solana.usd.toFixed(4);
        const solChange24h = data.solana.usd_24h_change;
        const solChange24hElement = document.getElementById('solChange24h');
        solChange24hElement.textContent = `${solChange24h >= 0 ? '+' : ''}${solChange24h.toFixed(2)}%`;
        solChange24hElement.className = solChange24h >= 0 ? 'positive' : 'negative';
        document.getElementById('solMarketCap').textContent = '$' + formatNumber(data.solana.usd_market_cap);
        document.getElementById('solVolume24h').textContent = '$' + formatNumber(data.solana.usd_24h_vol);
        
        // Update USDT data
        document.getElementById('usdtPrice').textContent = data.tether.idr.toLocaleString('id-ID');
        const usdtChange24h = data.tether.idr_24h_change;
        const usdtChange24hElement = document.getElementById('usdtChange24h');
        usdtChange24hElement.textContent = `${usdtChange24h >= 0 ? '+' : ''}${usdtChange24h.toFixed(2)}%`;
        usdtChange24hElement.className = usdtChange24h >= 0 ? 'positive' : 'negative';
        document.getElementById('usdtMarketCap').textContent = 'Rp' + formatNumber(data.tether.idr_market_cap);
        document.getElementById('usdtVolume24h').textContent = 'Rp' + formatNumber(data.tether.idr_24h_vol);
        
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
        document.getElementById('solLastUpdated').textContent = now.toLocaleTimeString();
        document.getElementById('usdtLastUpdated').textContent = now.toLocaleTimeString();
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
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
        console.error('Error fetching Arweave chart data:', error);
    }
}

// Function to update Solana chart data
async function updateSolChartData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${solCurrentInterval}`);
        const data = await response.json();
        
        const prices = data.prices;
        const labels = prices.map(price => {
            const date = new Date(price[0]);
            if (solCurrentInterval === 1) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (solCurrentInterval <= 7) {
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        });
        
        solPriceChart.data.labels = labels;
        solPriceChart.data.datasets[0].data = prices.map(price => price[1]);
        solPriceChart.update();
    } catch (error) {
        console.error('Error fetching Solana chart data:', error);
    }
}

// Function to update USDT chart data
async function updateUsdtChartData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=idr&days=${usdtCurrentInterval}`);
        const data = await response.json();
        
        const prices = data.prices;
        const labels = prices.map(price => {
            const date = new Date(price[0]);
            if (usdtCurrentInterval === 1) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (usdtCurrentInterval <= 7) {
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        });
        
        usdtPriceChart.data.labels = labels;
        usdtPriceChart.data.datasets[0].data = prices.map(price => price[1]);
        usdtPriceChart.update();
    } catch (error) {
        console.error('Error fetching USDT chart data:', error);
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

// Add Solana interval button listeners
document.querySelectorAll('.sol-interval-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.sol-interval-btn.active').classList.remove('active');
        button.classList.add('active');
        solCurrentInterval = parseInt(button.dataset.days);
        updateSolChartData();
    });
});

// Add USDT interval button listeners
document.querySelectorAll('.usdt-interval-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.usdt-interval-btn.active').classList.remove('active');
        button.classList.add('active');
        usdtCurrentInterval = parseInt(button.dataset.days);
        updateUsdtChartData();
    });
});

// Function to handle search
function handleSearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    const arweaveContainer = document.getElementById('arweaveContainer');
    const solanaContainer = document.getElementById('solanaContainer');
    const usdtContainer = document.getElementById('usdtContainer');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Hide all containers first
    arweaveContainer.style.display = 'none';
    solanaContainer.style.display = 'none';
    usdtContainer.style.display = 'none';
    welcomeMessage.style.display = 'none';

    if (searchTerm === 'arweave' || searchTerm === 'ar') {
        arweaveContainer.style.display = 'block';
        if (currentCrypto !== 'arweave') {
            currentCrypto = 'arweave';
            initChart();
            updateChartData();
        }
    } else if (searchTerm === 'solana' || searchTerm === 'sol') {
        solanaContainer.style.display = 'block';
        if (currentCrypto !== 'solana') {
            currentCrypto = 'solana';
            initSolChart();
            updateSolChartData();
        }
    } else if (searchTerm === 'tether' || searchTerm === 'usdt') {
        usdtContainer.style.display = 'block';
        if (currentCrypto !== 'usdt') {
            currentCrypto = 'usdt';
            initUsdtChart();
            updateUsdtChartData();
        }
    } else if (searchTerm === '') {
        welcomeMessage.style.display = 'block';
        currentCrypto = null;
    }
}

// Add search input listener
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
});

// Initialize search functionality
handleSearch('');

// Auto refresh based on current crypto
function autoRefresh() {
    updateAllCoinData();
    switch(currentCrypto) {
        case 'arweave':
            updateChartData();
            break;
        case 'solana':
            updateSolChartData();
            break;
        case 'usdt':
            updateUsdtChartData();
            break;
    }
}

// Initial data load
updateAllCoinData();

// Set up auto-refresh interval
setInterval(autoRefresh, 10000);
