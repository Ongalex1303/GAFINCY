-- GAFINCY Database Schema (v5 - Sesuai Desain Baru)
-- Target: MySQL

-- HAPUS SEMUA JIKA ADA (untuk fresh install)
DROP TABLE IF EXISTS `log_book`;
DROP TABLE IF EXISTS `user_progress`;
DROP TABLE IF EXISTS `users`;
DROP VIEW IF EXISTS `leaderboard`;
DROP PROCEDURE IF EXISTS `InitializeUserProgress`;

--
-- Tabel 1: users
-- Menambahkan kolom `strata` (TK-SD, SMP, SMA)
--
CREATE TABLE `users` (
  `firebase_uid` VARCHAR(128) NOT NULL PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `strata` ENUM('TK-SD', 'SMP', 'SMA') NOT NULL, -- <-- PERUBAHAN KRITIS
  `xp` INT NOT NULL DEFAULT 0,
  `coins` INT NOT NULL DEFAULT 0,
  `hearts` INT NOT NULL DEFAULT 5,
  `current_streak` INT NOT NULL DEFAULT 0,
  `last_login` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Tabel 2: user_progress
--
CREATE TABLE `user_progress` (
  `progress_id` INT AUTO_INCREMENT PRIMARY KEY,
  `firebase_uid` VARCHAR(128) NOT NULL,
  `level_id` VARCHAR(50) NOT NULL,
  `status` ENUM('locked', 'unlocked', 'completed') NOT NULL DEFAULT 'locked',
  `score` INT DEFAULT 0,
  `stars` INT DEFAULT 0,
  FOREIGN KEY (`firebase_uid`) REFERENCES `users`(`firebase_uid`) ON DELETE CASCADE,
  UNIQUE KEY `user_level_unique` (`firebase_uid`, `level_id`)
);

--
-- Tabel 3: log_book
--
CREATE TABLE `log_book` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `firebase_uid` VARCHAR(128) NOT NULL,
  `log_date` DATE NOT NULL,
  `type` ENUM('income', 'expense', 'saving') NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`firebase_uid`) REFERENCES `users`(`firebase_uid`) ON DELETE CASCADE
);

--
-- View 4: leaderboard
--
CREATE OR REPLACE VIEW `leaderboard` AS
SELECT
  `username`,
  `xp`,
  `firebase_uid`
FROM
  `users`
ORDER BY
  `xp` DESC;

--
-- Prosedur 5: InitializeUserProgress (LOGIKA BARU)
-- Prosedur ini sekarang HANYA membuka level pertama dari strata yang dipilih.
--
DELIMITER $$
CREATE PROCEDURE `InitializeUserProgress`(IN user_uid VARCHAR(128), IN user_strata ENUM('TK-SD', 'SMP', 'SMA'))
BEGIN
    -- Level TK-SD (Hanya terbuka jika strata 'TK-SD')
    IF user_strata = 'TK-SD' THEN
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_1', 'unlocked');
    ELSE
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_1', 'locked');
    END IF;
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_2', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_3', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_4', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_5', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_6', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_7', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_8', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_9', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'tk_sd_10', 'locked');

    -- Level SMP (Hanya terbuka jika strata 'SMP')
    IF user_strata = 'SMP' THEN
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_1', 'unlocked');
    ELSE
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_1', 'locked');
    END IF;
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_2', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_3', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_4', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_5', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_6', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_7', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_8', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_9', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'smp_10', 'locked');

    -- Level SMA (Hanya terbuka jika strata 'SMA')
    IF user_strata = 'SMA' THEN
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_1', 'unlocked');
    ELSE
        INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_1', 'locked');
    END IF;
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_2', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_3', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_4', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_5', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_6', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_7', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_8', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_9', 'locked');
    INSERT INTO user_progress (firebase_uid, level_id, status) VALUES (user_uid, 'sma_10', 'locked');
END$$
DELIMITER ;
