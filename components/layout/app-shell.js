import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCartShopping,
  faGaugeHigh,
  faRightFromBracket,
  faStore,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

function getNavigation(session) {
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: faGaugeHigh },
    { href: "/products", label: "Produk", icon: faBox },
    { href: "/pos", label: "POS", icon: faCartShopping },
  ];

  if (session.roleName === "admin" || session.roleId === 1) {
    items.splice(2, 0, { href: "/users", label: "Pengguna", icon: faUserShield });
  }

  return items;
}

export function AppShell({ session, children }) {
  const navigation = getNavigation(session);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
        <aside className="rounded-[30px] border border-border bg-primary p-6 text-primary-foreground card-shadow">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <FontAwesomeIcon icon={faStore} className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">POS Cabang</h1>
                <p className="mt-1 text-sm text-white/70">
                  Admin & kasir dalam satu panel.
                </p>
              </div>
            </div>

            <nav className="grid gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    <FontAwesomeIcon icon={Icon} className="text-sm" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[24px] border border-white/15 bg-white/8 p-4 text-sm">
              <p className="font-semibold">{session.username}</p>
              <p className="mt-1 text-white/70">
                {session.roleName} - {session.branchName}
              </p>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start border border-white/15 text-white hover:bg-white/10"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 text-sm" />
                Logout
              </Button>
            </form>
          </div>
        </aside>

        <div className="grid gap-6">
          <header className="rounded-[30px] border border-border bg-surface px-6 py-5 card-shadow">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">
                  Multi branch retail
                </p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Operasional toko lebih terkendali
                </h2>
              </div>
              <div className="text-sm text-muted">
                Branch aktif:{" "}
                <span className="font-semibold text-foreground">{session.branchName}</span>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
