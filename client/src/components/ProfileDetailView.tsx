import { Mail, Phone, Linkedin, Globe, FileText } from "lucide-react";
import { ensureHttps } from "@/lib/utils";
import type { IndividualProfile } from "@shared/schema";

interface ProfileDetailViewProps {
    profile: IndividualProfile;
    isAdmin?: boolean;
}

function Tag({ label, color }: { label: string; color?: string }) {
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-white/8 text-white/50 border-white/10"}`}>
            {label}
        </span>
    );
}

function DetailRow({ label, value }: { label: string; value: string | string[] | undefined | null }) {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(", ") : value;
    return (
        <div>
            <p className="text-[10px] text-white/20 uppercase mb-1">{label}</p>
            <p className="text-sm text-white/70">{displayValue}</p>
        </div>
    );
}

export function ProfileDetailView({ profile, isAdmin }: ProfileDetailViewProps) {
    const roles = profile.roles || [];
    const location = profile.location || "NA";
    const skills = profile.skills || [];
    const investorData = profile.investor_data;
    const studentData = profile.student_data;
    const professionalData = profile.professional_data;
    const freelancerData = profile.freelancer_data;
    const consultantData = profile.consultant_data;
    const creatorData = profile.creator_data;
    const founderStatus = profile.founder_status;

    const isInvestor = roles.includes("Investor");
    const isShortPath = roles.length === 1 && (roles.includes("Founder") || roles.includes("Other (Specify)"));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                    {profile.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">{profile.full_name}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/45 text-sm">
                        <span>{roles.join(", ")}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{location}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Column 1 */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Contact & Progress</h3>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-white/70">{profile.email}</span>
                            </div>
                            {profile.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-white/70">{profile.phone}</span>
                                </div>
                            )}
                            {profile.linkedin_url && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Linkedin className="w-3.5 h-3.5 text-white/30" />
                                    <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn Profile &rarr;</a>
                                </div>
                            )}
                            {profile.portfolio_url && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="w-3.5 h-3.5 text-white/30" />
                                    <a href={ensureHttps(profile.portfolio_url)} target="_blank" rel="noreferrer" className="text-white/70 hover:underline truncate">{profile.portfolio_url.replace(/^https?:\/\//, "")}</a>
                                </div>
                            )}
                            {profile.resume_url && (
                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="w-3.5 h-3.5 text-white/30" />
                                    <a href={ensureHttps(profile.resume_url)} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline transition-colors uppercase text-[10px] font-bold tracking-wider">View Resume</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isShortPath && !isInvestor && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Profile & Expertise</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-white/20 uppercase mb-1">Roles</p>
                                    <p className="text-sm text-white/70">{roles.join(", ")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    {/* Role Specific Details - Extended */}
                    {(roles.some(r => ["Investor", "Student", "Working Professional", "Freelancer / Service Provider", "Consultant / Mentor / Advisor", "Content Creator / Community Admin", "Founder"].includes(r))) && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Role-Specific Details</h3>
                            <div className="space-y-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                {roles.includes("Founder") && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-red-400/60 uppercase font-bold">Founder Status</p>
                                        <p className="text-sm text-white/70">{founderStatus || "Exploring"}</p>
                                    </div>
                                )}
                                {roles.includes("Investor") && investorData && (
                                    <div className={`space-y-3 ${roles.indexOf("Investor") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-red-400/60 uppercase font-bold">Investor Profile</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Type" value={investorData.investor_types} />
                                            <DetailRow label="Stages" value={investorData.investment_stages} />
                                            <DetailRow label="Ticket Size" value={investorData.ticket_size} />
                                            <DetailRow label="Focus Area" value={investorData.industries} />
                                            <DetailRow label="Geography" value={investorData.geography === "Specific Regions (Specify)" ? investorData.specific_regions : investorData.geography} />
                                        </div>
                                    </div>
                                )}

                                {roles.includes("Student") && studentData && (
                                    <div className={`space-y-3 ${roles.indexOf("Student") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-blue-400/60 uppercase font-bold">Academic Info</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Institution" value={studentData.institution} />
                                            <DetailRow label="Course" value={studentData.course} />
                                            <DetailRow label="Year" value={studentData.year} />
                                            <DetailRow label="Community" value={studentData.communities?.is_member ? "Member" : "No"} />
                                        </div>
                                        {skills.length > 0 && (
                                            <div className="pt-1">
                                                <p className="text-[10px] text-white/20 uppercase mb-1">Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skills.map(s => <Tag key={s} label={s} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {roles.includes("Working Professional") && professionalData && (
                                    <div className={`space-y-3 ${roles.indexOf("Working Professional") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-green-400/60 uppercase font-bold">Professional Path</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Company" value={professionalData.company} />
                                            <DetailRow label="Title" value={professionalData.title} />
                                            <DetailRow label="Experience" value={professionalData.experience_years} />
                                            <DetailRow label="Notice Period" value={professionalData.notice_period} />
                                        </div>
                                        {skills.length > 0 && (
                                            <div className="pt-1">
                                                <p className="text-[10px] text-white/20 uppercase mb-1">Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skills.map(s => <Tag key={s} label={s} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {roles.includes("Freelancer / Service Provider") && freelancerData && (
                                    <div className={`space-y-3 ${roles.indexOf("Freelancer / Service Provider") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-purple-400/60 uppercase font-bold">Freelance Details</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Experience" value={freelancerData.experience_years} />
                                            <DetailRow label="Model" value={freelancerData.engagement_model} />
                                            <DetailRow label="Project Budget" value={freelancerData.budget_range} />
                                        </div>
                                        {freelancerData.notable_clients && (
                                            <DetailRow label="Notable Clients" value={freelancerData.notable_clients} />
                                        )}
                                        {skills.length > 0 && (
                                            <div className="pt-1">
                                                <p className="text-[10px] text-white/20 uppercase mb-1">Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skills.map(s => <Tag key={s} label={s} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {roles.includes("Consultant / Mentor / Advisor") && consultantData && (
                                    <div className={`space-y-3 ${roles.indexOf("Consultant / Mentor / Advisor") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-orange-400/60 uppercase font-bold">Advisory Profile</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Expertise" value={consultantData.expertise_areas} />
                                            <DetailRow label="Level" value={consultantData.experience_level} />
                                            <DetailRow label="Support Type" value={consultantData.support_types} />
                                        </div>
                                    </div>
                                )}

                                {roles.includes("Content Creator / Community Admin") && creatorData && (
                                    <div className={`space-y-3 ${roles.indexOf("Content Creator / Community Admin") > 0 ? "pt-4 border-t border-white/5" : ""}`}>
                                        <p className="text-[10px] text-pink-400/60 uppercase font-bold">Creator Presence</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Platforms" value={creatorData.platforms} />
                                            <DetailRow label="Audience" value={creatorData.audience_size} />
                                            <DetailRow label="Niches" value={creatorData.niches} />
                                        </div>
                                        {creatorData.profile_links && (
                                            <DetailRow label="Links" value={creatorData.profile_links} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
