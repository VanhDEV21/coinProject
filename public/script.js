window.onload = function() {
    fetchCoinData();  // Gọi lần đầu khi tải trang
    setInterval(fetchCoinData, 300000);  // Gọi lại mỗi 5 phút (300000 ms)
};

// Hàm lấy dữ liệu từ API và hiển thị trên bảng
function fetchCoinData() {
    fetch('https://coinproject-2.onrender.com/api/coins/list') // Đảm bảo URL đúng
        .then(response => response.json())
        .then(data => {
            const coinTable = document.getElementById('coinTable').getElementsByTagName('tbody')[0];
            coinTable.innerHTML = ''; // Xóa dữ liệu cũ trước khi thêm mới

            // Duyệt qua từng coin và thêm vào bảng
            data.forEach(coin => {
                const row = coinTable.insertRow();
                // Thêm các cột vào bảng
                row.insertCell(0).innerText = coin.nameCoin;
                row.insertCell(1).innerText = coin.currentPrice; // Giá của coin
                row.insertCell(2).innerHTML = getChangeIcon(coin.change_5min); // Change 5 phút
                row.insertCell(3).innerHTML = getChangeIcon(coin.change_1h); // Change 1 giờ
                row.insertCell(4).innerHTML = getChangeIcon(coin.change_24h); // Change 24 giờ
                row.insertCell(5).innerText = coin.Volume_24h.toFixed(2); // Volume 24 giờ
            });
        })
        .catch(error => console.error('Error fetching coin data:', error));
}

// Hàm lấy biểu tượng mũi tên và định dạng sự thay đổi
function getChangeIcon(change) {
    let colorClass = ''; // Class màu sắc mặc định
    let displayValue = '';

    // Đảm bảo luôn hiển thị '0.00%' khi dữ liệu không hợp lệ
    if (change === null || change === undefined || isNaN(change)) {
        change = "0.00";
    }

    const numericChange = parseFloat(change);

    // Xác định class màu dựa trên giá trị change
    if (numericChange > 0) {
        colorClass = 'change-up'; // Class cho tăng giá (màu xanh)
        displayValue = `<span class="${colorClass}">↑ ${numericChange}%</span>`;
    } else if (numericChange < 0) {
        colorClass = 'change-down'; // Class cho giảm giá (màu đỏ)
        displayValue = `<span class="${colorClass}">↓ ${numericChange}%</span>`;
    } else {
        colorClass = 'change-neutral'; // Class cho không đổi (màu vàng)
        displayValue = `<span class="${colorClass}">↔ ${numericChange}%</span>`;
    }

    return displayValue;
}


