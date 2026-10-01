Add-Type -AssemblyName System.Drawing

$akar = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$p = Join-Path $akar 'docs\stitch_cute_wedding_planner\sweet_ties_wedding_planner_logo\screen.png'

$bmp = New-Object System.Drawing.Bitmap($p)
$w = $bmp.Width
$h = $bmp.Height
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$d = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$s = $d.Stride
$buf = New-Object byte[] ($s * $h)
[System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $buf, 0, $buf.Length)
$bmp.UnlockBits($d)

$bg = @(248.0, 249.0, 244.0)

$pita = New-Object int[] 16
$merah = New-Object double[] 16
$hijau = New-Object double[] 16
$biru = New-Object double[] 16

for ($y = 0; $y -lt $h; $y++) {
  $r = $y * $s
  $k = [int]([Math]::Floor($y / 64.0))
  for ($x = 0; $x -lt $w; $x++) {
    $i = $r + $x * 4
    $b = [double]$buf[$i]
    $g = [double]$buf[$i + 1]
    $rr = [double]$buf[$i + 2]
    $selisih = [Math]::Max([Math]::Max([Math]::Abs($rr - $bg[0]), [Math]::Abs($g - $bg[1])), [Math]::Abs($b - $bg[2]))
    if ($selisih -ge 60) {
      $pita[$k] = $pita[$k] + 1
      $merah[$k] += $rr
      $hijau[$k] += $g
      $biru[$k] += $b
    }
  }
}

for ($k = 0; $k -lt 16; $k++) {
  if ($pita[$k] -gt 0) {
    $nr = [int]($merah[$k] / $pita[$k])
    $ng = [int]($hijau[$k] / $pita[$k])
    $nb = [int]($biru[$k] / $pita[$k])
    Write-Output ("y {0,4}-{1,4}  piksel={2,7}  rata-rata #{3:X2}{4:X2}{5:X2}" -f ($k * 64), ($k * 64 + 63), $pita[$k], $nr, $ng, $nb)
  }
  else {
    Write-Output ("y {0,4}-{1,4}  piksel=      0  kosong" -f ($k * 64), ($k * 64 + 63))
  }
}

$bmp.Dispose()
