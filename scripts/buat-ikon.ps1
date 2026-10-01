Add-Type -AssemblyName System.Drawing

# Sumber tunggal: lambang Stitch yang sudah transparan di public/merek/merek-1024.png
$akar = Resolve-Path (Join-Path $PSScriptRoot '..')
$sumber = Join-Path $akar 'public\merek\merek-1024.png'
if (-not (Test-Path $sumber)) { throw "Sumber lambang tidak ada: $sumber" }

$lambang = [System.Drawing.Image]::FromFile($sumber)

# Warna latar disamakan dengan --color-base di globals.css (#fffdf9).
$latar = [System.Drawing.Color]::FromArgb(255, 0xff, 0xfd, 0xf9)

function Buat-Ikon {
  param(
    [int]$Ukuran,
    [string]$Tujuan,
    [double]$Rasio,          # bagian sisi kanvas yang ditempati lambang
    [bool]$SudutBulat,       # true: sudut tumpul ala iOS/Android biasa
    [bool]$Melingkar         # true: kanvas bulat penuh (maskable)
  )

  $bmp = New-Object System.Drawing.Bitmap($Ukuran, $Ukuran, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  # Bentuk kanvas: bulat penuh, atau kotak bersudut tumpul, atau kotak.
  $jalur = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($Melingkar) {
    $jalur.AddEllipse(0, 0, $Ukuran, $Ukuran)
  }
  elseif ($SudutBulat) {
    $r = [Math]::Round($Ukuran * 0.22)
    $d = $r * 2
    $jalur.AddArc(0, 0, $d, $d, 180, 90)
    $jalur.AddArc($Ukuran - $d, 0, $d, $d, 270, 90)
    $jalur.AddArc($Ukuran - $d, $Ukuran - $d, $d, $d, 0, 90)
    $jalur.AddArc(0, $Ukuran - $d, $d, $d, 90, 90)
    $jalur.CloseFigure()
  }
  else {
    $jalur.AddRectangle((New-Object System.Drawing.Rectangle(0, 0, $Ukuran, $Ukuran)))
  }

  $kuas = New-Object System.Drawing.SolidBrush($latar)
  $g.FillPath($kuas, $jalur)

  # Tempatkan lambang di tengah, skala sesuai rasio.
  $sisi = [Math]::Round($Ukuran * $Rasio)
  $x = [Math]::Round(($Ukuran - $sisi) / 2)
  $y = [Math]::Round(($Ukuran - $sisi) / 2)
  $tujuanKotak = New-Object System.Drawing.Rectangle($x, $y, $sisi, $sisi)
  $g.DrawImage($lambang, $tujuanKotak, 0, 0, $lambang.Width, $lambang.Height, [System.Drawing.GraphicsUnit]::Pixel)

  $g.Dispose()
  $kuas.Dispose()
  $jalur.Dispose()

  $bmp.Save($Tujuan, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  "  $([System.IO.Path]::GetFileName($Tujuan)) : ${Ukuran}x${Ukuran} (rasio $Rasio)"
}

$ikon = Join-Path $akar 'public\ikon'
if (-not (Test-Path $ikon)) { New-Item -ItemType Directory -Path $ikon | Out-Null }

"Menulis ulang ikon PWA dari lambang Stitch:"
# Ikon biasa: latar penuh warna dasar, sudut tumpul supaya enak dilihat di peluncur.
Buat-Ikon -Ukuran 192 -Tujuan (Join-Path $ikon 'ikon-192.png') -Rasio 0.80 -SudutBulat $true -Melingkar $false
Buat-Ikon -Ukuran 512 -Tujuan (Join-Path $ikon 'ikon-512.png') -Rasio 0.80 -SudutBulat $true -Melingkar $false
# Maskable: kanvas bulat penuh, lambang dikecilkan ke zona aman (<= 80%).
Buat-Ikon -Ukuran 512 -Tujuan (Join-Path $ikon 'ikon-maskable-512.png') -Rasio 0.62 -SudutBulat $false -Melingkar $true
# Apple touch: iOS memakai kanvas penuh dan membulatkan sendiri.
Buat-Ikon -Ukuran 180 -Tujuan (Join-Path $ikon 'apple-touch-icon.png') -Rasio 0.80 -SudutBulat $false -Melingkar $false

$lambang.Dispose()
"Selesai."
