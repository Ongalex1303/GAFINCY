<?php
// GAFINCY - API: Get Leaderboard
// File: backend/api/get_leaderboard.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/firebase_verify.php';

// 1. Verifikasi Token Firebase (opsional, leaderboard bisa jadi publik)
// Untuk saat ini, kita buat agar hanya user terautentikasi yang bisa lihat.
$claims = verify_firebase_token();
$user_uid = $claims->get('sub');

// 2. Ambil data dari View Leaderboard
// Kita batasi misalnya 100 teratas untuk efisiensi
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

// Query untuk mengambil top N leaderboard
$stmt = $conn->prepare("SELECT username, xp FROM leaderboard LIMIT ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyiapkan statement leaderboard: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $limit);
$stmt->execute();
$result = $stmt->get_result();

$leaderboard_data = [];
$rank = 1;
while ($row = $result->fetch_assoc()) {
    $row['rank'] = $rank++;
    $leaderboard_data[] = $row;
}
$stmt->close();

// 3. Ambil Peringkat Pengguna Saat Ini
$user_rank = null;
// Query ini sedikit rumit, menghitung rank pengguna secara spesifik
$rank_query = "
    SELECT rank FROM (
        SELECT firebase_uid, RANK() OVER (ORDER BY xp DESC) as rank 
        FROM users
    ) as ranked_users 
    WHERE firebase_uid = ?
";
$stmt = $conn->prepare($rank_query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyiapkan statement rank: ' . $conn->error]);
    exit;
}
$stmt->bind_param("s", $user_uid);
$stmt->execute();
$rank_result = $stmt->get_result()->fetch_assoc();
if ($rank_result) {
    $user_rank = $rank_result['rank'];
}
$stmt->close();


// 4. Kirim Response
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'data' => [
        'leaderboard' => $leaderboard_data,
        'user_rank' => $user_rank
    ]
]);

close_connection($conn);
?>
