# Nhật ký thay đổi multi-quote

## 0.2.0 (2026-11-05)

Bản này tập trung vào **tốn ít token hơn**. Thêm vào đó là tìm tin gốc của một quote, và khung Quotes dễ đọc hơn.

### Tốn ít token hơn

- **Mỗi lần `/quote` từ khoảng 150 còn khoảng 55 token** (đo trên phiên thật). Mỗi lần gõ một lệnh `/…`, Claude Code ghi vào cuộc trò chuyện một mẩu giấy nhắn mà Claude đọc ở lượt sau. Với các lệnh `/quote…`, mod giờ bỏ câu ghi chú dài và rút dòng lệnh còn `/quote`. Các lệnh khác vẫn được ghi đầy đủ.
- **Tin gửi cho Claude ngắn hơn.** Câu mở đầu chỉ còn `Feedback:`, quote đánh số `1. > …`, comment là dòng `- …` ngay dưới quote, lời nhắn chung là `Overall: …`. Bỏ các nhãn `Quote N:`, `Comment:` và `(no comment)`.
- **Kết quả:** một lần gửi 2 quote từ khoảng 390 còn khoảng 200 token.

Trước:

```
Please review the following feedback on your earlier replies.

Quote 1:
> Use a singleton for database connections.

Comments:
1. Do not use a singleton.
2. Explain how the pool is sized.
```

Sau:

```
Feedback:

1. > Use a singleton for database connections.
   - Do not use a singleton.
   - Explain how the pool is sized.
```

### Tìm tin gốc của một quote

- Bấm vào đoạn trích của quote đang mở thì khung chat cuộn tới câu trả lời chứa nó.
- **Mod tìm tin bằng mã tin** khi nơi bôi đen có báo mã (terminal toàn màn hình). **Nếu không có mã**, mod tìm bằng nội dung chữ trong các câu trả lời của Claude đã hiện trong phiên, nên quote gõ tay hay lấy bằng `/quote-last` cũng tìm được.
- **Trên VS Code, Claude Code không cho mod cuộn khung chat.** Bấm vào đoạn trích sẽ hiện `Couldn't go to the message: transcript not scrollable here`.

### Giao diện

- Các comment trong khung Quotes cách nhau một dòng trống.

### Tài liệu

- `docs/usage.md` có thêm mục **Token** với bảng số đo trước và sau.
- `docs/privacy.md` liệt kê thêm ba việc mới của mod:
  - cuộn khung chat;
  - đọc chữ các câu trả lời, chỉ giữ trong bộ nhớ của phiên;
  - sửa mẩu giấy nhắn của chính các lệnh `/quote…`.
- `docs/examples.md` và ví dụ trong `docs/usage.md` theo định dạng tin mới. Cả ba tin mẫu đã được kiểm tra khớp từng ký tự với mod.

### Nâng cấp

```bash
claude plugin update multi-quote@claude-mods
```

Sau đó gõ `/reload-plugins` trong phiên đang mở, hoặc mở phiên mới. Các quote đang có trong khung không bị mất khi nâng cấp.

### Vấn đề đã biết

- Trong khung hẹp ở VS Code, phần bên phải có thể bị cắt, làm nút **✕** cạnh comment và **+ Last reply** bị khuất.
- Mod vừa nạp lại thì chưa nhớ các câu trả lời cũ trong phiên, nên tìm tin gốc của những câu đó có thể báo `Couldn't find…`.
- Nếu một plugin khác chạy trước mod và cho mẩu giấy nhắn đi qua mà không qua mod, mẩu đó được lưu nguyên, không thu gọn.

## 0.1.0 (2026-11-05)

Bản đầu tiên.

- Bôi đen chữ trong câu trả lời của Claude rồi gõ `/quote` để thêm quote. Hoặc `/quote <chữ>`, `/quote-last`.
- Khung **Quotes**: mỗi lúc mở một quote, viết nhiều comment cho mỗi quote, sửa, xoá, sắp xếp qua menu **⋯**, thêm lời nhắn chung.
- Gửi tất cả cho Claude trong một tin bằng **Send to Claude** hoặc `/quote-send`. Tin đi như prompt của bạn, trong cùng phiên.
- Mod không gửi gì ra ngoài: chỉ tin bạn bấm gửi mới tới Claude.
