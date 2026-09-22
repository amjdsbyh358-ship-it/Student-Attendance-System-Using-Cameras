-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 22 سبتمبر 2026 الساعة 19:09
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_attendance`
--

-- --------------------------------------------------------

--
-- بنية الجدول `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `attendance_date` varchar(10) NOT NULL,
  `attendance_time` varchar(8) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `section_id`, `attendance_date`, `attendance_time`, `status`, `created_at`) VALUES
(19, 2, 3, '2026-09-14', '20:46:30', 'present', '2026-09-14 20:46:30'),
(20, 2, 3, '2026-09-16', '16:36:46', 'present', '2026-09-16 16:36:47'),
(21, 2, 3, '2026-09-18', '19:05:45', 'present', '2026-09-18 19:05:45'),
(22, 3, 3, '2026-09-18', '19:19:21', 'present', '2026-09-18 19:19:21'),
(23, 2, 4, '2026-09-18', '19:47:31', 'present', '2026-09-18 19:47:31'),
(24, 3, 4, '2026-09-18', '19:47:32', 'present', '2026-09-18 19:47:32'),
(25, 2, 5, '2026-09-18', '19:58:54', 'present', '2026-09-18 19:58:54'),
(26, 2, 3, '2026-09-19', '11:54:52', 'present', '2026-09-19 11:54:52'),
(27, 3, 3, '2026-09-19', '11:57:56', 'present', '2026-09-19 11:57:56'),
(28, 8, 3, '2026-09-19', '12:10:51', 'present', '2026-09-19 12:10:51'),
(29, 9, 3, '2026-09-19', '12:49:09', 'present', '2026-09-19 12:49:09'),
(30, 3, 4, '2026-09-19', '13:11:13', 'present', '2026-09-19 13:11:13'),
(31, 2, 4, '2026-09-19', '13:11:18', 'present', '2026-09-19 13:11:18');

-- --------------------------------------------------------

--
-- بنية الجدول `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_code` varchar(50) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `course_name`, `department`, `level`, `created_at`) VALUES
(3, 'AI', 'ذكاء اصطناعي', 'تقنية معلومات', 'الرابع', '2026-09-14 20:29:50'),
(4, 'A', 'ذكاء اصطناعي عملي', 'تقنية معلومات', 'الرابع', '2026-09-14 20:40:05');

-- --------------------------------------------------------

--
-- بنية الجدول `course_sections`
--

CREATE TABLE `course_sections` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `day` varchar(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `course_sections`
--

INSERT INTO `course_sections` (`id`, `course_id`, `teacher_id`, `section_name`, `room`, `day`, `start_time`, `end_time`, `created_at`) VALUES
(3, 3, 2, 'المجموعة الاولى', '2C', 'السبت', '10:00:00', '12:00:00', '2026-09-14 20:32:12'),
(4, 4, 4, 'الاولى عملي', 'معمل 2', 'السبت', '12:00:00', '14:00:00', '2026-09-14 20:43:32'),
(5, 3, 2, 'الاولى عملي', 'معمل 2', 'الأحد', '08:00:00', '10:00:00', '2026-09-18 19:55:17');

-- --------------------------------------------------------

--
-- بنية الجدول `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `section_id`, `created_at`) VALUES
(7, 2, 3, '2026-09-14 20:36:57'),
(8, 3, 3, '2026-09-14 20:37:29'),
(9, 2, 4, '2026-09-14 20:44:37'),
(10, 3, 4, '2026-09-14 20:45:49'),
(11, 2, 5, '2026-09-18 19:58:14'),
(12, 3, 5, '2026-09-18 20:01:02'),
(13, 7, 3, '2026-09-19 11:52:29'),
(14, 8, 3, '2026-09-19 12:10:12'),
(15, 9, 3, '2026-09-19 12:48:43');

-- --------------------------------------------------------

--
-- بنية الجدول `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `students`
--

INSERT INTO `students` (`id`, `student_number`, `full_name`, `email`, `phone`, `department`, `level`, `created_at`) VALUES
(2, '20', 'امجد ماجد صبيح', 'amjadmajed1133@gmail.com', '+967772864941', 'تقنية معلومات', 'الرابع', '2026-09-08 23:57:39'),
(3, '21', 'ابراهيم صبيح', 'aaaaaaaaaaaaaaaaaaaa@gmail.com', '77777777777', 'تقنية معلومات', 'الرابع', '2026-09-10 22:05:55'),
(7, '25', 'زين العابدين', 'zzzzzzzzzzzzzzzz@gmail.com', '77415635', 'تقنية معلومات', 'الرابع', '2026-09-19 11:51:12'),
(8, '26', 'جبران سليمان', 'ggggggggggg@gmail.com', '774156355', 'تقنية معلومات', 'الرابع', '2026-09-19 12:09:19'),
(9, '50', 'ايمن مارش', 'ayman@gmail.com', '712358785', 'تقنية معلومات', 'الرابع', '2026-09-19 12:47:20'),
(10, '27', 'حبيب عبد الله', 'jed1133@gmail.com', '77624532', 'تقنية معلومات', 'الرابع', '2026-09-19 13:10:01');

-- --------------------------------------------------------

--
-- بنية الجدول `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `teachers`
--

INSERT INTO `teachers` (`id`, `full_name`, `email`, `department`, `created_at`) VALUES
(2, 'معاذ الصبري', 'maaje@example.com', 'ذكاء اصظناعي', '2026-09-10 22:08:31'),
(4, 'افنان الحاتمي', 'afnan@gmail.com', 'تقنية معلومات', '2026-09-14 20:41:23');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_attendance_student_id` (`student_id`),
  ADD KEY `ix_attendance_id` (`id`),
  ADD KEY `ix_attendance_attendance_date` (`attendance_date`),
  ADD KEY `fk_attendance_section` (`section_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_courses_course_code` (`course_code`),
  ADD KEY `ix_courses_id` (`id`);

--
-- Indexes for table `course_sections`
--
ALTER TABLE `course_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_course_sections_teacher_id` (`teacher_id`),
  ADD KEY `ix_course_sections_course_id` (`course_id`),
  ADD KEY `ix_course_sections_id` (`id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_enrollments_student_id` (`student_id`),
  ADD KEY `ix_enrollments_section_id` (`section_id`),
  ADD KEY `ix_enrollments_id` (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_students_student_number` (`student_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ix_students_id` (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ix_teachers_id` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `ix_users_username` (`username`),
  ADD KEY `ix_users_id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_sections`
--
ALTER TABLE `course_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `fk_attendance_section` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`);

--
-- قيود الجداول `course_sections`
--
ALTER TABLE `course_sections`
  ADD CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `course_sections_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- قيود الجداول `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
