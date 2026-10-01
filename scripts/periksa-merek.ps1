Add-Type -AssemblyName System.Drawing

$akar = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sasaran = @('public\merek\merek-1024.png', 'public\merek\merek-512.png', 'public\merek\merek-192.png')

foreach ($rel in $sasaran) {
  $p = Join-Path $akar $rel
  $bmp = New-Object System.Drawing.Bitmap($p)
  $w = $bmp.Width
  $h = $bmp.Height
  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $d = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $s = $d.Stride
  $buf = New-Object byte[] ($s * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $buf, 0, $buf.Length)
  $bmp.UnlockBits($d)

  $profil = New-Object int[] $h
  for ($y = 0; $y -lt $h; $y++) {
    $r = $y * $s
    $n = 0
    for ($x = 0; $x -lt $w; $x++) { if ($buf[$r + $x * 4 + 3] -gt 24) { $n++ } }
    $profil[$y] = $n
  }

  $puncak = 0
  foreach ($v in $profil) { if ($v -gt $puncak) { $puncak = $v } }

  $baris = ""
  for ($y = 0; $y -lt $h; $y += 8) {
    $v = [int]([double]$profil[$y] / [double]$puncak * 9)
    $baris += "0123456789"[$v]
  }

  Write-Output ("{0} {1}x{2} puncak={3}" -f $rel, $w, $h, $puncak)
  Write-Output $baris
  $bmp.Dispose()
}
