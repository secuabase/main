"use client";

import * as React from "react";
import { greetingFor } from "@/lib/utils";

const noSubscribe = () => () => {};

/** "Good morning, {first name}!" — time-of-day aware on the visitor's clock ("Good morning" on the server). */
export function Greeting({ firstName }: { firstName: string }) {
  const greeting = React.useSyncExternalStore(noSubscribe, () => greetingFor(), () => "Good morning");
  return <PageTitle>{`${greeting}, ${firstName}!`}</PageTitle>;
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[30px] leading-[1.25] font-normal tracking-[-0.01em] text-text md:text-[48px] md:leading-[72px]">
      {children}
    </h1>
  );
}
