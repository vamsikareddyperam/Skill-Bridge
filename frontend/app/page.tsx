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
        {/* Header */}
        <section className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Skill<span className="text-blue-400">Bridge</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Discover suitable career paths, identify your skill gaps, and get
            a personalized roadmap to reach your target career.
          </p>
        </section>

        {/* Student Profile */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-2xl font-semibold">
            1. Tell us about yourself
          </h2>

          <p className="mt-2 text-slate-400">
            Enter your skills and interests separated by commas.
          </p>

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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={findCareers}
              disabled={loadingRecommendations}
              className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingRecommendations
                ? "Finding Careers..."
                : "Find Suitable Careers"}
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
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-semibold">
              2. Recommended Career Paths
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              {recommendations.map((career) => (
                <div
                  key={career.career_id}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg"
                >
                  <h3 className="text-xl font-semibold">
                    {career.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {career.description}
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-800 p-3 text-sm">
                    Match score:{" "}
                    <span className="font-bold text-blue-400">
                      {career.score}
                    </span>
                  </div>

                  <button
                    onClick={() => chooseCareer(career.title)}
                    disabled={loadingCareer}
                    className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Choose This Career
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected Career */}
        {selectedCareer && (
          <section className="mt-8 rounded-2xl border border-blue-500/40 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Your Target Career
            </p>

            <h2 className="mt-1 text-3xl font-bold text-blue-400">
              {selectedCareer}
            </h2>

            {loadingCareer && (
              <p className="mt-4 text-slate-300">
                Building your personalized career plan...
              </p>
            )}
          </section>
        )}

        {/* Skill Gap */}
        {skillGap && (
          <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-2xl font-semibold">
              3. Your Skill Gap
            </h2>

            <p className="mt-2 text-slate-400">
              These are the skills you should develop for your target career.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-slate-800 p-5">
                <h3 className="font-semibold text-blue-400">
                  Technical Skills
                </h3>

                {skillGap.missing_technical_skills.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-slate-300">
                    {skillGap.missing_technical_skills.map((skill) => (
                      <li key={skill}>• {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-slate-400">
                    No major technical skill gaps found.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-800 p-5">
                <h3 className="font-semibold text-blue-400">
                  Soft Skills
                </h3>

                {skillGap.missing_soft_skills.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-slate-300">
                    {skillGap.missing_soft_skills.map((skill) => (
                      <li key={skill}>• {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-slate-400">
                    No major soft-skill gaps found.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Gemini AI Explanation */}
        {selectedCareer && (
          <section className="mt-8 rounded-2xl border border-purple-500/40 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-xl">
                🤖
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  AI Career Explanation
                </h2>

                <p className="text-sm text-slate-400">
                  Personalized by Gemini using your profile
                </p>
              </div>
            </div>

            {loadingAI ? (
              <div className="mt-6 rounded-xl bg-slate-800 p-5">
                <p className="text-slate-300">
                  Gemini is analyzing your profile...
                </p>
              </div>
            ) : aiExplanation ? (
              <div className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-800 p-5 leading-7 text-slate-200">
                {aiExplanation}
              </div>
            ) : (
              <p className="mt-5 text-slate-400">
                AI explanation will appear here.
              </p>
            )}
          </section>
        )}

        {/* Roadmap */}
        {roadmap.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">
              4. Your Personalized Roadmap
            </h2>

            <p className="mt-2 text-slate-400">
              Follow these steps to close your skill gaps and move toward your
              target career.
            </p>

            <div className="mt-6 space-y-5">
              {roadmap.map((item) => (
                <div
                  key={`${item.step}-${item.skill}`}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-bold">
                      Step {item.step}
                    </span>

                    <h3 className="text-xl font-semibold">
                      {item.skill}
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-800 p-4">
                      <p className="text-sm font-semibold text-blue-400">
                        Goal
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.goal}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-800 p-4">
                      <p className="text-sm font-semibold text-blue-400">
                        Time
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.estimated_time}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-800 p-4">
                      <p className="text-sm font-semibold text-blue-400">
                        Difficulty
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-800 p-4">
                    <p className="text-sm font-semibold text-blue-400">
                      Practice
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      {item.practice}
                    </p>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-800 p-4">
                    <p className="text-sm font-semibold text-blue-400">
                      Resources & Projects
                    </p>

                    <ul className="mt-2 space-y-2 text-sm text-slate-300">
                      {item.resources.map((resource) => (
                        <li key={resource}>• {resource}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-lg border border-green-500/30 bg-green-950/20 p-4">
                    <p className="text-sm font-semibold text-green-400">
                      Milestone
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      {item.milestone}
                    </p>
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