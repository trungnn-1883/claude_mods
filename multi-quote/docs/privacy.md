# Dữ liệu và quyền riêng tư

Tóm tắt: **mod không gửi gì ra khỏi máy và không gửi cho bên thứ ba.** Thứ duy nhất đi ra ngoài là tin nhắn bạn chủ động gửi bằng **Send to Claude**, và nó đi đúng đường của mọi prompt bạn tự gõ trong Claude Code.

## Mod làm gì với dữ liệu

Đây là toàn bộ những gì mod gọi tới Claude Code, theo `claude plugin validate`:

| Mod gọi | Để làm gì | Ra khỏi máy? |
| --- | --- | --- |
| `$.ui.selection` | Đọc đoạn bạn đang bôi đen | Không |
| `$.ui.open`, `$.ui.resolve`, `$.ui.toast` | Mở và vẽ khung Quotes, hiện thông báo | Không |
| `$.state` | Giữ quote, comment, lời nhắn chung trong phiên đang mở | Không |
| `$.session.id` | Lấy mã phiên để gắn vào quote | Không |
| `$.session.messages` | Đọc câu trả lời mới nhất cho `/quote-last` và **+ Last reply** | Không |
| `$.command.register` | Đăng ký các lệnh `/quote…` | Không |
| Sự kiện `session.append` | Thấy từng dòng sắp lưu vào cuộc trò chuyện; **chỉ sửa** mẩu giấy nhắn của chính các lệnh `/quote…` cho ngắn lại, mọi dòng khác đi qua nguyên vẹn | Không |
| `$.prompt.submit` | Gửi tin nhắn khi bạn bấm **Send to Claude** hoặc gõ `/quote-send` | Có, xem bên dưới |

Mod **không**:

- dùng mạng (không có `fetch` hay lời gọi mạng nào),
- đọc hay ghi file trên máy,
- chạy lệnh shell,
- gọi model riêng (không tốn thêm lượt gọi Claude ngầm),
- đọc mã nguồn dự án của bạn,
- lưu gì sang phiên sau: quote chỉ nằm trong bộ nhớ của phiên đang mở.

## Thứ duy nhất ra khỏi máy

Khi bạn gửi, mod ghép các quote và comment thành một tin nhắn (định dạng ở [usage.md](usage.md#tin-nhắn-gửi-cho-claude)) và đưa vào ô prompt như chính bạn gõ. Claude Code gửi nó tới Claude (Anthropic) giống mọi tin nhắn khác trong cuộc trò chuyện. Mod không mở thêm đường nào.

Vì vậy, đừng quote hay viết vào comment những gì bạn không muốn gửi cho Claude: mật khẩu, key, dữ liệu cá nhân.

## Những thứ không do mod làm

- **Repo GitHub `claude_mods`** chỉ chứa mã của mod và tài liệu này, không chứa dự án nào của bạn. Repo để public: ai cũng đọc được mã của mod và tự kiểm tra những gì tài liệu này nói.
- **Thống kê sử dụng của Claude Code:** Claude Code có thể tự gửi số liệu sử dụng theo cài đặt của bạn. Phần này là của Claude Code; mod không có hook nào đọc hay gửi thống kê.

## Tự kiểm tra

Bạn không cần tin lời tài liệu này. Chạy:

```bash
claude plugin validate <đường-dẫn>/multi-quote
```

Dòng `calls:` liệt kê mọi lời gọi mà mod dùng; nếu mod có dùng mạng, file hay chạy lệnh, chúng sẽ hiện ở đây. Hoặc tìm thẳng trong mã:

```bash
grep -rnE 'fetch\(|\$\.(net|http|fs|process|store|model|tool)\b' <đường-dẫn>/multi-quote/hooks
```

Không có kết quả nghĩa là mod không gọi mạng, file, tiến trình, kho lưu lâu dài hay model nào.
