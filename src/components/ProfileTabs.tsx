"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/profile", label: "Overview" },
  { href: "/profile/history", label: "History" },
  { href: "/profile/account", label: "Account" },
];

export default function ProfileTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Profile" className="flex gap-2">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md border-2 border-ink px-3 py-1.5 font-display text-lg font-bold leading-none ${
              active ? "bg-secondary text-ink shadow-[2px_2px_0_#1C1917]" : "bg-white text-ink hover:bg-secondary/30"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
