const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

app.post("/lesson-intro", async (req, res) => {
    const { languageId, lessonTitle } = req.body;
  
    try {
      const aiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You're a friendly beginner coding teacher.",
            },
            {
              role: "user",
              content: `Teach the lesson titled "${lessonTitle}" in ${languageId} to a total beginner.
                1. Start with a fun real-world analogy.
                2. Explain what the concept is and when to use it.
                3. End with a simple coding task the user can try. Show them an example`,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
  
      const teaching = aiRes.data.choices[0].message.content;
      res.json({ teaching });
    } catch (err) {
      console.error("Intro error:", err);
      res.status(500).json({ error: "Could not fetch lesson intro." });
    }
  });

app.post("/run-code", async (req, res) => {
    const { code, languageId } = req.body;

    try {
    // If no code submitted, provide teaching prompt
    if (!code) {
    const aiLesson = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-3.5-turbo",
            messages: [
        {
            role: "system",
            content: "You are a friendly and helpful coding tutor.",
        },
        {
            role: "user",
            content: `Can you teach a beginner what ${languageId} is and give a simple real-world analogy and a beginner task to try?`,
        },
        ],
        },
            {
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        }
        );

        const lessonMessage = aiLesson.data.choices[0].message.content;
        return res.json({ teaching: lessonMessage });
        }

        // 🧪 Submit code to Judge0 for execution
        const submissionRes = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
        source_code: code,
        language_id: languageId,
        },
        {
        headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        }
        );

        const output = submissionRes.data;

        const aiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
        model: "gpt-3.5-turbo",
        messages: [
        {
            role: "system",
            content: "You are a friendly coding tutor.",
            },
        {
            role: "user",
            content: `Here is a student's solution to a coding task:\n\n${code}\n\nPlease tell thme if it solves the task well, point out any issues, and give brief constructive feedback.`,
            },
        ],
        },
        {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        }
    );

    const explanation = aiRes.data.choices[0].message.content;

    res.json({
    output: output.stdout || output.stderr || "No output.",
        explanation,
    });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));