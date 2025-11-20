<?php
// GAFINCY - Firebase Token Verification
// File: backend/config/firebase_verify.php

require __DIR__ . '/../vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

/**
 * Memverifikasi Firebase ID Token dari header Authorization.
 *
 * @return object Mengembalikan data pengguna (claims) dari token jika valid.
 *                Akan menghentikan eksekusi skrip dengan response 401 jika tidak valid.
 */
function verify_firebase_token() {
    // --- PATH KE SERVICE ACCOUNT KEY ---
    // Ganti dengan path absolut ke file kunci JSON service account Anda.
    // PENTING: Simpan file ini di luar direktori web root yang dapat diakses publik.
    $serviceAccountKeyPath = __DIR__ . '/gafincy-firebase-adminsdk.json'; // <--- GANTI NAMA FILE INI

    if (!file_exists($serviceAccountKeyPath)) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Konfigurasi Firebase Admin SDK tidak ditemukan.'
        ]);
        exit;
    }

    try {
        $factory = (new Factory)->withServiceAccount($serviceAccountKeyPath);
        $auth = $factory->createAuth();
    } catch (\Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menginisialisasi Firebase Admin SDK: ' . $e->getMessage()
        ]);
        exit;
    }

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Token tidak ditemukan.']);
        exit;
    }

    $idToken = substr($authHeader, 7);

    if (empty($idToken)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Token kosong.']);
        exit;
    }

    try {
        $verifiedIdToken = $auth->verifyIdToken($idToken);
        // Mengembalikan klaim dari token yang terverifikasi
        return $verifiedIdToken->claims();
    } catch (FailedToVerifyToken $e) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized: Token tidak valid atau kedaluwarsa. ' . $e->getMessage()
        ]);
        exit;
    } catch (\Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat verifikasi token: ' . $e->getMessage()
        ]);
        exit;
    }
}
?>
