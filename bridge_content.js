// bridge_content.js
console.log("Bridge content script đã được kích hoạt trên localhost!");

// Lắng nghe thông điệp gửi từ trang giao diện chính (Main World)
window.addEventListener("message", (event) => {
  // Chỉ chấp nhận các thông điệp xuất phát từ chính cửa sổ hiện tại
  if (event.source !== window) return;

  const message = event.data;
  if (!message || typeof message !== "object") return;

  // Nếu là yêu cầu lưu dữ liệu, tiến hành ghi vào Chrome Storage thật của trình duyệt
  if (message.type === "FROM_PAGE_SET_STORAGE") {
    chrome.storage.local.set(message.data, () => {
      console.log("Bridge đã đồng bộ dữ liệu vào Chrome Storage thành công:", Object.keys(message.data));
    });
  } 
  // Nếu là yêu cầu xóa dữ liệu
  else if (message.type === "FROM_PAGE_REMOVE_STORAGE") {
    chrome.storage.local.remove(message.keys, () => {
      console.log("Bridge đã xóa dữ liệu khỏi Chrome Storage:", message.keys);
    });
  }
});

// Đồng bộ ngược lại từ máy chủ Python vào Chrome Storage khi trang vừa tải xong để đảm bảo không mất dữ liệu
function syncFromServerOnLoad() {
  fetch('/api/storage_get', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ keys: ["last_captcha_image"] })
  })
  .then(r => r.json())
  .then(data => {
    if (data && data.last_captcha_image) {
      chrome.storage.local.set({ last_captcha_image: data.last_captcha_image }, () => {
        console.log("Bridge đã đồng bộ sẵn ảnh captcha từ máy chủ Python vào Chrome Storage.");
      });
    }
  })
  .catch(err => console.error("Lỗi đồng bộ ban đầu từ máy chủ Python:", err));
}

syncFromServerOnLoad();
