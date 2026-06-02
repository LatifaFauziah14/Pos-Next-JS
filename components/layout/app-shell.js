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
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 p-3 sm:p-4 lg:grid-cols-[280px_1fr] lg:gap-6 lg:p-6">
        <aside className="rounded-[24px] border border-border bg-primary p-4 text-primary-foreground card-shadow sm:p-5 lg:sticky lg:top-6 lg:self-start lg:rounded-[30px] lg:p-6">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-start gap-4 lg:block">
              <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:size-14">
                <FontAwesomeIcon icon={faStore} className="text-xl sm:text-2xl" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold sm:text-2xl">POS Cabang</h1>
                <p className="mt-1 text-sm text-white/70">
                  Admin & kasir dalam satu panel.
                </p>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white lg:justify-start lg:gap-3 lg:px-4"
                  >
                    <FontAwesomeIcon icon={Icon} className="text-sm" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[24px] border border-white/15 bg-white/8 p-4 text-sm">
              <p className="font-semibold break-words">{session.username}</p>
              <p className="mt-1 text-white/70">
                {session.roleName} - {session.branchName}
              </p>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-center border border-white/15 text-white hover:bg-white/10 lg:justify-start"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 text-sm" />
                Logout
              </Button>
            </form>
          </div>
        </aside>

        <div className="grid min-w-0 gap-4 sm:gap-6">
          <header className="rounded-[24px] border border-border bg-surface px-4 py-4 card-shadow sm:rounded-[30px] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">
                  Multi branch retail
                </p>
                <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  Operasional toko lebih terkendali
                </h2>
              </div>
              <div className="text-sm text-muted sm:text-right">
                Branch aktif:{" "}
                <span className="break-words font-semibold text-foreground">
                  {session.branchName}
                </span>
              </div>
            </div>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
