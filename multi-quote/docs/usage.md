# Cách dùng multi-quote

Mục lục: [Command](#command) · [Quy trình](#quy-trình-làm-việc) · [Tin nhắn gửi cho Claude](#tin-nhắn-gửi-cho-claude) · [Giới hạn](#giới-hạn)

Giao diện pane Quotes: xem [interface.md](interface.md).

## Command

| Command | Làm gì | Thông báo |
| --- | --- | --- |
| `/quote` | Thêm đoạn text đang được chọn thành quote | `Quote added.` |
| `/quote <text>` | Thêm đúng đoạn `<text>` bạn gõ thành quote | `Quote added.` |
| `/quote-last` | Thêm toàn bộ câu trả lời text gần nhất của Claude làm quote, để bạn cắt bớt bằng **Edit quote** | `Latest reply added as a quote.` |
| `/quotes` | Mở pane Quotes | `Quote composer opened.` |
| `/quote-send [instruction]` | Gửi mọi quote và comment cho Claude. Có `instruction` thì dùng nó làm overall instruction, thay cho ô instruction trong pane | `Quotes sent to Claude.` |
| `/quote-clear` | Xóa mọi quote, comment và overall instruction | `Quotes cleared.` |

Các trường hợp không thêm được (mod trả về lý do, không thêm quote):

| Tình huống | Thông báo |
| --- | --- |
| `/quote` mà không có text nào được chọn | `Nothing selected. Select text in a reply first, or type /quote followed by the text, or use /quote-last.` |
| Đoạn vừa quote trùng với quote mới nhất (bấm hai lần trên cùng một selection) | `That passage is already the latest quote.` |
| `/quote-last` khi Claude chưa trả lời bằng text | `Claude has not replied with text yet.` |
| `/quote-send` khi chưa có quote | `No quotes to send.` |
| Gửi bị chặn | `Not sent: <lý do>` (quote được giữ nguyên) |

Text quote được cắt khoảng trắng đầu cuối trước khi lưu.

## Quy trình làm việc

1. Chọn text trong câu trả lời của Claude bằng chuột, rồi gõ `/quote`. Hoặc gõ `/quote <text>`, hoặc `/quote-last`.
2. Mỗi quote mới tự mở ra, ô comment đầu tiên đã focus. Gõ comment, Enter để lưu.
3. Thêm quote khác theo cùng cách. Quote được đánh số 1, 2, 3... theo thứ tự thêm. Dùng **Move up / Move down** để đổi thứ tự (số được đánh lại).
4. Tùy chọn: viết một overall instruction áp dụng cho mọi quote.
5. Gửi bằng **Send to Claude** hoặc `/quote-send`.

Pane tự mở khi bạn thêm quote (nếu terminal đủ rộng, xem [Giới hạn](#giới-hạn)). Muốn mở thủ công: `/quotes`. Mọi command chạy được kể cả khi pane không hiện.

## Tin nhắn gửi cho Claude

Tin nhắn được gửi như prompt kế tiếp của chính bạn, trong cùng session, nên Claude giữ nguyên ngữ cảnh cuộc trò chuyện. Gửi xong, composer được làm trống (quote, comment, instruction đều bị xóa). Nếu gửi bị chặn thì không xóa gì.

Ví dụ, hai quote, quote 1 có hai comment, quote 2 chưa có comment, kèm overall instruction:

```
Please review the following feedback on your earlier replies.

Quote 1:
> Use a singleton for database connections.

Comments:
1. Do not use a singleton. We need multiple database connections.
2. Explain how the pool is sized.

Quote 2:
> Cache every response for an hour.

Comment:
(no comment)

Overall instruction:
Address every comment individually and update the implementation.
```

Quy tắc dựng nội dung:

| Trường hợp | Kết quả |
| --- | --- |
| Quote có đúng một comment | `Comment:` rồi comment |
| Quote có nhiều comment | `Comments:` rồi đánh số `1.`, `2.`... |
| Quote không có comment (hoặc toàn comment trống) | `Comment:` rồi `(no comment)` |
| Có overall instruction (sau khi bỏ khoảng trắng) | Thêm khối `Overall instruction:` ở cuối |
| Không có overall instruction | Không có khối đó |
| Quote nhiều dòng | Mỗi dòng bắt đầu bằng `> ` |

Phần chữ cố định (`Please review...`, `Quote N:`, `Comment:`) luôn bằng tiếng Anh, vì code dựng như vậy.

## Giới hạn

- **Đọc text đang chọn:** mod dùng `$.ui.selection()` của engine. Cách này chạy trong panel VS Code và trong terminal fullscreen, khi bạn gõ `/quote` lúc text vẫn đang được chọn. Nơi nào engine không báo selection thì `/quote` trả về thông báo `Nothing selected...` ở trên; dùng `/quote <text>` hoặc `/quote-last`.
- **Không có nút "Add selection" trong pane:** trong VS Code, bấm nút làm mất selection nên nút không đọc được text đã chọn. Vì vậy chỉ có `/quote`.
- **Selection trải qua nhiều dòng (row) không có response id.** Engine báo như vậy; text vẫn được quote bình thường.
- **Quote chỉ tồn tại trong session.** Không lưu sang session khác.
- **Mobile không có ô nhập text và menu:** xem danh sách, mở quote, đổi thứ tự (↑ ↓), xóa, gửi được; không viết hay sửa comment, không sửa text quote được.
- **Pane tự mở chỉ khi terminal đủ rộng:** từ 144 cột trở lên, hoặc từ 110 cột trở lên khi bạn đã chủ động mở. Terminal hẹp hơn thì dùng `/quotes`.
- **VS Code:** các nút là native button, được vẽ nền xanh đặc. Mod không đổi được màu này.
