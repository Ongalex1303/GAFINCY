# GAFINCY (Gaok Financial Literacy)

GAFINCY adalah platform Learning Management System (LMS) gamifikasi berbasis web yang dirancang untuk mengajarkan literasi keuangan kepada siswa dari tingkat TK hingga SMA. Platform ini didasarkan pada kerangka kerja literasi keuangan OECD/INFE dan OJK.

## Stack Teknologi

*   **Backend:** PHP 8+ (Vanilla)
*   **Database:** MySQL
*   **Otentikasi:** Firebase Authentication (Email/Password, Google Sign-In)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)

## Arsitektur

Aplikasi ini menggunakan arsitektur hybrid:
1.  **Frontend (Client-side):** Mengelola semua interaksi pengguna dan otentikasi melalui Firebase Authentication SDK.
2.  **Backend (Server-side):** Menyediakan API untuk operasi data (CRUD) ke database MySQL. Setiap permintaan API harus menyertakan Firebase ID Token yang valid.
3.  **Verifikasi Token:** Backend PHP memverifikasi ID Token yang diterima dari frontend menggunakan Firebase Admin SDK sebelum memproses permintaan apa pun ke database.

## Setup & Instalasi

### 1. Backend (PHP)

1.  **Clone Repository:**
    ```bash
    git clone [URL_REPOSITORY_ANDA]
    cd GAFINCY/backend
    ```

2.  **Install Dependensi PHP:**
    Pastikan Anda memiliki [Composer](https://getcomposer.org/) terinstal.
    ```bash
    composer install
    ```
    Ini akan menginstal `kreait/firebase-php` dan dependensi lainnya.

3.  **Konfigurasi Firebase Admin:**
    *   Buat *service account* di Firebase Console Anda: **Project Settings > Service accounts > Generate new private key**.
    *   Simpan file JSON yang diunduh di lokasi yang aman, misalnya di dalam direktori `backend/config/`.
    *   **PENTING:** Pastikan untuk menambahkan file kunci ini ke `.gitignore` Anda agar tidak terekspos ke publik.
    *   Ubah path ke file kunci Anda di dalam file `backend/config/firebase_verify.php`.

4.  **Konfigurasi Database:**
    *   Buka file `backend/config/db_connect.php`.
    *   Sesuaikan detail koneksi (host, username, password, nama database) dengan konfigurasi server MySQL Anda.

### 2. Database (MySQL)

1.  **Buat Database:**
    Buat database baru di server MySQL Anda (misalnya, melalui phpMyAdmin) dengan nama `gafincy_db`.

2.  **Impor Skema:**
    Impor file `schema.sql` ke dalam database `gafincy_db` Anda. Ini akan membuat semua tabel dan *view* yang diperlukan.

### 3. Frontend (HTML/JS)

1.  **Konfigurasi Firebase SDK:**
    *   Buka file `frontend/js/firebase-init.js`.
    *   Salin konfigurasi Firebase untuk aplikasi web Anda dari Firebase Console: **Project Settings > General > Your apps > Web app**.
    *   Tempel konfigurasi tersebut ke dalam objek `firebaseConfig`.

2.  **Jalankan Aplikasi:**
    *   Anda memerlukan web server lokal (seperti XAMPP, WAMP, atau server bawaan PHP) untuk menjalankan proyek ini.
    *   Arahkan *document root* server Anda ke direktori `frontend`.
    *   Buka browser dan navigasikan ke `http://localhost/` (atau alamat server lokal Anda). Halaman login (`index.html`) akan muncul.

## Struktur File

```
/gafincy
|
|-- /backend
|   |-- /api/ (Endpoint API PHP)
|   |-- /config/ (Koneksi DB & Verifikasi Firebase)
|   |-- composer.json
|   |-- vendor/ (Dibuat oleh Composer)
|
|-- /frontend
|   |-- /css/ (File Styling)
|   |-- /js/ (Logika Frontend & Firebase)
|   |-- /images/ (Aset Gambar)
|   |-- *.html (Halaman-halaman)
|
|-- schema.sql
|-- README.md
```
