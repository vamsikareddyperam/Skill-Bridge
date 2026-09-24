"use client";

import { useState } from "react";

type CareerRecommendation = {
  career_id: string;
  title: string;
  description: string;
  score: number;
};

type SkillGap = {
  career: string;
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

export default function Home() {
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
  const [loadingAI, setLoadingAI] = useState(false);

  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingCareer, setLoadingCareer] = useState(false);

  const [error, setError] = useState("");

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

  const findCareers = async () => {
    setLoadingRecommendations(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/career/recommend",
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

      setRecommendations(data.recommendations || []);

      setSelectedCareer("");
      setSelectedCareerId("");
      setSkillGap(null);
      setRoadmap([]);
      setAiExplanation("");
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the SkillBridge backend. Make sure FastAPI is running."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const chooseCareer = async (career: string) => {
    const careerIds: Record<string, string> = {
      "Machine Learning Engineer": "ml-engineer",
      "Data Engineer": "data-engineer",
      "Frontend Developer": "frontend-developer",
    };

    const careerId = careerIds[career];

    if (!careerId) {
      setError("Career ID not found.");
      return;
    }

    setSelectedCareer(career);
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

      // -----------------------------
      // 1. Skill-gap analysis
      // -----------------------------
      const skillGapResponse = await fetch(
        `http://127.0.0.1:8000/api/career/skill-gap?career_id=${careerId}`,
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

      // -----------------------------
      // 2. Personalized roadmap
      // -----------------------------
      const roadmapResponse = await fetch(
        `http://127.0.0.1:8000/api/career/roadmap?career_id=${careerId}`,
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

      // -----------------------------
      // 3. Gemini AI explanation
      // -----------------------------
      setLoadingAI(true);

      const aiResponse = await fetch(
        `http://127.0.0.1:8000/api/career/ai-explanation?career_id=${careerId}`,
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
      <section className="mb-12 text-center">
  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-3xl">
    🚀
  </div>

  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
    AI-Powered Career Guidance
  </p>

  <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
    Skill<span className="text-blue-400">Bridge</span>
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
    Discover the right career for your skills, understand what you are
    missing, and get a personalized roadmap to reach your goal.
  </p>

  <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-3 text-sm">
    <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
      🎯 Career Discovery
    </span>

    <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
      📊 Skill Gap Analysis
    </span>

    <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
      🤖 AI Guidance
    </span>

    <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
      🗺️ Learning Roadmap
    </span>
  </div>
</section>

{/* How SkillBridge Works */}
<section className="mb-10 grid gap-4 md:grid-cols-4">
  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
    <div className="text-2xl">👤</div>
    <h3 className="mt-3 font-semibold">1. Your Profile</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Enter your skills, interests, and strengths.
    </p>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
    <div className="text-2xl">🎯</div>
    <h3 className="mt-3 font-semibold">2. Career Discovery</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Discover career paths that match your profile.
    </p>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
    <div className="text-2xl">📊</div>
    <h3 className="mt-3 font-semibold">3. Skill Gap</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Understand which skills you need to develop.
    </p>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
    <div className="text-2xl">🗺️</div>
    <h3 className="mt-3 font-semibold">4. Roadmap</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      Follow a practical personalized learning plan.
    </p>
  </div>
</section>

        {/* Student Profile */}
<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
      👤
    </div>

    <div>
      <h2 className="text-2xl font-semibold">
        1. Tell us about yourself
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Your skills and interests help us find suitable career paths.
      </p>
    </div>
  </div>

  <div className="mt-6 space-y-5">
    <div>
      <label className="mb-2 block font-medium">
        Technical Skills
      </label>

      <input
        type="text"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder="Python, SQL, JavaScript"
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />

      <p className="mt-2 text-xs text-slate-500">
        Example: Python, SQL, React
      </p>
    </div>

    <div>
      <label className="mb-2 block font-medium">
        Soft Skills
      </label>

      <input
        type="text"
        value={softSkills}
        onChange={(e) => setSoftSkills(e.target.value)}
        placeholder="Communication, Teamwork, Problem Solving"
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />

      <p className="mt-2 text-xs text-slate-500">
        Example: Communication, Teamwork
      </p>
    </div>

    <div>
      <label className="mb-2 block font-medium">
        Interests
      </label>

      <input
        type="text"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="Machine Learning, AI, Web Development"
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />

      <p className="mt-2 text-xs text-slate-500">
        Example: AI, Web Development, Data Science
      </p>
    </div>

    <button
      onClick={findCareers}
      disabled={loadingRecommendations}
      className="w-full rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loadingRecommendations
        ? "Finding Careers..."
        : "🎯 Find Suitable Careers"}
    </button>
  </div>
</section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Recommendations */}
{recommendations.length > 0 && (
  <section className="mt-10">
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/20 text-xl">
        🎯
      </div>

      <div>
        <h2 className="text-2xl font-semibold">
          2. Recommended Career Paths
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Based on your current skills, interests, and strengths.
        </p>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-3">
      {recommendations.map((career) => (
        <div
          key={career.career_id}
          className="group rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">
            💼
          </div>

          <h3 className="text-xl font-semibold">
            {career.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {career.description}
          </p>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Skill Match
              </span>

              <span className="font-bold text-blue-400">
                {career.score}
              </span>
            </div>
          </div>

          <button
            onClick={() => chooseCareer(career.title)}
            disabled={loadingCareer}
            className="mt-5 w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose This Career →
          </button>
        </div>
      ))}
    </div>
  </section>
)}
        {/* Selected Career */}
{selectedCareer && (
  <section className="mt-10 overflow-hidden rounded-2xl border border-blue-500/40 bg-slate-900 shadow-xl">
    <div className="border-b border-slate-800 bg-blue-500/10 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">
          🚀
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
            Your Target Career
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {selectedCareer}
          </h2>
        </div>
      </div>
    </div>

    <div className="p-6">
      {loadingCareer ? (
        <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />

          <p className="text-slate-300">
            Building your personalized career plan...
          </p>
        </div>
      ) : (
        <p className="text-slate-400">
          Your skill analysis, AI guidance, and personalized learning roadmap
          are ready below.
        </p>
      )}
    </div>
  </section>
)}
        {/* Skill Gap */}
{skillGap && (
  <section className="mt-10">
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-xl">
        📊
      </div>

      <div>
        <h2 className="text-2xl font-semibold">
          3. Your Skill Gap
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Skills you can develop to move closer to your target career.
        </p>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
            💻
          </div>

          <h3 className="text-lg font-semibold">
            Technical Skills
          </h3>
        </div>

        {skillGap.missing_technical_skills.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {skillGap.missing_technical_skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-3 rounded-lg bg-slate-800 p-3 text-slate-300"
              >
                <span className="text-orange-400">→</span>
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-lg bg-green-950/20 p-4 text-green-400">
            ✓ No major technical skill gaps found.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            🤝
          </div>

          <h3 className="text-lg font-semibold">
            Soft Skills
          </h3>
        </div>

        {skillGap.missing_soft_skills.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {skillGap.missing_soft_skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-3 rounded-lg bg-slate-800 p-3 text-slate-300"
              >
                <span className="text-purple-400">→</span>
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-lg bg-green-950/20 p-4 text-green-400">
            ✓ No major soft-skill gaps found.
          </p>
        )}
      </div>
    </div>
  </section>
)}

        {/* Gemini AI Explanation */}
{selectedCareer && (
  <section className="mt-10 overflow-hidden rounded-2xl border border-purple-500/40 bg-slate-900 shadow-xl">
    <div className="border-b border-purple-500/20 bg-purple-500/10 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl">
          🤖
        </div>

        <div>
          <h2 className="text-2xl font-semibold">
            AI Career Guidance
          </h2>

          <p className="mt-1 text-sm text-purple-300">
            Personalized by Gemini using your profile
          </p>
        </div>
      </div>
    </div>

    <div className="p-6">
      {loadingAI ? (
        <div className="flex items-center gap-4 rounded-xl bg-slate-800 p-5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-purple-400" />

          <div>
            <p className="font-medium text-slate-200">
              Gemini is analyzing your profile...
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Creating personalized career guidance for you.
            </p>
          </div>
        </div>
      ) : aiExplanation ? (
        <div className="rounded-xl bg-slate-800 p-6 leading-7 text-slate-200">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-purple-400">
            ✨ Gemini's Analysis
          </div>

          <div className="whitespace-pre-wrap">
            {aiExplanation}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-800 p-5 text-slate-400">
          AI career guidance will appear here.
        </div>
      )}
    </div>
  </section>
)}
      {/* Roadmap */}
{roadmap.length > 0 && (
  <section className="mt-10">
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-xl">
        🗺️
      </div>

      <div>
        <h2 className="text-2xl font-semibold">
          4. Your Personalized Roadmap
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          A practical step-by-step plan to close your skill gaps.
        </p>
      </div>
    </div>

    <div className="space-y-5">
      {roadmap.map((item) => (
        <div
          key={`${item.step}-${item.skill}`}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold">
                {item.step}
              </span>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Step {item.step}
                </p>

                <h3 className="text-xl font-semibold">
                  {item.skill}
                </h3>
              </div>
            </div>

            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
              {item.difficulty}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm font-semibold text-blue-400">
                🎯 Goal
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.goal}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm font-semibold text-cyan-400">
                ⏱️ Estimated Time
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.estimated_time}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm font-semibold text-green-400">
                🏆 Milestone
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.milestone}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-800 p-5">
            <p className="text-sm font-semibold text-purple-400">
              🛠️ Practice
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {item.practice}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="text-sm font-semibold text-orange-400">
              📚 Resources & Projects
            </p>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {item.resources.map((resource) => (
                <li key={resource} className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </section>
)}
        {/* Footer */}
        <footer className="mt-12 border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          SkillBridge • Career discovery and personalized learning roadmap
        </footer>
      </div>
    </main>
  );
}