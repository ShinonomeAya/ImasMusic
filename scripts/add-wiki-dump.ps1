# 从剪贴板读取 Wiki dump 并自动保存
# 用法: 双击 scripts/add-wiki-dump.bat

Add-Type -AssemblyName System.Windows.Forms
$text = [System.Windows.Forms.Clipboard]::GetText()

if ([string]::IsNullOrWhiteSpace($text)) {
    Write-Host ""
    Write-Host "❌ 剪贴板为空"
    Write-Host "   请先在浏览器中打开 Wiki 页面，按 Ctrl+A → Ctrl+C 复制全文"
    Write-Host ""
    exit 1
}

# ── 提取字段 ──
function Extract-Field($pattern) {
    $m = [regex]::Match($text, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return $m.Groups[1].Value.Trim() }
    return $null
}

$originalTitle  = Extract-Field 'Original title:\s*(.+)'
$translatedTitle = Extract-Field 'Translated title:\s*(.+)'
$composer       = Extract-Field 'Composer:\s*(.+)'
$lyricist       = Extract-Field 'Lyricist:\s*(.+)'
$arranger       = Extract-Field 'Arranger:\s*(.+)'
if (-not $arranger) { $arranger = Extract-Field 'Arranged by:\s*(.+)' }
$bpmRaw         = Extract-Field 'BPM:\s*(\d+)'
$imageStat      = Extract-Field 'Image stat:\s*(.+)'

# ── 提取描述（first appeared in 段落）──
$description = $null
$descMatch = [regex]::Match($text, '(.{5,50}?\s+first appeared in[^\r\n]+(?:\r?\n(?!\s*(Contents|Lyrics|Appearances|CD Recordings|Navigation menu|v • d • e|Categories:|This page was last edited))[^\r\n]+)*)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($descMatch.Success) {
    $description = $descMatch.Value.Trim() -replace '\s+', ' '
}

# ── 确定曲名 ──
$title = $originalTitle
if (-not $title) { $title = $translatedTitle }

# 兜底：首行（过滤掉导航垃圾）
if (-not $title) {
    $lines = $text -split "`r?`n" | Where-Object { $_.Trim().Length -gt 0 }
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -notmatch '^(Skip to|Documentation|Community|Dashboard|Create account|Log in|Page|Navigation|Search|Tools|Main page|Current events|Recent changes|Random page|Help|What links here|Related changes|Special pages|Printable version|Permanent link|Page information|Privacy policy|About|Disclaimers|Mobile view|GNU|Powered by|Content is available|This page was last edited)') {
            $title = $trimmed
            break
        }
    }
}

if (-not $title) {
    $title = "unknown-$(Get-Date -Format yyyyMMddHHmmss)"
}

# ── 显示解析摘要 ──
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "解析摘要"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "曲名(识别): $title"
if ($originalTitle -and $originalTitle -ne $title) { Write-Host "曲名(原文): $originalTitle" }
if ($composer)       { Write-Host "Composer:   $composer" }
if ($lyricist)       { Write-Host "Lyricist:   $lyricist" }
if ($arranger)       { Write-Host "Arranger:   $arranger" }
if ($bpmRaw)         { Write-Host "BPM:        $bpmRaw" }
if ($imageStat)      { Write-Host "Image stat: $imageStat" }
if ($description)    { Write-Host "Description: $($description.Substring(0, [Math]::Min(80, $description.Length)))..." }
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# ── Windows 安全文件名 ──
$safeTitle = $title -replace '[<>:"/\\|?*]', '_' `
                     -replace '[\x00-\x1f]', '' `
                     -replace '^[\s.]+|[\s.]+$', '' `
                     -replace '\s+', ' '

if ([string]::IsNullOrWhiteSpace($safeTitle)) {
    $safeTitle = "unknown-$(Get-Date -Format yyyyMMddHHmmss)"
}

# ── 保存目录 ──
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$dumpsDir = Join-Path $projectDir "data/seed/wiki-dumps"

if (-not (Test-Path $dumpsDir)) {
    New-Item -ItemType Directory -Path $dumpsDir | Out-Null
}

# ── 处理重名 ──
$path = Join-Path $dumpsDir "$safeTitle.txt"
$counter = 1
while (Test-Path $path) {
    $path = Join-Path $dumpsDir "${safeTitle}_${counter}.txt"
    $counter++
}

# ── 保存 ──
Set-Content -Path $path -Value $text -Encoding UTF8

$lineCount = ($text -split "`r?`n").Count
Write-Host "✅ 已保存: $path"
Write-Host "   行数: $lineCount"
Write-Host ""
