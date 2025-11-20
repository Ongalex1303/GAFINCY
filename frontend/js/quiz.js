// GAFINCY - Quiz Logic
// File: frontend/js/quiz.js

// --- DUMMY QUIZ DATA ---
// Di aplikasi nyata, ini akan diambil dari database/API.
const quizBank = {
    "tk_sd_1": {
        questions: [
            { q: "Gambar pahlawan di uang Rp 100.000 adalah...", o: ["Soekarno & Hatta", "I Gusti Ngurah Rai", "Cut Nyak Dien", "Pangeran Diponegoro"], a: 0 },
            { q: "Uang koin Rp 500 yang baru berwarna...", o: ["Emas", "Perak", "Perunggu", "Putih"], a: 3 },
            { q: "Manakah yang lebih besar nilainya, Rp 20.000 atau Rp 50.000?", o: ["Rp 20.000", "Rp 50.000", "Sama saja", "Tidak ada yang benar"], a: 1 }
        ],
        xpPerCorrect: 10,
        coinsPerCorrect: 5
    },
    "tk_sd_2": {
        questions: [
            { q: "Tempat paling aman untuk menyimpan uang dalam jumlah banyak adalah...", o: ["Di bawah kasur", "Di dalam lemari", "Di bank", "Di saku celana"], a: 2 },
            { q: "Benda yang biasa digunakan untuk menabung di rumah adalah...", o: ["Toples", "Celengan", "Botol", "Amplop"], a: 1 },
            { q: "Menyisihkan sebagian uang jajan untuk ditabung adalah perbuatan...", o: ["Tercela", "Biasa saja", "Terpuji", "Merugikan"], a: 2 }
        ],
        xpPerCorrect: 12,
        coinsPerCorrect: 6
    }
    // Tambahkan data untuk level lain di sini
};

// --- ELEMEN DOM ---
const questionCounterEl = document.getElementById('question-counter');
const questionTextEl = document.getElementById('question-text');
const answerOptionsEl = document.getElementById('answer-options');
const nextQuestionBtn = document.getElementById('next-question-btn');
const progressBarInnerEl = document.getElementById('progress-bar-inner');

const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const finalScoreEl = document.getElementById('final-score');
const xpEarnedEl = document.getElementById('xp-earned');
const coinsEarnedEl = document.getElementById('coins-earned');
const savingMsgEl = document.getElementById('saving-progress-msg');
const backToMapBtn = document.getElementById('back-to-map-btn');


// --- STATE KUIS ---
let currentLevelId = null;
let currentQuizData = null;
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timerInterval = null; // <-- TAMBAHKAN INI
let timeLeft = 30;        // <-- TAMBAHKAN INI

// --- LOGIKA UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil level_id dari URL
    const params = new URLSearchParams(window.location.search);
    currentLevelId = params.get('level');

    if (!currentLevelId || !quizBank[currentLevelId]) {
        alert("Level kuis tidak valid atau tidak ditemukan!");
        window.location.href = '/home.html';
        return;
    }

    // 2. Muat data kuis
    currentQuizData = quizBank[currentLevelId];
    questions = currentQuizData.questions;
    
    // 3. Mulai kuis
    startQuiz();

    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });
});

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function showQuestion() {
    // Reset UI
    nextQuestionBtn.style.display = 'none';
    answerOptionsEl.innerHTML = '';
    
    // Hentikan timer sebelumnya (jika ada)
    clearInterval(timerInterval);
    timeLeft = 30; // Reset waktu
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `00:${timeLeft}`;
    timerEl.style.color = 'var(--color-text)'; // Kembalikan warna timer

    // Tampilkan pertanyaan
    const question = questions[currentQuestionIndex];
    questionCounterEl.textContent = `Pertanyaan ${currentQuestionIndex + 1}/${questions.length}`;
    questionTextEl.textContent = question.q;

    // Tampilkan pilihan jawaban
    question.o.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'answer-btn';
        button.dataset.index = index;
        button.addEventListener('click', selectAnswer);
        answerOptionsEl.appendChild(button);
    });

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBarInnerEl.style.width = `${progress}%`;

    // Mulai timer baru
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

        // Beri peringatan visual
        if (timeLeft <= 10) {
            timerEl.style.color = 'var(--color-danger)';
        }

        // Jika waktu habis
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function selectAnswer(e) {
    clearInterval(timerInterval); // <-- HENTIKAN TIMER SAAT JAWABAN DIPILIH
    
    const selectedButton = e.target;
    const selectedAnswerIndex = parseInt(selectedButton.dataset.index);
    const correctAnswerIndex = questions[currentQuestionIndex].a;

    // Disable semua tombol
    Array.from(answerOptionsEl.children).forEach(btn => {
        btn.disabled = true;
    });

    // Beri tanda jawaban benar/salah
    if (selectedAnswerIndex === correctAnswerIndex) {
        selectedButton.classList.add('correct');
        // ANIMASI BARU: Tambahkan 'pulse' ke tombol yang benar
        selectedButton.classList.add('pulse-animation');
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        // ANIMASI BARU: Tambahkan 'shake' ke body saat salah
        document.body.classList.add('shake-animation');
        // Hapus kelas getar setelah animasi selesai
        setTimeout(() => {
            document.body.classList.remove('shake-animation');
        }, 500);

        // Tampilkan juga jawaban yang benar
        answerOptionsEl.querySelector(`[data-index='${correctAnswerIndex}']`).classList.add('correct');
        
        // --- TAMBAHKAN LOGIKA PENGURANG HATI ---
        if (window.GAFINCY_USER_DATA) {
            window.GAFINCY_USER_DATA.profile.hearts--;
            // Perbarui tampilan header secara instan
            updateGamificationStats(window.GAFINCY_USER_DATA.profile);
            
            // Beri animasi getar juga pada ikon hati di header
            const heartIcon = document.getElementById('stat-hearts').closest('.stat-item');
            if (heartIcon) {
                heartIcon.classList.add('shake-animation');
                setTimeout(() => heartIcon.classList.remove('shake-animation'), 500);
            }
        }
        // --- AKHIR TAMBAHAN ---
    }

    // Tampilkan tombol lanjut
    nextQuestionBtn.style.display = 'block';
}

// TAMBAHKAN FUNGSI BARU INI (untuk menangani waktu habis)
function handleTimeUp() {
    // Disable semua tombol
    Array.from(answerOptionsEl.children).forEach(btn => {
        btn.disabled = true;
    });

    // Tampilkan jawaban yang benar
    const correctAnswerIndex = questions[currentQuestionIndex].a;
    answerOptionsEl.querySelector(`[data-index='${correctAnswerIndex}']`).classList.add('correct');

    // Beri animasi getar
    document.body.classList.add('shake-animation');
    setTimeout(() => document.body.classList.remove('shake-animation'), 500);

    // Kurangi hati
    if (window.GAFINCY_USER_DATA) {
        window.GAFINCY_USER_DATA.profile.hearts--;
        updateGamificationStats(window.GAFINCY_USER_DATA.profile);
        const heartIcon = document.getElementById('stat-hearts').closest('.stat-item');
        if (heartIcon) {
            heartIcon.classList.add('shake-animation');
            setTimeout(() => heartIcon.classList.remove('shake-animation'), 500);
        }
    }

    // Tampilkan tombol lanjut
    nextQuestionBtn.style.display = 'block';
}

async function showResults() {
    clearInterval(timerInterval); // <-- PASTIKAN TIMER BERSIH
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    // Hitung XP dan Koin
    const xpGained = score * currentQuizData.xpPerCorrect;
    const coinsGained = score * currentQuizData.coinsPerCorrect;
    const finalScore = Math.round((score / questions.length) * 100);

    // Tampilkan hasil
    finalScoreEl.textContent = `${finalScore}%`;
    xpEarnedEl.textContent = `+${xpGained}`;
    coinsEarnedEl.textContent = `+${coinsGained}`;

    // Tentukan level selanjutnya
    const levelParts = currentLevelId.split('_');
    const currentLevelNum = parseInt(levelParts[levelParts.length - 1]);
    const nextLevelId = `${levelParts.slice(0, -1).join('_')}_${currentLevelNum + 1}`;

    // Kirim data ke backend
    try {
        const response = await fetchWithAuth('/save_progress.php', {
            method: 'POST',
            body: JSON.stringify({
                level_id: currentLevelId,
                score: finalScore,
                stars: calculateStars(finalScore),
                xp_gained: xpGained,
                coins_gained: coinsGained,
                next_level_id: nextLevelId // Kirim ID level selanjutnya
            })
        });

        if (response.status === 'success') {
            savingMsgEl.textContent = 'Progres berhasil disimpan!';
            backToMapBtn.style.display = 'block';

            // --- ANIMASI KONFETI DITAMBAHKAN DI SINI ---
            if (score > 0) { // Hanya rayakan jika skor tidak nol
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
            // --- AKHIR ANIMASI KONFETI ---

        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error("Gagal menyimpan progres:", error);
        savingMsgEl.textContent = `Gagal menyimpan progres: ${error.message}`;
        savingMsgEl.style.color = 'var(--color-danger)';
        // Tetap tampilkan tombol kembali ke peta agar pengguna tidak terjebak
        backToMapBtn.style.display = 'block';
    }
}

function calculateStars(score) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score > 0) return 1;
    return 0;
}
