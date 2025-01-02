let priceChart = null;
let solPriceChart = null;
let usdtPriceChart = null;
let currentInterval = 1;
let solCurrentInterval = 1;
let usdtCurrentInterval = 1;

// Cache DOM elements for better performance
const priceElements = {
    ar: {
        price: document.getElementById('price'),
        change: document.getElementById('change24h'),
        marketCap: document.getElementById('marketCap'),
        volume: document.getElementById('volume24h'),
        lastUpdated: document.getElementById('lastUpdated')
    },
    sol: {
        price: document.getElementById('solPrice'),
        change: document.getElementById('solChange24h'),
        marketCap: document.getElementById('solMarketCap'),
        volume: document.getElementById('solVolume24h'),
        lastUpdated: document.getElementById('solLastUpdated')
    },
    usdt: {
        price: document.getElementById('usdtPrice'),
        change: document.getElementById('usdtChange24h'),
        marketCap: document.getElementById('usdtMarketCap'),
        volume: document.getElementById('usdtVolume24h'),
        lastUpdated: document.getElementById('usdtLastUpdated')
    }
};

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

// Function to update UI with data
function updateUI(data) {
    // Update AR data
    if (data.arweave && priceElements.ar.price) {
        priceElements.ar.price.textContent = data.arweave.usd.toFixed(4);
        const change = data.arweave.usd_24h_change;
        priceElements.ar.change.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        priceElements.ar.change.className = change >= 0 ? 'positive' : 'negative';
        priceElements.ar.marketCap.textContent = '$' + formatNumber(data.arweave.usd_market_cap);
        priceElements.ar.volume.textContent = '$' + formatNumber(data.arweave.usd_24h_vol);
    }
    
    // Update SOL data
    if (data.solana && priceElements.sol.price) {
        priceElements.sol.price.textContent = data.solana.usd.toFixed(4);
        const change = data.solana.usd_24h_change;
        priceElements.sol.change.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        priceElements.sol.change.className = change >= 0 ? 'positive' : 'negative';
        priceElements.sol.marketCap.textContent = '$' + formatNumber(data.solana.usd_market_cap);
        priceElements.sol.volume.textContent = '$' + formatNumber(data.solana.usd_24h_vol);
    }
    
    // Update USDT data
    if (data.tether && priceElements.usdt.price) {
        priceElements.usdt.price.textContent = data.tether.idr.toLocaleString('id-ID');
        const change = data.tether.idr_24h_change;
        priceElements.usdt.change.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        priceElements.usdt.change.className = change >= 0 ? 'positive' : 'negative';
        priceElements.usdt.marketCap.textContent = 'Rp' + formatNumber(data.tether.idr_market_cap);
        priceElements.usdt.volume.textContent = 'Rp' + formatNumber(data.tether.idr_24h_vol);
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    if (priceElements.ar.lastUpdated) priceElements.ar.lastUpdated.textContent = timeString;
    if (priceElements.sol.lastUpdated) priceElements.sol.lastUpdated.textContent = timeString;
    if (priceElements.usdt.lastUpdated) priceElements.usdt.lastUpdated.textContent = timeString;
}

// Proxy configuration
const PROXY_URL = 'http://85645789-zone-custom-region-US-sessid-WcpFcA6s-sessTime-15:Nm3ft1XK@aus.360s5.com:3600';

// Function to fetch data through proxy
async function fetchWithProxy(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            proxy: PROXY_URL
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to update price data immediately
async function updatePriceData() {
    try {
        const [arData, solData, usdtData] = await Promise.all([
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'),
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'),
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        ]);

        const data = {
            arweave: arData.arweave,
            solana: solData.solana,
            tether: usdtData.tether
        };

        updateUI(data);
    } catch (error) {
        console.error('Error updating price data:', error);
    }
}

// Function to update all chart data
async function updateAllChartData() {
    try {
        await Promise.all([
            updateChartData(),
            updateSolChartData(),
            updateUsdtChartData()
        ]);
    } catch (error) {
        console.error('Error updating chart data:', error);
    }
}

// Initialize all charts
function initializeCharts() {
    try {
        initChart();
        initSolChart();
        initUsdtChart();
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('priceChart')?.getContext('2d');
    if (!ctx) {
        console.error('Could not find priceChart canvas');
        return;
    }
    
    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: '#818cf8',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    position: 'right',
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
    showChart('priceChart');
}

// Initialize Solana chart
function initSolChart() {
    const ctx = document.getElementById('solPriceChart')?.getContext('2d');
    if (!ctx) {
        console.error('Could not find solPriceChart canvas');
        return;
    }
    
    if (solPriceChart) {
        solPriceChart.destroy();
    }

    solPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: '#818cf8',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    position: 'right',
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
    showChart('solPriceChart');
}

// Initialize USDT chart
function initUsdtChart() {
    const ctx = document.getElementById('usdtPriceChart')?.getContext('2d');
    if (!ctx) {
        console.error('Could not find usdtPriceChart canvas');
        return;
    }
    
    if (usdtPriceChart) {
        usdtPriceChart.destroy();
    }

    usdtPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: '#818cf8',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Rp${context.parsed.y.toLocaleString('id-ID')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    position: 'right',
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
    showChart('usdtPriceChart');
}

// Function to show chart after data is loaded
function showChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (canvas) {
        const loadingIndicator = canvas.parentElement.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        canvas.classList.add('loaded');
    }
}

// Function to update chart data
async function updateChartData() {
    try {
        const response = await fetchWithProxy(`https://api.coingecko.com/api/v3/coins/arweave/market_chart?vs_currency=usd&days=${currentInterval}`);
        if (priceChart && response.prices) {
            const prices = response.prices;
            const labels = prices.map(price => {
                const date = new Date(price[0]);
                if (currentInterval === 1) {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (currentInterval <= 7) {
                    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
            });

            priceChart.data.labels = labels;
            priceChart.data.datasets[0].data = prices.map(price => price[1]);
            priceChart.update('none');
            showChart('priceChart');
        }
    } catch (error) {
        console.error('Error updating AR chart data:', error);
    }
}

// Function to update Solana chart data
async function updateSolChartData() {
    try {
        const response = await fetchWithProxy(`https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${solCurrentInterval}`);
        if (solPriceChart && response.prices) {
            const prices = response.prices;
            const labels = prices.map(price => {
                const date = new Date(price[0]);
                if (solCurrentInterval === 1) {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (solCurrentInterval <= 7) {
                    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
            });

            solPriceChart.data.labels = labels;
            solPriceChart.data.datasets[0].data = prices.map(price => price[1]);
            solPriceChart.update('none');
            showChart('solPriceChart');
        }
    } catch (error) {
        console.error('Error updating SOL chart data:', error);
    }
}

// Function to update USDT chart data
async function updateUsdtChartData() {
    try {
        const response = await fetchWithProxy(`https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=idr&days=${usdtCurrentInterval}`);
        if (usdtPriceChart && response.prices) {
            const prices = response.prices;
            const labels = prices.map(price => {
                const date = new Date(price[0]);
                if (usdtCurrentInterval === 1) {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (usdtCurrentInterval <= 7) {
                    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
            });

            usdtPriceChart.data.labels = labels;
            usdtPriceChart.data.datasets[0].data = prices.map(price => price[1]);
            usdtPriceChart.update('none');
            showChart('usdtPriceChart');
        }
    } catch (error) {
        console.error('Error updating USDT chart data:', error);
    }
}

// Function to initialize data and charts
async function initializeData() {
    try {
        // Fetch initial price data
        const [arData, solData, usdtData] = await Promise.all([
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'),
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'),
            fetchWithProxy('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        ]);

        const priceData = {
            arweave: arData.arweave,
            solana: solData.solana,
            tether: usdtData.tether
        };

        // Update UI with initial price data
        updateUI(priceData);

        // Initialize and populate charts
        initializeCharts();

        // Fetch initial chart data
        const [arChart, solChart, usdtChart] = await Promise.all([
            fetchWithProxy(`https://api.coingecko.com/api/v3/coins/arweave/market_chart?vs_currency=usd&days=${currentInterval}`),
            fetchWithProxy(`https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${solCurrentInterval}`),
            fetchWithProxy(`https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=idr&days=${usdtCurrentInterval}`)
        ]);

        // Update charts with initial data
        if (priceChart && arChart.prices) {
            updateChartWithData(priceChart, arChart.prices, currentInterval);
        }
        if (solPriceChart && solChart.prices) {
            updateChartWithData(solPriceChart, solChart.prices, solCurrentInterval);
        }
        if (usdtPriceChart && usdtChart.prices) {
            updateChartWithData(usdtPriceChart, usdtChart.prices, usdtCurrentInterval);
        }

        // Set up refresh intervals
        setInterval(updatePriceData, 3000);
        setInterval(updateAllChartData, 30000);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Helper function to update chart with data
function updateChartWithData(chart, prices, interval) {
    const labels = prices.map(price => {
        const date = new Date(price[0]);
        if (interval === 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (interval <= 7) {
            return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = prices.map(price => price[1]);
    chart.update('none');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start initialization immediately
    initializeData();
});

// Add interval button event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.interval-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const days = parseInt(button.dataset.days);
            currentInterval = days;
            document.querySelectorAll('.interval-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            await updateChartData();
        });
    });

    document.querySelectorAll('.sol-interval-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const days = parseInt(button.dataset.days);
            solCurrentInterval = days;
            document.querySelectorAll('.sol-interval-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            await updateSolChartData();
        });
    });

    document.querySelectorAll('.usdt-interval-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const days = parseInt(button.dataset.days);
            usdtCurrentInterval = days;
            document.querySelectorAll('.usdt-interval-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            await updateUsdtChartData();
        });
    });
});
