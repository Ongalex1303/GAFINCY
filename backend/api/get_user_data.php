<?php
// GAFINCY - API: Get User Data (v5 - Sesuai Desain Baru)
// File: backend/api/get_user_data.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
// Izinkan header kustom X-Register-Info
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Register-Info');

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/firebase_verify.php';

// 1. Verifikasi Token Firebase
$claims = verify_firebase_token();
$firebase_uid = $claims->get('sub'); 

// 2. Ambil Data Pengguna dari Database MySQL
$stmt = $conn->prepare(
    "SELECT username, email, strata, xp, coins, hearts, current_streak, last_login 
     FROM users 
     WHERE firebase_uid = ?"
);
$stmt->bind_param("s", $firebase_uid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // --- PENGGUNA SUDAH ADA (LOGIN BIASA) ---
    $userData = $result->fetch_assoc();
    $progressStmt = $conn->prepare("SELECT level_id, status FROM user_progress WHERE firebase_uid = ?");
    $progressStmt->bind_param("s", $firebase_uid);
    $progressStmt->execute();
    $progressResult = $progressStmt->get_result();
    $userProgress = [];
    while ($row = $progressResult->fetch_assoc()) {
        $userProgress[$row['level_id']] = $row['status']; // Kirim sebagai objek untuk pencarian cepat
    }
    $progressStmt->close();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => [
            'profile' => $userData,
            'progress' => $userProgress
        ]
    ]);

} else {
    // --- PENGGUNA BARU (PROSES REGISTRASI) ---
    
    // Ambil data registrasi (username & strata) dari header
    $headers = getallheaders();
    $registerInfo = $headers['X-Register-Info'] ?? '';
    
    if (empty($registerInfo)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Registrasi Gagal: Data registrasi (username/strata) tidak diterima oleh server.']);
        exit;
    }

    $registerData = json_decode(base64_decode($registerInfo), true);
    $username = $registerData['username'] ?? explode('@', $claims->get('email'))[0];
    $strata = $registerData['strata'] ?? '';
    $email = $claims->get('email');

    // Validasi Strata
    if (!in_array($strata, ['TK-SD', 'SMP', 'SMA'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Registrasi Gagal: Jenjang Pendidikan (Strata) tidak valid.']);
        exit;
    }

    // Buat entri pengguna baru
    $insertStmt = $conn->prepare(
        "INSERT INTO users (firebase_uid, username, email, strata) VALUES (?, ?, ?, ?)"
    );
    $insertStmt->bind_param("ssss", $firebase_uid, $username, $email, $strata);
    
    if ($insertStmt->execute()) {
        // Panggil prosedur untuk inisialisasi progress SESUAI STRATA
        $conn->query("CALL InitializeUserProgress('$firebase_uid', '$strata')");

        // Ambil kembali data yang baru dibuat untuk dikirim ke klien
        $stmt->execute();
        $result = $stmt->get_result();
        $userData = $result->fetch_assoc();

        // Ambil juga progress yang baru diinisialisasi
        $progressStmt = $conn->prepare("SELECT level_id, status FROM user_progress WHERE firebase_uid = ?");
        $progressStmt->bind_param("s", $firebase_uid);
        $progressStmt->execute();
        $progressResult = $progressStmt->get_result();
        $userProgress = [];
        while ($row = $progressResult->fetch_assoc()) {
            $userProgress[$row['level_id']] = $row['status'];
        }
        $progressStmt->close();

        http_response_code(201); // 201 Created
        echo json_encode([
            'status' => 'success_created',
            'data' => [
                'profile' => $userData,
                'progress' => $userProgress
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal membuat data pengguna baru: ' . $insertStmt->error]);
    }
    $insertStmt->close();
}

$stmt->close();
close_connection($conn);
?>
