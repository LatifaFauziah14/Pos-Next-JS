import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Login | POS Multi Cabang",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="surface-grid flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[24px] border border-border bg-surface card-shadow sm:rounded-[32px] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.05),_transparent_60%)]" />
          <div className="relative space-y-5">
            <span className="inline-flex rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/80">
              Next.js 16 POS
            </span>
            <div className="space-y-4">
              <h1 className="max-w-lg text-5xl font-semibold leading-tight">
                Penjualan lebih rapi untuk toko dengan banyak cabang.
              </h1>
              <p className="max-w-md text-base leading-7 text-white/78">
                Dashboard admin, kasir, laporan cabang, manajemen stok, dan
                transaksi cepat dalam satu aplikasi modular.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4 rounded-[28px] border border-white/15 bg-white/8 p-6 backdrop-blur">
            <div className="grid gap-1">
              <span className="text-sm text-white/70">Demo credentials</span>
              <span className="text-lg font-semibold">admin / admin123</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-2xl font-semibold">3</p>
                <p className="text-white/70">Cabang aktif</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">128</p>
                <p className="text-white/70">Produk</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">1.248</p>
                <p className="text-white/70">Transaksi</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-primary/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Secure Login
              </span>
              <div>
                <h2 className="text-3xl font-semibold text-foreground">
                  Masuk ke sistem POS
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Password diproses dengan pola `bcrypt(username + password)`
                  dan divalidasi penuh di server.
                </p>
              </div>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
