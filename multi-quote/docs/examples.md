# Ví dụ dùng multi-quote

Ba tình huống thường gặp. Mỗi ví dụ có các bước làm và đúng nguyên văn tin nhắn mod gửi cho Claude. Phần chữ cố định (`Please review…`, `Quote N:`, `Comment:`) luôn là tiếng Anh vì mod dựng như vậy; quote và comment giữ nguyên chữ bạn viết.

Mục lục: [Góp ý một bản đề xuất](#1-góp-ý-một-bản-đề-xuất-thiết-kế) · [Hỏi lại nhiều chỗ](#2-hỏi-lại-nhiều-chỗ-trong-một-câu-trả-lời) · [Không chọn được text](#3-không-chọn-được-text)

## 1. Góp ý một bản đề xuất thiết kế

Claude vừa đề xuất kiến trúc cho một service, trong đó có ba điểm bạn muốn sửa.

1. Bôi đen câu *"Use a singleton for database connections."* rồi gõ `/quote`. Quote 1 xuất hiện, ô comment đã sẵn: gõ `Không dùng singleton, mình cần nhiều kết nối DB.` rồi Enter.
2. Bôi đen *"Authentication should be handled by middleware."*, gõ `/quote`, comment `Giải thích rủi ro bảo mật của cách này.`, Enter.
3. Bôi đen *"Retry failed requests automatically."*, gõ `/quote`, comment `Thêm exponential backoff.`, Enter.
4. Bấm **+ Overall instruction (optional)**, gõ `Trả lời từng góp ý rồi sửa lại bản thiết kế.`, Enter.
5. Bấm **Send to Claude (3)**.

Claude nhận được:

```
Please review the following feedback on your earlier replies.

Quote 1:
> Use a singleton for database connections.

Comment:
Không dùng singleton, mình cần nhiều kết nối DB.

Quote 2:
> Authentication should be handled by middleware.

Comment:
Giải thích rủi ro bảo mật của cách này.

Quote 3:
> Retry failed requests automatically.

Comment:
Thêm exponential backoff.

Overall instruction:
Trả lời từng góp ý rồi sửa lại bản thiết kế.
```

## 2. Hỏi lại nhiều chỗ trong một câu trả lời

Một câu trả lời dài có hai đoạn bạn chưa hiểu; đoạn thứ nhất bạn có hai câu hỏi.

1. Bôi đen đoạn *"Cache invalidation runs on every write."*, gõ `/quote`, comment `Ghi nhiều thì có chậm không?`, Enter.
2. Vẫn ở quote đó, bấm **+ Add comment**, gõ `Có cách nào gom lại theo lô không?`, Enter. Dòng quote giờ hiện `💬 2`.
3. Bôi đen đoạn thứ hai, gõ `/quote`, và để trống comment (bấm sang chỗ khác). Quote không có comment vẫn được gửi.
4. Gõ `/quote-send` thay vì bấm nút.

Claude nhận được:

```
Please review the following feedback on your earlier replies.

Quote 1:
> Cache invalidation runs on every write.

Comments:
1. Ghi nhiều thì có chậm không?
2. Có cách nào gom lại theo lô không?

Quote 2:
> The queue is drained by a single worker.

Comment:
(no comment)
```

Không có overall instruction nên không có khối `Overall instruction:` ở cuối.

## 3. Không chọn được text

Khi `/quote` báo `Nothing selected…` (nơi engine không báo phần text đang chọn), có hai cách:

**Gõ thẳng đoạn cần quote**

```
/quote Use a singleton for database connections.
```

**Lấy cả câu trả lời rồi cắt bớt**

1. Gõ `/quote-last` (hoặc bấm **+ Last reply** trong khung). Toàn bộ câu trả lời mới nhất thành một quote.
2. Ở quote đó, chọn **⋯ → Edit quote**, xoá hết, chỉ giữ câu bạn muốn, Enter.
3. Viết comment như bình thường.

Gửi kèm lời nhắn chung ngay trong lệnh gửi, không cần mở ô trong khung:

```
/quote-send Sửa tất cả các điểm trên rồi chạy lại test.
```

Lời nhắn này dùng thay cho ô *Overall instruction* trong khung và ra ở cuối tin nhắn:

```
Overall instruction:
Sửa tất cả các điểm trên rồi chạy lại test.
```
