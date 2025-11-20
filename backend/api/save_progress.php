<?php
// GAFINCY - API: Save User Progress
// File: backend/api/save_progress.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// 2. Ambil data dari body request
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['level_id']) || !isset($input['score']) || !isset($input['stars'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Data input tidak lengkap atau tidak valid.']);
    exit;
}

$level_id = $input['level_id'];
$score = (int)$input['score'];
$stars = (int)$input['stars'];
$xp_gained = (int)($input['xp_gained'] ?? 0);
$coins_gained = (int)($input['coins_gained'] ?? 0);
$next_level_id = $input['next_level_id'] ?? null;

// 3. Simpan Progress ke Database
$conn->begin_transaction();

try {
    // Update status level yang selesai
    $stmt1 = $conn->prepare(
        "UPDATE user_progress SET status = 'completed', score = ?, stars = ? 
         WHERE firebase_uid = ? AND level_id = ?"
    );
    if (!$stmt1) throw new Exception("Gagal menyiapkan statement 1: " . $conn->error);
    $stmt1->bind_param("iiss", $score, $stars, $firebase_uid, $level_id);
    $stmt1->execute();
    $stmt1->close();

    // Buka level selanjutnya jika ada
    if ($next_level_id) {
        $stmt2 = $conn->prepare(
            "UPDATE user_progress SET status = 'unlocked' 
             WHERE firebase_uid = ? AND level_id = ? AND status = 'locked'"
        );
        if (!$stmt2) throw new Exception("Gagal menyiapkan statement 2: " . $conn->error);
        $stmt2->bind_param("ss", $firebase_uid, $next_level_id);
        $stmt2->execute();
        $stmt2->close();
    }

    // Update XP dan Koin pengguna
    $stmt3 = $conn->prepare(
        "UPDATE users SET xp = xp + ?, coins = coins + ? 
         WHERE firebase_uid = ?"
    );
    if (!$stmt3) throw new Exception("Gagal menyiapkan statement 3: " . $conn->error);
    $stmt3->bind_param("iis", $xp_gained, $coins_gained, $firebase_uid);
    $stmt3->execute();
    $stmt3->close();

    // Commit transaksi
    $conn->commit();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Progress berhasil disimpan.',
        'data' => [
            'unlocked_level' => $next_level_id
        ]
    ]);

} catch (Exception $e) {
    // Rollback jika terjadi error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan progress: ' . $e->getMessage()]);
}

close_connection($conn);
?>
