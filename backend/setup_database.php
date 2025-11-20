<?php
// GAFINCY - Database Setup Script (Auto-Migrate)
// File: backend/setup_database.php
// Cara pakai: Buka terminal di root folder, ketik: php backend/setup_database.php

// Pastikan hanya dijalankan lewat Terminal (CLI)
if (php_sapi_name() !== 'cli') {
    die("❌ Script ini hanya boleh dijalankan melalui Terminal.");
}

echo "\n🚀 Memulai Setup Database GAFINCY...\n";

$host = 'localhost';
$user = 'root';
$pass = ''; // Password default XAMPP kosong
$dbname = 'gafincy_db';

// 1. Koneksi Awal (Tanpa DB)
$conn = new mysqli($host, $user, $pass);
if ($conn->connect_error) {
    die("❌ Koneksi Gagal: " . $conn->connect_error . "\n   Pastikan XAMPP (MySQL) sudah berjalan!\n");
}

// 2. Reset Database
echo "🗑️  Menghapus database lama '$dbname'விற்கு\n";
$conn->query("DROP DATABASE IF EXISTS $dbname");

echo "✨ Membuat database baru '$dbname'விற்கு\n";
if (!$conn->query("CREATE DATABASE $dbname")) {
    die("❌ Gagal membuat database: " . $conn->error . "\n");
}
$conn->select_db($dbname);

// 3. Baca & Jalankan schema.sql
$schemaFile = __DIR__ . '/../../schema.sql'; // Path ke schema.sql di root
if (!file_exists($schemaFile)) {
    // Coba path alternatif jika dijalankan dari dalam folder backend
    $schemaFile = __DIR__ . '/../schema.sql'; 
}

if (!file_exists($schemaFile)) {
    die("❌ File 'schema.sql' tidak ditemukan!\n");
}

echo "📂 Membaca file schema.sql...\n";
$sqlContent = file_get_contents($schemaFile);

// Eksekusi Multi-Query
if ($conn->multi_query($sqlContent)) {
    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    
    if ($conn->errno) {
         echo "⚠️ Ada peringatan: " . $conn->error . "\n";
    } else {
         echo "✅ Tabel dan Struktur berhasil dibuat!\n";
    }
} else {
    echo "❌ Gagal menjalankan SQL: " . $conn->error . "\n";
}

$conn->close();
echo "\n🎉 SUKSES! Database siap digunakan.\n";
?>
