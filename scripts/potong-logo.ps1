Add-Type -AssemblyName System.Drawing

$akar = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$p = Join-Path $akar 'docs\stitch_cute_wedding_planner\sweet_ties_wedding_planner_logo\screen.png'

$bmp = New-Object System.Drawing.Bitmap($p)
$w = $bmp.Width
$h = $bmp.Height
Write-Output ("ukuran layar {0}x{1}" -f $w, $h)

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$d = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$s = $d.Stride
$buf = New-Object byte[] ($s * $h)
[System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $buf, 0, $buf.Length)
$bmp.UnlockBits($d)

$bg = @(248.0, 249.0, 244.0)
$kolom = New-Object int[] $w
for ($x = 0; $x -lt $w; $x++) {
  $n = 0
  for ($y = 256; $y -lt 768; $y++) {
    $i = $y * $s + $x * 4
    $b = [double]$buf[$i]
    $g = [double]$buf[$i + 1]
    $rr = [double]$buf[$i + 2]
    $selisih = [Math]::Max([Math]::Max([Math]::Abs($rr - $bg[0]), [Math]::Abs($g - $bg[1])), [Math]::Abs($b - $bg[2]))
    if ($selisih -ge 60) { $n++ }
  }
  $kolom[$x] = $n
}

$puncak = 0
foreach ($v in $kolom) { if ($v -gt $puncak) { $puncak = $v } }
$baris = ""
for ($x = 0; $x -lt $w; $x += 16) {
  $v = [int]([double]$kolom[$x] / [double]$puncak * 9)
  $baris += "0123456789"[$v]
}
Write-Output "profil kolom (langkah 16 px):"
Write-Output $baris

# cari batas kiri dan kanan
$kiri = -1
$kanan = -1
for ($x = 0; $x -lt $w; $x++) { if ($kolom[$x] -gt 3) { $kiri = $x; break } }
for ($x = $w - 1; $x -ge 0; $x--) { if ($kolom[$x] -gt 3) { $kanan = $x; break } }
Write-Output ("merek kiri={0} kanan={1} lebar={2}" -f $kiri, $kanan, ($kanan - $kiri + 1))

# potong hanya bagian merek lalu simpan kecil untuk ditinjau
$potong = New-Object System.Drawing.Rectangle($kiri, 256, ($kanan - $kiri + 1), 512)
$keping = $bmp.Clone($potong, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$kecil = New-Object System.Drawing.Bitmap(384, [int](384.0 * 512.0 / [double]($kanan - $kiri + 1)))
$graf = [System.Drawing.Graphics]::FromImage($kecil)
$graf.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graf.DrawImage($keping, 0, 0, $kecil.Width, $kecil.Height)
$graf.Dispose()
$keluar = Join-Path $akar 'docs\stitch_cute_wedding_planner\_tinjau-merek.png'
$kecil.Save($keluar, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output ("disimpan {0} ukuran {1}x{2}" -f $keluar, $kecil.Width, $kecil.Height)

$keping.Dispose()
$kecil.Dispose()
$bmp.Dispose()
