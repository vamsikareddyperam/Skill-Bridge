"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Compass,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Map,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type CareerRecommendation = {
  career_id: string;
  title: string;
  description: string;
  score: number;
};

type TargetCareer = {
  id: string;
  title: string;
  description?: string;
};

type SkillGap = {
  career: string;
  existing_technical_skills?: string[];
  existing_soft_skills?: string[];
  missing_technical_skills: string[];
  missing_soft_skills: string[];
};

type RoadmapStep = {
  step: number;
  skill: string;
  goal: string;
  practice: string;
  resources: string[];
  estimated_time: string;
  difficulty: string;
  milestone: string;
};

const steps = [
  {
    id: 0,
    title: "Student Profile",
    short: "Your skills & interests",
    icon: "👤",
  },
  {
    id: 1,
    title: "Career Discovery",
    short: "Find your career",
    icon: "🎯",
  },
  {
    id: 2,
    title: "Skill Gap",
    short: "See what to learn",
    icon: "📊",
  },
  {
    id: 3,
    title: "AI Guidance",
    short: "Personalized advice",
    icon: "🤖",
  },
  {
    id: 4,
    title: "Learning Roadmap",
    short: "Your action plan",
    icon: "🗺️",
  },
];

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [dashboardSection, setDashboardSection] = useState<
    "overview" | "profile" | "career" | "skillgap" | "roadmap"
  >("overview");

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const [skills, setSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [interests, setInterests] = useState("");

  const [recommendations, setRecommendations] = useState<
    CareerRecommendation[]
  >([]);

  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedCareerId, setSelectedCareerId] = useState("");

  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);

  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);

  const [aiExplanation, setAiExplanation] = useState("");

  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false);

  const [loadingCareer, setLoadingCareer] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);

  const [error, setError] = useState("");

  const [roadmapProgress, setRoadmapProgress] = useState<
    Record<string, boolean>
  >({});

  const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const joinList = (value: unknown) =>
    Array.isArray(value) ? value.filter(Boolean).join(", ") : "";

  const hydrateFromUser = (user: {
    user_metadata?: Record<string, unknown>;
  } | null) => {
    if (!user) return;

    const meta = user.user_metadata || {};
    const savedName =
      typeof meta.full_name === "string" ? meta.full_name : "";

    setStudentName(savedName);
    setProfileName(savedName);
    setSkills(joinList(meta.skills));
    setSoftSkills(joinList(meta.soft_skills));
    setInterests(joinList(meta.interests));

    const career = meta.target_career as TargetCareer | undefined;
    if (career?.title) {
      setSelectedCareer(career.title);
      setSelectedCareerId(career.id || "");
    }

    if (meta.skill_gap) {
      setSkillGap(meta.skill_gap as SkillGap);
    }

    if (Array.isArray(meta.roadmap)) {
      setRoadmap(meta.roadmap as RoadmapStep[]);
    }

    if (meta.roadmap_progress && typeof meta.roadmap_progress === "object") {
      setRoadmapProgress(meta.roadmap_progress as Record<string, boolean>);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      hydrateFromUser(data.session?.user ?? null);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setShowDashboard(false);
        setDashboardSection("overview");
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        hydrateFromUser(nextSession.user);
      } else {
        const savedName =
          nextSession.user?.user_metadata?.full_name || "";
        setStudentName(savedName);
        setProfileName((current) => current || savedName);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          setShowDashboard(true);
        } else {
          setAuthError("Account created successfully. You can now log in.");
          setAuthMode("login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSession(data.session);
        setShowDashboard(true);
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const getStudentSkills = () =>
    skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

  const getStudentSoftSkills = () =>
    softSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

  const getStudentInterests = () =>
    interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

  const saveStudentProfile = async (event: FormEvent) => {
    event.preventDefault();

    const cleanName = profileName.trim();

    if (!cleanName) {
      setAuthError("Please enter your name.");
      return;
    }

    setProfileLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          skills: getStudentSkills(),
          soft_skills: getStudentSoftSkills(),
          interests: getStudentInterests(),
        },
      });

      if (error) throw error;

      setStudentName(
        data.user.user_metadata?.full_name || cleanName
      );
      if (data.user) {
        setSession((current: any) =>
          current ? { ...current, user: data.user } : current
        );
      }
      setShowDashboard(true);
      if (!studentName) {
        setDashboardSection("overview");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setAuthError(
        error instanceof Error
          ? error.message
          : "Could not save your profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        setAuthError(error.message);
        return;
      }

      setSession(null);
      setShowDashboard(false);
      setCurrentStep(0);
      setRecommendations([]);
      setSelectedCareer("");
      setSelectedCareerId("");
      setSkillGap(null);
      setRoadmap([]);
      setRoadmapProgress({});
      setAiExplanation("");
      setError("");
      setPassword("");
      setSkills("");
      setSoftSkills("");
      setInterests("");
      setStudentName("");
      setProfileName("");
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthError("Could not log out. Please try again.");
    }
  };

  const roadmapStepKey = (item: RoadmapStep) => `${item.step}-${item.skill}`;

  const toggleRoadmapProgress = async (item: RoadmapStep) => {
    const key = roadmapStepKey(item);
    const next = {
      ...roadmapProgress,
      [key]: !roadmapProgress[key],
    };

    setRoadmapProgress(next);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        roadmap_progress: next,
      },
    });

    if (!error && data.user) {
      setSession((current: any) =>
        current ? { ...current, user: data.user } : current
      );
    }
  };

  // =========================
  // FIND CAREERS
  // =========================

  const findCareers = async () => {
    setLoadingRecommendations(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/career/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: getStudentSkills(),
            soft_skills: getStudentSoftSkills(),
            interest: getStudentInterests().join(", "),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not get career recommendations.");
      }

      const data = await response.json();

      const { data: profileUpdate } = await supabase.auth.updateUser({
        data: {
          full_name: studentName,
          skills: getStudentSkills(),
          soft_skills: getStudentSoftSkills(),
          interests: getStudentInterests(),
        },
      });

      if (profileUpdate.user) {
        setSession((current: any) =>
          current ? { ...current, user: profileUpdate.user } : current
        );
      }

      setRecommendations(data.recommendations || []);

      setSelectedCareer("");
      setSelectedCareerId("");
      setSkillGap(null);
      setRoadmap([]);
      setAiExplanation("");

      setCurrentStep(1);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the SkillBridge backend. Make sure FastAPI is running."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // =========================
  // CHOOSE CAREER
  // =========================

  const chooseCareer = async (career: CareerRecommendation) => {
    const careerId = career.career_id;

    setSelectedCareer(career.title);
    setSelectedCareerId(careerId);

    setSkillGap(null);
    setRoadmap([]);
    setAiExplanation("");
    setError("");

    setLoadingCareer(true);

    try {
      const studentProfile = {
        skills: getStudentSkills(),
        soft_skills: getStudentSoftSkills(),
        interest: getStudentInterests().join(", "),
      };

      // -------------------------
      // Skill Gap
      // -------------------------

      const skillGapResponse = await fetch(
        `${API_BASE}/api/career/skill-gap?career_id=${careerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentProfile),
        }
      );

      if (!skillGapResponse.ok) {
        throw new Error("Could not calculate skill gap.");
      }

      const skillGapData = await skillGapResponse.json();

      setSkillGap(skillGapData);

      // -------------------------
      // Roadmap
      // -------------------------

      const roadmapResponse = await fetch(
        `${API_BASE}/api/career/roadmap?career_id=${careerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentProfile),
        }
      );

      if (!roadmapResponse.ok) {
        throw new Error("Could not generate roadmap.");
      }

      const roadmapData = await roadmapResponse.json();

      setRoadmap(roadmapData.roadmap || []);
      setRoadmapProgress({});

      const { data: careerUpdate } = await supabase.auth.updateUser({
        data: {
          target_career: {
            id: careerId,
            title: career.title,
            description: career.description,
          },
          skill_gap: skillGapData,
          roadmap: roadmapData.roadmap || [],
          roadmap_progress: {},
        },
      });

      if (careerUpdate.user) {
        setSession((current: any) =>
          current ? { ...current, user: careerUpdate.user } : current
        );
      }

      // -------------------------
      // AI Explanation
      // -------------------------

      setLoadingAI(true);

      const aiResponse = await fetch(
        `${API_BASE}/api/career/ai-explanation?career_id=${careerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentProfile),
        }
      );

      if (!aiResponse.ok) {
        throw new Error("Could not generate AI explanation.");
      }

      const aiData = await aiResponse.json();

      setAiExplanation(aiData.explanation || "");

      setCurrentStep(2);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while generating your career plan. Make sure the backend is running."
      );
    } finally {
      setLoadingCareer(false);
      setLoadingAI(false);
    }
  };

  // =========================
  // NAVIGATION
  // =========================

  const goToStep = (step: number) => {
    if (step === 0) {
      setCurrentStep(0);
      return;
    }

    if (step === 1 && recommendations.length > 0) {
      setCurrentStep(1);
      return;
    }

    if (step === 2 && skillGap) {
      setCurrentStep(2);
      return;
    }

    if (step === 3 && selectedCareer) {
      setCurrentStep(3);
      return;
    }

    if (step === 4 && roadmap.length > 0) {
      setCurrentStep(4);
    }
  };

  const nextFromSkillGap = () => {
    if (selectedCareer) {
      setCurrentStep(3);
    }
  };

  const nextFromAI = () => {
    if (roadmap.length > 0) {
      setCurrentStep(4);
    }
  };

  const restart = () => {
    setCurrentStep(0);

    setSkills("");
    setSoftSkills("");
    setInterests("");

    setRecommendations([]);

    setSelectedCareer("");
    setSelectedCareerId("");

    setSkillGap(null);
    setRoadmap([]);

    setAiExplanation("");

    setError("");
  };

  // =========================
  // STEP AVAILABILITY
  // =========================

  const isStepAvailable = (index: number) => {
    if (index === 0) return true;

    if (index === 1) {
      return recommendations.length > 0;
    }

    if (index === 2) {
      return !!skillGap;
    }

    if (index === 3) {
      return !!selectedCareer;
    }

    if (index === 4) {
      return roadmap.length > 0;
    }

    return false;
  };

  const isStepCompleted = (index: number) => {
    if (index === 0) {
      return currentStep > 0;
    }

    if (index === 1) {
      return recommendations.length > 0 && currentStep > 1;
    }

    if (index === 2) {
      return !!skillGap && currentStep > 2;
    }

    if (index === 3) {
      return !!aiExplanation && currentStep > 3;
    }

    return false;
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-600 text-2xl shadow-lg shadow-violet-600/20">
                🚀
              </div>
              <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
                Skill<span className="text-violet-600">Bridge</span>
              </h1>
              <p className="mt-2 text-slate-500">
                AI-powered career discovery and personalized learning
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${authMode === "login" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${authMode === "signup" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (session && !studentName) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                👋
              </div>
              <h1 className="mt-5 text-3xl font-extrabold">
                Welcome to SkillBridge
              </h1>
              <p className="mt-3 text-slate-600">
                Before we build your career dashboard, tell us your name.
              </p>
            </div>

            <form onSubmit={saveStudentProfile} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Student Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              {authError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {profileLoading ? "Saving Profile..." : "Save My Profile →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (session && showDashboard) {
    const savedCareer = session.user?.user_metadata?.target_career as TargetCareer | undefined;
    const savedSkillGap = session.user?.user_metadata?.skill_gap as SkillGap | undefined;
    const savedRoadmap = (session.user?.user_metadata?.roadmap || []) as RoadmapStep[];

    const completedSteps = savedRoadmap.filter(
      (item) => roadmapProgress[roadmapStepKey(item)]
    ).length;

    const dashboardCards = [
      {
        key: "profile" as const,
        icon: UserRound,
        title: "My Profile",
        description: "View and update your name, skills, and interests.",
      },
      {
        key: "career" as const,
        icon: Target,
        title: "Target Career",
        description: savedCareer?.title || "Choose a career to set your target.",
      },
      {
        key: "skillgap" as const,
        icon: Sparkles,
        title: "Skill Gap",
        description: savedSkillGap
          ? "See skills you already have and skills to develop."
          : "Complete career discovery to see your skill gap.",
      },
      {
        key: "roadmap" as const,
        icon: Map,
        title: "My Roadmap",
        description: savedRoadmap.length
          ? `${completedSteps}/${savedRoadmap.length} steps completed.`
          : "Your personalized learning roadmap will appear here.",
      },
    ];

    const renderSkillList = (items: string[] | undefined, emptyText: string) =>
      items && items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((skill) => (
            <li
              key={skill}
              className="rounded-lg bg-white/70 px-3 py-2 font-medium text-slate-700"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      );

    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-violet-600">SkillBridge Dashboard</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                Welcome, {studentName}
              </h1>
              <p className="mt-2 text-slate-600">
                Keep going — every skill you practice moves you closer to your target career.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setDashboardSection(card.key)}
                  className={`rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:shadow-md ${
                    dashboardSection === card.key
                      ? "border-violet-400 ring-2 ring-violet-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-violet-600">
                    Open {card.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {dashboardSection === "overview" && (
              <div>
                <h2 className="text-2xl font-bold">Career Overview</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
                    <p className="text-sm font-semibold text-violet-600">Target Career</p>
                    <p className="mt-2 font-bold">{savedCareer?.title || "Not selected yet"}</p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-600">Skill Gaps</p>
                    <p className="mt-2 font-bold">
                      {savedSkillGap
                        ? savedSkillGap.missing_technical_skills.length + savedSkillGap.missing_soft_skills.length
                        : 0} skills to develop
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-sm font-semibold text-emerald-600">Roadmap</p>
                    <p className="mt-2 font-bold">
                      {completedSteps}/{savedRoadmap.length || 0} steps complete
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dashboardSection === "profile" && (
              <div>
                <h2 className="text-2xl font-bold">Student Profile</h2>
                <p className="mt-1 text-slate-500">Update your details. Email comes from your SkillBridge account.</p>

                <form onSubmit={saveStudentProfile} className="mt-6 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Email</label>
                      <input
                        type="email"
                        value={session.user?.email || ""}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Technical skills</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(event) => setSkills(event.target.value)}
                        placeholder="Python, SQL, JavaScript"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Soft skills</label>
                      <input
                        type="text"
                        value={softSkills}
                        onChange={(event) => setSoftSkills(event.target.value)}
                        placeholder="Communication, Teamwork"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">Interests</label>
                      <input
                        type="text"
                        value={interests}
                        onChange={(event) => setInterests(event.target.value)}
                        placeholder="Machine Learning, Web Development"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    {profileLoading ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </div>
            )}

            {dashboardSection === "career" && (
              <div>
                <h2 className="text-2xl font-bold">Target Career</h2>
                {savedCareer ? (
                  <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-6">
                    <p className="text-sm font-semibold text-violet-600">Your selected career</p>
                    <p className="mt-2 text-2xl font-bold">{savedCareer.title}</p>
                    {savedCareer.description && (
                      <p className="mt-3 leading-6 text-slate-600">{savedCareer.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowDashboard(false);
                        setCurrentStep(0);
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
                    >
                      <Compass className="h-4 w-4" />
                      Discover another career
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl bg-slate-50 p-6">
                    <p className="text-slate-600">You have not selected a target career yet.</p>
                    <button
                      type="button"
                      onClick={() => setShowDashboard(false)}
                      className="mt-4 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
                    >
                      Discover Careers
                    </button>
                  </div>
                )}
              </div>
            )}

            {dashboardSection === "skillgap" && (
              <div>
                <h2 className="text-2xl font-bold">Skill Gap</h2>
                {savedSkillGap ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                      <h3 className="font-bold text-emerald-800">Technical skills you know</h3>
                      {renderSkillList(
                        savedSkillGap.existing_technical_skills ??
                          (session.user?.user_metadata?.skills || []),
                        "No matching technical skills yet."
                      )}
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
                      <h3 className="font-bold text-amber-800">Technical skills to develop</h3>
                      {renderSkillList(
                        savedSkillGap.missing_technical_skills,
                        "No major technical gaps found."
                      )}
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                      <h3 className="font-bold text-blue-800">Soft skills you know</h3>
                      {renderSkillList(
                        savedSkillGap.existing_soft_skills ??
                          (session.user?.user_metadata?.soft_skills || []),
                        "No matching soft skills yet."
                      )}
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
                      <h3 className="font-bold text-violet-800">Soft skills to develop</h3>
                      {renderSkillList(
                        savedSkillGap.missing_soft_skills,
                        "No major soft-skill gaps found."
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-slate-50 p-6 text-slate-600">Complete career discovery first to generate your skill gap.</p>
                )}
              </div>
            )}

            {dashboardSection === "roadmap" && (
              <div>
                <h2 className="text-2xl font-bold">My Learning Roadmap</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mark steps as you complete them. Progress is saved to your profile.
                </p>
                {savedRoadmap.length ? (
                  <div className="mt-5 space-y-4">
                    {savedRoadmap.map((item) => {
                      const done = !!roadmapProgress[roadmapStepKey(item)];
                      return (
                        <div
                          key={roadmapStepKey(item)}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => toggleRoadmapProgress(item)}
                              className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-400" />
                              )}
                              {done ? "Completed" : "Mark complete"}
                            </button>
                            <div className="flex gap-2">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {item.estimated_time}
                              </span>
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                {item.difficulty}
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-violet-600">Step {item.step}</p>
                          <h3 className="mt-1 text-lg font-bold">{item.skill}</h3>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                              <p className="font-semibold text-slate-500">Goal</p>
                              <p className="mt-1 text-slate-700">{item.goal}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                              <p className="font-semibold text-slate-500">Practice</p>
                              <p className="mt-1 text-slate-700">{item.practice}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                              <p className="font-semibold text-slate-500">Milestone</p>
                              <p className="mt-1 text-slate-700">{item.milestone}</p>
                            </div>
                          </div>
                          {item.resources?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-slate-500">Resources & projects</p>
                              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                {item.resources.map((resource) => (
                                  <li key={resource}>• {resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-slate-50 p-6 text-slate-600">Your roadmap will appear after you choose a career.</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-8">
            <h2 className="text-2xl font-bold">Continue your career journey</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Discover careers, analyze your skill gaps, and build your personalized roadmap.
            </p>
            <button
              type="button"
              onClick={() => { setShowDashboard(false); setCurrentStep(0); }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              <Compass className="h-4 w-4" />
              Discover Careers
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          TOP HEADER + HORIZONTAL STEPPER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">

          {/* Logo */}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl shadow-lg shadow-violet-600/20">
                🚀
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Skill<span className="text-violet-600">Bridge</span>
                </h1>

                <p className="text-xs text-slate-500">
                  AI Career Navigator
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 sm:block">
                Step {currentStep + 1} of 5
              </div>
              <button
                type="button"
                onClick={() => setShowDashboard(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Horizontal Stepper */}

          <div className="mt-6 overflow-x-auto pb-1">
            <div className="flex min-w-[760px] items-center">

              {steps.map((step, index) => {
                const isCurrent = currentStep === index;

                const available = isStepAvailable(index);

                const completed = isStepCompleted(index);

                return (
                  <div
                    key={step.id}
                    className="flex flex-1 items-center"
                  >

                    <button
                      onClick={() => goToStep(index)}
                      disabled={!available}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isCurrent
                          ? "bg-violet-50"
                          : available
                          ? "hover:bg-slate-50"
                          : "cursor-not-allowed"
                      }`}
                    >

                      {/* Circle */}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                          isCurrent
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                            : completed
                            ? "bg-emerald-500 text-white"
                            : available
                            ? "border-2 border-slate-300 bg-white text-slate-500"
                            : "border-2 border-slate-200 bg-slate-50 text-slate-300"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      {/* Text */}

                      <div className="min-w-0">

                        <p
                          className={`truncate text-sm font-bold ${
                            isCurrent
                              ? "text-violet-700"
                              : completed
                              ? "text-emerald-700"
                              : available
                              ? "text-slate-700"
                              : "text-slate-300"
                          }`}
                        >
                          {step.title}
                        </p>

                        <p
                          className={`truncate text-xs ${
                            available
                              ? "text-slate-400"
                              : "text-slate-300"
                          }`}
                        >
                          {step.short}
                        </p>

                      </div>
                    </button>

                    {/* Connector */}

                    {index < steps.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 w-6 shrink-0 sm:w-10 ${
                          currentStep > index
                            ? "bg-emerald-400"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            STEP 1 — STUDENT PROFILE
        ====================================================== */}

        {currentStep === 0 && (
          <section>

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                👤
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Step 1
              </p>

              <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                Tell us about yourself
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Enter your current skills, strengths, and interests.
                SkillBridge will use them to discover suitable career paths.
              </p>

            </div>

            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

              <div className="space-y-6">

                {/* Technical Skills */}

                <div>

                  <label className="mb-2 block font-semibold text-slate-800">
                    Technical Skills
                  </label>

                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, SQL, JavaScript"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Separate multiple skills with commas.
                  </p>

                </div>

                {/* Soft Skills */}

                <div>

                  <label className="mb-2 block font-semibold text-slate-800">
                    Soft Skills
                  </label>

                  <input
                    type="text"
                    value={softSkills}
                    onChange={(e) => setSoftSkills(e.target.value)}
                    placeholder="Communication, Teamwork, Problem Solving"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Example: Communication, Teamwork, Creativity
                  </p>

                </div>

                {/* Interests */}

                <div>

                  <label className="mb-2 block font-semibold text-slate-800">
                    Interests
                  </label>

                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Machine Learning, AI, Web Development"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    What areas of technology interest you?
                  </p>

                </div>

                {/* Continue */}

                <button
                  onClick={findCareers}
                  disabled={loadingRecommendations}
                  className="w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingRecommendations
                    ? "Finding suitable careers..."
                    : "Find Suitable Careers →"}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            STEP 2 — CAREER DISCOVERY
        ====================================================== */}

        {currentStep === 1 && (
          <section>

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                🎯
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Step 2
              </p>

              <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
                Discover your career
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                These career paths were identified from your current profile.
                Choose the one you want to explore.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-3">

              {recommendations.map((career) => (
                <div
                  key={career.career_id}
                  className={`rounded-2xl border bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
                    selectedCareerId === career.career_id
                      ? "border-violet-400 ring-2 ring-violet-100"
                      : "border-slate-200"
                  }`}
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                    💼
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {career.title}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {career.description}
                  </p>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Skill Match
                      </span>

                      <span className="font-bold text-violet-600">
                        {career.score}
                      </span>

                    </div>

                  </div>

                  <button
                    onClick={() => chooseCareer(career)}
                    disabled={loadingCareer}
                    className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingCareer && selectedCareerId === career.career_id
                      ? "Building your plan..."
                      : "Choose This Career →"}
                  </button>

                </div>
              ))}

            </div>

            {recommendations.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-slate-500">
                  No career recommendations found.
                </p>

                <button
                  onClick={() => setCurrentStep(0)}
                  className="mt-4 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
                >
                  ← Update Profile
                </button>
              </div>
            )}

          </section>
        )}

        {/* =====================================================
            STEP 3 — SKILL GAP
        ====================================================== */}

        {currentStep === 2 && skillGap && (
          <section>

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                📊
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Step 3
              </p>

              <h2 className="mt-2 text-4xl font-extrabold">
                Understand your skill gap
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                For your target career as a{" "}
                <span className="font-semibold text-slate-900">
                  {selectedCareer}
                </span>
                , these are the skills you should focus on developing.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg">
                <h3 className="font-bold text-emerald-800">Technical skills you know</h3>
                {skillGap.existing_technical_skills && skillGap.existing_technical_skills.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {skillGap.existing_technical_skills.map((skill) => (
                      <div key={skill} className="rounded-xl bg-emerald-50 p-4 font-medium text-slate-700">
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-700">
                    No matching technical skills yet.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-lg">
                <h3 className="font-bold text-amber-800">Technical skills to develop</h3>
                {skillGap.missing_technical_skills.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {skillGap.missing_technical_skills.map((skill) => (
                      <div key={skill} className="rounded-xl bg-amber-50 p-4 font-medium text-slate-700">
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-700">
                    No major technical skill gaps found.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-lg">
                <h3 className="font-bold text-blue-800">Soft skills you know</h3>
                {skillGap.existing_soft_skills && skillGap.existing_soft_skills.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {skillGap.existing_soft_skills.map((skill) => (
                      <div key={skill} className="rounded-xl bg-blue-50 p-4 font-medium text-slate-700">
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-700">
                    No matching soft skills yet.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-lg">
                <h3 className="font-bold text-violet-800">Soft skills to develop</h3>
                {skillGap.missing_soft_skills.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {skillGap.missing_soft_skills.map((skill) => (
                      <div key={skill} className="rounded-xl bg-violet-50 p-4 font-medium text-slate-700">
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl bg-violet-50 p-4 text-violet-700">
                    No major soft-skill gaps found.
                  </div>
                )}
              </div>

            </div>

            <div className="mt-8 flex justify-end">

              <button
                onClick={nextFromSkillGap}
                className="rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
              >
                Continue to AI Guidance →
              </button>

            </div>

          </section>
        )}

        {/* =====================================================
            STEP 4 — AI GUIDANCE
        ====================================================== */}

        {currentStep === 3 && selectedCareer && (
          <section>

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                🤖
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Step 4
              </p>

              <h2 className="mt-2 text-4xl font-extrabold">
                AI Career Guidance
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Gemini has analyzed your profile and target career to create
                personalized guidance.
              </p>

            </div>

            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-xl">

              <div className="border-b border-violet-100 bg-violet-50 p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                    ✨
                  </div>

                  <div>

                    <p className="text-sm font-medium uppercase tracking-wider text-violet-600">
                      Target Career
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      {selectedCareer}
                    </h3>

                  </div>

                </div>

              </div>

              <div className="p-6">

                {loadingAI ? (
                  <div className="flex items-center gap-4 rounded-xl bg-violet-50 p-6">

                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

                    <div>

                      <p className="font-semibold">
                        Gemini is analyzing your profile...
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Creating personalized career guidance.
                      </p>

                    </div>

                  </div>
                ) : aiExplanation ? (
                  <div className="rounded-xl bg-slate-50 p-6">

                    <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-violet-600">
                      🤖 Gemini&apos;s Analysis
                    </div>

                    <div className="whitespace-pre-wrap leading-7 text-slate-700">
                      {aiExplanation}
                    </div>

                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-5 text-slate-500">
                    AI guidance is not available right now.
                  </div>
                )}

              </div>

            </div>

            <div className="mt-8 flex justify-end">

              <button
                onClick={nextFromAI}
                disabled={!roadmap.length}
                className="rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                View My Learning Roadmap →
              </button>

            </div>

          </section>
        )}

        {/* =====================================================
            STEP 5 — ROADMAP
        ====================================================== */}

        {currentStep === 4 && (
          <section>

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                🗺️
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Step 5
              </p>

              <h2 className="mt-2 text-4xl font-extrabold">
                Your Personalized Roadmap
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Follow these practical steps to close your skill gaps and
                move toward your target career.
              </p>

            </div>

            {roadmap.length > 0 ? (
              <div className="space-y-6">

                {roadmap.map((item) => (
                  <div
                    key={`${item.step}-${item.skill}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
                  >

                    {/* Roadmap Header */}

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white shadow-md">
                          {item.step}
                        </div>

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Step {item.step}
                          </p>

                          <h3 className="text-xl font-bold text-slate-900">
                            {item.skill}
                          </h3>

                        </div>

                      </div>

                      <div className="flex gap-2">

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          ⏱ {item.estimated_time}
                        </span>

                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          {item.difficulty}
                        </span>

                      </div>

                    </div>

                    {/* Details */}

                    <div className="mt-6 grid gap-4 md:grid-cols-3">

                      <div className="rounded-xl bg-violet-50 p-5">

                        <p className="text-sm font-bold text-violet-600">
                          🎯 Goal
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.goal}
                        </p>

                      </div>

                      <div className="rounded-xl bg-blue-50 p-5">

                        <p className="text-sm font-bold text-blue-600">
                          🛠 Practice
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.practice}
                        </p>

                      </div>

                      <div className="rounded-xl bg-emerald-50 p-5">

                        <p className="text-sm font-bold text-emerald-600">
                          🏆 Milestone
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.milestone}
                        </p>

                      </div>

                    </div>

                    {/* Resources */}

                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">

                      <p className="text-sm font-bold text-amber-700">
                        📚 Resources & Projects
                      </p>

                      <ul className="mt-3 space-y-2">

                        {item.resources.map((resource) => (
                          <li
                            key={resource}
                            className="flex gap-2 text-sm text-slate-700"
                          >
                            <span className="font-bold text-amber-600">
                              •
                            </span>

                            <span>{resource}</span>
                          </li>
                        ))}

                      </ul>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

                <p className="text-slate-500">
                  Your roadmap will appear here after selecting a career.
                </p>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
                >
                  Choose a Career
                </button>

              </div>
            )}

            {/* Finish */}

            {roadmap.length > 0 && (
              <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-6 text-center">

                <div className="text-3xl">
                  🎉
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  You have your SkillBridge plan!
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Start with the first skill, complete the practical activity,
                  and move through your roadmap step by step.
                </p>

                <button
                  onClick={() => setShowDashboard(true)}
                  className="mt-5 rounded-xl border border-violet-300 bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  Back to Dashboard
                </button>

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-14 border-t border-slate-200 py-8 text-center">

          <p className="text-sm font-medium text-slate-600">
            🚀 SkillBridge
          </p>

          <p className="mt-1 text-xs text-slate-400">
            AI-powered career discovery and personalized learning
          </p>

        </footer>

      </div>
    </main>
  );
}