export interface StarQuestion {
  question: string;
  category: "Technical Leadership" | "Problem Solving" | "Delivering Impact" | "Conflict Resolution" | "System Scaling";
  modelAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface InterviewPrepPacket {
  role: string;
  company: string;
  starQuestions: StarQuestion[];
  followUpEmail: {
    subject: string;
    body: string;
  };
}

/**
 * Generates tailored STAR interview preparation questions and 7-day follow-up email.
 */
export function generateInterviewPrep(
  company: string,
  role: string,
  candidateName: string,
  resumeData: any,
  jobDescription?: string
): InterviewPrepPacket {
  const experiences = resumeData?.sections?.experience?.items || [];
  const topExp = experiences[0] || { company: "Previous Company", title: "Software Engineer", description: [] };
  const bulletSample = Array.isArray(topExp.description) ? topExp.description[0] : (topExp.description || "Delivered critical software systems with measurable £ impact.");

  const starQuestions: StarQuestion[] = [
    {
      question: `Tell me about a time you led a major project or technical initiative at ${topExp.company}:`,
      category: "Technical Leadership",
      modelAnswer: {
        situation: `At ${topExp.company}, our team faced challenges scaling core infrastructure to meet growing UK user demand.`,
        task: `I took ownership of re-architecting the backend workflow while maintaining high availability.`,
        action: `Collaborated across engineering and product, breaking down milestones and implementing rigorous automated testing.`,
        result: `Successfully delivered the overhaul, achieving measurable reliability and cost gains (${bulletSample.slice(0, 80)}...).`,
      },
    },
    {
      question: `How do your technical strengths map specifically to what ${company} is building?`,
      category: "System Scaling",
      modelAnswer: {
        situation: `${company} operates high-volume systems where uptime and precision are critical.`,
        task: `To apply my proven track record in distributed architecture and British English stakeholder communication.`,
        action: `I focus on clear domain modeling, pragmatic trade-offs, and quantified ROI on engineering investments.`,
        result: `Immediate time-to-value with zero ramp-up delay on core product initiatives.`,
      },
    },
    {
      question: `Describe a situation where you had to make a difficult trade-off between speed and code quality:`,
      category: "Problem Solving",
      modelAnswer: {
        situation: `Facing a tight regulatory deadline for a UK launch with incomplete technical specifications.`,
        task: `Deliver an MVP feature set safely without creating insurmountable technical debt.`,
        action: `Adopted an iterative release strategy with feature flags and decoupled data models.`,
        result: `Met the launch deadline on time with zero production incidents and clean subsequent refactoring.`,
      },
    },
    {
      question: `Give an example of delivering measurable financial or operational impact in your last role:`,
      category: "Delivering Impact",
      modelAnswer: {
        situation: `Legacy processes were consuming significant engineering hours and cloud expenditure.`,
        task: `Identify bottlenecks and deliver automated, efficient pipeline replacements.`,
        action: `Analyzed runtime telemetry, eliminated redundant queries, and instituted automated CI/CD checks.`,
        result: `Directly recovered ARR and reduced infrastructure costs by over 20%.`,
      },
    },
    {
      question: `How do you handle disagreements on architectural direction within your team?`,
      category: "Conflict Resolution",
      modelAnswer: {
        situation: `Two senior engineers had conflicting proposals for database partitioning and schema design.`,
        task: `Align the team on a definitive path forward without stalling sprint progress.`,
        action: `Facilitated an RFC session evaluating both options against benchmarked latency and maintenance overhead.`,
        result: `Reached unanimous consensus on a hybrid approach that satisfied both performance and timeline requirements.`,
      },
    },
  ];

  const followUpEmail = {
    subject: `Application Follow-Up — ${role} at ${company} — ${candidateName}`,
    body: `Dear Hiring Manager,\n\nI hope you are having a productive week.\n\nI am writing to politely follow up on my recent application for the ${role} position at ${company}. Having reviewed ${company}'s current milestones in the UK, I remain very enthusiastic about the prospect of bringing my experience in technical delivery and system scalability to your team.\n\nPlease let me know if you require any additional work samples, references, or details regarding my right to work in the UK.\n\nI look forward to hearing from you regarding next steps.\n\nKind regards,\n${candidateName}`,
  };

  return {
    role,
    company,
    starQuestions,
    followUpEmail,
  };
}
