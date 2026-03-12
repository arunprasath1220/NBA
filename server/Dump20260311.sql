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
INSERT INTO `all_program` VALUES (1,1,1,29,'Aeronautical Engineering',2008,2022,'2026-03-05 05:54:43','2026-03-05 06:11:17'),(2,1,1,30,'Agricultural Engineering',2015,NULL,'2026-03-05 06:01:50','2026-03-05 06:01:50'),(3,1,1,31,'Artificial Intelligence and Data Science',2020,NULL,'2026-03-05 06:04:09','2026-03-05 06:04:09'),(4,1,1,32,'Artificial Intelligence and Machine Learning',2021,NULL,'2026-03-05 06:04:48','2026-03-05 06:04:48'),(5,1,1,33,'Automobile Engineering',2014,2022,'2026-03-05 06:05:21','2026-03-05 06:11:31'),(6,1,1,34,'Biomedical Engineering',2019,2024,'2026-03-05 06:05:47','2026-03-05 06:11:41'),(7,1,2,35,'Biotechnology',2008,2024,'2026-03-05 06:07:07','2026-03-05 06:11:47'),(8,1,1,36,'Biotechnology',2003,NULL,'2026-03-05 06:07:48','2026-03-05 06:07:48'),(9,1,1,37,'Civil Engineering',2001,2024,'2026-03-05 06:08:26','2026-03-05 06:12:07'),(10,1,2,38,'Communication Systems(PG)',2005,2024,'2026-03-05 06:08:52','2026-03-05 06:12:20'),(11,1,1,39,'Computer Science and Business System',2019,2022,'2026-03-05 06:10:26','2026-03-06 09:46:51'),(12,1,1,40,'Computer Science and Design',2022,2024,'2026-03-05 06:13:49','2026-03-05 06:14:14'),(13,1,2,41,'Computer Science and  Engineering(PG)',2005,NULL,'2026-03-05 06:20:00','2026-03-05 06:20:00'),(14,1,1,42,'Computer Science and Engineering',1996,NULL,'2026-03-05 06:20:42','2026-03-05 06:20:42'),(15,1,1,43,'Computer Technology',2019,2024,'2026-03-05 06:21:05','2026-03-05 06:28:14'),(16,1,1,44,'Electrical and Electronics Engineering',1996,NULL,'2026-03-05 06:21:33','2026-03-09 08:57:30'),(17,1,1,45,'Electronics & Communication  Engineering',1998,NULL,'2026-03-05 06:21:51','2026-03-05 06:21:51'),(18,1,1,46,'Electronics & Instrumentation  Engineering',2007,NULL,'2026-03-05 06:22:10','2026-03-05 06:22:10'),(19,1,2,47,'Embedded Systems(PG)',2010,2022,'2026-03-05 06:22:39','2026-03-05 06:28:27'),(20,1,1,48,'Fashion Technology',2004,2024,'2026-03-05 06:23:07','2026-03-05 06:28:43'),(21,1,1,49,'Food Technology',2016,2024,'2026-03-05 06:23:32','2026-03-05 06:28:49'),(22,1,2,50,'Industrial Automation & Robotics(PG)',2015,2022,'2026-03-05 06:23:58','2026-03-05 06:28:55'),(23,1,2,51,'Industrial Safety Engineering(PG)',2014,NULL,'2026-03-05 06:24:27','2026-03-05 06:24:27'),(24,1,1,52,'Information Science &  Engineering',2019,2024,'2026-03-05 06:24:54','2026-03-05 06:29:10'),(25,1,1,53,'Information Technology',1999,NULL,'2026-03-05 06:25:08','2026-03-05 06:25:08'),(26,1,1,54,'Mechanical Engineering',1996,NULL,'2026-03-05 06:25:25','2026-03-05 06:25:25'),(27,1,1,55,'Mechatronics Engineering',2012,NULL,'2026-03-05 06:25:39','2026-03-05 06:25:39'),(28,1,2,56,'Power Electronics & Drives(PG)',2003,2022,'2026-03-05 06:25:58','2026-03-05 06:29:27'),(29,1,2,57,'Software Engineering(PG)',2006,2022,'2026-03-05 06:26:26','2026-03-05 06:29:33'),(30,1,2,58,'Structural Engineering(PG)',2007,2024,'2026-03-05 06:27:07','2026-03-05 06:29:47'),(31,1,1,59,'Textile Technology',1996,2023,'2026-03-05 06:27:38','2026-03-05 06:29:54'),(32,2,2,60,'Master of Business Administration',2008,NULL,'2026-03-05 06:27:56','2026-03-05 06:27:56');
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
  `academic_year` varchar(9) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_allied_course_group_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=90004;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allied_course_group`
--

LOCK TABLES `allied_course_group` WRITE;
/*!40000 ALTER TABLE `allied_course_group` DISABLE KEYS */;
INSERT INTO `allied_course_group` VALUES (30037,'2025-26','2026-03-07 06:47:17','2026-03-07 06:47:17'),(30038,'2025-26','2026-03-07 06:47:44','2026-03-07 06:47:44'),(30039,'2025-26','2026-03-07 06:48:08','2026-03-07 06:48:08'),(30040,'2025-26','2026-03-07 06:48:40','2026-03-07 06:48:40'),(30041,'2025-26','2026-03-07 06:48:50','2026-03-07 06:48:50'),(30042,'2025-26','2026-03-07 06:49:00','2026-03-07 06:49:00'),(60004,'2026-27','2026-03-10 03:48:59','2026-03-10 03:48:59'),(60005,'2026-27','2026-03-10 03:49:06','2026-03-10 03:49:06'),(60006,'2026-27','2026-03-10 03:49:08','2026-03-10 03:49:08'),(60007,'2026-27','2026-03-10 03:49:10','2026-03-10 03:49:10'),(60008,'2026-27','2026-03-10 03:49:11','2026-03-10 03:49:11'),(60009,'2026-27','2026-03-10 03:49:12','2026-03-10 03:49:12');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=90033;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allied_course_mapping`
--

LOCK TABLES `allied_course_mapping` WRITE;
/*!40000 ALTER TABLE `allied_course_mapping` DISABLE KEYS */;
INSERT INTO `allied_course_mapping` VALUES (30082,30037,14,'2026-03-07 06:47:18','2026-03-07 06:47:18'),(30083,30037,25,'2026-03-07 06:47:18','2026-03-07 06:47:18'),(30084,30037,3,'2026-03-07 06:47:18','2026-03-07 06:47:18'),(30085,30037,4,'2026-03-07 06:47:18','2026-03-07 06:47:18'),(30086,30038,17,'2026-03-07 06:47:44','2026-03-07 06:47:44'),(30087,30038,27,'2026-03-07 06:47:44','2026-03-07 06:47:44'),(30088,30038,18,'2026-03-07 06:47:44','2026-03-07 06:47:44'),(30089,30039,2,'2026-03-07 06:48:08','2026-03-07 06:48:08'),(30090,30040,16,'2026-03-07 06:48:40','2026-03-07 06:48:40'),(30091,30041,26,'2026-03-07 06:48:50','2026-03-07 06:48:50'),(30092,30042,8,'2026-03-07 06:49:00','2026-03-07 06:49:00'),(60033,60004,14,'2026-03-10 03:49:00','2026-03-10 03:49:00'),(60034,60004,25,'2026-03-10 03:49:01','2026-03-10 03:49:01'),(60035,60004,3,'2026-03-10 03:49:01','2026-03-10 03:49:01'),(60036,60004,4,'2026-03-10 03:49:01','2026-03-10 03:49:01'),(60040,60006,2,'2026-03-10 03:49:09','2026-03-10 03:49:09'),(60041,60007,16,'2026-03-10 03:49:10','2026-03-10 03:49:10'),(60042,60008,26,'2026-03-10 03:49:11','2026-03-10 03:49:11'),(60043,60009,8,'2026-03-10 03:49:13','2026-03-10 03:49:13'),(60044,60005,17,'2026-03-10 03:50:57','2026-03-10 03:50:57'),(60045,60005,18,'2026-03-10 03:50:58','2026-03-10 03:50:58');
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
-- Table structure for table `faculty_details`
--

DROP TABLE IF EXISTS `faculty_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `program_id` int NOT NULL,
  `faculty_name` varchar(150) NOT NULL,
  `pan_no` varchar(20) DEFAULT NULL,
  `apaar_faculty_id` varchar(50) DEFAULT NULL,
  `highest_degree` varchar(100) DEFAULT NULL,
  `university_name` varchar(200) DEFAULT NULL,
  `area_of_specialization` varchar(200) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `designation_at_joining` varchar(100) DEFAULT NULL,
  `present_designation` varchar(100) DEFAULT NULL,
  `date_designated_as_prof` date DEFAULT NULL,
  `date_of_receiving_highest_degree` date DEFAULT NULL,
  `nature_of_association` varchar(20) DEFAULT 'Regular',
  `working_presently` varchar(10) DEFAULT NULL,
  `date_of_leaving` date DEFAULT NULL,
  `experience_years` decimal(5,2) DEFAULT NULL,
  `is_hod_principal` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_faculty_program` (`program_id`),
  CONSTRAINT `fk_faculty_program` FOREIGN KEY (`program_id`) REFERENCES `programname_level_discipline` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_details`
--

LOCK TABLES `faculty_details` WRITE;
/*!40000 ALTER TABLE `faculty_details` DISABLE KEYS */;
INSERT INTO `faculty_details` VALUES (60001,16,'Dr.MAHESHWARI K T','BFDPM9572G','843939 857993','M.E. and Ph.D','Anna University','Power Electronics And Drives','2010-05-19','Assistant Professor','Associate Professor','2022-03-01',NULL,'Regular','Yes',NULL,14.93,'Yes','2026-03-09 08:58:41','2026-03-09 08:58:41'),(60002,16,'Dr.BHARANI KUMAR R','AHIPB8753C','725785 713636','M.E. and Ph.D','Anna University','Power Electronics And Drives','1999-05-03','Assistant Professor','Professor','2012-07-02',NULL,'Regular','Yes',NULL,25.98,'No','2026-03-09 08:58:41','2026-03-09 08:58:41'),(60003,16,'Dr.SIVARAMAN P','BSTPS3249D','418957 439100','M.Tech. and Ph.D','Anna University','High Voltage Engineering','2005-07-13','Assistant Professor','Professor','2020-05-14',NULL,'Regular','Yes',NULL,19.78,'No','2026-03-09 08:58:42','2026-03-09 08:58:42'),(60004,16,'Dr.SRINIVASAN M','ARCPM5538N','789242 215707','M.E. and Ph.D','Anna University','Power Electronics And Drives','2005-06-20','Assistant Professor','Associate Professor','2018-07-02',NULL,'Regular','Yes',NULL,19.85,'No','2026-03-09 08:58:42','2026-03-09 08:58:42'),(60005,16,'Dr.RAJALASHMI K','AJFPR5599H','642130 579443','M.E. and Ph.D','Anna University','Applied Electronics','2005-06-29','Assistant Professor','Associate Professor','2018-07-02',NULL,'Regular','Yes',NULL,19.82,'No','2026-03-09 08:58:43','2026-03-09 08:58:43'),(60006,16,'Dr.VEERAKUMAR S','AGQPV8371F','945761 142849','M.Tech. and Ph.D','Anna University','Power Electronics And Drives','2007-05-14','Assistant Professor','Associate Professor','2018-07-02',NULL,'Regular','Yes',NULL,17.95,'No','2026-03-09 08:58:43','2026-03-09 08:58:43'),(60007,16,'Dr.SHANKAR N','AGXPN5552F','933222 413906','M.E. and Ph.D','Anna University','Power Electronics And Drives','2008-06-23','Assistant Professor','Associate Professor','2022-03-01',NULL,'Regular','No','2025-05-01',16.87,'No','2026-03-09 08:58:44','2026-03-09 08:58:44'),(60008,16,'Dr.SENTHIL KUMAR J','JPMPS8699R','356251 418569','M.E. and Ph.D','Anna University','Power Systems Engineering','2018-12-27','Assistant Professor','Associate Professor','2020-12-07',NULL,'Regular','Yes',NULL,6.32,'No','2026-03-09 08:58:44','2026-03-09 08:58:44'),(60009,16,'Dr.DHEEPANCHAKKARAVARTHY A','AZXPD3250F',NULL,'M.E. and Ph.D','National Institute Of Technology, Trichy','Power Electronics And Drives Engineering','2018-12-27','Assistant Professor','Associate Professor','2020-12-07',NULL,'Regular','No','2024-05-24',5.41,'No','2026-03-09 08:58:45','2026-03-09 08:58:45'),(60010,16,'Dr.MANOJKUMAR P','BNWPM1699D','184575 476575','M.Tech. and Ph.D','Anna University','Embedded Systems','2020-06-10','Assistant Professor','Associate Professor','2020-12-07',NULL,'Regular','Yes',NULL,4.86,'No','2026-03-09 08:58:45','2026-03-09 08:58:45'),(60011,16,'Dr.NANDHAKUMARA A','ALNPN5907H','695996 854754','M.E. and Ph.D','Anna University','Power Electronics And Drives','2010-06-04','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,14.89,'No','2026-03-09 08:58:46','2026-03-09 08:58:46'),(60012,16,'Mr.MANIVANNAN S','BFPPM0683A',NULL,'M.E.','Anna University','Pwm Control Techniques','2010-06-16','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2023-08-31',13.22,'No','2026-03-09 08:58:46','2026-03-09 08:58:46'),(60013,16,'Ms.SRITHA P','BZCPS3096N','233594 666026','M.E.','Anna University','Vlsi Design','2011-05-13','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,13.95,'No','2026-03-09 08:58:46','2026-03-09 08:58:46'),(60014,16,'Mr.ASHOKKUMAR R','ANBPA8520B',NULL,'M.E.','Anna University','Power Electronics And Drives','2011-05-16','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2024-05-25',13.04,'No','2026-03-09 08:58:47','2026-03-09 08:58:47'),(60015,16,'Ms.MOHANAPRIYA V','BEVPM4110H','211936 939275','M.E.','Anna University','Power Electronics','2011-05-27','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,13.91,'No','2026-03-09 08:58:47','2026-03-09 08:58:47'),(60016,16,'Mr.SUNDAR S','EYCPS0201R','940804 763042','M.E.','Anna University','Power Electronics And Drives','2013-05-15','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,11.94,'No','2026-03-09 08:58:48','2026-03-09 08:58:48'),(60017,16,'Dr.ALEX STANLEY RAJA T','ANPPA4722R','183659 622926','M.E. and Ph.D','Anna University','Power Electronics And Drives','2015-06-01','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,9.89,'No','2026-03-09 08:58:48','2026-03-09 08:58:48'),(60018,16,'Mr.ARUN CHENDHURAN R','AJRPA8453B','426959 506665','M.E.','Anna University','Power Electronics And Drives','2016-07-04','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,8.80,'No','2026-03-09 08:58:49','2026-03-09 08:58:49'),(60019,16,'Dr.SATHISHKUMAR S','BEIPS4249Q','140568 520317','M.E. and Ph.D','Anna University','Applied Electronics','2017-02-22','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,8.16,'No','2026-03-09 08:58:49','2026-03-09 08:58:49'),(60020,16,'Mr.KALIMUTHU M','DLBPK0258K',NULL,'M.Tech.','Vit University','Embedded Systems','2017-07-27','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2023-08-31',6.10,'No','2026-03-09 08:58:49','2026-03-09 08:58:49'),(60021,16,'Mr.VAIDEESWARAN V','BAUPV8744F',NULL,'M.E.','Anna University','Power Electronics And Drives','2018-05-24','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2023-05-02',4.94,'No','2026-03-09 08:58:50','2026-03-09 08:58:50'),(60022,16,'Mr.BALAVIGNESH S','CNZPS1217F',NULL,'M.E.','Anna University','Power Systems Engineering','2018-06-18','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2024-01-06',5.56,'No','2026-03-09 08:58:50','2026-03-09 08:58:50'),(60023,16,'Ms.NITHYA G','AZXPN8294K','492627 411742','M.E.','Anna University','Power Electronics And Drives','2018-09-05','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,6.63,'No','2026-03-09 08:58:51','2026-03-09 08:58:51'),(60024,16,'Ms.MADHUMITHA J','DFGPM6430E','299189 647859','M.E.','Anna University','Embedded Systems','2023-03-01','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,2.14,'No','2026-03-09 08:58:51','2026-03-09 08:58:51'),(60025,16,'Mr.RISHIKESH N','AWXPR7744P','743219 052411','MS','University Of Northumbria','Electrical Power Engineering With Advanced Practice','2019-01-03','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,6.30,'No','2026-03-09 08:58:52','2026-03-09 08:58:52'),(60026,16,'Ms.ANDRIL ALAGUSABAI','BRDPA2090K','320236 931102','M.E.','Anna University','Embedded System Technologies','2019-05-15','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2025-05-01',5.97,'No','2026-03-09 08:58:52','2026-03-09 08:58:52'),(60027,16,'Ms.GOPIKA N P','BYOPN5419H','332160 182924','M.Tech.','Amrita Vishwa Vidyapeetham','Power And Energy Engineering','2019-06-17','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,5.85,'No','2026-03-09 08:58:52','2026-03-09 08:58:52'),(60028,16,'Dr.CHINNADURRAI CL','AZBPC2370B','366149 543009','M.E. and Ph.D','Anna University','Power Systems Engineering','2021-03-18','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,4.09,'No','2026-03-09 08:58:53','2026-03-09 08:58:53'),(60029,16,'Dr.GOLDVIN SUGIRTHA DHAS B','BVRPG0543D','266346 804715','M.E. and Ph.D','Anna University','Power Electronics And Drives','2021-04-15','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','Yes',NULL,4.02,'No','2026-03-09 08:58:53','2026-03-09 08:58:53'),(60030,16,'Ms.MERCY P','AOYPM8022Q','704934 346234','M.Tech.','Anna University','Energy Conservation And Management','2021-06-07','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2024-11-30',3.48,'No','2026-03-09 08:58:54','2026-03-09 08:58:54'),(60031,16,'Dr.GOWRI SHANKAR M','BETPG0429P',NULL,'M.E. and Ph.D','Anna University','Vlsi Design','2023-07-13','Assistant Professor','Assistant Professor',NULL,NULL,'Regular','No','2024-05-22',0.86,'No','2026-03-09 08:58:54','2026-03-09 08:58:54'),(90001,14,'Dr.SASIKALA D','AQXPS9914J','322855417994','M.E. and Ph.D','Anna University','Data Mining','2001-05-17','Assistant Professor','Professor','2017-11-30','2017-01-18','Regular','Yes',NULL,24.81,'Yes','2026-03-10 04:50:59','2026-03-10 05:18:37'),(90002,14,'Dr.SATHISHKUMAR P','CMAPS7728H','635269408451','M.E. and Ph.D','Anna University','Cloud Computing','2006-04-27','Assistant Professor','Professor','2024-04-01','2021-09-03','Regular','Yes',NULL,19.87,'No','2026-03-10 04:50:59','2026-03-10 04:50:59'),(90003,14,'Dr.PREMALATHA K','AIEPP3582A','936044241254','M.E. and Ph.D','Anna University','Data Mining','2009-06-03','Associate Professor','Professor','2009-11-01','2009-10-05','Regular','Yes',NULL,16.77,'No','2026-03-10 04:51:00','2026-03-10 04:51:00'),(90004,14,'Dr.SANGEETHAA SN','EUWPS8385G','446458388292','M.E. and Ph.D','Anna University','Artificial Intelligence','2020-08-26','Assistant Professor','Professor','2024-04-01','2019-10-18','Regular','Yes',NULL,5.54,'No','2026-03-10 04:51:00','2026-03-10 04:51:00'),(90005,14,'Dr.RAJESHKUMAR G','AKQPR1224H','414058076795','M.E. and Ph.D','Anna University','Computer Networking','2022-06-23','Associate Professor','Professor','2023-03-01','2017-04-13','Regular','Yes',NULL,3.71,'No','2026-03-10 04:51:00','2026-03-10 04:51:00'),(90006,14,'Dr.RAMYA R','BPEPR8859G','726076093260','M.E. and Ph.D','Anna University','Data Mining','2013-05-15','Assistant Professor','Associate Professor','2023-08-09','2023-08-08','Regular','Yes',NULL,12.82,'No','2026-03-10 04:51:00','2026-03-10 04:51:00'),(90007,14,'Dr.KARTHIGA M','ENQPK4878H','669663306936','M.E. and Ph.D','Anna University','Data Science','2016-04-16','Assistant Professor','Associate Professor','2023-03-01','2023-03-02','Regular','Yes',NULL,9.90,'No','2026-03-10 04:51:01','2026-03-10 04:51:01'),(90008,14,'Dr.PRAVEEN V','CSVPP1446G','216465948369','M.E. and Ph.D','Anna University','Vehicular Networks','2018-06-04','Assistant Professor','Associate Professor','2025-08-12','2023-07-21','Regular','Yes',NULL,7.76,'No','2026-03-10 04:51:01','2026-03-10 04:51:01'),(90009,14,'Dr.PARTHASARATHI P','AUOPP7321B','159869953390','M.E. and Ph.D','Anna University','Network Security','2020-06-11','Assistant Professor','Associate Professor','2024-04-01','2023-08-08','Regular','Yes',NULL,5.74,'No','2026-03-10 04:51:01','2026-03-10 04:51:01'),(90010,14,'Dr.DHIVYA P','AWLPD5140P','898693119098','M.E. and Ph.D','Anna University','Data Science','2020-06-18','Assistant Professor','Associate Professor','2024-04-01','2022-07-22','Regular','Yes',NULL,5.72,'No','2026-03-10 04:51:01','2026-03-10 04:51:01'),(90011,14,'Dr.RAJESH KANNA P','BNYPR3210H','489635824028','M.E. and Ph.D','Anna University','Computer Networks','2020-09-07','Assistant Professor','Associate Professor','2024-06-01','2022-04-21','Regular','Yes',NULL,5.50,'No','2026-03-10 04:51:01','2026-03-10 04:51:01'),(90012,14,'Dr.SARANYA K','BQZPS9775C','353849321284','M.E. and Ph.D','Anna University','Data Science','2021-08-19','Assistant Professor','Associate Professor','2023-03-01','2021-09-01','Regular','Yes',NULL,4.56,'No','2026-03-10 04:51:02','2026-03-10 04:51:02'),(90013,14,'Dr.DEEPA PRIYA B S','APCPP2985G','950226777431','M.Tech. and Ph.D','Noorul Islam University','Computer Science and Engineering','2023-07-28','Associate Professor','Associate Professor','2023-07-28','2021-12-20','Regular','Yes',NULL,2.62,'No','2026-03-10 04:51:02','2026-03-10 04:51:02'),(90014,14,'Mr.DINESH P S','BZIPD9808D','352536602398','M.E.','Anna University','Networking','2014-05-12','Assistant Professor','Assistant Professor',NULL,'2014-05-10','Regular','Yes',NULL,11.83,'No','2026-03-10 04:51:02','2026-03-10 04:51:02'),(90015,14,'Ms.SUDHA R','EEOPS8433F','926702836849','M.E.','Anna University','Computer Science and Engineering','2023-03-01','Assistant Professor','Assistant Professor',NULL,'2016-05-20','Regular','Yes',NULL,3.03,'No','2026-03-10 04:51:02','2026-03-10 04:51:02'),(90016,14,'Ms.GANAGAVALLI K','BAIPG4402M','715585789645','M.E.','Anna University','Deep Learning','2016-06-01','Assistant Professor','Assistant Professor',NULL,'2013-06-29','Regular','Yes',NULL,9.77,'No','2026-03-10 04:51:03','2026-03-10 04:51:03'),(90017,14,'Mr.MOHAN KUMAR V','BRZPM9299Q','113762496607','M.E.','Anna University','Software Engineering','2022-06-01','Assistant Professor','Assistant Professor',NULL,'2022-05-27','Regular','Yes',NULL,3.77,'No','2026-03-10 04:51:03','2026-03-10 04:51:03'),(90018,14,'Ms.PRABHA DEVI D','CZJPP6693Q','605145450501','M.E.','Anna University','Computer Science and Engineering','2017-05-29','Assistant Professor','Assistant Professor',NULL,'2015-06-21','Regular','Yes',NULL,8.78,'No','2026-03-10 04:51:03','2026-03-10 04:51:03'),(90019,14,'Ms.SOUNDARIYA R S','FNZPS4653E','533219175001','M.E.','Anna University','Computer Science and Engineering','2017-06-12','Assistant Professor','Assistant Professor',NULL,'2017-05-01','Regular','Yes',NULL,8.74,'No','2026-03-10 04:51:03','2026-03-10 04:51:03'),(90020,14,'Dr.SWATHYPRIYADHARSINI P','EWCPS2808J','121619677203','M.E. and Ph.D','Anna University','Data Mining','2018-07-02','Assistant Professor','Assistant Professor',NULL,'2020-08-24','Regular','Yes',NULL,7.69,'No','2026-03-10 04:51:04','2026-03-10 04:51:04'),(90021,14,'Mr.MAGESH KUMAR B','BMCPM3813J','295049026860','M.E.','Anna University','Data Science','2020-03-16','Assistant Professor','Assistant Professor',NULL,'2014-05-02','Regular','Yes',NULL,5.98,'No','2026-03-10 04:51:05','2026-03-10 04:51:05'),(90022,14,'Mr.SUSEENDRAN S','DKBPS5732M','992863532433','M.E.','Anna University','Data Science','2020-05-28','Assistant Professor','Assistant Professor',NULL,'2013-05-02','Regular','Yes',NULL,5.78,'No','2026-03-10 04:51:06','2026-03-10 04:51:06'),(90023,14,'Mr.CHANDRU K S','ALIPC4469J','285647694421','M.Tech.','Amrita University','Computational Engineering and Networking','2020-07-01','Assistant Professor','Assistant Professor',NULL,'2011-05-01','Regular','Yes',NULL,5.69,'No','2026-03-10 04:51:07','2026-03-10 04:51:07'),(90024,14,'Ms.KIRUTHIKA V R','ELWPK9291Q','279043150184','M.E.','Anna University','Machine Learning','2020-09-10','Assistant Professor','Assistant Professor',NULL,'2020-06-19','Regular','Yes',NULL,5.49,'No','2026-03-10 04:51:08','2026-03-10 04:51:08'),(90025,14,'Ms.NITHYA R','AMBPN9734D','349043023465','M.E.','Anna University','Deep Learning','2020-10-31','Assistant Professor','Assistant Professor',NULL,'2016-05-02','Regular','Yes',NULL,5.36,'No','2026-03-10 04:51:09','2026-03-10 04:51:09'),(90026,14,'Ms.SANGAVI N','HOAPS9628D','266828065901','M.E.','Anna University','Data Science','2020-12-17','Assistant Professor','Assistant Professor',NULL,'2020-05-02','Regular','Yes',NULL,5.23,'No','2026-03-10 04:51:11','2026-03-10 04:51:11'),(90027,14,'Mr.SATHISHKANNAN R','FAPPS4592K','285472980246','M.E.','Anna University','Ar/Vr','2021-03-22','Assistant Professor','Assistant Professor',NULL,'2015-05-15','Regular','Yes',NULL,4.97,'No','2026-03-10 04:51:11','2026-03-10 04:51:11'),(90028,14,'Ms.KALAIVANI E','COUPK9605R','729834879626','M.E.','Anna University','Deep Learning','2021-03-31','Assistant Professor','Assistant Professor',NULL,'2012-05-18','Regular','Yes',NULL,4.94,'No','2026-03-10 04:51:11','2026-03-10 04:51:11'),(90029,14,'Mr.RAMASAMI S','ATQPR2534P','184739329668','M.E.','Anna University','Network Security','2022-03-16','Assistant Professor','Assistant Professor',NULL,'2008-05-16','Regular','Yes',NULL,3.98,'No','2026-03-10 04:51:11','2026-03-10 04:51:11'),(90030,14,'Mr.STEEPHAN AMALRAJ J','FFYPS9391C','972015193094','M.E.','Anna University','Machine Learning','2022-07-18','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,3.64,'No','2026-03-10 04:51:12','2026-03-10 04:51:12'),(90031,14,'Ms.KAVITHA R','CAFPK1545R','740281781733','M.E.','Karpagam University','Machine Learning','2022-08-03','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,3.60,'No','2026-03-10 04:51:12','2026-03-10 04:51:12'),(90032,14,'Mr.SATHYAMOORTHY J','HHMPS1115Q','610932827087','M.E.','Anna University','Software Engineering','2023-02-01','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,3.10,'No','2026-03-10 04:51:13','2026-03-10 04:51:13'),(90033,14,'Ms.MOHANAPRIYA K','GEVPM0079G','799394291518','M.E.','Anna University','Computer Science and Engineering','2023-03-31','Assistant Professor','Assistant Professor',NULL,'2023-03-30','Regular','Yes',NULL,2.94,'No','2026-03-10 04:51:13','2026-03-10 04:51:13'),(90034,14,'Ms.MOHANAMBAL K','CRRPM5012N','305583424895','M.E.','Anna University','Computer Science and Engineering','2023-05-19','Assistant Professor','Assistant Professor',NULL,'2006-05-12','Regular','Yes',NULL,2.81,'No','2026-03-10 04:51:14','2026-03-10 04:51:14'),(90035,14,'Ms.CHITRADEVI T N','ATEPC6329H','183239288548','M.E.','Avinashilingam Deemed University','Computer Science and Engineering','2023-06-19','Assistant Professor','Assistant Professor',NULL,'2012-05-25','Regular','Yes',NULL,2.72,'No','2026-03-10 04:51:14','2026-03-10 04:51:14'),(90036,14,'Ms.AMMU V','AZPPA3340K','293226122074','M.Tech.','Anna University','Information Technology','2023-07-26','Assistant Professor','Assistant Professor',NULL,'2011-05-20','Regular','Yes',NULL,2.62,'No','2026-03-10 04:51:14','2026-03-10 04:51:14'),(90037,14,'Ms.GUNAVARDINI V','CLEPG2717H','596749601254','M.E.','Anna University','Computer Science and Engineering','2023-08-14','Assistant Professor','Assistant Professor',NULL,'2023-05-19','Regular','Yes',NULL,2.57,'No','2026-03-10 04:51:14','2026-03-10 04:51:14'),(90038,14,'Ms.GAYATHRI S','BRJPG7915D','151337755452','M.E.','Anna University','Computer Science and Engineering','2023-09-04','Assistant Professor','Assistant Professor',NULL,'2018-05-18','Regular','Yes',NULL,2.51,'No','2026-03-10 04:51:15','2026-03-10 04:51:15'),(90039,14,'Ms.PRIYANGA M A','BTZPP0303C','906033902133','M.E.','Anna University','Computer Science and Engineering','2023-08-28','Assistant Professor','Assistant Professor',NULL,'2015-05-22','Regular','Yes',NULL,2.53,'No','2026-03-10 04:51:15','2026-03-10 04:51:15'),(90040,14,'Ms.SATHIYA B','GZCPS5176L','493626943635','M.E.','Anna University','Computer Science and Engineering','2023-10-18','Assistant Professor','Assistant Professor',NULL,'2023-05-19','Regular','Yes',NULL,2.39,'No','2026-03-10 04:51:15','2026-03-10 04:51:15'),(90041,14,'Ms.RATHNA S','LBXPS6947K','854170714808','M.E.','Anna University','Computer Science and Engineering','2023-12-21','Assistant Professor','Assistant Professor',NULL,'2021-05-07','Regular','Yes',NULL,2.22,'No','2026-03-10 04:51:15','2026-03-10 04:51:15'),(90042,14,'Ms.ALAMELU M','AGPPA6283Q','382579507241','M.E','Anna University','Computer Science and Engineering','2024-03-07','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,2.01,'No','2026-03-10 04:51:16','2026-03-10 04:51:16'),(90043,14,'Ms.PARKAVI S','PXQPS4542P','387699198305','M.E.','Anna University','Computer Science and Engineering','2024-05-13','Assistant Professor','Assistant Professor',NULL,'2024-05-06','Regular','Yes',NULL,1.82,'No','2026-03-10 04:51:16','2026-03-10 04:51:16'),(90044,14,'Ms.MYTHILI G M','AOZPM9100N','136533572888','M.E.','Anna University','Computer Science and Engineering','2025-01-03','Assistant Professor','Assistant Professor',NULL,'2014-05-23','Regular','Yes',NULL,1.18,'No','2026-03-10 04:51:16','2026-03-10 04:51:16'),(90045,14,'Ms.GAYATHIRI DEVI S','SVDPS5443B','386432244363','M.E.','Anna University','Computer Science and Engineering','2025-04-16','Assistant Professor','Assistant Professor',NULL,'2025-04-11','Regular','Yes',NULL,0.90,'No','2026-03-10 04:51:17','2026-03-10 04:51:17'),(90046,14,'Ms.KAYALVIZHI B','CPEPK4378C','275984774692','M.E.','Anna University','Software Engineering','2024-08-28','Assistant Professor','Assistant Professor',NULL,'2015-04-17','Regular','Yes',NULL,1.53,'No','2026-03-10 04:51:17','2026-03-10 04:51:17'),(90047,14,'Ms.THANGATAMILSELVI S','SVQPS2999K','829209094660','M.E.','Anna University','Computer Science and Engineering','2025-06-02','Assistant Professor','Assistant Professor',NULL,'2025-05-23','Regular','Yes',NULL,0.77,'No','2026-03-10 04:51:17','2026-03-10 04:51:17'),(90048,14,'Ms.MAHESH S','FSEPM6260D','656869220544','M.E.','Anna University','Computer Science and Engineering','2025-06-02','Assistant Professor','Assistant Professor',NULL,'2025-05-23','Regular','Yes',NULL,0.77,'No','2026-03-10 04:51:17','2026-03-10 04:51:17'),(90049,14,'Mr.JACKSON J','BBUPJ1572Q','872377942818','M.E.','Anna University','Computer Science and Engineering','2025-06-05','Assistant Professor','Assistant Professor',NULL,'2025-05-23','Regular','Yes',NULL,0.76,'No','2026-03-10 04:51:18','2026-03-10 04:51:18'),(90050,14,'Mr.RANGARAJ K','BLVPR1620Q','511327235560','M.E.','Anna University','Software Engineering','2025-06-05','Assistant Professor','Assistant Professor',NULL,'2020-05-22','Regular','Yes',NULL,0.76,'No','2026-03-10 04:51:18','2026-03-10 04:51:18'),(90051,14,'Mr.ASWIN JAYA SURYA M J','EEUPA4588B','445290488457','M.E.','Anna University','Computer Science and Engineering','2025-08-28','Assistant Professor','Assistant Professor',NULL,'2024-05-25','Regular','Yes',NULL,0.53,'No','2026-03-10 04:51:18','2026-03-10 04:51:18'),(90052,14,'Mr.GOKUL M S','DFJPG8862P',NULL,'M.E.','Anna University','Computer Science and Engineering','2025-08-28','Assistant Professor','Assistant Professor',NULL,'2025-05-17','Regular','Yes',NULL,0.53,'No','2026-03-10 04:51:18','2026-03-10 04:51:18'),(120001,25,'Dr.BHARATHI A','AGHPB8381Q','160573102165','M.E. and Ph.D','Anna University','Data Mining and Soft Computing','1998-08-04','Assistant Professor','Professor','2013-04-30','2012-07-26','Regular','Yes',NULL,27.59,'Yes','2026-03-10 05:19:08','2026-03-10 05:21:02'),(120002,25,'Dr.NAVEENA S','AQSPN2197B','830057824163','M.Tech. and Ph.D','Anna University','Information Technology','2012-05-16','Assistant Professor','Associate Professor','2024-04-01','2024-01-05','Regular','Yes',NULL,13.82,'No','2026-03-10 05:19:09','2026-03-10 05:19:09'),(120003,25,'Dr.PALANISAMY C','AIRPP1020E','578335832449','M.E. and Ph.D','Anna University','Data Mining','2007-05-19','Assistant Professor','Professor','2010-04-01','2009-11-12','Regular','Yes',NULL,18.81,'No','2026-03-10 05:19:09','2026-03-10 05:19:09'),(120004,25,'Dr.SADHASIVAM N','CMIPS9730B','785292401719','M.E. and Ph.D','Anna University','Information and Communication Engineering','2023-04-10','Associate Professor','Professor','2024-04-01','2017-08-11','Regular','Yes',NULL,2.92,'No','2026-03-10 05:19:09','2026-03-10 05:19:09'),(120005,25,'Dr.PAARIVALLAL RA','ASZPP1808Q','760635752578','MCA and Ph.D','Anna University','Object Locality Detection','2007-05-16','Assistant Professor','Associate Professor','2022-11-01','2015-08-31','Regular','Yes',NULL,18.82,'No','2026-03-10 05:19:09','2026-03-10 05:19:09'),(120006,25,'Dr.SATHIS KUMAR K','BUEPS1808P','681718071817','M.E. and Ph.D','Anna University','Network Security','2011-05-16','Assistant Professor','Associate Professor','2023-03-01','2023-02-24','Regular','Yes',NULL,14.82,'No','2026-03-10 05:19:09','2026-03-10 05:19:09'),(120007,25,'Dr.NATARAJ N','AQAPN1408K','100781002503','M.E. and Ph.D','Anna University','Software Engineering','2015-05-29','Assistant Professor','Associate Professor','2025-08-12','2025-06-27','Regular','Yes',NULL,10.78,'No','2026-03-10 05:19:10','2026-03-10 05:19:10'),(120008,25,'Dr.SRI VINITHA V','FPXPS6090R','609643585582','M.Tech. and Ph.D','Anna University','Information Technology','2017-02-22','Assistant Professor','Associate Professor','2025-08-12','2024-10-15','Regular','Yes',NULL,9.04,'No','2026-03-10 05:19:10','2026-03-10 05:19:10'),(120009,25,'Dr.CHANDRAPRABHA K','APQPC3590N','421966411823','M.E. and Ph.D','Anna University','Information and Communication Engineering','2020-09-10','Assistant Professor','Associate Professor','2020-12-07','2020-05-20','Regular','Yes',NULL,5.49,'No','2026-03-10 05:19:10','2026-03-10 05:19:10'),(120010,25,'Dr.VENKATESAN R','BCFPV1664K','960438157320','M.E. and Ph.D',NULL,'Software Engineering','2020-11-03','Assistant Professor','Associate Professor','2024-06-01','2024-05-07','Regular','Yes',NULL,5.35,'No','2026-03-10 05:19:10','2026-03-10 05:19:10'),(120011,25,'Dr.PRIYA J','CIUPP6995H','851883463360','M.E. and Ph.D','Anna University','Information Technology','2023-02-17','Assistant Professor','Associate Professor','2024-04-01','2023-03-10','Regular','Yes',NULL,3.06,'No','2026-03-10 05:19:10','2026-03-10 05:19:10'),(120012,25,'Mr.PRABHU P S','ASNPP0054G','385087527983','M.E.','Anna University','Computer Science and Engineering','2019-11-01','Assistant Professor','Assistant Professor',NULL,'2012-05-04','Regular','Yes',NULL,6.35,'No','2026-03-10 05:19:11','2026-03-10 05:19:11'),(120013,25,'Ms.SABARMATHI K R','EPDPS8898G','874543555838','M.E.','Anna University','Software Engineering','2016-05-25','Assistant Professor','Assistant Professor',NULL,'2016-05-20','Regular','Yes',NULL,9.79,'No','2026-03-10 05:19:11','2026-03-10 05:19:11'),(120014,25,'Mr.VINOTH M','ANYPV1694E','149249414895','M.Tech.','Prist University','Computer Science and Engineering','2018-06-08','Assistant Professor','Assistant Professor',NULL,'2014-05-23','Regular','Yes',NULL,7.75,'No','2026-03-10 05:19:11','2026-03-10 05:19:11'),(120015,25,'Ms.SOBIYAA P','ENLPS3149N','699750847053','M.E.','Anna University','Computer Science and Engineering','2018-07-05','Assistant Professor','Assistant Professor',NULL,'2015-05-22','Regular','Yes',NULL,7.68,'No','2026-03-10 05:19:11','2026-03-10 05:19:11'),(120016,25,'Ms.JANANI T','BJLPJ1815R','825941509148','M.E.','Anna University','Computer Science and Engineering','2019-07-29','Assistant Professor','Assistant Professor',NULL,'2012-05-04','Regular','Yes',NULL,6.61,'No','2026-03-10 05:19:11','2026-03-10 05:19:11'),(120017,25,'Ms.PRIYA L','BGUPP5622E','415880979949','M.E.','Anna University','Computer Science and Engineering','2020-08-26','Assistant Professor','Assistant Professor',NULL,'2012-05-11','Regular','Yes',NULL,5.54,'No','2026-03-10 05:19:12','2026-03-10 05:19:12'),(120018,25,'Mr.SELVAKUMAR M','DJMPS1419F','674629189690','M.E.','Anna University','Computer Science and Engineering','2020-11-03','Assistant Professor','Assistant Professor',NULL,'2011-05-06','Regular','Yes',NULL,5.35,'No','2026-03-10 05:19:12','2026-03-10 05:19:12'),(120019,25,'Ms.NIKITHA M','AWJPN5861H','405210607469','M.E.','Anna University','Software Engineering','2022-02-16','Assistant Professor','Assistant Professor',NULL,'2019-04-01','Regular','Yes',NULL,4.06,'No','2026-03-10 05:19:12','2026-03-10 05:19:12'),(120020,25,'Ms.SANTHIYA B','OCUPS1481M','618728404033','M.E.','Anna University','Computer Science and Engineering','2024-04-01','Assistant Professor','Assistant Professor',NULL,'2017-05-12','Regular','Yes',NULL,1.94,'No','2026-03-10 05:19:12','2026-03-10 05:19:12'),(120021,25,'Dr.JOTHIMANI S','AXMPJ4442L','395030756542','M.Tech. and Ph.D','Anna University','Mainframe','2024-06-03','Assistant Professor','Assistant Professor',NULL,'2025-04-30','Regular','Yes',NULL,1.77,'No','2026-03-10 05:19:12','2026-03-10 05:19:12'),(120022,25,'Ms.MUTHUMEENA S','SQJPS1343R','418850992516','M.E.','Anna University','Computer Science and Engineering','2024-06-10','Assistant Professor','Assistant Professor',NULL,'2024-05-24','Regular','Yes',NULL,1.75,'No','2026-03-10 05:19:13','2026-03-10 05:19:13'),(120023,25,'Dr.TAMILTHENDRAL M','AKIPT4842P','951882674633','M.E. and Ph.D','Anna University, Chennai','Image Processing','2024-07-01','Assistant Professor','Assistant Professor',NULL,'2022-02-25','Regular','Yes',NULL,1.69,'No','2026-03-10 05:19:13','2026-03-10 05:19:13'),(120024,25,'Dr.NIVEDHA S','ASCPN2256M','530613470114','M.E. and Ph.D','Anna University, Chennai','Computer Science and Engineering','2024-07-01','Assistant Professor','Assistant Professor',NULL,'2025-06-30','Regular','Yes',NULL,1.69,'No','2026-03-10 05:19:13','2026-03-10 05:19:13'),(120025,25,'Ms.KAVITHA V','CEGPK3808A','696146256950','M.E','Anna University, Chennai','Computer Science','2024-07-03','Assistant Professor','Assistant Professor',NULL,'2017-06-13','Regular','Yes',NULL,1.68,'No','2026-03-10 05:19:13','2026-03-10 05:19:13'),(120026,25,'Ms.PRIYA A','CAJPP9439F','994932347666','M.E.','Anna University','Computer Science and Information Security','2024-07-19','Assistant Professor','Assistant Professor',NULL,'2017-05-12','Regular','Yes',NULL,1.64,'No','2026-03-10 05:19:13','2026-03-10 05:19:13'),(120027,25,'Ms.KEERTHANA K','CODPK0531D','532842729590','M.E.','Anna University','Computer Science and Engineering','2024-07-26','Assistant Professor','Assistant Professor',NULL,'2020-05-22','Regular','Yes',NULL,1.62,'No','2026-03-10 05:19:14','2026-03-10 05:19:14'),(120028,25,'Ms.SHANGARA NARAYANEE N','IESPS8647H','409409067994','M.E.','Anna University','Computer Science and Engineering','2024-08-19','Assistant Professor','Assistant Professor',NULL,'2013-06-14','Regular','Yes',NULL,1.56,'No','2026-03-10 05:19:14','2026-03-10 05:19:14'),(120029,25,'Ms.INDHU BHASHINI V','AKDPI3033N','275568168993','M.Tech.','Anna University','Computer Science and Engineering','2024-08-12','Assistant Professor','Assistant Professor',NULL,'2024-04-26','Regular','Yes',NULL,1.57,'No','2026-03-10 05:19:14','2026-03-10 05:19:14'),(120030,25,'Mr.MOHEMMED YOUSUF','BFXPM1334N','282836954738','M.E.','Anna University','Computer Science and Engineering','2024-10-15','Assistant Professor','Assistant Professor',NULL,'2013-05-24','Regular','Yes',NULL,1.40,'No','2026-03-10 05:19:14','2026-03-10 05:19:14'),(120031,25,'Mr.SENTHILNATHAN S','CQHPS0870H','653201594241','M.E.','Anna University','Computer Science and Engineering','2024-08-20','Assistant Professor','Assistant Professor',NULL,'2009-05-22','Regular','Yes',NULL,1.55,'No','2026-03-10 05:19:14','2026-03-10 05:19:14'),(120032,25,'Ms.DEEPA SUMATHI M','CAUPD5989F','812639492624','M.E.','Anna University','Computer Science and Engineering','2025-04-07','Assistant Professor','Assistant Professor',NULL,'2025-03-28','Regular','Yes',NULL,0.92,'No','2026-03-10 05:19:15','2026-03-10 05:19:15'),(120033,25,'Ms.ELAVARASI T','AEOPE9551J','768718250286','M.E.','Anna University','Computer Science and Engineering','2025-06-02','Assistant Professor','Assistant Professor',NULL,'2025-05-23','Regular','Yes',NULL,0.77,'No','2026-03-10 05:19:15','2026-03-10 05:19:15'),(120034,25,'Ms.SHOBANA K B','GQQPS9662L','262768305610','M.E.','Anna University','Computer Science and Engineering','2025-06-05','Assistant Professor','Assistant Professor',NULL,'2020-05-22','Regular','Yes',NULL,0.76,'No','2026-03-10 05:19:15','2026-03-10 05:19:15'),(120035,25,'Ms.GAYATHRI D','BCRPG8707L','786568304247','M.E.','Anna University','Computer Science and Engineering','2025-06-06','Assistant Professor','Assistant Professor',NULL,'2018-05-25','Regular','Yes',NULL,0.76,'No','2026-03-10 05:19:15','2026-03-10 05:19:15'),(120036,3,'Dr.GOMATHI R','ANDPG6088N','932949727521','M.E. and Ph.D','Anna University','Semantic Web and Query Processing','2007-05-18','Assistant Professor','Professor','2023-02-26','2016-04-12','Regular','Yes',NULL,18.80,'Yes','2026-03-10 05:25:30','2026-03-10 09:05:56'),(120037,3,'Dr.SUNDARA MURTHY S','BMKPS4101H','654621709493','M.E. and Ph.D','Anna University','Information and Communication Engineering','2001-05-07','Assistant Professor','Professor','2022-03-01','2016-10-06','Regular','Yes',NULL,24.84,'No','2026-03-10 05:25:31','2026-03-10 05:25:31'),(120038,3,'Dr.NANDHINI S S','AJAPN4212E','183460101506','M.E. and Ph.D','Anna University','Computer Science and Engineering','2013-06-09','Assistant Professor','Associate Professor','2024-12-31','2024-12-15','Regular','Yes',NULL,12.75,'No','2026-03-10 05:25:31','2026-03-10 08:35:44'),(120039,3,'Dr.KODIESWARI A','AVCPK0585H','258335086692','M.E. and Ph.D','Anna University','Information and Communication Engineering','2014-05-01','Assistant Professor','Associate Professor','2021-12-05','2021-08-31','Regular','Yes',NULL,11.85,'No','2026-03-10 05:25:31','2026-03-10 08:36:02'),(120040,3,'Dr.ARUN KUMAR R','ALFPA6603D','268775612985','M.E. and Ph.D','Anna University','Computer Science and Engineering','2018-12-02','Assistant Professor','Associate Professor','2024-03-31','2024-03-21','Regular','Yes',NULL,7.27,'No','2026-03-10 05:25:31','2026-03-10 08:46:51'),(120041,3,'Dr.ESWARAMOORTHY V','AAJPE4363P','110600780226','M.Tech. and Ph.D','Anna University','Mobile Ad Hoc Networks','2020-09-04','Assistant Professor','Associate Professor','2021-12-06','2018-04-20','Regular','Yes',NULL,5.51,'No','2026-03-10 05:25:31','2026-03-10 05:25:31'),(120042,3,'Mr.RANJITH G','AVXPR7419L','873106942093','M.E.','Anna University','Computer Science and Engineering','2018-06-04','Assistant Professor','Assistant Professor',NULL,'2015-05-22','Regular','Yes',NULL,7.76,'No','2026-03-10 05:25:32','2026-03-10 05:25:32'),(120043,3,'Ms.NITHYAPRIYA S','ANDPN4422H','669489735558','M.E.','Anna University','Computer Science and Engineering','2020-10-19','Assistant Professor','Assistant Professor',NULL,'2015-05-22','Regular','Yes',NULL,5.39,'No','2026-03-10 05:25:32','2026-03-10 05:25:32'),(120044,3,'Ms.NISHA DEVI K','AKXPN5668E','965390384510','M.E.','Anna University','Computer Science and Engineering','2021-12-01','Assistant Professor','Assistant Professor',NULL,'2013-05-17','Regular','Yes',NULL,4.27,'No','2026-03-10 05:25:32','2026-03-10 05:25:32'),(120045,3,'Mr.BALASAMY K','AUKPB3794L','478520997453','M.E.','Anna University','Computer Science and Engineering','2021-12-10','Assistant Professor','Assistant Professor',NULL,'2009-05-15','Regular','Yes',NULL,4.25,'No','2026-03-10 05:25:32','2026-03-10 05:25:32'),(120046,3,'Mr.PRABANAND S C','CVTPP5036R','463940533204','M.Tech.','Anna University','Information Technology','2022-01-31','Assistant Professor','Assistant Professor',NULL,'2013-05-17','Regular','Yes',NULL,4.10,'No','2026-03-10 05:25:32','2026-03-10 05:25:32'),(120047,3,'Mr.SATHEESH N P','JJAPS5226N','266609574879','M.E.','Anna University','Software Engineering','2022-03-04','Assistant Professor','Assistant Professor',NULL,'2016-05-13','Regular','Yes',NULL,4.02,'No','2026-03-10 05:25:33','2026-03-10 05:25:33'),(120048,3,'Mr.RAJ KUMAR V S','BWJPR7331F','502815167008','M.E.','Anna University','Computer Science and Engineering','2022-05-25','Assistant Professor','Assistant Professor',NULL,'2016-05-13','Regular','Yes',NULL,3.79,'No','2026-03-10 05:25:33','2026-03-10 05:25:33'),(120049,3,'Ms.ESAKKI MADURA E','ADJPE6139J','934268579903','M.E.','Anna University','Computer Science and Engineering','2022-06-01','Assistant Professor','Assistant Professor',NULL,'2017-05-19','Regular','Yes',NULL,3.77,'No','2026-03-10 05:25:33','2026-03-10 05:25:33'),(120050,3,'Ms.DIVYABARATHI P','FCNPD8599H','458943997932','M.E.','Anna University','Computer Science and Engineering','2022-10-19','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,3.39,'No','2026-03-10 05:25:33','2026-03-10 05:25:33'),(120051,3,'Mr.SATHEESHKUMAR S','PDTPS0979D','330262680093','M.E.','Anna University','Computer Science and Engineering','2022-11-18','Assistant Professor','Assistant Professor',NULL,'2020-05-15','Regular','Yes',NULL,3.31,'No','2026-03-10 05:25:34','2026-03-10 05:25:34'),(120052,3,'Ms.KIRUTHIGA R','BCWPK6495G','580491008756','M.E.','Anna University','Computer Science and Engineering','2022-11-25','Assistant Professor','Assistant Professor',NULL,'2015-05-15','Regular','Yes',NULL,3.29,'No','2026-03-10 05:25:34','2026-03-10 05:25:34'),(120053,3,'Ms.VAANATHI S','ALQPV3581Q','473052883212','M.E.','Anna University','Computer Science and Engineering','2023-01-02','Assistant Professor','Assistant Professor',NULL,'2016-05-13','Regular','Yes',NULL,3.18,'No','2026-03-10 05:25:34','2026-03-10 05:25:34'),(120054,3,'Mr.CHOZHARAJAN P','BEFPC2618G','897353423321','M.E.','Anna University','Computer Science and Engineering','2023-02-01','Assistant Professor','Assistant Professor',NULL,'2013-05-17','Regular','Yes',NULL,3.10,'No','2026-03-10 05:25:34','2026-03-10 05:25:34'),(120055,3,'Ms.ASHFORN HERMINA J','MBJFPJ9140K','399749556796','M.E.','Anna University','Computer Science and Engineering','2023-03-01','Assistant Professor','Assistant Professor',NULL,'2016-05-26','Regular','Yes',NULL,3.03,'No','2026-03-10 05:25:34','2026-03-10 05:25:34'),(120056,3,'Ms.JEEVITHA S V','AVHPJ2344J','367070462283','M.E.','Anna University','VLSI Design','2023-03-01','Assistant Professor','Assistant Professor',NULL,'2015-11-20','Regular','Yes',NULL,3.03,'No','2026-03-10 05:25:35','2026-03-10 05:25:35'),(120057,3,'Ms.BENITA GRACIA THANGAM J','FYNPB3198C','139327876973','M.E.','Anna University','Software Engineering','2023-06-01','Assistant Professor','Assistant Professor',NULL,'2023-05-31','Regular','Yes',NULL,2.77,'No','2026-03-10 05:25:35','2026-03-10 05:25:35'),(120058,3,'Mr.PREMKUMAR C','AXEPP3987E','286032991034','M.E.','Anna University','Computer Science and Engineering','2023-06-01','Assistant Professor','Assistant Professor',NULL,'2017-05-26','Regular','Yes',NULL,2.77,'No','2026-03-10 05:25:35','2026-03-10 05:25:35'),(120059,3,'Ms.RESHMI T S','BJLPR4140P','780036507598','M.Tech.','Calicut University Kozhikode','Computer Science and Engineering','2023-08-28','Assistant Professor','Assistant Professor',NULL,'2017-05-31','Regular','Yes',NULL,2.53,'No','2026-03-10 05:25:35','2026-03-10 05:25:35'),(120060,3,'Dr.SUBBULAKSHMI M','DGNPS6498Q','215483736325','M.E. and Ph.D','Anna University','Computer Science and Engineering','2024-01-19','Assistant Professor','Assistant Professor',NULL,'2018-06-18','Regular','Yes',NULL,2.14,'No','2026-03-10 05:25:35','2026-03-10 05:25:35'),(120061,3,'Ms.KALPANA R','GDMPK3094K','330218950857','M.E.','Anna University','Computer Science and Engineering','2024-04-03','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,1.93,'No','2026-03-10 05:25:36','2026-03-10 05:25:36'),(120062,3,'Ms.SURIYA V','HLBPS3397R','113686970578','M.E.','Anna University','Computer Science and Engineering','2024-05-02','Assistant Professor','Assistant Professor',NULL,'2024-04-26','Regular','Yes',NULL,1.85,'No','2026-03-10 05:25:36','2026-03-10 05:25:36'),(120063,3,'Ms.HEMA PRIYA D','AILPH4957J','896417517573','M.E.','Anna University','Computer Science and Engineering','2024-05-02','Assistant Professor','Assistant Professor',NULL,'2024-04-26','Regular','Yes',NULL,1.85,'No','2026-03-10 05:25:36','2026-03-10 05:25:36'),(120064,3,'Ms.MANJU M','DWPPM5292G','441183747160','M.E.','Anna University','Computer Science and Engineering','2024-05-03','Assistant Professor','Assistant Professor',NULL,'2014-05-16','Regular','Yes',NULL,1.85,'No','2026-03-10 05:25:37','2026-03-10 05:25:37'),(120065,3,'Ms.PRIYADHARSHNI S','PIOPS5845A','221670824364','M.E.','Anna University','Computer Science and Engineering','2024-05-13','Assistant Professor','Assistant Professor',NULL,'2024-04-26','Regular','Yes',NULL,1.82,'No','2026-03-10 05:25:37','2026-03-10 05:25:37'),(120066,3,'Mr.SASSON TAFFWIN MOSES S','NZGPS3863D','983970724192','M.E.','Anna University','Computer Science and Engineering','2025-06-02','Assistant Professor','Assistant Professor',NULL,'2025-05-23','Regular','Yes',NULL,0.77,'No','2026-03-10 05:25:37','2026-03-10 05:25:37'),(120067,3,'Ms.MANOCHITRA A S','EEAPM5171J','362125832035','M.E.','Anna University','Computer Science and Engineering','2025-06-05','Assistant Professor','Assistant Professor',NULL,'2025-03-28','Regular','Yes',NULL,0.76,'No','2026-03-10 05:25:37','2026-03-10 05:25:37');
/*!40000 ALTER TABLE `faculty_details` ENABLE KEYS */;
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
-- Table structure for table `intake_details`
--

DROP TABLE IF EXISTS `intake_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intake_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `program_id` int NOT NULL,
  `year_of_aicte_approval` year(4) DEFAULT NULL,
  `initial_intake` int DEFAULT NULL,
  `intake_increase` int DEFAULT NULL,
  `current_intake` int DEFAULT NULL,
  `accreditation_status` varchar(50) DEFAULT NULL,
  `accreditation_from` year(4) DEFAULT NULL,
  `accreditation_to` year(4) DEFAULT NULL,
  `program_for_consideration` tinyint(1) DEFAULT NULL,
  `program_duration` int DEFAULT NULL,
  `academic_year` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_program` (`program_id`),
  CONSTRAINT `fk_program` FOREIGN KEY (`program_id`) REFERENCES `all_program` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intake_details`
--

LOCK TABLES `intake_details` WRITE;
/*!40000 ALTER TABLE `intake_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `intake_details` ENABLE KEYS */;
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
INSERT INTO `program_name` VALUES (29,'Aeronautical Engineering'),(30,'Agricultural Engineering'),(31,'Artificial Intelligence and Data Science'),(32,'Artificial Intelligence and Machine Learning'),(33,'Automobile Engineering'),(34,'Biomedical Engineering'),(35,'Biotechnology(PG)'),(36,'Biotechnology'),(37,'Civil Engineering'),(38,'Communication Systems(PG)'),(39,'Computer Science and Business System'),(40,'Computer Science and Design'),(41,'Computer Science and  Engineering(PG)'),(42,'Computer Science and Engineering'),(43,'Computer Technology'),(44,'Electrical and Electronics Engineering'),(45,'Electronics & Communication  Engineering'),(46,'Electronics & Instrumentation  Engineering'),(47,'Embedded Systems(PG)'),(48,'Fashion Technology'),(49,'Food Technology'),(50,'Industrial Automation & Robotics(PG)'),(51,'Industrial Safety Engineering(PG)'),(52,'Information Science &  Engineering'),(53,'Information Technology'),(54,'Mechanical Engineering'),(55,'Mechatronics Engineering'),(56,'Power Electronics & Drives(PG)'),(57,'Software Engineering(PG)'),(58,'Structural Engineering(PG)'),(59,'Textile Technology'),(60,'Master of Business Administration');
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
INSERT INTO `user_role` VALUES (1,1),(2,2),(3,2),(4,2),(5,2),(6,2);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=120003;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'arunprasathp.cs24@bitsathy.ac.in',NULL,1,'2026-03-02 14:54:18','2026-03-02 14:54:18'),(2,'kanikaab.cs24@bitsathy.ac.in',NULL,1,'2026-03-03 10:03:30','2026-03-03 10:03:30'),(3,'sanjeevirajanramajayam.cs24@bitsathy.ac.in',NULL,1,'2026-03-07 03:47:24','2026-03-07 03:49:28'),(4,'jaisondavidm.cs25@bitsathy.ac.in',NULL,1,'2026-03-10 12:17:32','2026-03-10 12:17:32'),(5,'santhoshs.cs25@bitsathy.ac.in',NULL,1,'2026-03-11 04:08:52','2026-03-11 04:09:52'),(6,'selvakarshanck.cs25@bitsathy.ac.in',NULL,1,'2026-03-11 04:08:52','2026-03-11 04:09:52');
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

-- Dump completed on 2026-03-11 14:02:23
