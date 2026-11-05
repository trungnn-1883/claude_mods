# Cài đặt multi-quote

Mục lục: [Yêu cầu](#yêu-cầu) · [Cài từ GitHub](#cài-từ-github) · [Cài từ thư mục local](#cài-từ-thư-mục-local-để-phát-triển) · [Cập nhật](#cập-nhật) · [Gỡ cài đặt](#gỡ-cài-đặt) · [Kiểm tra](#kiểm-tra-mod)

## Yêu cầu

- Claude Code hỗ trợ mod dạng function hook. Mod được viết và test trên bản **2.1.314**. Nếu máy dùng bản cũ hơn, chạy `claude update`.
- Nếu cài từ GitHub: có `git` trên máy. Repo `trungnn-1883/claude_mods` là public, không cần tài khoản GitHub hay quyền gì thêm.

## Cài từ GitHub

Trong Claude Code:

```
/plugin install multi-quote --marketplace trungnn-1883/claude_mods
```

Hoặc từ shell:

```
claude plugin install multi-quote --marketplace trungnn-1883/claude_mods
```

Lần đầu cài, Claude Code hỏi `Add marketplace?` kèm nguồn `github:trungnn-1883/claude_mods`: trả lời `y`, rồi chọn phạm vi cài (mặc định là user, tức mọi phiên của bạn). Trong ứng dụng desktop, nơi `/plugin` không chạy: bấm **+** cạnh ô prompt → **Plugins** → **Add marketplace** với `trungnn-1883/claude_mods` → **Add plugin**.

Không cần đăng ký hay đẩy lên chợ ứng dụng nào. "Marketplace" trong Claude Code chỉ là file danh mục `.claude-plugin/marketplace.json` nằm sẵn trong repo này (tên `claude-mods`, chứa plugin `multi-quote` ở thư mục `./multi-quote`). Khi bạn chạy lệnh cài, Claude Code clone repo, đọc file đó để tìm mod rồi cài. Nó không liên quan tới GitHub Marketplace.

## Cài từ thư mục local (để phát triển)

Clone repo về máy, rồi chọn một trong hai cách.

**Cách 1: chạy thẳng một session với plugin**

```bash
claude --plugin-dir <đường-dẫn>/multi-quote
```

Chỉ session này có mod.

**Cách 2: thêm thư mục repo làm marketplace**

```bash
claude plugin marketplace add <thư-mục-repo>
claude plugin install multi-quote@claude-mods --scope user
```

`<thư-mục-repo>` là thư mục gốc của repo đã clone (thư mục chứa `.claude-plugin/marketplace.json`).

Sau khi sửa code trong thư mục này, thay đổi có hiệu lực ở session kế tiếp, hoặc chạy `/reload-plugins` để nạp lại ngay.

## Cập nhật

Với bản cài từ GitHub: Claude Code chạy bản sao tạo lúc cài, nên thay đổi mới trên repo chỉ tới máy bạn khi cập nhật:

```bash
claude plugin update multi-quote@claude-mods
```

rồi chạy `/reload-plugins` trong session đang mở (hoặc mở session mới).

Với bản local (Cách 2 ở trên): Claude Code đọc thẳng từ thư mục repo, nên chỉ cần `git pull` rồi `/reload-plugins`.

## Gỡ cài đặt

```bash
claude plugin uninstall multi-quote@claude-mods
```

Nếu bạn đã thêm marketplace dưới tên khác, thay `claude-mods` bằng tên đó.

## Kiểm tra mod

```bash
claude plugin validate <đường-dẫn>/multi-quote
claude plugin test <đường-dẫn>/multi-quote
```

`validate` kiểm tra manifest và cấu trúc plugin. `test` chạy 11 test trong `hooks/register.test.tsx`.

Cài xong, gõ `/quotes` trong Claude Code. Nếu thấy pane **Quotes** mở ra (hoặc dòng "Quote composer opened.") thì mod đã chạy. Cách dùng: [usage.md](usage.md).
