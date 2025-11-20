<?php
// GAFINCY - API: Update Log Book
// File: backend/api/update_logbook.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

// Handle pre-flight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/firebase_verify.php';

// 1. Verifikasi Token Firebase
$claims = verify_firebase_token();
$firebase_uid = $claims->get('sub');

// 2. Tentukan metode request (GET atau POST)
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // --- Menambah Entri Baru ---
    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !$input || !isset($input['log_date']) || !isset($input['type']) ||
        !isset($input['category']) || !isset($input['amount'])
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data input tidak lengkap.']);
        exit;
    }

    $log_date = $input['log_date'];
    $type = $input['type'];
    $category = $input['category'];
    $amount = (float)$input['amount'];
    $description = $input['description'] ?? '';

    // Validasi tipe
    if (!in_array($type, ['income', 'expense', 'saving'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Tipe log tidak valid.']);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO log_book (firebase_uid, log_date, type, category, amount, description) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyiapkan statement: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("ssssds", $firebase_uid, $log_date, $type, $category, $amount, $description);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            'status' => 'success',
            'message' => 'Entri log berhasil ditambahkan.',
            'log_id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan entri log: ' . $stmt->error]);
    }
    $stmt->close();

} elseif ($method === 'GET') {
    // --- Mengambil Semua Entri Log Pengguna ---
    $stmt = $conn->prepare(
        "SELECT log_id, log_date, type, category, amount, description, created_at 
         FROM log_book 
         WHERE firebase_uid = ? 
         ORDER BY log_date DESC, created_at DESC"
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyiapkan statement: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("s", $firebase_uid);
    $stmt->execute();
    $result = $stmt->get_result();

    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $logs
    ]);

    $stmt->close();
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Metode request tidak diizinkan.']);
}

close_connection($conn);
?>
