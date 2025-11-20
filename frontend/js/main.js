// GAFINCY - Main Application Logic (v4 - Dashboard + New Map)
// File: frontend/js/main.js

// Global variable to hold user data
window.GAFINCY_USER_DATA = null;

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan logika Notifikasi di semua halaman
    initNotificationDropdown();
    
    // Cek status login
    auth.onAuthStateChanged(user => {
        const currentPage = window.location.pathname.split("/").pop();
        if (user) {
            // Pengguna login, muat data
            loadUserDataAndInitPage();
        } else {
            // Pengguna tidak login, paksa kembali ke index.html
            if (currentPage !== 'index.html' && currentPage !== '') {
                window.location.href = 'index.html';
            }
        }
    });

    // Event listener khusus untuk Halaman Login/Register
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        initLoginPage();
    }
});

/**
 * Fungsi utama untuk memuat data pengguna dari backend dan menginisialisasi UI.
 */
async function loadUserDataAndInitPage() {
    // Cegah pemuatan ganda
    if (window.GAFINCY_USER_DATA) {
        console.log("Data pengguna sudah dimuat.");
        return;
    }

    try {
        console.log("Memuat data pengguna dari backend...");
        const response = await fetchWithAuth('/get_user_data.php');
        
        if (response.status === 'success' || response.status === 'success_created') {
            const userData = response.data;
            console.log("Data diterima:", userData);

            window.GAFINCY_USER_DATA = userData;

            // Perbarui UI di seluruh halaman (Header Stats)
            updateGamificationStats(userData.profile);
            
            // Jalankan logika spesifik untuk halaman yang sedang aktif
            const currentPage = window.location.pathname.split("/").pop();
            switch (currentPage) {
                case 'home.html':
                    initDashboardPage();
                    break;
                case 'belajar.html':
                    initLearningPathPage();
                    break;
                case 'profile.html':
                    initProfilePage();
                    break;
                case 'leaderboard.html':
                    initLeaderboardPage();
                    break;
                case 'logbook.html':
                    initLogbookPage();
                    break;
            }

            // Tambahkan event listener untuk tombol logout jika ada
            const logoutButton = document.getElementById('logout-btn');
            if (logoutButton) {
                logoutButton.addEventListener('click', handleSignOut);
            }

        } else {
            throw new Error(response.message || "Gagal memuat data pengguna.");
        }
    } catch (error) {
        console.error("Gagal memuat dan inisialisasi data:", error);
    }
}

/**
 * Memperbarui tampilan stat gamifikasi di header.
 */
function updateGamificationStats(profileData) {
    const statsMap = {
        'stat-xp': profileData.xp || 0,
        'stat-coins': profileData.coins || 0,
        'stat-hearts': profileData.hearts || 5,
        'stat-streak': profileData.current_streak || 0
    };

    for (const id in statsMap) {
        const element = document.getElementById(id);
        if (element) {
            const currentValue = parseInt(element.textContent);
            const newValue = statsMap[id];

            if (currentValue !== newValue) {
                element.textContent = newValue;
                const parent = element.closest('.stat-item');
                if (parent) {
                    parent.classList.add('burst-animation');
                    setTimeout(() => {
                        parent.classList.remove('burst-animation');
                    }, 400);
                }
            }
        }
    }
}

// --- FUNGSI INISIALISASI PER HALAMAN (BARU) ---

/**
 * Inisialisasi untuk Halaman Dashboard (home.html).
 */
function initDashboardPage() {
    console.log("Inisialisasi Halaman Dashboard...");
    if (!window.GAFINCY_USER_DATA) return;
    const { profile } = window.GAFINCY_USER_DATA;

    // Set pesan selamat datang
    document.getElementById('welcome-message').textContent = `Selamat Datang, ${profile.username}!`;
    
    // Set 4 kartu statistik utama
    document.getElementById('stat-xp-card').textContent = profile.xp || 0;
    document.getElementById('stat-streak-card').textContent = `${profile.current_streak || 0} hari`;
    document.getElementById('stat-hearts-card').textContent = `${profile.hearts || 5}/5`;
    document.getElementById('stat-coins-card').textContent = profile.coins || 0;
}

/**
 * Inisialisasi untuk Halaman Peta Belajar (belajar.html).
 */
function initLearningPathPage() {
    console.log("Inisialisasi Halaman Peta Belajar (v4)...");
    if (!window.GAFINCY_USER_DATA) return;
    
    const { progress, profile } = window.GAFINCY_USER_DATA;

    // 1. Logika Buka/Tutup (Collapsible)
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
        // Jangan tambahkan event listener jika kartu terkunci
        if (card.classList.contains('locked')) {
            return;
        }
        
        const header = card.querySelector('.level-card-header');
        header.addEventListener('click', () => {
            card.classList.toggle('open');
        });
    });

    // 2. Logika Kunci Level (Buka level pertama dari strata pengguna)
    // Ini mengasumsikan progres sudah dibuat di backend (via schema.sql)
    const sdCard = document.getElementById('level-card-sd');
    const smpCard = document.getElementById('level-card-smp');
    const smaCard = document.getElementById('level-card-sma');

    // Cek level pertama dari setiap strata
    const sdUnlocked = progress.find(p => p.level_id === 'tk_sd_1' && p.status !== 'locked');
    const smpUnlocked = progress.find(p => p.level_id === 'smp_1' && p.status !== 'locked');
    const smaUnlocked = progress.find(p => p.level_id === 'sma_1' && p.status !== 'locked');

    if (sdUnlocked) {
        sdCard.classList.remove('locked');
        sdCard.classList.add('open'); // Otomatis buka level pertama
    }
    if (smpUnlocked) {
        smpCard.classList.remove('locked');
    }
    if (smaUnlocked) {
        smaCard.classList.remove('locked');
    }

    // 3. Atur status node (locked/unlocked/completed)
    const nodes = document.querySelectorAll('.path-node');
    nodes.forEach(node => {
        const levelId = node.dataset.levelId;
        const levelProgress = progress.find(p => p.level_id === levelId);

        if (levelProgress) {
            node.classList.remove('node-locked', 'node-unlocked', 'node-completed');
            node.classList.add(`node-${levelProgress.status}`);

            if (levelProgress.status !== 'locked') {
                node.addEventListener('click', () => {
                    const currentUserHearts = window.GAFINCY_USER_DATA.profile.hearts || 0;
                    if (currentUserHearts > 0) {
                        window.location.href = `quiz.html?level=${levelId}`;
                    } else {
                        alert("Yah, hatimu sudah habis! Tunggu besok atau latihan untuk mengisinya kembali.");
                    }
                });
            }
        }
    });
}

/**
 * Inisialisasi untuk Halaman Profil (profile.html).
 */
function initProfilePage() {
    console.log("Inisialisasi Halaman Profil...");
    if (!window.GAFINCY_USER_DATA) return;
    const { profile } = window.GAFINCY_USER_DATA;
    
    document.getElementById('profile-username').textContent = profile.username;
    document.getElementById('profile-email').textContent = profile.email;
    document.getElementById('profile-xp').textContent = profile.xp;
    document.getElementById('profile-coins').textContent = profile.coins;
    document.getElementById('profile-streak').textContent = profile.current_streak;
}

/**
 * Inisialisasi untuk Halaman Leaderboard (leaderboard.html).
 */
async function initLeaderboardPage() {
    console.log("Inisialisasi Halaman Leaderboard...");
    try {
        const response = await fetchWithAuth('/get_leaderboard.php');
        if (response.status === 'success') {
            const { leaderboard, user_rank } = response.data;
            const tableBody = document.getElementById('leaderboard-body');
            const currentUser = auth.currentUser;

            tableBody.innerHTML = ''; 

            leaderboard.forEach(entry => {
                const row = document.createElement('tr');
                if (entry.firebase_uid === currentUser.uid) {
                    row.classList.add('current-user');
                }
                row.innerHTML = `
                    <td class="rank">${entry.rank}</td>
                    <td class="username">${entry.username}</td>
                    <td class="xp">${entry.xp} XP</td>
                `;
                tableBody.appendChild(row);
            });

            const userRankElement = document.getElementById('user-rank-info');
            if (userRankElement && user_rank) {
                userRankElement.textContent = `Peringkat Anda saat ini: #${user_rank}`;
            }
        }
    } catch (error) {
        console.error("Gagal memuat leaderboard:", error);
    }
}

/**
 * Inisialisasi untuk Halaman Log Book (logbook.html).
 */
async function initLogbookPage() {
    console.log("Inisialisasi Halaman Log Book...");
    const form = document.getElementById('logbook-form');
    const logEntriesContainer = document.getElementById('log-entries');

    const loadEntries = async () => {
        try {
            const response = await fetchWithAuth('/update_logbook.php', { method: 'GET' });
            if (response.status === 'success') {
                logEntriesContainer.innerHTML = '';
                if (response.data.length === 0) {
                    logEntriesContainer.innerHTML = '<p>Belum ada entri.</p>';
                    return;
                }
                response.data.forEach(entry => {
                    const div = document.createElement('div');
                    div.className = `log-entry log-type-${entry.type}`;
                    div.innerHTML = `
                        <span class="log-date">${entry.log_date}</span>
                        <span class="log-category">${entry.category}</span>
                        <span class="log-amount">${entry.type === 'income' ? '+' : '-'} Rp ${parseFloat(entry.amount).toLocaleString('id-ID')}</span>
                    `;
                    logEntriesContainer.appendChild(div);
                });
            }
        } catch (error) {
            console.error("Gagal memuat entri log:", error);
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            log_date: formData.get('log_date'),
            type: formData.get('type'),
            category: formData.get('category'),
            amount: formData.get('amount'),
            description: formData.get('description')
        };

        try {
            const response = await fetchWithAuth('/update_logbook.php', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (response.status === 'success') {
                form.reset();
                await loadEntries(); 
            }
        } catch (error) {
            console.error("Gagal menyimpan entri log:", error);
            alert("Gagal menyimpan entri. Silakan coba lagi.");
        }
    });

    await loadEntries();
}

/**
 * Inisialisasi untuk Halaman Login (index.html).
 */
function initLoginPage() {
    // Pindahkan logika event listener dari index.html ke sini
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const errorMessage = document.getElementById('error-message');
    const registerErrorMessage = document.getElementById('register-error-message');

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleSignIn(email, password).catch(error => {
            errorMessage.textContent = `Gagal masuk: ${error.message}`;
            errorMessage.style.display = 'block';
        });
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            registerErrorMessage.textContent = 'Password dan konfirmasi password tidak cocok.';
            registerErrorMessage.style.display = 'block';
            return;
        }

        handleRegister(email, password).catch(error => {
            registerErrorMessage.textContent = `Gagal mendaftar: ${error.message}`;
            registerErrorMessage.style.display = 'block';
        });
    });

    googleSignInBtn.addEventListener('click', () => {
        handleGoogleSignIn().catch(error => {
            errorMessage.textContent = `Gagal masuk dengan Google: ${error.message}`;
            errorMessage.style.display = 'block';
        });
    });
}


/**
 * Logika Notifikasi (dipanggil oleh DOMContentLoaded)
 */
function initNotificationDropdown() {
    const notifBtn = document.querySelector('.notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            notifDropdown.classList.toggle('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (notifDropdown && notifDropdown.classList.contains('show')) {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        }
    });
}