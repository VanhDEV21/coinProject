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
    if (change === null || change === undefined) {
        return '<span class="arrow-neutral">↔</span>'; // Biểu tượng mũi tên ngang cho dữ liệu không thay đổi
    }

    if (change > 0) {
        return `<span class="arrow-up">↑</span> ${change}%`; // Mũi tên lên cho sự thay đổi tích cực
    } else if (change < 0) {
        return `<span class="arrow-down">↓</span> ${change}%`; // Mũi tên xuống cho sự thay đổi tiêu cực
    } else {
        return '<span class="arrow-neutral">↔</span>'; // Biểu tượng mũi tên ngang cho sự thay đổi bằng 0
    }
}
