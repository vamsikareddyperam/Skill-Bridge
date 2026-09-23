"use client";

import { useState } from "react";

type Recommendation = {
  career: string;
  score: number;
  matching_skills: string[];
  matching_interests: string[];
};

type SkillGap = {
  career: string;
  technical_skills: {
    have: string[];
    missing: string[];
  };
  soft_skills: {
    have: string[];
    missing: string[];
  };
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

type Roadmap = {
  career: string;
  roadmap: RoadmapStep[];
};

export default function Home() {
  const [skills, setSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [interests, setInterests] = useState("");

  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);

  const [selectedCareer, setSelectedCareer] = useState("");

  const [selectedCareerId, setSelectedCareerId] = useState("");

  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const findCareer = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/api/career/recommend",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          soft_skills: softSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),

          interests: interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean),
        }),
      }
    );

    const data = await response.json();

    setRecommendations(data.recommendations);
    setSelectedCareer("");
    setSelectedCareerId("");
    setSkillGap(null);
    setRoadmap(null);
  };

  const chooseCareer = async (career: string) => {
    const careerIds: Record<string, string> = {
      "Machine Learning Engineer": "ml-engineer",
      "Data Engineer": "data-engineer",
      "Frontend Developer": "frontend-developer",
    };

    const careerId = careerIds[career];

    setSelectedCareer(career);
    setSelectedCareerId(careerId);
    setRoadmap(null);

    const response = await fetch(
      `http://127.0.0.1:8000/api/career/skill-gap?career_id=${careerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          soft_skills: softSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),

          interests: interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean),
        }),
      }
    );

    const data = await response.json();

    setSkillGap(data);
  };

  const generateRoadmap = async () => {
    const response = await fetch(
      `http://127.0.0.1:8000/api/career/roadmap?career_id=${selectedCareerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        
          soft_skills: softSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        
          interests: interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean),
        }),
      }
    );

    const data = await response.json();

    setRoadmap(data);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            SkillBridge
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            Discover the right career and build the skills to reach it.
          </p>
        </div>

        {/* Profile Form */}

        <div className="rounded-2xl bg-slate-900 p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">
            Tell us about yourself
          </h2>

          <p className="mt-2 text-slate-400">
            Enter your current skills and the areas you are interested in.
          </p>

          <div className="mt-8">
            <label className="mb-2 block font-medium">
              Your skills
            </label>

            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Example: Python, SQL, HTML"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-sm text-slate-500">
              Separate multiple skills with commas.
            </p>
          </div>
          <div className="mt-6">
  <label className="mb-2 block font-medium">
    Your soft skills
  </label>

  <input
    type="text"
    value={softSkills}
    onChange={(e) => setSoftSkills(e.target.value)}
    placeholder="Example: Communication, Teamwork, Problem Solving"
    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
  />

  <p className="mt-2 text-sm text-slate-500">
    Separate multiple soft skills with commas.
  </p>
</div>

          <div className="mt-6">
            <label className="mb-2 block font-medium">
              Your interests
            </label>

            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Example: Machine Learning, AI, Data"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-sm text-slate-500">
              Separate multiple interests with commas.
            </p>
          </div>

          <button
            type="button"
            onClick={findCareer}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Find My Career
          </button>
        </div>

        {/* Career Recommendations */}

        {recommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">
              Recommended Careers
            </h2>

            <div className="mt-4 space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.career}
                  className="rounded-xl bg-slate-900 p-6"
                >
                  <h3 className="text-xl font-semibold">
                    {recommendation.career}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    Match score: {recommendation.score}
                  </p>

                  {recommendation.matching_skills.length > 0 && (
                    <p className="mt-2 text-sm text-slate-300">
                      Matching skills:{" "}
                      {recommendation.matching_skills.join(", ")}
                    </p>
                  )}

                  {recommendation.matching_interests.length > 0 && (
                    <p className="mt-2 text-sm text-slate-300">
                      Matching interests:{" "}
                      {recommendation.matching_interests.join(", ")}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      chooseCareer(recommendation.career)
                    }
                    className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-500"
                  >
                    Choose This Career
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gap */}

        {selectedCareer && skillGap && (
          <div className="mt-8 rounded-2xl border border-green-600 bg-slate-900 p-8">

            <h2 className="text-2xl font-bold">
              🎯 Your Target Career
            </h2>

            <p className="mt-3 text-lg text-green-400">
              {skillGap.career}
            </p>

            {/* Technical Skills */}

            <div className="mt-8">
              <h3 className="text-xl font-semibold">
                💻 Technical Skills
              </h3>

              {skillGap.technical_skills.have.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-green-400">
                    Skills you already have
                  </p>

                  <p className="mt-2 text-slate-300">
                    {skillGap.technical_skills.have.join(", ")}
                  </p>
                </div>
              )}

              {skillGap.technical_skills.missing.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-red-400">
                    Skills you need to learn
                  </p>

                  <p className="mt-2 text-slate-300">
                    {skillGap.technical_skills.missing.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Soft Skills */}

            <div className="mt-8">
              <h3 className="text-xl font-semibold">
                🤝 Soft Skills
              </h3>

              {skillGap.soft_skills.have.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-green-400">
                    Skills you already have
                  </p>

                  <p className="mt-2 text-slate-300">
                    {skillGap.soft_skills.have.join(", ")}
                  </p>
                </div>
              )}

              {skillGap.soft_skills.missing.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-red-400">
                    Skills you need to develop
                  </p>

                  <p className="mt-2 text-slate-300">
                    {skillGap.soft_skills.missing.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Roadmap Button */}

            <button
              type="button"
              onClick={generateRoadmap}
              className="mt-8 w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
            >
              🚀 Generate My Roadmap
            </button>

          </div>
        )}

        {/* Roadmap */}

        {roadmap && (
          <div className="mt-8 rounded-2xl border border-purple-600 bg-slate-900 p-8">

            <h2 className="text-2xl font-bold">
              🗺️ Your Learning Roadmap
            </h2>

            <p className="mt-2 text-slate-400">
              Roadmap for becoming a {roadmap.career}
            </p>

            <div className="mt-6 space-y-4">

              {roadmap.roadmap.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl bg-slate-800 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold">
                      {step.step}
                    </div>

                    <h3 className="text-xl font-semibold">
                      {step.skill}
                    </h3>
                  </div>

                  <p className="mt-4 text-slate-300">
                    <span className="font-semibold text-purple-400">
                      Goal:
                    </span>{" "}
                    {step.goal}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
  <span className="rounded-full bg-slate-700 px-3 py-1 text-slate-300">
    ⏱️ {step.estimated_time}
  </span>

  <span className="rounded-full bg-slate-700 px-3 py-1 text-slate-300">
    📊 {step.difficulty}
  </span>
</div>

<p className="mt-3 text-slate-300">
  <span className="font-semibold text-purple-400">
    🎯 Milestone:
  </span>{" "}
  {step.milestone}
</p>
                  




                  <p className="mt-3 text-slate-300">
                    <span className="font-semibold text-purple-400">
                      Practice:
                    </span>{" "}
                    {step.practice}
                  </p>
                  <div className="mt-4">
  <p className="font-semibold text-purple-400">
    📚 Resources & Projects:
  </p>

  <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-300">
    {step.resources.map((resource) => (
      <li key={resource}>{resource}</li>
    ))}
  </ul>
</div>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}