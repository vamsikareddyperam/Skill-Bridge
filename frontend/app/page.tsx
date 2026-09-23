"use client";

import { useState } from "react";

export default function Home() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");

  const [recommendations, setRecommendations] = useState<
    {
      career: string;
      score: number;
      matching_skills: string[];
      matching_interests: string[];
    }[]
  >([]);

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

          interests: interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean),
        }),
      }
    );

    const data = await response.json();

    setRecommendations(data.recommendations);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            SkillBridge
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            Discover the right career and build the skills to reach it.
          </p>
        </div>

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
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}