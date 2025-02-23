require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { analyzePoll } = require("./shady_agent"); // Import Gemini function

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/**
 * 📌 API Route: Generate Vote Analysis for a Poll
 * 
 * @route  POST /api/vote-analysis
 * @body   { pollId: number }
 * @return { analysis: string }
 */
app.post("/api/vote-analysis", async (req, res) => {
    const { pollId } = req.body;

    if (!pollId) {
        return res.status(400).json({ error: "Missing pollId in request." });
    }

    try {
        const analysis = await analyzePoll(pollId);
        return res.json({ analysis });
    } catch (error) {
        console.error("❌ Error in generating vote analysis:", error);
        return res.status(500).json({ error: "Failed to generate vote analysis." });
    }
});

// 🚀 Start Express Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
