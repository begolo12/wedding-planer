Add-Type -AssemblyName System.Drawing

$akar = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sumber = Join-Path $akar 'docs\stitch_cute_wedding_planner\sweet_ties_wedding_planner_logo\screen.png'
$keluar = Join-Path $akar 'public\merek'
if (-not (Test-Path $keluar)) { New-Item -ItemType Directory -Path $keluar | Out-Null }

$bg = @(248.0, 249.0, 244.0)
$ambang = 55.0
$ambangKotak = 60.0

$sumberBmp = New-Object System.Drawing.Bitmap($sumber)
$lebar = $sumberBmp.Width
$tinggi = $sumberBmp.Height

$rect = New-Object System.Drawing.Rectangle(0, 0, $lebar, $tinggi)
$data = $sumberBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$langkah = $data.Stride
$buffer = New-Object byte[] ($langkah * $tinggi)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buffer, 0, $buffer.Length)
$sumberBmp.UnlockBits($data)

$keluaranBmp = New-Object System.Drawing.Bitmap($lebar, $tinggi, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$rectTulis = New-Object System.Drawing.Rectangle(0, 0, $lebar, $tinggi)
$dataTulis = $keluaranBmp.LockBits($rectTulis, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$langkahTulis = $dataTulis.Stride
$bufferTulis = New-Object byte[] ($langkahTulis * $tinggi)

$minX = $lebar
$minY = $tinggi
$maksX = -1
$maksY = -1

for ($y = 0; $y -lt $tinggi; $y++) {
  $barisSumber = $y * $langkah
  $barisTulis = $y * $langkahTulis
  for ($x = 0; $x -lt $lebar; $x++) {
    $i = $barisSumber + ($x * 4)
    $b = [double]$buffer[$i]
    $g = [double]$buffer[$i + 1]
    $r = [double]$buffer[$i + 2]

    $selisih = [Math]::Max([Math]::Max([Math]::Abs($r - $bg[0]), [Math]::Abs($g - $bg[1])), [Math]::Abs($b - $bg[2]))
    $a = 0
    if ($selisih -ge $ambang) {
      $a = 255
    } elseif ($selisih -gt 26) {
      $a = [int][Math]::Round((($selisih - 26) / ($ambang - 26)) * 255)
    }

    $j = $barisTulis + ($x * 4)
    $bufferTulis[$j] = [byte]$b
    $bufferTulis[$j + 1] = [byte]$g
    $bufferTulis[$j + 2] = [byte]$r
    $bufferTulis[$j + 3] = [byte]$a

    if ($selisih -ge $ambangKotak) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maksX) { $maksX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maksY) { $maksY = $y }
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bufferTulis, 0, $dataTulis.Scan0, $bufferTulis.Length)
$keluaranBmp.UnlockBits($dataTulis)

Write-Output "kotak tanda: x=$minX..$maksX y=$minY..$maksY"

$lebarTanda = $maksX - $minX + 1
$tinggiTanda = $maksY - $minY + 1
$sisiTerbesar = [Math]::Max($lebarTanda, $tinggiTanda)
$padat = [int][Math]::Round($sisiTerbesar * 0.08)

$sisi = $sisiTerbesar + ($padat * 2)
$pusatX = ($minX + $maksX) / 2.0
$pusatY = ($minY + $maksY) / 2.0
$kiri = [int][Math]::Round($pusatX - ($sisi / 2.0))
$atas = [int][Math]::Round($pusatY - ($sisi / 2.0))

foreach ($ukuran in @(1024, 512, 192)) {
  $kanvas = New-Object System.Drawing.Bitmap($ukuran, $ukuran, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graf = [System.Drawing.Graphics]::FromImage($kanvas)
  $graf.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graf.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graf.Clear([System.Drawing.Color]::Transparent)

  $tujuan = New-Object System.Drawing.Rectangle(0, 0, $ukuran, $ukuran)
  $asal = New-Object System.Drawing.Rectangle($kiri, $atas, $sisi, $sisi)
  $graf.DrawImage($keluaranBmp, $tujuan, $asal, [System.Drawing.GraphicsUnit]::Pixel)
  $graf.Dispose()

  $nama = Join-Path $keluar ("merek-{0}.png" -f $ukuran)
  $kanvas.Save($nama, [System.Drawing.Imaging.ImageFormat]::Png)
  $kanvas.Dispose()
  Write-Output "tulis $nama"
}

$keluaranBmp.Dispose()
$sumberBmp.Dispose()
