Add-Type -AssemblyName System.Drawing

# Ikon PWA digambar langsung dari bentuk lambang, bukan lagi dari berkas PNG
# hasil potong. Sumber gambar lama (public/merek/merek-1024.png) sudah dihapus,
# jadi skrip ini tidak punya ketergantungan pada berkas luar.
#
# Bentuknya harus sama dengan `src/components/merek.tsx`: kotak bersudut tumpul
# berwarna aksen, dengan pita penanda buku yang dilubangi dari kotak itu. Kalau
# salah satu berubah, yang lain harus ikut berubah, karena keduanya lambang
# yang sama.

$akar = Resolve-Path (Join-Path $PSScriptRoot '..')
$ikon = Join-Path $akar 'public\ikon'
if (-not (Test-Path $ikon)) { New-Item -ItemType Directory -Path $ikon | Out-Null }

# Warna disamakan dengan token di globals.css.
#   --color-aksen-permukaan #b23a2e
#   --color-base            #f4f2ea
#   --color-kartu-putih     #ffffff
$aksen = [System.Drawing.Color]::FromArgb(255, 0xb2, 0x3a, 0x2e)
$kertas = [System.Drawing.Color]::FromArgb(255, 0xf4, 0xf2, 0xea)

function New-JalurBulat {
  param([double]$X, [double]$Y, [double]$Lebar, [double]$Tinggi, [double]$Radius)
  $jalur = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $Radius * 2
  $jalur.AddArc($X, $Y, $d, $d, 180, 90)
  $jalur.AddArc($X + $Lebar - $d, $Y, $d, $d, 270, 90)
  $jalur.AddArc($X + $Lebar - $d, $Y + $Tinggi - $d, $d, $d, 0, 90)
  $jalur.AddArc($X, $Y + $Tinggi - $d, $d, $d, 90, 90)
  $jalur.CloseFigure()
  return $jalur
}

function Buat-Ikon {
  param(
    [int]$Ukuran,
    [string]$Tujuan,
    [double]$Rasio,        # bagian sisi kanvas yang ditempati lambang
    [bool]$SudutBulat,     # true: sudut tumpul ala iOS/Android biasa
    [bool]$Melingkar       # true: kanvas bulat penuh (maskable)
  )

  $bmp = New-Object System.Drawing.Bitmap($Ukuran, $Ukuran, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  # Kanvas: bulat penuh, kotak bersudut tumpul, atau kotak penuh.
  if ($Melingkar) {
    $kanvas = New-Object System.Drawing.Drawing2D.GraphicsPath
    $kanvas.AddEllipse(0, 0, $Ukuran, $Ukuran)
  }
  elseif ($SudutBulat) {
    $kanvas = New-JalurBulat -X 0 -Y 0 -Lebar $Ukuran -Tinggi $Ukuran -Radius ([Math]::Round($Ukuran * 0.22))
  }
  else {
    $kanvas = New-Object System.Drawing.Drawing2D.GraphicsPath
    $kanvas.AddRectangle((New-Object System.Drawing.Rectangle(0, 0, $Ukuran, $Ukuran)))
  }
  $kuasKanvas = New-Object System.Drawing.SolidBrush($kertas)
  $g.FillPath($kuasKanvas, $kanvas)

  # Lambang di tengah, diskalakan sesuai rasio.
  $sisi = [double][Math]::Round($Ukuran * $Rasio)
  $x = [Math]::Round(($Ukuran - $sisi) / 2)
  $y = [Math]::Round(($Ukuran - $sisi) / 2)

  $kotak = New-JalurBulat -X $x -Y $y -Lebar $sisi -Tinggi $sisi -Radius ([Math]::Round($sisi * 0.23))
  $kuasAksen = New-Object System.Drawing.SolidBrush($aksen)
  $g.FillPath($kuasAksen, $kotak)

  # Pita penanda buku, koordinat relatif terhadap kotak lambang dalam satuan
  # 24 seperti di SVG, supaya bentuknya identik dengan yang di layar.
  $s = $sisi / 24.0
  function P([double]$nx, [double]$ny) {
    return New-Object System.Drawing.PointF([single]($x + ($nx * $s)), [single]($y + ($ny * $s)))
  }
  $pita = New-Object System.Drawing.Drawing2D.GraphicsPath
  $titik = @(
    (P 8.6 5.0),
    (P 15.4 5.0),
    (P 15.4 19.4),
    (P 12.0 16.4),
    (P 8.6 19.4)
  )
  $pita.AddPolygon($titik)
  $kuasPita = New-Object System.Drawing.SolidBrush($kertas)
  $g.FillPath($kuasPita, $pita)

  $g.Dispose()
  $kuasKanvas.Dispose()
  $kuasAksen.Dispose()
  $kuasPita.Dispose()
  $kanvas.Dispose()
  $kotak.Dispose()
  $pita.Dispose()

  $bmp.Save($Tujuan, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  "  $([System.IO.Path]::GetFileName($Tujuan)) : ${Ukuran}x${Ukuran} (rasio $Rasio)"
}

"Menulis ulang ikon PWA dari bentuk lambang:"
# Ikon biasa: kanvas penuh warna kertas, sudut tumpul supaya enak dilihat di peluncur.
Buat-Ikon -Ukuran 192 -Tujuan (Join-Path $ikon 'ikon-192.png') -Rasio 0.80 -SudutBulat $true -Melingkar $false
Buat-Ikon -Ukuran 512 -Tujuan (Join-Path $ikon 'ikon-512.png') -Rasio 0.80 -SudutBulat $true -Melingkar $false
# Maskable: kanvas bulat penuh, lambang dikecilkan ke zona aman (<= 80%).
Buat-Ikon -Ukuran 512 -Tujuan (Join-Path $ikon 'ikon-maskable-512.png') -Rasio 0.62 -SudutBulat $false -Melingkar $true
# Apple touch: iOS memakai kanvas penuh dan membulatkan sendiri.
Buat-Ikon -Ukuran 180 -Tujuan (Join-Path $ikon 'apple-touch-icon.png') -Rasio 0.80 -SudutBulat $false -Melingkar $false

"Selesai."
