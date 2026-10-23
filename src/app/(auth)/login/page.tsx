import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { postLoginPath, safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log in" };

type Search = Record<string, string | string[] | undefined>;

const linkErrors: Record<string, string> = {
  link: "That link is not valid any more. Ask for a new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next || (await postLoginPath(supabase, user.id)));

  const initialEmail = typeof params.email === "string" ? params.email : undefined;
  const initialError = typeof params.error === "string" ? linkErrors[params.error] : undefined;

  return (
    <div className="grid flex-1 gap-5 md:grid-cols-2">
      <Hero />
      <AuthCard className="flex flex-col justify-center">
        <LoginForm next={next} initialEmail={initialEmail} initialError={initialError} />
      </AuthCard>
    </div>
  );
}

const kpis = [
  { value: "74%", label: "proof ready" },
  { value: "48/62", label: "suppliers replied" },
];

function Hero() {
  return (
    <section
      aria-hidden
      className="card-blue relative flex min-h-[520px] flex-col overflow-hidden rounded-[24px] p-[45px] shadow-card md:min-h-[686px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="relative">
        <p className="text-[12px] font-bold tracking-[0.08em] text-[#d3d6f7]">SECUABASE</p>
        <h2 className="mt-5 text-[44px] leading-[1.1] font-normal tracking-[-0.01em] text-white sm:text-[56px]">
          Proof for every product.
          <br />
          Done for you.
        </h2>
        <p className="mt-5 max-w-[440px] text-[16px] leading-[26px] text-[#d3d6f7]">
          We find the rules, chase your suppliers and build the file. You sign.
        </p>
      </div>
      <div className="relative flex flex-1 items-center justify-center py-10">
        <Image src="/illustrations/login-curve.svg" alt="" width={232} height={86} className="opacity-95" priority />
      </div>
      <div className="relative flex flex-wrap gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="w-[176px] rounded-[16px] bg-[#1B207C]/70 px-[18px] py-4">
            <p className="text-[26px] leading-[1.3] text-white">{k.value}</p>
            <p className="mt-1 text-[13px] text-[#d3d6f7]">{k.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
