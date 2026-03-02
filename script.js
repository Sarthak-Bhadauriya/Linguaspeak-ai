const languageSelect = document.querySelector("#languageSelect");
const inputText = document.querySelector("#inputText");
const outputText = document.querySelector("#outputText");
const translateBtn = document.querySelector("#translateBtn");
const clearBtn = document.querySelector("#clearBtn");
const listenBtn = document.querySelector("#listenBtn");
const copyBtn = document.querySelector("#copyBtn");
const statusText = document.querySelector("#statusText");
const inputCount = document.querySelector("#inputCount");
const outputCount = document.querySelector("#outputCount");

const speech = new SpeechSynthesisUtterance();
let allVoices = [];
let fallbackAudio = null;

const targetLanguages = [
    { code: "en", label: "English" },
    { code: "zh-CN", label: "Mandarin Chinese" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "ar", label: "Modern Standard Arabic" },
    { code: "bn", label: "Bengali" },
    { code: "pt", label: "Portuguese" },
    { code: "ru", label: "Russian" },
    { code: "ur", label: "Urdu" },
    { code: "id", label: "Indonesian" },
    { code: "de", label: "German" },
    { code: "ja", label: "Japanese" },
    { code: "sw", label: "Swahili" },
    { code: "mr", label: "Marathi" },
    { code: "te", label: "Telugu" },
    { code: "kn", label: "Kannada" },
    { code: "tr", label: "Turkish" },
    { code: "ta", label: "Tamil" },
    { code: "vi", label: "Vietnamese" },
    { code: "ko", label: "Korean" },
    { code: "it", label: "Italian" },
    { code: "zh", label: "Chinese" }
];

function setStatus(message, type = "info") {
    statusText.textContent = message;
    statusText.className = `status status--${type}`;
}

function updateCounters() {
    inputCount.textContent = `${inputText.value.length} chars`;
    outputCount.textContent = `${outputText.value.length} chars`;
}

function updateActionState() {
    const hasOutput = Boolean(outputText.value.trim());
    listenBtn.disabled = !hasOutput;
    copyBtn.disabled = !hasOutput;
}

function populateLanguageOptions() {
    languageSelect.innerHTML = "";

    targetLanguages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = lang.label;
        languageSelect.appendChild(option);
    });

    languageSelect.value = "fr";
}

function decodeHtmlEntities(text) {
    const temp = document.createElement("textarea");
    temp.innerHTML = text;
    return temp.value;
}

function hasTooMuchEnglish(text) {
    if (!text) {
        return false;
    }

    const letters = text.match(/[A-Za-z]/g) || [];
    const chars = text.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0B80-\u0BFF\u0C00-\u0C7F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/g) || [];

    if (!chars.length) {
        return false;
    }

    return letters.length / chars.length > 0.35;
}

async function translateWithGoogle(targetCode, text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetCode)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Google translation request failed.");
    }

    const data = await response.json();
    const parts = Array.isArray(data?.[0]) ? data[0] : [];
    const combined = parts.map((part) => part?.[0] || "").join("").trim();

    if (!combined) {
        throw new Error("Google translation empty.");
    }

    return combined;
}

async function translateWithMyMemory(targetCode, text) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("MyMemory translation request failed.");
    }

    const data = await response.json();
    const translated = data?.responseData?.translatedText;

    if (!translated) {
        throw new Error("MyMemory translation not found.");
    }

    return decodeHtmlEntities(translated);
}

async function translateEnglishTo(targetCode, text) {
    if (targetCode === "en") {
        return text;
    }

    try {
        const googleText = await translateWithGoogle(targetCode, text);
        if (!hasTooMuchEnglish(googleText)) {
            return googleText;
        }
    } catch (error) {
        // Fallback below.
    }

    const myMemoryText = await translateWithMyMemory(targetCode, text);
    return myMemoryText;
}

function pickVoiceForLanguage(langCode) {
    if (!allVoices.length) {
        allVoices = speechSynthesis.getVoices();
    }

    return allVoices.find((voice) => voice.lang.toLowerCase().startsWith(langCode.toLowerCase())) || null;
}

function stopFallbackAudio() {
    if (fallbackAudio) {
        fallbackAudio.pause();
        fallbackAudio = null;
    }
}

function splitTextIntoChunks(text, maxLen = 180) {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length <= maxLen) {
        return [cleaned];
    }

    const words = cleaned.split(" ");
    const chunks = [];
    let current = "";

    words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > maxLen) {
            if (current) {
                chunks.push(current);
            }
            current = word;
        } else {
            current = candidate;
        }
    });

    if (current) {
        chunks.push(current);
    }

    return chunks;
}

function buildGoogleTtsUrl(text, langCode) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(text)}`;
}

async function speakWithGoogleTts(text, langCode) {
    const chunks = splitTextIntoChunks(text);

    for (const chunk of chunks) {
        // Sequential playback to support longer text.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
            const audio = new Audio(buildGoogleTtsUrl(chunk, langCode));
            fallbackAudio = audio;
            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error("Cloud TTS playback failed."));
            audio.play().catch(() => reject(new Error("Cloud TTS play blocked.")));
        });
    }
}

async function runTranslation() {
    const text = inputText.value.trim();

    if (!text) {
        outputText.value = "";
        updateCounters();
        updateActionState();
        setStatus("Please type English text first.", "warning");
        return;
    }

    setStatus("Translating...", "info");
    translateBtn.disabled = true;
    translateBtn.textContent = "Translating...";

    try {
        const translated = await translateEnglishTo(languageSelect.value, text);
        outputText.value = translated;
        updateCounters();
        updateActionState();
        setStatus("Translation ready.", "success");
    } catch (error) {
        outputText.value = "";
        updateCounters();
        updateActionState();
        setStatus("Translation failed. Check internet and try again.", "error");
    } finally {
        translateBtn.disabled = false;
        translateBtn.textContent = "Translate";
    }
}

async function speakTranslation() {
    const text = outputText.value.trim();

    if (!text) {
        setStatus("Translate text first, then listen.", "warning");
        return;
    }

    const targetCode = languageSelect.value;
    const voice = pickVoiceForLanguage(targetCode);
    speechSynthesis.cancel();
    stopFallbackAudio();

    if (voice) {
        speech.text = text;
        speech.lang = voice.lang;
        speech.voice = voice;
        speechSynthesis.speak(speech);
        setStatus("Playing translated audio.", "info");
        return;
    }

    try {
        await speakWithGoogleTts(text, targetCode);
        setStatus("Playing translated audio.", "info");
    } catch (error) {
        setStatus("Audio play failed for selected language.", "error");
    }
}

async function copyTranslation() {
    const text = outputText.value.trim();

    if (!text) {
        setStatus("Nothing to copy yet.", "warning");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        setStatus("Translated text copied.", "success");
    } catch (error) {
        setStatus("Copy failed. Browser permission blocked clipboard.", "error");
    }
}

function clearAll() {
    inputText.value = "";
    outputText.value = "";
    speechSynthesis.cancel();
    stopFallbackAudio();
    updateCounters();
    updateActionState();
    setStatus("Cleared input and output.", "info");
    inputText.focus();
}

translateBtn.addEventListener("click", runTranslation);
listenBtn.addEventListener("click", speakTranslation);
copyBtn.addEventListener("click", copyTranslation);
clearBtn.addEventListener("click", clearAll);

languageSelect.addEventListener("change", () => {
    if (outputText.value.trim()) {
        setStatus("Language changed. Click Translate to refresh output.", "info");
    }
});

inputText.addEventListener("input", () => {
    updateCounters();
    if (!inputText.value.trim() && outputText.value.trim()) {
        outputText.value = "";
        updateCounters();
        updateActionState();
    }
});

inputText.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runTranslation();
    }
});

populateLanguageOptions();
allVoices = speechSynthesis.getVoices();
speechSynthesis.onvoiceschanged = () => {
    allVoices = speechSynthesis.getVoices();
};

updateCounters();
updateActionState();
setStatus("Ready.", "info");
