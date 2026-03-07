-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com    Database: nba
-- ------------------------------------------------------
-- Server version	8.0.11-TiDB-v7.5.6-serverless

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `all_program`
--

DROP TABLE IF EXISTS `all_program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `all_program` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discipline` int DEFAULT NULL,
  `level` int DEFAULT NULL,
  `programname` int DEFAULT NULL,
  `department_name` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `year_start` year(4) DEFAULT NULL,
  `year_end` year(4) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_discipline` (`discipline`),
  KEY `fk_level` (`level`),
  KEY `fk_programname` (`programname`),
  CONSTRAINT `fk_discipline` FOREIGN KEY (`discipline`) REFERENCES `discipline` (`id`),
  CONSTRAINT `fk_level` FOREIGN KEY (`level`) REFERENCES `program_level` (`id`),
  CONSTRAINT `fk_programname` FOREIGN KEY (`programname`) REFERENCES `program_name` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30033;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `all_program`
--

LOCK TABLES `all_program` WRITE;
/*!40000 ALTER TABLE `all_program` DISABLE KEYS */;
INSERT INTO `all_program` VALUES (1,1,1,29,'Aeronautical Engineering',2008,2022,'2026-03-05 05:54:43','2026-03-05 06:11:17'),(2,1,1,30,'Agricultural Engineering',2015,NULL,'2026-03-05 06:01:50','2026-03-05 06:01:50'),(3,1,1,31,'Artificial Intelligence and Data Science',2020,NULL,'2026-03-05 06:04:09','2026-03-05 06:04:09'),(4,1,1,32,'Artificial Intelligence and Machine Learning',2021,NULL,'2026-03-05 06:04:48','2026-03-05 06:04:48'),(5,1,1,33,'Automobile Engineering',2014,2022,'2026-03-05 06:05:21','2026-03-05 06:11:31'),(6,1,1,34,'Biomedical Engineering',2019,2024,'2026-03-05 06:05:47','2026-03-05 06:11:41'),(7,1,2,35,'Biotechnology',2008,2024,'2026-03-05 06:07:07','2026-03-05 06:11:47'),(8,1,1,36,'Biotechnology',2003,NULL,'2026-03-05 06:07:48','2026-03-05 06:07:48'),(9,1,1,37,'Civil Engineering',2001,2024,'2026-03-05 06:08:26','2026-03-05 06:12:07'),(10,1,2,38,'Communication Systems(PG)',2005,2024,'2026-03-05 06:08:52','2026-03-05 06:12:20'),(11,1,1,39,'Computer Science and Business System',2019,2022,'2026-03-05 06:10:26','2026-03-06 09:46:51'),(12,1,1,40,'Computer Science and Design',2022,2024,'2026-03-05 06:13:49','2026-03-05 06:14:14'),(13,1,2,41,'Computer Science and  Engineering(PG)',2005,NULL,'2026-03-05 06:20:00','2026-03-05 06:20:00'),(14,1,1,42,'Computer Science and Engineering',1996,NULL,'2026-03-05 06:20:42','2026-03-05 06:20:42'),(15,1,1,43,'Computer Technology',2019,2024,'2026-03-05 06:21:05','2026-03-05 06:28:14'),(16,1,1,44,'Electrical and Electronics  Engineering',1996,NULL,'2026-03-05 06:21:33','2026-03-05 06:21:33'),(17,1,1,45,'Electronics & Communication  Engineering',1998,NULL,'2026-03-05 06:21:51','2026-03-05 06:21:51'),(18,1,1,46,'Electronics & Instrumentation  Engineering',2007,NULL,'2026-03-05 06:22:10','2026-03-05 06:22:10'),(19,1,2,47,'Embedded Systems(PG)',2010,2022,'2026-03-05 06:22:39','2026-03-05 06:28:27'),(20,1,1,48,'Fashion Technology',2004,2024,'2026-03-05 06:23:07','2026-03-05 06:28:43'),(21,1,1,49,'Food Technology',2016,2024,'2026-03-05 06:23:32','2026-03-05 06:28:49'),(22,1,2,50,'Industrial Automation & Robotics(PG)',2015,2022,'2026-03-05 06:23:58','2026-03-05 06:28:55'),(23,1,2,51,'Industrial Safety Engineering(PG)',2014,NULL,'2026-03-05 06:24:27','2026-03-05 06:24:27'),(24,1,1,52,'Information Science &  Engineering',2019,2024,'2026-03-05 06:24:54','2026-03-05 06:29:10'),(25,1,1,53,'Information Technology',1999,NULL,'2026-03-05 06:25:08','2026-03-05 06:25:08'),(26,1,1,54,'Mechanical Engineering',1996,NULL,'2026-03-05 06:25:25','2026-03-05 06:25:25'),(27,1,1,55,'Mechatronics Engineering',2012,NULL,'2026-03-05 06:25:39','2026-03-05 06:25:39'),(28,1,2,56,'Power Electronics & Drives(PG)',2003,2022,'2026-03-05 06:25:58','2026-03-05 06:29:27'),(29,1,2,57,'Software Engineering(PG)',2006,2022,'2026-03-05 06:26:26','2026-03-05 06:29:33'),(30,1,2,58,'Structural Engineering(PG)',2007,2024,'2026-03-05 06:27:07','2026-03-05 06:29:47'),(31,1,1,59,'Textile Technology',1996,2023,'2026-03-05 06:27:38','2026-03-05 06:29:54'),(32,2,2,60,'Master of Business Administration',2008,NULL,'2026-03-05 06:27:56','2026-03-05 06:27:56');
/*!40000 ALTER TABLE `all_program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allied_course_group`
--

DROP TABLE IF EXISTS `allied_course_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allied_course_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=60004;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allied_course_group`
--

LOCK TABLES `allied_course_group` WRITE;
/*!40000 ALTER TABLE `allied_course_group` DISABLE KEYS */;
INSERT INTO `allied_course_group` VALUES (1,'2026-03-06 05:03:56','2026-03-06 05:03:56'),(2,'2026-03-06 05:25:07','2026-03-06 05:25:07'),(3,'2026-03-06 05:26:57','2026-03-06 05:26:57'),(30004,'2026-03-07 04:02:20','2026-03-07 04:02:20'),(30005,'2026-03-07 04:05:42','2026-03-07 04:05:42'),(30006,'2026-03-07 04:06:20','2026-03-07 04:06:20'),(30007,'2026-03-07 04:06:41','2026-03-07 04:06:41'),(30008,'2026-03-07 04:06:56','2026-03-07 04:06:56');
/*!40000 ALTER TABLE `allied_course_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allied_course_mapping`
--

DROP TABLE IF EXISTS `allied_course_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allied_course_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `program_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `group_id` (`group_id`,`program_id`),
  KEY `fk_program` (`program_id`),
  CONSTRAINT `fk_allied_group` FOREIGN KEY (`group_id`) REFERENCES `allied_course_group` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_program` FOREIGN KEY (`program_id`) REFERENCES `all_program` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=60033;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allied_course_mapping`
--

LOCK TABLES `allied_course_mapping` WRITE;
/*!40000 ALTER TABLE `allied_course_mapping` DISABLE KEYS */;
INSERT INTO `allied_course_mapping` VALUES (15,2,17,'2026-03-06 05:25:07','2026-03-06 05:25:07'),(16,2,18,'2026-03-06 05:25:07','2026-03-06 05:25:07'),(17,2,27,'2026-03-06 05:25:07','2026-03-06 05:25:07'),(18,3,2,'2026-03-06 05:26:57','2026-03-06 05:26:57'),(26,1,14,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(27,1,12,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(28,1,15,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(29,1,24,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(30,1,25,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(31,1,3,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(32,1,4,'2026-03-06 09:47:11','2026-03-06 09:47:11'),(30033,30004,16,'2026-03-07 04:02:21','2026-03-07 04:02:21'),(30034,30005,26,'2026-03-07 04:05:42','2026-03-07 04:05:42'),(30035,30006,6,'2026-03-07 04:06:20','2026-03-07 04:06:20'),(30036,30007,8,'2026-03-07 04:06:41','2026-03-07 04:06:41'),(30037,30008,9,'2026-03-07 04:06:56','2026-03-07 04:06:56');
/*!40000 ALTER TABLE `allied_course_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discipline`
--

DROP TABLE IF EXISTS `discipline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discipline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discipline` varchar(150) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `discipline` (`discipline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30003;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discipline`
--

LOCK TABLES `discipline` WRITE;
/*!40000 ALTER TABLE `discipline` DISABLE KEYS */;
INSERT INTO `discipline` VALUES (1,'Engineering & Technology'),(2,'Management');
/*!40000 ALTER TABLE `discipline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institute_program_details`
--

DROP TABLE IF EXISTS `institute_program_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institute_program_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tier` varchar(50) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `institute_name` varchar(255) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `year_of_establishment` year(4) DEFAULT NULL,
  `institute_location` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `institute_address` text COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pin_code` varchar(10) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `institute_email` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `institute_phone` varchar(20) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `institute_type` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ownership_status` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_name` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_designation` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `appointment_status` varchar(100) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_mobile` varchar(20) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_email` varchar(150) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_telephone` varchar(20) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `university_name` varchar(255) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `university_city` varchar(100) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `university_state` varchar(100) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `university_pin_code` varchar(10) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institute_program_details`
--

LOCK TABLES `institute_program_details` WRITE;
/*!40000 ALTER TABLE `institute_program_details` DISABLE KEYS */;
INSERT INTO `institute_program_details` VALUES (1,'1','BANNARI AMMAN INSTITUTE OF TECHNOLOGY',1996,'SATHYAMANGALAM','SATHY -BHAVANI ROAD [ STATE HIGHWAY] ALATHUKOMBAI -POST SATHYAMANGALAM  [TALUK]','ERODE ','Tamil Nadu','638401 ','WWW.BITSATHY.AC.IN','BITSATHY@BANNARI.COM','04295-226000','Self-Supported Institute','Self financing','Dr C PALANISAMY ','PRINCIPAL','REGULAR','9842217170 ','PRINCIPAL@BITSATHY.AC.IN','04295-226000',' ANNA UNIVERSITY OF TECHNOLOGY COIMBATORE ','Chennai','Tamil Nadu ','600025','2026-03-03 09:41:14','2026-03-05 06:44:11');
/*!40000 ALTER TABLE `institute_program_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_level`
--

DROP TABLE IF EXISTS `program_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` varchar(100) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30006;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_level`
--

LOCK TABLES `program_level` WRITE;
/*!40000 ALTER TABLE `program_level` DISABLE KEYS */;
INSERT INTO `program_level` VALUES (1,'Undergraduate'),(2,'Postgraduate'),(4,'Doctor of Philosophy');
/*!40000 ALTER TABLE `program_level` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_name`
--

DROP TABLE IF EXISTS `program_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_name` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coursename` varchar(255) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30061;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_name`
--

LOCK TABLES `program_name` WRITE;
/*!40000 ALTER TABLE `program_name` DISABLE KEYS */;
INSERT INTO `program_name` VALUES (29,'Aeronautical Engineering'),(30,'Agricultural Engineering'),(31,'Artificial Intelligence and Data Science'),(32,'Artificial Intelligence and Machine Learning'),(33,'Automobile Engineering'),(34,'Biomedical Engineering'),(35,'Biotechnology(PG)'),(36,'Biotechnology'),(37,'Civil Engineering'),(38,'Communication Systems(PG)'),(39,'Computer Science and Business System'),(40,'Computer Science and Design'),(41,'Computer Science and  Engineering(PG)'),(42,'Computer Science and Engineering'),(43,'Computer Technology'),(44,'Electrical and Electronics  Engineering'),(45,'Electronics & Communication  Engineering'),(46,'Electronics & Instrumentation  Engineering'),(47,'Embedded Systems(PG)'),(48,'Fashion Technology'),(49,'Food Technology'),(50,'Industrial Automation & Robotics(PG)'),(51,'Industrial Safety Engineering(PG)'),(52,'Information Science &  Engineering'),(53,'Information Technology'),(54,'Mechanical Engineering'),(55,'Mechatronics Engineering'),(56,'Power Electronics & Drives(PG)'),(57,'Software Engineering(PG)'),(58,'Structural Engineering(PG)'),(59,'Textile Technology'),(60,'Master of Business Administration');
/*!40000 ALTER TABLE `program_name` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programname_level_discipline`
--

DROP TABLE IF EXISTS `programname_level_discipline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programname_level_discipline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` int NOT NULL,
  `level` int NOT NULL,
  `discipline` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `name` (`name`),
  KEY `level` (`level`),
  KEY `discipline` (`discipline`),
  CONSTRAINT `programname_level_discipline_ibfk_1` FOREIGN KEY (`name`) REFERENCES `program_name` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `programname_level_discipline_ibfk_2` FOREIGN KEY (`level`) REFERENCES `program_level` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `programname_level_discipline_ibfk_3` FOREIGN KEY (`discipline`) REFERENCES `discipline` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30033;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programname_level_discipline`
--

LOCK TABLES `programname_level_discipline` WRITE;
/*!40000 ALTER TABLE `programname_level_discipline` DISABLE KEYS */;
INSERT INTO `programname_level_discipline` VALUES (1,30,1,1),(2,29,1,1),(3,31,1,1),(4,32,1,1),(5,33,1,1),(6,34,1,1),(7,35,2,1),(8,36,1,1),(9,37,1,1),(10,38,2,1),(11,39,1,1),(12,40,1,1),(13,41,2,1),(14,42,1,1),(15,43,1,1),(16,44,1,1),(17,45,1,1),(18,46,1,1),(19,47,2,1),(20,48,1,1),(21,49,1,1),(22,50,2,1),(23,51,2,1),(24,52,1,1),(25,53,1,1),(26,54,1,1),(27,55,1,1),(28,56,2,1),(29,57,2,1),(30,58,2,1),(31,59,1,1),(32,60,2,2);
/*!40000 ALTER TABLE `programname_level_discipline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=30003;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'user'),(2,'admin');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`) /*T![clustered_index] CLUSTERED */,
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (1,1),(2,2),(3,2);
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=60003;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'arunprasathp.cs24@bitsathy.ac.in',NULL,1,'2026-03-02 14:54:18','2026-03-02 14:54:18'),(2,'kanikaab.cs24@bitsathy.ac.in',NULL,1,'2026-03-03 10:03:30','2026-03-03 10:03:30'),(3,'sanjeevirajanramajayam.cs24@bitsathy.ac.in',NULL,1,'2026-03-07 03:47:24','2026-03-07 03:49:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-07  9:37:25
