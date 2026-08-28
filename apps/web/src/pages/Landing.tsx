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

export default function Landing() {
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
