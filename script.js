const questionsList = [
    "¿Cuál es su color favorito?",
    "¿Cuál es su postre o dulce favorito?",
    "¿Cuál es su animal favorito en el mundo?",
    "¿Qué dibujo animado o serie le gusta más ver?",
    "¿Cuál es su juego favorito para pasar el rato?",
    "Si tuviera que elegir una sola fruta para comer todos los días, ¿cuál sería?",
    "¿Cuál es su sabor de helado favorito?",
    "¿Qué prefiere: la playa o la piscina?",
    "¿Qué prefiere: perros o gatos?",
    "¿Cuál es su juguete favorito o con el que más juega?",
    "¿Cuál es su canción o tipo de música favorita?",
    "¿Qué prefiere: mañanas de frío o días de calor?",
    "¿Cuál es su materia o curso favorito del colegio?",
    "¿Cuál es su película animada favorita de todos los tiempos?",
    "¿Qué prefiere: chocolate blanco o chocolate oscuro?",
    "¿Cuál es su pasatiempo favorito cuando está en casa?",
    "¿A qué lugar del mundo le gustaría viajar de vacaciones?",
    "¿Cuál es su golosina o snack favorito para ver una película?",
    "¿Cuál es su prenda de ropa favorita, como pijama, zapatillas o gorro?",
    "¿Qué prefiere: dibujar o armar cosas?",
    "¿Cómo se llama su personaje de ficción favorito?",
    "¿Cuál es su bebida favorita que no sea agua?",
    "¿Qué prefiere: día de campo o quedarse en casa jugando?",
    "¿Cuál es la travesura o broma más graciosa que le gusta hacer?",
    "¿Qué es lo que más le hace reír a carcajadas?"
];

let config = {
    name: "Cumpleañero(a)",
    age: 8,
    timePerQuestion: 30,
    guests: []
};

let currentQuestionIndex = 0;
let scores = {};
let timerInterval = null;
let timeLeft = 30;
let bgMusicInterval = null;
let audioCtx = null;

function addGuest() {
    const container = document.getElementById("guests-container");
    const row = document.createElement("div");
    row.className = "guest-row";
    row.innerHTML = `
        <input type="text" class="guest-name" value="Invitado">
        <button type="button" class="btn-remove" onclick="removeGuest(this)">✕</button>
    `;
    container.appendChild(row);
}

function removeGuest(btn) {
    const rows = document.querySelectorAll(".guest-row");
    if (rows.length > 1) {
        btn.parentElement.remove();
    } else {
        alert("¡Debe haber al menos un invitado!");
    }
}

function startGame() {
    config.name = document.getElementById("name-input").value.trim() || "Cumpleañero(a)";
    config.age = document.getElementById("age-input").value || 8;
    config.timePerQuestion = parseInt(document.getElementById("time-input").value) || 30;

    const guestInputs = document.querySelectorAll(".guest-name");
    config.guests = [];
    guestInputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            config.guests.push(name);
            scores[name] = 0;
        }
    });

    if (config.guests.length === 0) {
        alert("Por favor añade al menos un invitado.");
        return;
    }

    // Iniciar música de fondo ambiental aesthetic
    startBackgroundMusic();

    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");

    currentQuestionIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questionsList.length) {
        stopBackgroundMusic();
        showPodium();
        return;
    }

    document.getElementById("question-counter").innerText = `Pregunta ${currentQuestionIndex + 1} / ${questionsList.length}`;
    document.getElementById("question-text").innerText = questionsList[currentQuestionIndex];
    
    document.getElementById("scoring-section").classList.add("hidden");

    // Leer pregunta en voz alta con tono pausado, dulce y natural (tipo profesora)
    speakCurrentQuestion();

    // Iniciar temporizador configurado
    timeLeft = config.timePerQuestion;
    document.getElementById("timer").innerText = timeLeft;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playAlarm();
            showScoringSection();
        }
    }, 1000);
}

function speakCurrentQuestion() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = questionsList[currentQuestionIndex];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.75; // Velocidad pausada y natural
        utterance.pitch = 1.1; // Tono ligeramente más amable y cálido

        // Intentar buscar una voz en español más natural si está disponible en el dispositivo
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Lucia') || v.name.includes('Monica') || v.name.includes('Elena')));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

function playAlarm() {
    // Alarma sonora amigable al terminar el tiempo
    try {
        const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = tempCtx.createOscillator();
        const gain = tempCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, tempCtx.currentTime); // Nota E5
        gain.gain.setValueAtTime(0.15, tempCtx.currentTime);
        osc.connect(gain);
        gain.connect(tempCtx.destination);
        osc.start();
        osc.stop(tempCtx.currentTime + 0.6);
    } catch (e) {
        console.log("Audio no soportado");
    }
}

// Generador de música de fondo ambiental suave (estilo lo-fi / cajita musical festiva)
function startBackgroundMusic() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23]; // Acordes suaves
        let noteIndex = 0;

        bgMusicInterval = setInterval(() => {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[noteIndex], audioCtx.currentTime);
            noteIndex = (noteIndex + 1) % notes.length;

            gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // Volumen bajito y ambiental
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 2.5);
        }, 3000); // Toca una nota relajante cada 3 segundos
    } catch (e) {
        console.log("Música de fondo no iniciada automáticamente");
    }
}

function stopBackgroundMusic() {
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

function showScoringSection() {
    const checkboxesContainer = document.getElementById("score-checkboxes");
    checkboxesContainer.innerHTML = "";

    config.guests.forEach(guest => {
        const label = document.createElement("label");
        label.className = "checkbox-label";
        label.innerHTML = `
            <input type="checkbox" value="${guest}" class="guest-checkbox">
            <span>${guest}</span>
        `;
        checkboxesContainer.appendChild(label);
    });

    document.getElementById("scoring-section").classList.remove("hidden");
}

function nextQuestion() {
    const checkboxes = document.querySelectorAll(".guest-checkbox");
    checkboxes.forEach(cb => {
        if (cb.checked) {
            scores[cb.value] = (scores[cb.value] || 0) + 1;
        }
    });

    currentQuestionIndex++;
    loadQuestion();
}

function showPodium() {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("podium-screen").classList.remove("hidden");
    document.getElementById("final-name").innerText = config.name;

    const sortedGuests = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const podiumList = document.getElementById("podium-list");
    podiumList.innerHTML = "";

    sortedGuests.forEach((guest, index) => {
        const div = document.createElement("div");
        div.className = "podium-item";
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⭐";
        div.innerHTML = `<span>${medal} ${index + 1}. ${guest}</span> <span>${scores[guest]} pts</span>`;
        podiumList.appendChild(div);
    });
}
