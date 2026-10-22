#!/bin/bash
# Map Studio — ตัวติดตั้งสำหรับนักเรียน (macOS, Apple Silicon หรือ Intel)
# วิธีรัน: เปิดแอป Terminal แล้ววางบรรทัดนี้
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/jaroensakyod/vdomaps/main/course/install-mac.sh)"
#
# ลง Xcode Command Line Tools, Homebrew, git, Node.js, ffmpeg, Claude Code → โหลดชุด vdomaps
# → สร้าง ~/maps/my-channel → npm install → เลือกโหมดการ์ดจอ → เรนเดอร์ภาพทดสอบ → เปิด .env ให้ใส่ Gemini API key
# รันซ้ำได้ ไม่ลบงานเดิม (ทดสอบ: MAPS_DIR=โฟลเดอร์อื่น, VDOMAPS_SRC=ชุด vdomaps ในเครื่องแทนการ clone)

ROOT="${MAPS_DIR:-$HOME/maps}"
PROJECT="$ROOT/my-channel"
KIT="$PROJECT/.vdomaps"
REPO="https://github.com/jaroensakyod/vdomaps"

step() { printf '\n\033[36m==> %s\033[0m\n' "$1"; }
ok() { printf '    \033[32mOK\033[0m  %s\n' "$1"; }
warn() { printf '    \033[33m!!\033[0m  %s\n' "$1"; }
has() { command -v "$1" >/dev/null 2>&1; }
brew_env() { for b in /opt/homebrew/bin/brew /usr/local/bin/brew; do [ -x "$b" ] && eval "$("$b" shellenv)" && return; done; }

step "1/7 ลง Xcode Command Line Tools"
if xcode-select -p >/dev/null 2>&1; then ok "มีแล้ว"
else
  xcode-select --install
  echo "    มีหน้าต่างเด้งขึ้นมา ให้กด Install แล้วรอจนเสร็จ (5-15 นาที)"
  until xcode-select -p >/dev/null 2>&1; do sleep 10; done
  ok "ลงแล้ว"
fi

step "2/7 ลง Homebrew, git, Node.js, ffmpeg"
brew_env
if ! has brew; then
  echo "    กำลังลง Homebrew — จะถามรหัสผ่านเครื่อง Mac (พิมพ์แล้วไม่ขึ้นตัวอักษร เป็นเรื่องปกติ) แล้วกด Enter"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew_env
  has brew || { warn "ลง Homebrew ไม่สำเร็จ — ส่งภาพหน้าจอนี้ให้ครู"; exit 1; }
  # ให้ Terminal หน้าต่างใหม่เจอ brew ด้วย
  grep -q 'brew shellenv' "$HOME/.zprofile" 2>/dev/null || echo "eval \"\$($(command -v brew) shellenv)\"" >> "$HOME/.zprofile"
fi
ok "Homebrew พร้อม"
for pkg in git node ffmpeg; do
  if has "$pkg"; then ok "$pkg มีแล้ว"; else echo "    กำลังลง $pkg ..."; brew install "$pkg" && ok "$pkg ลงแล้ว" || { warn "ลง $pkg ไม่สำเร็จ"; exit 1; }; fi
done
major=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
[ "$major" -ge 18 ] || { warn "Node $(node -v) เก่าเกินไป — รัน: brew upgrade node"; exit 1; }

step "3/7 ลง Claude Code"
export PATH="$HOME/.local/bin:$PATH"
if has claude; then ok "Claude Code มีแล้ว"
else
  curl -fsSL https://claude.ai/install.sh | bash
  if has claude; then ok "Claude Code ลงแล้ว"; else warn "ข้ามได้ ถ้าใช้แอป Claude Desktop (แท็บ Code) — โหลดที่ https://claude.ai/download"; fi
fi

step "4/7 โหลดชุด vdomaps ไปที่ $PROJECT แล้ว npm install (ครั้งแรก 2-5 นาที)"
mkdir -p "$PROJECT"
if [ -n "$VDOMAPS_SRC" ]; then KIT="$VDOMAPS_SRC"; ok "ใช้ชุดในเครื่อง $KIT"
elif [ -d "$KIT/.git" ]; then git -C "$KIT" pull --ff-only && ok "อัปเดตชุดล่าสุดแล้ว"
else git clone --depth 1 "$REPO" "$KIT" || { warn "โหลดไม่สำเร็จ — เช็กอินเทอร์เน็ตแล้วรันใหม่"; exit 1; }; ok "โหลดแล้ว"
fi
if [ ! -f "$PROJECT/package.json" ]; then cp -R "$KIT/skills/map-studio/template/." "$PROJECT/"; ok "สร้างโปรเจกต์จาก template แล้ว"
else ok "มีโปรเจกต์อยู่แล้ว (ไม่ทับงานเดิม)"; fi
[ -f "$PROJECT/CLAUDE.md" ] || cp "$KIT/course/CLAUDE.md" "$PROJECT/"
[ -f "$PROJECT/.env" ] || cp "$KIT/course/env.example" "$PROJECT/.env"
cd "$PROJECT" || exit 1
npm install --no-audit --no-fund || { warn "npm install ไม่ผ่าน — ส่งภาพหน้าจอนี้ให้ครู"; exit 1; }
ok "ลงแพ็กเกจแล้ว"

step "5/7 เลือกโหมดเรนเดอร์ (Mac ใช้ angle → Metal)"
echo "    ชิป: $(sysctl -n machdep.cpu.brand_string 2>/dev/null)"
chosen=""
for gl in angle swangle; do
  echo "    ลองโหมด $gl ... (ครั้งแรกจะโหลด Chrome สำหรับเรนเดอร์ก่อน)"
  start=$(date +%s)
  if npx remotion render MapTest out/gl-test.mp4 --frames=0-29 --gl=$gl --log=error >/dev/null 2>&1; then
    chosen=$gl; ok "$gl ใช้ได้ (ทดสอบ $(( $(date +%s) - start )) วินาที)"; break
  fi
  warn "$gl ใช้ไม่ได้บนเครื่องนี้"
done
if [ -n "$chosen" ]; then sed -i '' -E "s/setChromiumOpenGlRenderer\(\"[a-z]+\"\)/setChromiumOpenGlRenderer(\"$chosen\")/" remotion.config.ts
else sed -i '' '/setChromiumOpenGlRenderer/d' remotion.config.ts; warn "ใช้โหมดพื้นฐาน (ช้ากว่าแต่ใช้ได้)"; fi
rm -f out/gl-test.mp4

step "6/7 เรนเดอร์ภาพทดสอบ"
if npx remotion still MapTest out/test.png --frame=140 --log=error >/dev/null 2>&1; then ok "ได้ภาพ $PROJECT/out/test.png"; open out/test.png
else warn "เรนเดอร์ไม่ผ่าน — ไม่เป็นไร ในคลาสให้ Claude ซ่อมให้ (สั่ง: \"เรนเดอร์ MapTest ไม่ผ่าน ช่วยแก้\")"; fi

step "7/7 ใส่ Gemini API key"
echo "    กำลังเปิดไฟล์ .env ใน TextEdit — วาง key ต่อจาก GEMINI_API_KEY= แล้วกด Cmd+S"
echo "    ขอ key ฟรีที่ https://aistudio.google.com/apikey"
open -e "$PROJECT/.env"

printf '\n\033[32m==================== เสร็จแล้ว ====================\033[0m\n'
echo " โฟลเดอร์งานของคุณ: $PROJECT"
echo " ต่อไป: เปิดแอป Claude → แท็บ Code → เลือกโฟลเดอร์นี้"
echo "        (หรือพิมพ์ใน Terminal:  cd ~/maps/my-channel && claude )"
echo " แล้วพิมพ์:  เช็กว่าเครื่องพร้อมทำคลิปแผนที่ไหม"
echo "==================================================="
