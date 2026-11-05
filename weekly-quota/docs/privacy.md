# Dữ liệu và quyền riêng tư

Tóm tắt: **mod không gửi gì ra khỏi máy và không gửi cho bên thứ ba.** Nó chỉ đọc con số quota mà Claude Code đã có sẵn, rồi viết lên thanh trạng thái.

## Mod làm gì với dữ liệu

Đây là toàn bộ những gì mod gọi tới Claude Code, theo `claude plugin validate`:

| Mod gọi | Để làm gì | Ra khỏi máy? |
| --- | --- | --- |
| `$.session.usage` | Đọc quota tuần và quota 5 giờ lúc mở phiên | Không |
| `session.measure` (sự kiện) | Nhận số quota mới mỗi khi Claude Code đo lại | Không |
| `$.ui.status` | Viết dòng chữ lên thanh trạng thái | Không |
| `$.clock.now`, `$.clock.every` | Tính giờ đến lúc reset, cho mèo chuyển động | Không |
| `$.store` | Nhớ bạn đã bật hay tắt mèo (một giá trị đúng/sai) | Không |
| `$.command.register` | Đăng ký lệnh `/cat` | Không |

Mod **không**:

- dùng mạng (không có `fetch` hay lời gọi mạng nào),
- đọc hay ghi file của bạn,
- chạy lệnh shell,
- gọi Claude hay model nào (không tốn token),
- đọc cuộc trò chuyện hay mã nguồn của bạn,
- gửi số liệu quota đi đâu.

## Mod lưu gì trên máy

Chỉ một giá trị: mèo đang bật hay tắt. Claude Code giữ nó trong một file JSON riêng của mod, trong thư mục cấu hình Claude Code của bạn, để lần sau mở phiên vẫn nhớ. Ngoài ra không lưu gì, kể cả số liệu quota.

## Số liệu quota từ đâu

Claude Code tự nhận số liệu quota từ Anthropic trong lúc làm việc bình thường, dù có mod hay không. Mod chỉ đọc lại con số đó. Mod không gửi thêm yêu cầu nào tới Anthropic hay ai khác.

## Những thứ không do mod làm

- **Repo GitHub `claude_mods`** chỉ chứa mã của mod và tài liệu này. Repo để public: ai cũng đọc được mã để tự kiểm tra những gì tài liệu này nói.
- **Thống kê sử dụng của Claude Code:** Claude Code có thể tự gửi số liệu sử dụng theo cài đặt của bạn. Phần này là của Claude Code; mod không có hook nào đọc hay gửi thống kê.

## Tự kiểm tra

```bash
claude plugin validate <đường-dẫn>/weekly-quota
```

Dòng `calls:` liệt kê mọi lời gọi mà mod dùng; nếu mod có dùng mạng, file hay chạy lệnh, chúng sẽ hiện ở đây. Hoặc tìm thẳng trong mã:

```bash
grep -rnE 'fetch\(|\$\.(net|http|fs|process|model|tool)\b' <đường-dẫn>/weekly-quota/hooks
```

Không có kết quả nghĩa là mod không gọi mạng, file, tiến trình hay model nào.
