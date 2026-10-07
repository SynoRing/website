import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { businessPlanFromEnv, normalizePassword } from "../../../business-plan.mjs";
import { PlanGate } from "../gate";
import { currentViewer } from "../server";
import "../bp.css";

// Always checks the visitor's session, never prerendered.
export const dynamic = "force-dynamic";

const description = "Shared privately by SynoRing.";

export const metadata: Metadata = {
  title: "Business plan",
  description,
  robots: { index: false, follow: false },
  openGraph: { title: "SynoRing business plan", description },
};

/* A recipient's link, with their password in it: one click opens the
   plan. Someone already viewing through this link goes straight to it. */
export default async function PlanLink({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;
  const password = normalizePassword(link);
  const plan = businessPlanFromEnv();
  const session = plan && (await currentViewer(plan));
  if (password && session?.recipient.password === password) redirect("/bp");
  return <PlanGate available={Boolean(plan)} link={link} />;
}
