require("dotenv").config(); // Loads environment variables from .env
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://jbbwwsfkkglbberlgwwz.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYnd3c2Zra2dsYmJlcmxnd3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzk1MzcsImV4cCI6MjA1NTgxNTUzN30.f1EddSG9LjbphrEP7jHsMmnX0Wv5OS0jUasXhba5ge4";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyze poll results based on vote count & voter birthdays.
 *
 * @param {number} pollId - The poll ID to analyze.
 */
async function analyzePoll(pollId) {
  try {
    // A) Fetch votes from `votes` table
    const { data: options, error: optionsError } = await supabase
      .from("options")
      .select("id, option_text")
      .eq("poll_id", pollId);

    if (optionsError) throw new Error(`Supabase options error: ${optionsError.message}`);
    if (!options || options.length === 0) {
      console.log(`⚠️ No options found for poll: ${pollId}`);
      return null;
    }

    // Get votes for those options
    const optionIds = options.map(opt => opt.id);
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("option_id, user_id")
      .in("option_id", optionIds);

    if (votesError) throw new Error(`Supabase votes error: ${votesError.message}`);
    if (!votes || votes.length === 0) {
      console.log(`⚠️ No votes found for poll: ${pollId}`);
      return null;
    }

    // B) Extract user IDs from votes
    const userIds = votes.map(v => v.user_id);

    // C) Fetch user birthdays from `users` table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, birthday")
      .in("id", userIds);

    if (usersError) throw new Error(`Supabase users error: ${usersError.message}`);

    // D) Merge votes with birthdays
    const mergedData = votes.map(vote => {
      const user = users.find(u => u.id === vote.user_id);
      return {
        option_id: vote.option_id,
        birthday: user ? user.birthday : null,
      };
    });

    // E) Count votes per option & birth month
    let voteStats = {};
    mergedData.forEach(item => {
      const { option_id, birthday } = item;
      let birthGroup = "unknown";

      if (birthday) {
        const month = new Date(birthday).getMonth() + 1; // 1..12
        birthGroup = `Month_${month}`;
      }

      if (!voteStats[option_id]) {
        voteStats[option_id] = {};
      }
      if (!voteStats[option_id][birthGroup]) {
        voteStats[option_id][birthGroup] = 0;
      }
      voteStats[option_id][birthGroup]++;
    });

    // F) Convert option_id to candidate names
    let candidateVoteStats = {};
    options.forEach(option => {
      candidateVoteStats[option.option_text] = voteStats[option.id] || {};
    });

    // G) Generate text prompt for Gemini AI
    const geminiPrompt = `
Given the following poll results (votes per candidate grouped by voter birth month), explain why certain candidates performed better among specific groups.

Poll ID: ${pollId}
Candidate-Birthday Stats: ${JSON.stringify(candidateVoteStats, null, 2)}

Provide a **concise** analysis on how age groups may have influenced the outcome.
`;

    // H) Call Gemini AI
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const geminiAnalysis = response.text();

    console.log("📊 Gemini AI Analysis:", geminiAnalysis);
    return geminiAnalysis;
  } catch (err) {
    console.error("❌ Error in analyzePoll:", err);
    return null;
  }
}

// Example usage
(async () => {
  const pollId = 1; // Change this to your actual poll ID
  const analysis = await analyzePoll(pollId);
  console.log("✅ Final Gemini AI Analysis:", analysis);
})();