function generateFuture() {

    const name = document.getElementById("name").value;
    const situation = document.getElementById("situation").value;
    const goal = document.getElementById("goal").value;
    const challenge = document.getElementById("challenge").value;
    const extra = document.getElementById("extra").value;

    localStorage.setItem("vantageData", JSON.stringify({
        name, situation, goal, challenge, extra
    }));

    window.location.href = "future.html";
}


// ---------------------------
// LOAD AI RESULTS
// ---------------------------
async function loadFutureResults() {

    const data = localStorage.getItem("vantageData");
    if (!data) return;

    const userData = JSON.parse(data);

    let timeoutTriggered = false;

    const loadingMessages = [
        "Analyzing your life situation...",
        "Mapping possible futures...",
        "Simulating decision outcomes...",
        "Generating your future paths...",
        "Building your Life GPS..."
    ];

    let i = 0;

    const loader = setInterval(() => {
        const box = document.getElementById("loadingBox");
        if (box) box.innerText = loadingMessages[i++ % loadingMessages.length];
    }, 2000);

    const timeout = setTimeout(() => {
        timeoutTriggered = true;
        clearInterval(loader);
        showFallbackData();
    }, 30000);

    try {

        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                situation: userData.situation,
                goal: userData.goal,
                challenge: userData.challenge
            })
        });

        const result = await response.json();
        console.log("AI RESPONSE:", result);

        if (!result?.result) throw new Error("No AI response");

        if (timeoutTriggered) return;

        clearTimeout(timeout);
        clearInterval(loader);

        const text = result.result;

        // IMPORTANT: store full response for future letter page
        localStorage.setItem("fullAIResponse", text);

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value || "";
        };

        document.getElementById("loadingBox").style.display = "none";
        document.getElementById("resultsContainer").style.display = "block";

        setText("futureA", extractSection(text, "FUTURE_A:", "FUTURE_B:"));
        setText("futureB", extractSection(text, "FUTURE_B:", "FUTURE_C:"));
        setText("futureC", extractSection(text, "FUTURE_C:", "LIFE_GPS:"));
        setText("lifeGPS", extractSection(text, "LIFE_GPS:", "CONFLICT_DETECTOR:"));
        setText("conflictDetector", extractSection(text, "CONFLICT_DETECTOR:", "FUTURE_LETTER:"));

        // MEMORY CARDS FIXED
        const memoryContainer = document.getElementById("memoryCards");
        if (memoryContainer) {
            const memoryData = extractMemoryCards();
            memoryContainer.innerHTML = memoryData.map(m => `
                <div class="story-card">
                    <h3>${m.title}</h3>
                    <p>${m.text}</p>
                </div>
            `).join("");
        }

    } catch (err) {
        console.error(err);
        clearInterval(loader);
        showFallbackData();
    }
}


// ---------------------------
// TEXT PARSER
// ---------------------------
function extractSection(text, start, end) {
    const s = text.indexOf(start);
    if (s === -1) return "";
    const startIndex = s + start.length;

    if (!end) return text.substring(startIndex).trim();

    const e = text.indexOf(end);
    if (e === -1) return text.substring(startIndex).trim();

    return text.substring(startIndex, e).trim();
}


// ---------------------------
// AUTO LOAD
// ---------------------------
if (window.location.pathname.includes("future.html")) {
    window.addEventListener("load", loadFutureResults);
}


// ---------------------------
// SPEECH
// ---------------------------
function speakText(id) {

    const el = document.getElementById(id);
    const text = el ? el.innerText : "";

    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const selected = localStorage.getItem("voiceChoice") || "female";

    let baseVoice =
        voices.find(v => v.lang && v.lang.includes("en")) ||
        voices[0];

    // Apply voice if available
    if (baseVoice) {
        speech.voice = baseVoice;
    }

    // 🔥 HACKATHON IMPACT: simulate gender using audio tuning
    if (selected === "female") {

        speech.pitch = 1.3;   // higher = softer/female feel
        speech.rate = 1.02;

    } else {

        speech.pitch = 0.85;  // lower = deeper/male feel
        speech.rate = 0.95;
    }

    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}

function stopSpeech() {
    window.speechSynthesis.cancel();
}


// ---------------------------
// FUTURE LETTER NAVIGATION FIX
// ---------------------------
function goToLetter() {
    window.location.href = "future-letter.html";
}


// ---------------------------
// FALLBACK SAFE
// ---------------------------
function showFallbackData() {

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    const results = document.getElementById("resultsContainer");
    const loading = document.getElementById("loadingBox");

    if (loading) loading.style.display = "none";
    if (results) results.style.display = "block";

    setText("futureA", "If you continue inconsistently, progress will be slow.");
    setText("futureB", "With discipline, you can grow steadily.");
    setText("futureC", "Alternative paths may open opportunities.");
    setText("lifeGPS", "Partial alignment with your goals.");
    setText("conflictDetector", "Conflicts exist between time and ambition.");
}


// ---------------------------
// MEMORY CARDS
// ---------------------------
function extractMemoryCards() {
    return [
        { title: "Today", text: "You are at the starting point." },
        { title: "3 Months", text: "Small improvements begin." },
        { title: "1 Year", text: "Clear direction emerges." },
        { title: "3 Years", text: "Major transformation happens." },
        { title: "5 Years", text: "Strong future self is built." }
    ];
}


// ---------------------------
// FUTURE LETTER PAGE LOAD FIX
// ---------------------------
if (window.location.pathname.includes("future-letter.html")) {

    window.addEventListener("load", () => {

        const full = localStorage.getItem("fullAIResponse");

        const el = document.getElementById("futureLetterText");

        if (!el) return;

        if (!full) {
            el.innerText = "No letter found. Please generate first.";
            return;
        }

        const start = full.indexOf("FUTURE_LETTER:");
        const letter = start !== -1
            ? full.substring(start + "FUTURE_LETTER:".length).trim()
            : "Your future self believes in you.";

        el.innerText = letter;
    });
}