const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

app.post("/run-code", async (req, res) =>{
    const {code, languageId} = req.body; //Judge 0 coding languages IDs

    try { //sending code to Judge0
        const submissionRes = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false%wait=true",
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

        const aiRes = await axios.post( //sending code to OpenAi for simple explination
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful nice coding tutor",
                    },
                    {
                        role: "user",
                        content: 'Can you briefly explain what this code does and offer suggestions if any?\n\n$(code)',
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ${process.env.OPENAI_API_KEY}',
                },
            }
        );

        const explination = aiRes.data.choices[0].message.content;

        res.json({
            output: output.stdout || output.stderr || "No output.",
            explination,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Something went wrong with respomse"});
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
