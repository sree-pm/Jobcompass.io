import { MarketingLayout } from "../components/marketing/MarketingLayout";
import { Hero } from "../sections/Hero";
import { StackStrip } from "../sections/StackStrip";
import { Manifesto } from "../sections/Manifesto";
import { Dossier } from "../sections/Dossier";
import { Kanban } from "../sections/Kanban";
import { Locks } from "../sections/Locks";
import { UkAdvantage } from "../sections/UkAdvantage";
import { Jobs } from "../sections/Jobs";
import { Pricing } from "../sections/Pricing";
import { Automations } from "../sections/Automations";
import { Guards } from "../sections/Guards";
import { Frontend } from "../sections/Frontend";
import { Cta } from "../sections/Cta";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function Landing() {
  usePageMeta(
    "UK job search, done properly — JobCompass",
    "Tailored CVs for UK jobs — one page, A4, British spelling, every employer checked. Your first 10 jobs are free. Then 10p per job, and they never expire. You approve everything before it's sent.",
    "/"
  );
  return (
    <MarketingLayout>
      <Hero />
      <StackStrip />
      <Manifesto />
      <Dossier />
      <Kanban />
      <Locks />
      <UkAdvantage />
      <Jobs />
      <Pricing />
      <Automations />
      <Guards />
      <Frontend />
      <Cta />
    </MarketingLayout>
  );
}
