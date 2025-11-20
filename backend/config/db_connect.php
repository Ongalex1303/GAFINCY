<?php
// GAFINCY - Database Connection
// File: backend/config/db_connect.php

// --- KONFIGURASI DATABASE ---
// Sesuaikan nilai-nilai di bawah ini dengan konfigurasi server MySQL Anda.
define('DB_HOST', 'localhost');       // Biasanya 'localhost' atau 127.0.0.1
define('DB_USER', 'root');            // Username database Anda
define('DB_PASS', '');                // Password database Anda (kosongkan jika default XAMPP)
define('DB_NAME', 'gafincy_db');      // Nama database yang Anda buat

// --- BUAT KONEKSI ---
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// --- PERIKSA KONEKSI ---
if ($conn->connect_error) {
    // Hentikan eksekusi dan tampilkan pesan error jika koneksi gagal.
    header('Content-Type: application/json');
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'status' => 'error',
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]);
    die();
}

// Atur charset ke utf8mb4 untuk mendukung berbagai karakter.
$conn->set_charset("utf8mb4");

// Fungsi ini bisa dipanggil di akhir skrip API untuk menutup koneksi.
function close_connection($db_connection) {
    $db_connection->close();
}
?>