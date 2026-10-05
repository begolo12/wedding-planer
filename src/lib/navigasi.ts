export function navigasiAktif(pathname: string, href: string, sidebar = false) {
  if (href === "/beranda") return pathname === href;
  if (sidebar && href === "/rencana" &&
      (pathname === "/rencana/vendor" || pathname.startsWith("/rencana/vendor/"))) {
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
