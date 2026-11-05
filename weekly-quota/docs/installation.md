# Cài đặt weekly-quota

Mục lục: [Yêu cầu](#yêu-cầu) · [Cài từ GitHub](#cài-từ-github) · [Cài từ thư mục local](#cài-từ-thư-mục-local-để-phát-triển) · [Cập nhật](#cập-nhật) · [Gỡ cài đặt](#gỡ-cài-đặt) · [Kiểm tra](#kiểm-tra-mod)

## Yêu cầu

- Claude Code hỗ trợ mod dạng function hook. Nếu máy dùng bản cũ, chạy `claude update`.
- Đăng nhập Claude Code bằng gói thuê bao (Pro, Max, Team…). Quota tuần và quota 5 giờ chỉ có với gói thuê bao; dùng API key thì Claude Code không có số liệu này và thanh trạng thái để trống.
- Nếu cài từ GitHub: có `git` trên máy. Repo `trungnn-1883/claude_mods` là public, không cần tài khoản GitHub hay quyền gì thêm.

## Cài từ GitHub

Trong Claude Code:

```
/plugin install weekly-quota --marketplace trungnn-1883/claude_mods
```

Hoặc từ shell:

```
claude plugin install weekly-quota --marketplace trungnn-1883/claude_mods
```

Lần đầu cài, Claude Code hỏi `Add marketplace?` kèm nguồn `github:trungnn-1883/claude_mods`: trả lời `y`, rồi chọn phạm vi cài (mặc định là user, tức mọi phiên của bạn). Trong ứng dụng desktop, nơi `/plugin` không chạy: bấm **+** cạnh ô prompt → **Plugins** → **Add marketplace** với `trungnn-1883/claude_mods` → **Add plugin**.

Không cần đăng ký hay đẩy lên chợ ứng dụng nào. "Marketplace" trong Claude Code chỉ là file danh mục `.claude-plugin/marketplace.json` nằm sẵn trong repo (tên `claude-mods`). Đã thêm marketplace này khi cài `multi-quote` thì lần này không bị hỏi lại.

## Cài từ thư mục local (để phát triển)

Clone repo về máy, rồi chọn một trong hai cách.

**Cách 1: chạy thẳng một session với plugin**

```bash
claude --plugin-dir <đường-dẫn>/weekly-quota
```

Chỉ session này có mod.

**Cách 2: thêm thư mục repo làm marketplace**

```bash
claude plugin marketplace add <thư-mục-repo>
claude plugin install weekly-quota@claude-mods --scope user
```

`<thư-mục-repo>` là thư mục gốc của repo đã clone (thư mục chứa `.claude-plugin/marketplace.json`). Sau khi sửa code, thay đổi có hiệu lực ở session kế tiếp, hoặc chạy `/reload-plugins` để nạp lại ngay.

## Cập nhật

Với bản cài từ GitHub: Claude Code chạy bản sao tạo lúc cài, nên thay đổi mới trên repo chỉ tới máy bạn khi cập nhật:

```bash
claude plugin update weekly-quota@claude-mods
```

rồi chạy `/reload-plugins` trong session đang mở (hoặc mở session mới).

Với bản local (Cách 2 ở trên): Claude Code đọc thẳng từ thư mục repo, nên chỉ cần `git pull` rồi `/reload-plugins`.

## Gỡ cài đặt

```bash
claude plugin uninstall weekly-quota@claude-mods
```

Nếu bạn đã thêm marketplace dưới tên khác, thay `claude-mods` bằng tên đó. Đừng cài cùng mod này từ hai marketplace một lúc: thanh trạng thái sẽ bị hai bản tranh nhau ghi.

## Kiểm tra mod

```bash
claude plugin validate <đường-dẫn>/weekly-quota
```

`validate` kiểm tra manifest và mã của mod, và liệt kê mọi lời gọi mà mod dùng. Mod này chưa có test tự động.

Cài xong, mở session mới: thấy dòng `Tuần: …` trên thanh trạng thái là mod đã chạy. Gõ `/cat` sẽ thấy `Mèo đã nghỉ.` hoặc `Mèo chạy lại rồi.`
