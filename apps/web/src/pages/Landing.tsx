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
    "UK-first agentic CV tailoring — A4 GBP British spelling, per-bullet field locks, two-pass hallucination audit, DID ground truth, Companies House trust. £10/100 credits, never expire. Not volume — trust.",
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
