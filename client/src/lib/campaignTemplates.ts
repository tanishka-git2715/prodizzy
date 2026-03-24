import {
  Briefcase,
  Code,
  Video,
  Users,
  TestTube,
  Lightbulb,
  TrendingUp,
  Building2,
  FileText
} from "lucide-react";

export interface CampaignTemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  defaultFields: {
    engagementType?: string;
    experience?: string;
    workType?: string;
    compensation?: string;
    [key: string]: any;
  };
  requiredFields: string[];
  optionalFields: string[];
  customFields?: {
    name: string;
    label: string;
    type: "text" | "select" | "number" | "textarea" | "multiselect";
    options?: string[];
    placeholder?: string;
  }[];
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: "general",
    title: "General",
    description: "Post a flexible opportunity according to your current requirements",
    icon: FileText,
    category: "General",
    defaultFields: {},
    requiredFields: ["title", "description"],
    optionalFields: ["engagementType", "compensation", "deadline", "location", "skills"],
    customFields: [
      {
        name: "type",
        label: "Opportunity Type",
        type: "text",
        placeholder: "e.g., Research, Translation, Event Support"
      }
    ]
  },
  {
    id: "beta-testing",
    title: "Beta Testing",
    description: "Get early users to try your product and share valuable feedback",
    icon: TestTube,
    category: "Testing",
    defaultFields: {
      experience: "Beginner"
    },
    requiredFields: ["title", "description", "targetProfiles"],
    optionalFields: ["deadline"],
    customFields: [
      {
        name: "product",
        label: "Product Name",
        type: "text",
        placeholder: "e.g., TaskFlow App"
      },
      {
        name: "productLink",
        label: "Product Link",
        type: "text",
        placeholder: "https://..."
      },
      {
        name: "incentive",
        label: "Incentive",
        type: "text",
        placeholder: "e.g., Free premium access, $50 Amazon gift card"
      }
    ]
  },
  {
    id: "cofounder-search",
    title: "Co-founder Search",
    description: "Find the right partner to build, launch, and grow your startup",
    icon: Users,
    category: "Startup",
    defaultFields: {
      engagementType: "Partnership",
      compensation: "Equity"
    },
    requiredFields: ["title", "description"],
    optionalFields: ["location", "targetProfiles"],
    customFields: [
      {
        name: "expertise",
        label: "Required Expertise",
        type: "text",
        placeholder: "e.g., Technical Co-founder with ML background"
      },
      {
        name: "equity",
        label: "Equity Offered",
        type: "text",
        placeholder: "e.g., 20-30%"
      },
      {
        name: "commitment",
        label: "Time Commitment",
        type: "select",
        options: ["Part-time", "Full-time", "Open / Flexible"]
      }
    ]
  },
  {
    id: "hiring-talent",
    title: "Hiring Talent",
    description: "Recruit interns, part-time, or full-time team members for your startup",
    icon: Briefcase,
    category: "Hiring",
    defaultFields: {
      engagementType: "Full-time",
      experience: "Intermediate"
    },
    requiredFields: ["title", "description", "skills", "engagementType"],
    optionalFields: ["location", "deadline"],
    customFields: [
      {
        name: "role",
        label: "Role Title",
        type: "text",
        placeholder: "e.g., Senior Software Engineer"
      },
      {
        name: "experience",
        label: "Experience Level",
        type: "select",
        options: ["Entry-level", "Intermediate", "Senior", "Lead"]
      },
      {
        name: "budget",
        label: "Budget",
        type: "text",
        placeholder: "e.g., $1000 - $5000 or $50/hr"
      }
    ]
  },
  {
    id: "freelance-project",
    title: "Freelance Project",
    description: "Hire freelancers for short-term tasks and accelerate execution",
    icon: Code,
    category: "Freelance",
    defaultFields: {
      engagementType: "Project-based",
      workType: "Remote"
    },
    requiredFields: ["title", "description", "skills"],
    optionalFields: ["engagementType", "deadline", "location"],
    customFields: [
      {
        name: "skill",
        label: "Primary Skill",
        type: "text",
        placeholder: "e.g., UI/UX Designer"
      },
      {
        name: "project",
        label: "Project Name",
        type: "text",
        placeholder: "e.g., Mobile App Redesign"
      },
      {
        name: "duration",
        label: "Project Duration",
        type: "select",
        options: ["1-2 weeks", "2-4 weeks", "1-2 months", "2-3 months", "3+ months"]
      },
      {
        name: "budget",
        label: "Budget",
        type: "text",
        placeholder: "e.g., $1000 fixed or $50/hr"
      }
    ]
  },
  {
    id: "distribution-promotion",
    title: "Distribution / Promotion Campaign",
    description: "Collaborate with creators and communities to drive reach and user growth",
    icon: Video,
    category: "Growth",
    defaultFields: {
      engagementType: "Project-based"
    },
    requiredFields: ["title", "description", "targetProfiles"],
    optionalFields: ["engagementType", "deadline", "location"],
    customFields: [
      {
        name: "channel",
        label: "Preferred Channel",
        type: "multiselect",
        options: ["WhatsApp", "Instagram", "LinkedIn", "YouTube", "Facebook", "X (Twitter)", "Telegram", "Discord"]
      },
      {
        name: "niche",
        label: "Target Niche",
        type: "text",
        placeholder: "e.g., Tech, Lifestyle, Fashion"
      },
      {
        name: "followerRange",
        label: "Partner Audience Size",
        type: "select",
        options: ["1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+"]
      },
      {
        name: "deliverables",
        label: "Expected Deliverables",
        type: "text",
        placeholder: "e.g., 3 Instagram posts + 1 community shoutout"
      },
      {
        name: "budget",
        label: "Budget",
        type: "text",
        placeholder: "e.g., $500 - $1000"
      }
    ]
  },
  {
    id: "agency-collaboration",
    title: "Agency Collaboration",
    description: "Work with specialised agencies for marketing, tech, design, or branding needs",
    icon: Building2,
    category: "Agency",
    defaultFields: {},
    requiredFields: ["title", "description"],
    optionalFields: ["engagementType", "deadline", "location"],
    customFields: [
      {
        name: "function",
        label: "Service Type",
        type: "select",
        options: [
          "AI Automation",
          "App / Web Development",
          "Performance Marketing",
          "Branding & Design",
          "SEO & Content Marketing",
          "Growth Strategy & GTM",
          "Legal & Compliance Support",
          "Accounting / Finance Support",
          "Other (Specify)"
        ]
      },
      {
        name: "budget",
        label: "Budget",
        type: "text",
        placeholder: "e.g., $1000 - $5000"
      },
      {
        name: "timeline",
        label: "Project Timeline",
        type: "select",
        options: ["1 month", "2-3 months", "3-6 months", "6+ months", "Ongoing"]
      }
    ]
  },
  {
    id: "advisor-mentor",
    title: "Find Advisor / Mentor",
    description: "Connect with experienced mentors for strategic guidance and support",
    icon: Lightbulb,
    category: "Advisory",
    defaultFields: {
      engagementType: "Partnership"
    },
    requiredFields: ["title", "description"],
    optionalFields: ["location"],
    customFields: [
      {
        name: "domain",
        label: "Advisory Domain",
        type: "text",
        placeholder: "e.g., Marketing, Fundraising, Product Strategy"
      },
      {
        name: "meetingFrequency",
        label: "Meeting Frequency",
        type: "select",
        options: ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "As needed"]
      },
      {
        name: "compensation",
        label: "Compensation",
        type: "text",
        placeholder: "e.g., Equity, Hourly rate, Free"
      }
    ]
  },
  {
    id: "fundraising",
    title: "Fundraising",
    description: "Showcase your startup and connect with potential investors to raise capital",
    icon: TrendingUp,
    category: "Fundraising",
    defaultFields: {},
    requiredFields: ["title", "description"],
    optionalFields: ["targetProfiles", "deadline", "location"],
    customFields: [
      {
        name: "stage",
        label: "Funding Stage",
        type: "select",
        options: [
          "Pre-seed (Ideation stage)",
          "Seed (MVP & early traction)",
          "Series A (Generating revenue)",
          "Series B/C/D (Expansion and scaling)",
          "MNC (Global)",
          "Other (Specify)"
        ]
      },
      {
        name: "amount",
        label: "Target Amount",
        type: "text",
        placeholder: "e.g., $500K - $1M"
      },
      {
        name: "traction",
        label: "Key Traction",
        type: "textarea",
        placeholder: "e.g., 10K users, $50K MRR, 30% MoM growth"
      },
      {
        name: "deckLink",
        label: "Pitch Deck Link",
        type: "text",
        placeholder: "https://..."
      }
    ]
  }
];

export const getCampaignTemplateById = (id: string): CampaignTemplate | undefined => {
  return campaignTemplates.find(template => template.id === id);
};
