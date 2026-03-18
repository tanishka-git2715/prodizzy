import {
  Briefcase,
  Code,
  Video,
  Users,
  TestTube,
  GraduationCap,
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
  defaultTitle: string;
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
    type: "text" | "select" | "number" | "textarea";
    options?: string[];
    placeholder?: string;
  }[];
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: "hiring-talent",
    title: "Hiring Talent",
    description: "Find full-time or contract talent for your team",
    icon: Briefcase,
    category: "Hiring",
    defaultTitle: "Hiring {role} for {project}",
    defaultFields: {
      engagementType: "Full-time",
      experience: "Intermediate"
    },
    requiredFields: ["title", "description", "skills", "engagementType"],
    optionalFields: ["budget", "location", "deadline"],
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
      }
    ]
  },
  {
    id: "freelance-project",
    title: "Freelance Project",
    description: "Hire freelancers for short-term projects",
    icon: Code,
    category: "Freelance",
    defaultTitle: "Need {skill} for {project}",
    defaultFields: {
      engagementType: "Project-based",
      workType: "Remote"
    },
    requiredFields: ["title", "description", "skills", "budget"],
    optionalFields: ["deadline", "location"],
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
      }
    ]
  },
  {
    id: "creator-campaign",
    title: "Creator Campaign",
    description: "Collaborate with content creators and influencers",
    icon: Video,
    category: "Creator",
    defaultTitle: "Looking for {number} creators for {campaign}",
    defaultFields: {
      engagementType: "Project-based"
    },
    requiredFields: ["title", "description", "targetProfiles", "budget"],
    optionalFields: ["deadline", "location"],
    customFields: [
      {
        name: "platform",
        label: "Platform",
        type: "select",
        options: ["Instagram", "YouTube", "TikTok", "Twitter", "LinkedIn", "Multiple"]
      },
      {
        name: "niche",
        label: "Creator Niche",
        type: "text",
        placeholder: "e.g., Tech, Lifestyle, Fashion"
      },
      {
        name: "followerRange",
        label: "Follower Range",
        type: "select",
        options: ["1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+"]
      },
      {
        name: "deliverables",
        label: "Deliverables",
        type: "text",
        placeholder: "e.g., 3 Instagram posts + 2 stories"
      }
    ]
  },
  {
    id: "cofounder-search",
    title: "Co-founder Search",
    description: "Find the perfect co-founder for your startup",
    icon: Users,
    category: "Startup",
    defaultTitle: "Looking for Co-founder (Equity Based)",
    defaultFields: {
      engagementType: "Equity",
      compensation: "Equity"
    },
    requiredFields: ["title", "description", "skills"],
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
        options: ["Part-time", "Full-time", "Flexible"]
      }
    ]
  },
  {
    id: "beta-testing",
    title: "Beta Testing",
    description: "Get early users to test your product",
    icon: TestTube,
    category: "Testing",
    defaultTitle: "Need testers for {product}",
    defaultFields: {
      engagementType: "Part-time",
      experience: "Beginner"
    },
    requiredFields: ["title", "description", "targetProfiles"],
    optionalFields: ["deadline", "budget"],
    customFields: [
      {
        name: "product",
        label: "Product Name",
        type: "text",
        placeholder: "e.g., TaskFlow App"
      },
      {
        name: "testingDuration",
        label: "Testing Duration",
        type: "select",
        options: ["1 week", "2 weeks", "1 month", "Ongoing"]
      },
      {
        name: "incentive",
        label: "Incentive",
        type: "text",
        placeholder: "e.g., Free premium access, $50 Amazon gift card"
      },
      {
        name: "feedbackType",
        label: "Feedback Type",
        type: "select",
        options: ["Survey", "Interview", "Bug Reports", "Usage Analytics"]
      }
    ]
  },
  {
    id: "campus-ambassadors",
    title: "Campus Ambassadors",
    description: "Build a student ambassador program",
    icon: GraduationCap,
    category: "Students",
    defaultTitle: "Hiring campus ambassadors",
    defaultFields: {
      engagementType: "Part-time"
    },
    requiredFields: ["title", "description", "targetProfiles"],
    optionalFields: ["budget", "deadline", "location"],
    customFields: [
      {
        name: "responsibilities",
        label: "Key Responsibilities",
        type: "textarea",
        placeholder: "e.g., Organize events, promote on social media, recruit users"
      },
      {
        name: "perks",
        label: "Perks & Benefits",
        type: "text",
        placeholder: "e.g., Stipend, swag, networking opportunities"
      },
      {
        name: "duration",
        label: "Program Duration",
        type: "select",
        options: ["1 semester", "1 year", "Ongoing"]
      }
    ]
  },
  {
    id: "advisor-mentor",
    title: "Advisor / Mentor",
    description: "Find experienced advisors for your business",
    icon: Lightbulb,
    category: "Advisory",
    defaultTitle: "Looking for advisor in {domain}",
    defaultFields: {
      engagementType: "Advisory"
    },
    requiredFields: ["title", "description", "skills"],
    optionalFields: ["budget", "location"],
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
    description: "Raise capital for your startup",
    icon: TrendingUp,
    category: "Fundraising",
    defaultTitle: "Raising {stage} round",
    defaultFields: {},
    requiredFields: ["title", "description"],
    optionalFields: ["targetProfiles", "deadline"],
    customFields: [
      {
        name: "stage",
        label: "Funding Stage",
        type: "select",
        options: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"]
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
  },
  {
    id: "community-partnership",
    title: "Community Partnership",
    description: "Partner with communities and organizations",
    icon: Users,
    category: "Agency",
    defaultTitle: "Looking for community partnership",
    defaultFields: {
      engagementType: "Long-term"
    },
    requiredFields: ["title", "description"],
    optionalFields: ["targetProfiles", "deadline", "budget"],
    customFields: [
      {
        name: "partnershipType",
        label: "Partnership Type",
        type: "select",
        options: ["Event Collaboration", "Content Partnership", "Co-marketing", "Distribution"]
      },
      {
        name: "audienceSize",
        label: "Expected Audience Reach",
        type: "text",
        placeholder: "e.g., 10K+ members"
      }
    ]
  },
  {
    id: "agency-collaboration",
    title: "Agency Collaboration",
    description: "Work with agencies for specialized services",
    icon: Building2,
    category: "Agency",
    defaultTitle: "Looking for agency for {function}",
    defaultFields: {},
    requiredFields: ["title", "description", "budget"],
    optionalFields: ["deadline", "skills"],
    customFields: [
      {
        name: "function",
        label: "Service Type",
        type: "select",
        options: ["Marketing", "Design", "Development", "Content", "PR", "SEO", "Social Media"]
      },
      {
        name: "scope",
        label: "Project Scope",
        type: "textarea",
        placeholder: "Describe what you need help with"
      },
      {
        name: "deliverables",
        label: "Expected Deliverables",
        type: "textarea",
        placeholder: "List key deliverables"
      },
      {
        name: "timeline",
        label: "Project Timeline",
        type: "select",
        options: ["1 month", "2-3 months", "3-6 months", "6+ months", "Ongoing"]
      }
    ]
  }
];

export const getCampaignTemplateById = (id: string): CampaignTemplate | undefined => {
  return campaignTemplates.find(template => template.id === id);
};
