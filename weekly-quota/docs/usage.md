# Cách dùng weekly-quota

Mod tự chạy, gần như không cần làm gì. Cách đọc thanh trạng thái và các hoạt động của mèo: xem [interface.md](interface.md).

## Lệnh

| Lệnh | Làm gì | Thông báo |
| --- | --- | --- |
| `/cat` | Tắt mèo nếu đang bật, bật nếu đang tắt. Quota vẫn hiện | `Mèo đã nghỉ.` khi tắt, `Mèo chạy lại rồi.` khi bật |

Lựa chọn bật hay tắt được lưu trên máy bạn và giữ cho mọi phiên sau. Mặc định là bật.

## Số liệu cập nhật khi nào

- **Lúc mở phiên:** mod hỏi Claude Code số liệu quota hiện tại và hiện ngay.
- **Mỗi khi Claude Code đo lại mức dùng**, thường là sau mỗi lần Claude trả lời: mod lấy số mới và vẽ lại.
- **Giữa hai lần đo,** số phần trăm và số giờ đến lúc reset đứng yên. Chỉ có mèo chuyển động, khoảng ba lần mỗi giây.

Mod không tự đi hỏi máy chủ của Anthropic. Nó chỉ đọc con số Claude Code đã có sẵn.

## Khi nào không hiện gì

| Tình huống | Thanh trạng thái hiện |
| --- | --- |
| Có cả quota tuần và quota 5 giờ | `Tuần: …  │  Giờ: …` và mèo |
| Chỉ có một trong hai | Phần còn lại là `--`, ví dụ `Tuần: 66% còn lại, reset in 64.7h │ Giờ: --` |
| Không có quota nào: dùng API key, hoặc Claude Code chưa nhận được số liệu | Không hiện gì, cả mèo cũng ẩn |
| Một khung không có giờ reset | Bỏ phần `, reset in …h` của khung đó |

## Ví dụ

| Thanh trạng thái | Nghĩa là |
| --- | --- |
| `Tuần: 66% còn lại, reset in 64.7h │ Giờ: 92% còn lại, reset in 4.5h` | Còn 66% quota tuần, khoảng 2 ngày 17 giờ nữa reset. Khung 5 giờ còn 92%, 4 giờ rưỡi nữa reset |
| `Tuần: 3% còn lại, reset in 20.0h │ Giờ: 0% còn lại, reset in 0.8h` | Sắp hết quota tuần. Khung 5 giờ đã hết, khoảng 48 phút nữa mới dùng tiếp được |
| `Tuần: -- │ Giờ: 40% còn lại, reset in 2.1h` | Claude Code chưa báo quota tuần, chỉ có khung 5 giờ |

## Giới hạn

- **Phần trăm làm tròn một chữ số thập phân,** và không xuống dưới 0.
- **Giờ reset tính bằng giờ có một chữ số thập phân:** `4.5h` là 4 giờ 30 phút.
- **Chữ cố định chưa đổi ngôn ngữ được:** `Tuần`, `Giờ`, `còn lại` là tiếng Việt, `reset in` là tiếng Anh, vì mã viết như vậy.
