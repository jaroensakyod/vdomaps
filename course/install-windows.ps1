# Map Studio — ตัวติดตั้งสำหรับนักเรียน (Windows 10/11, มีหรือไม่มีการ์ดจอก็ได้)
# วิธีรัน: เปิด PowerShell แล้ววางบรรทัดนี้
#   irm https://raw.githubusercontent.com/jaroensakyod/vdomaps/main/course/install-windows.ps1 | iex
# หรือดับเบิลคลิก install-windows.bat
#
# ลง git, Node.js LTS, ffmpeg, Claude Code → โหลดชุด vdomaps → สร้าง C:\maps\my-channel → npm install
# → เลือกโหมดการ์ดจอที่เร็วที่สุด → เรนเดอร์ภาพทดสอบ → เปิดไฟล์ .env ให้ใส่ Gemini API key
# รันซ้ำได้ ไม่ลบงานเดิม (ทดสอบ: MAPS_DIR=โฟลเดอร์อื่น, VDOMAPS_SRC=ชุด vdomaps ในเครื่องแทนการ clone)

function Install-MapStudio {
  [Console]::OutputEncoding = [Text.Encoding]::UTF8
  $ProgressPreference = 'SilentlyContinue'
  $root = if ($env:MAPS_DIR) { $env:MAPS_DIR } else { 'C:\maps' }
  $project = Join-Path $root 'my-channel'
  $kit = Join-Path $project '.vdomaps'
  $repo = 'https://github.com/jaroensakyod/vdomaps'

  function Step($msg) { Write-Host ''; Write-Host "==> $msg" -ForegroundColor Cyan }
  function Ok($msg) { Write-Host "    OK  $msg" -ForegroundColor Green }
  function Warn($msg) { Write-Host "    !!  $msg" -ForegroundColor Yellow }
  function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
  function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
    foreach ($p in "$env:USERPROFILE\.local\bin", "$env:LOCALAPPDATA\Microsoft\WinGet\Links") { if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) { $env:Path += ";$p" } }
  }

  Step '1/7 ลงเครื่องมือ (git, Node.js, ffmpeg)'
  $tools = @(
    @{ cmd = 'git'; id = 'Git.Git'; name = 'git' },
    @{ cmd = 'node'; id = 'OpenJS.NodeJS.LTS'; name = 'Node.js LTS' },
    @{ cmd = 'ffmpeg'; id = 'Gyan.FFmpeg'; name = 'ffmpeg' }
  )
  foreach ($t in $tools) {
    if (Has $t.cmd) { Ok "$($t.name) มีแล้ว"; continue }
    if (-not (Has 'winget')) {
      Write-Host '    ไม่พบ winget — เปิด Microsoft Store ค้นหา "App Installer" กด Update/Install แล้วรันตัวติดตั้งนี้ใหม่' -ForegroundColor Red
      return
    }
    Write-Host "    กำลังลง $($t.name) ... (อาจมีหน้าต่างขออนุญาต ให้กด Yes)"
    winget install --id $t.id -e --silent --accept-package-agreements --accept-source-agreements | Out-Host
    Refresh-Path
    if (Has $t.cmd) { Ok "$($t.name) ลงแล้ว" } else { Warn "$($t.name) ยังไม่เจอ — ปิด PowerShell เปิดใหม่ แล้วรันตัวติดตั้งซ้ำ"; return }
  }
  $major = [int]((node -v) -replace '^v(\d+).*', '$1')
  if ($major -lt 18) { Warn "Node $(node -v) เก่าเกินไป (ต้อง 18 ขึ้นไป) — รัน: winget upgrade OpenJS.NodeJS.LTS"; return }

  Step '2/7 ลง Claude Code'
  if (Has 'claude') { Ok 'Claude Code มีแล้ว' }
  else {
    try { Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression; Refresh-Path } catch { Warn "ลง Claude Code ไม่สำเร็จ: $_" }
    if (Has 'claude') { Ok 'Claude Code ลงแล้ว' } else { Warn 'ข้ามได้ ถ้าใช้แอป Claude Desktop (แท็บ Code) — โหลดที่ https://claude.ai/download' }
  }

  Step "3/7 โหลดชุด vdomaps ไปที่ $project"
  New-Item -ItemType Directory -Force $project | Out-Null
  if ($env:VDOMAPS_SRC) { $kit = $env:VDOMAPS_SRC; Ok "ใช้ชุดในเครื่อง $kit" }
  elseif (Test-Path (Join-Path $kit '.git')) { git -C $kit pull --ff-only | Out-Host; Ok 'อัปเดตชุดล่าสุดแล้ว' }
  else { git clone --depth 1 $repo $kit | Out-Host; if (-not (Test-Path (Join-Path $kit 'skills'))) { Warn 'โหลดไม่สำเร็จ — เช็กอินเทอร์เน็ตแล้วรันใหม่'; return }; Ok 'โหลดแล้ว' }
  if (-not (Test-Path (Join-Path $project 'package.json'))) {
    Copy-Item (Join-Path $kit 'skills\map-studio\template\*') $project -Recurse -Force
    Ok 'สร้างโปรเจกต์จาก template แล้ว'
  } else { Ok 'มีโปรเจกต์อยู่แล้ว (ไม่ทับงานเดิม)' }
  if (-not (Test-Path (Join-Path $project 'CLAUDE.md'))) { Copy-Item (Join-Path $kit 'course\CLAUDE.md') $project }
  $envFile = Join-Path $project '.env'
  if (-not (Test-Path $envFile)) { Copy-Item (Join-Path $kit 'course\env.example') $envFile }

  Step '4/7 npm install (ครั้งแรก 2-5 นาที)'
  Push-Location $project
  try {
    npm.cmd install --no-audit --no-fund | Out-Host
    if ($LASTEXITCODE -ne 0) { Warn 'npm install ไม่ผ่าน — ส่งภาพหน้าจอนี้ให้ครู'; return }
    Ok 'ลงแพ็กเกจแล้ว'

    Step '5/7 เช็กการ์ดจอ แล้วเลือกโหมดเรนเดอร์ที่ใช้ได้'
    $gpus = (Get-CimInstance Win32_VideoController | ForEach-Object Name) -join ', '
    Write-Host "    การ์ดจอ: $gpus"
    $config = Join-Path $project 'remotion.config.ts'
    $chosen = $null
    foreach ($gl in 'vulkan', 'angle') {
      Write-Host "    ลองโหมด $gl ... (ครั้งแรกจะโหลด Chrome สำหรับเรนเดอร์ก่อน)"
      $sw = [Diagnostics.Stopwatch]::StartNew()
      npx.cmd remotion render MapTest out/gl-test.mp4 --frames=0-29 --gl=$gl --log=error | Out-Null
      if ($LASTEXITCODE -eq 0) { $chosen = $gl; Ok "$gl ใช้ได้ (ทดสอบ $([int]$sw.Elapsed.TotalSeconds) วินาที)"; break }
      Warn "$gl ใช้ไม่ได้บนเครื่องนี้"
    }
    $text = Get-Content $config -Raw
    if ($chosen) { $text = $text -replace 'setChromiumOpenGlRenderer\("\w+"\)', "setChromiumOpenGlRenderer(`"$chosen`")" }
    else { $text = $text -replace '(?m)^Config\.setChromiumOpenGlRenderer.*\r?\n', ''; Warn 'ใช้โหมด CPU ล้วน (ช้ากว่าแต่ใช้ได้)' }
    [IO.File]::WriteAllText($config, $text)
    Remove-Item out\gl-test.mp4 -ErrorAction SilentlyContinue
    if ($gpus -match 'NVIDIA') { Ok 'มีการ์ด NVIDIA — หลังทำคลิปแรกได้ ให้สั่ง Claude ตั้ง Whisper แบบ CUDA จะจับเวลาเสียงเร็วขึ้น ~7 เท่า' }

    Step '6/7 เรนเดอร์ภาพทดสอบ'
    npx.cmd remotion still MapTest out/test.png --frame=140 --log=error | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "ได้ภาพ $project\out\test.png"; Start-Process (Join-Path $project 'out\test.png') }
    else { Warn 'เรนเดอร์ไม่ผ่าน — ไม่เป็นไร ในคลาสให้ Claude ซ่อมให้ (สั่ง: "เรนเดอร์ MapTest ไม่ผ่าน ช่วยแก้")' }
  } finally { Pop-Location }

  Step '7/7 ใส่ Gemini API key'
  Write-Host '    กำลังเปิดไฟล์ .env ใน Notepad — วาง key ต่อจาก GEMINI_API_KEY= แล้วกด Ctrl+S'
  Write-Host '    ขอ key ฟรีที่ https://aistudio.google.com/apikey'
  Start-Process notepad.exe $envFile

  Write-Host ''
  Write-Host '==================== เสร็จแล้ว ====================' -ForegroundColor Green
  Write-Host " โฟลเดอร์งานของคุณ: $project"
  Write-Host ' ต่อไป: เปิดแอป Claude → แท็บ Code → เลือกโฟลเดอร์นี้'
  Write-Host "        (หรือพิมพ์ใน PowerShell:  cd $project ; claude )"
  Write-Host ' แล้วพิมพ์:  เช็กว่าเครื่องพร้อมทำคลิปแผนที่ไหม'
  Write-Host '==================================================='
}

Install-MapStudio
