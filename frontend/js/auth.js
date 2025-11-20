// GAFINCY - Authentication Logic & API Calls (v5 - Sesuai Desain Baru)
// File: frontend/js/auth.js

/**
 * Fungsi helper untuk melakukan panggilan API ke backend
 */
async function fetchWithAuth(endpoint, options = {}) {
    const user = auth.currentUser;
    if (!user) {
        console.error("Tidak ada pengguna yang login.");
        window.location.href = 'index.html'; 
        throw new Error("Pengguna tidak terautentikasi.");
    }

    try {
        const token = await user.getIdToken();

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // --- PERUBAHAN PENTING ---
        // Cek apakah ada data registrasi yang tertunda di localStorage
        const pendingRegisterInfo = localStorage.getItem('pendingRegisterInfo');
        if (pendingRegisterInfo) {
            headers['X-Register-Info'] = pendingRegisterInfo; // Kirim data (username, strata)
            localStorage.removeItem('pendingRegisterInfo'); // Hapus setelah dikirim
        }
        // --- AKHIR PERUBAHAN ---

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            // Jika error karena data registrasi tidak valid, paksa logout
            if (response.status === 400 || response.status === 403) {
                alert(errorData.message); // Tampilkan pesan error
                handleSignOut(); // Paksa logout
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`Error pada panggilan API ke ${endpoint}:`, error);
        if (error.message.includes("401") || error.message.includes("Token tidak valid")) {
            handleSignOut();
        }
        throw error;
    }
}


// --- FUNGSI-FUNGSI OTENTIKASI ---

/**
 * Menangani pendaftaran pengguna baru dengan email dan password.
 * @param {string} email 
 * @param {string} password 
 * @param {string} username 
 * @param {string} strata 
 * @returns {Promise<firebase.auth.UserCredential>}
 */
function handleRegister(email, password, username, strata) {
    // 1. Simpan info ekstra ke localStorage untuk dikirim nanti
    const registerInfo = { username, strata };
    const encodedInfo = btoa(JSON.stringify(registerInfo)); // Encode ke Base64
    localStorage.setItem('pendingRegisterInfo', encodedInfo);

    // 2. Buat pengguna di Firebase Auth
    return auth.createUserWithEmailAndPassword(email, password);
}

function handleSignIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function handleGoogleSignIn() {
    // Login Google akan dibuatkan profile di backend, tapi
    // kita perlu cara untuk menanyakan 'strata'-nya.
    
    // Implementasi Sederhana: Minta pengguna mendaftar dengan email dulu
    alert("Untuk saat ini, silakan daftar menggunakan Email dan Password agar kami dapat mengetahui jenjang pendidikan Anda.");
    return Promise.reject(new Error("Google Sign-In disabled for registration."));
    
    // Implementasi Nanti (Lebih Rumit):
    // return auth.signInWithPopup(googleProvider);
}

function handleSignOut() {
    auth.signOut().then(() => {
        console.log("Pengguna berhasil logout.");
        window.location.href = 'index.html'; 
    }).catch((error) => {
        console.error("Error saat logout:", error);
    });
}


// --- LISTENER STATUS OTENTIKASI ---

auth.onAuthStateChanged(user => {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (user) {
        // Pengguna sedang login
        console.log("Status: Login (UID:", user.uid, ")");
        // Arahkan ke Dashboard jika kita ada di halaman login
        if (currentPage === 'index.html' || currentPage === '' || currentPage === 'splash.html') {
            window.location.href = 'home.html'; 
        }
    } else {
        // Pengguna tidak login
        console.log("Status: Logout");
        // Arahkan ke Login jika kita TIDAK di halaman login/splash
        if (currentPage !== 'index.html' && currentPage !== '' && currentPage !== 'splash.html') {
            window.location.href = 'index.html'; 
        }
    }
});
