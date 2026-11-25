"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Home,
  User,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  Film,
  Tv,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

/** Pages that open on a full-bleed backdrop: the bar starts transparent over it */
const isCinematicRoute = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/movie/") ||
  pathname.startsWith("/serie/") ||
  pathname.startsWith("/auth");

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      router.push("/auth");
    }
  };

  const links = [
    { href: "/", label: t.nav.home, icon: Home, show: true },
    { href: "/movies", label: t.nav.movies, icon: Film, show: true },
    { href: "/discover", label: t.nav.series, icon: Tv, show: true },
    { href: "/search", label: t.nav.search, icon: Search, show: true },
    { href: "/favorites", label: t.nav.favorites, icon: Heart, show: !!user },
    { href: "/profile", label: t.nav.profile, icon: User, show: !!user },
  ].filter((l) => l.show);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const overBackdrop = isCinematicRoute(pathname) && !scrolled && !isMenuOpen;
  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Utilisateur";

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ease-[var(--ease-cinema)] border-b ${
          overBackdrop
            ? "border-transparent bg-transparent text-white dark:text-white [--nav-ink-2:rgb(255_255_255/0.72)]"
            : "border-line bg-canvas/90 backdrop-blur-md text-ink [--nav-ink-2:var(--ink-2)]"
        }`}
      >
        {/* Soft top shade so white links stay legible over bright backdrops */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${
            overBackdrop ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-10">
            <Link href="/" aria-label="WatchWhat, accueil" className="shrink-0">
              <img src="/logo.svg" alt="WatchWhat" width={40} height={40} className="h-10 w-10" />
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex h-9 items-center rounded-lg px-3 text-[14px] transition-colors duration-150 ${
                        active
                          ? "font-medium"
                          : "text-[var(--nav-ink-2)] hover:text-current"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute bottom-[3px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-accent"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/search"
              aria-label={t.nav.search}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-[var(--nav-ink-2)] transition-colors duration-150 hover:text-current sm:inline-flex md:hidden lg:inline-flex"
            >
              <Search size={18} strokeWidth={1.5} />
            </Link>

            <ThemeToggle
              className={overBackdrop ? "text-white/75! hover:text-white! hover:bg-white/10!" : ""}
            />

            <Link
              href="/settings"
              aria-label={t.nav.settings}
              title={t.nav.settings}
              className={`hidden h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 md:inline-flex ${
                overBackdrop
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-ink-2 hover:bg-raised hover:text-ink"
              }`}
            >
              <Settings size={18} strokeWidth={1.5} />
            </Link>

            {!loading && (
              <div className="ml-2 flex items-center gap-2">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className={`flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150 ${overBackdrop ? "hover:bg-white/10" : "hover:bg-raised"}`}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-raised text-[13px] font-medium text-ink">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="hidden text-[14px] lg:block">{displayName}</span>
                    </Link>
                    <button
                      onClick={handleAuthAction}
                      aria-label={t.nav.logout}
                      title={t.nav.logout}
                      className={`hidden h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 sm:inline-flex ${
                        overBackdrop
                          ? "text-white/75 hover:bg-white/10 hover:text-white"
                          : "text-ink-2 hover:bg-raised hover:text-ink"
                      }`}
                    >
                      <LogOut size={18} strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAuthAction}
                    className="hidden h-9 items-center gap-2 rounded-lg bg-accent px-4 md:inline-flex text-[14px] font-medium text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] transition-[background-color,transform] duration-150 hover:bg-velvet-700 active:scale-[0.97]"
                  >
                    {t.nav.login}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className={`ml-1 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150 md:hidden ${overBackdrop ? "hover:bg-white/10" : "hover:bg-raised"}`}
            >
              {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Menu mobile plein écran */}
        {isMenuOpen && (
          <div
            id="menu-mobile"
            className="animate-fade-in fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-canvas px-4 pb-28 pt-4 md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-14 items-center justify-between border-b border-line font-display text-[28px] leading-none ${
                        active ? "text-ink" : "text-ink-2"
                      }`}
                    >
                      {link.label}
                      {active && <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-accent" />}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-14 items-center border-b border-line font-display text-[28px] leading-none text-ink-2"
                >
                  {t.nav.settings}
                </Link>
              </li>
            </ul>
            {user && (
              <button
                onClick={handleAuthAction}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-line-strong text-[15px] text-ink"
              >
                <LogOut size={18} strokeWidth={1.5} />
                {t.nav.logout}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Barre d'onglets mobile */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {[
            { href: "/", label: t.nav.home, icon: Home },
            { href: "/movies", label: t.nav.movies, icon: Film },
            { href: "/discover", label: t.nav.series, icon: Tv },
            ...(user
              ? [
                  { href: "/favorites", label: t.nav.favorites, icon: Heart },
                  { href: "/profile", label: t.nav.profile, icon: User },
                ]
              : [{ href: "/search", label: t.nav.search, icon: Search }]),
          ].map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                    active ? "text-ink" : "text-ink-3 hover:text-ink-2"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 1.75 : 1.5} />
                  <span className="text-[11px] leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
          {!user && (
            <li className="flex-1">
              <button
                onClick={handleAuthAction}
                className="flex h-14 w-full flex-col items-center justify-center gap-1 text-ink-3 transition-colors duration-150 hover:text-ink-2"
              >
                <LogIn size={20} strokeWidth={1.5} />
                <span className="text-[11px] leading-none">{t.nav.login}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
