-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2018 at 11:31 PM
-- Server version: 5.7.9
-- PHP Version: 5.6.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ucchr`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
CREATE TABLE IF NOT EXISTS `bank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number',
  `account_no` varchar(150) DEFAULT NULL COMMENT 'Account Number',
  `account_name` varchar(350) DEFAULT NULL COMMENT 'Account Name',
  `account_branch` varchar(150) DEFAULT NULL COMMENT 'Account Branch',
  `bank_name` varchar(255) DEFAULT NULL COMMENT 'Name of Bank',
  `date_added` date DEFAULT NULL COMMENT 'Date Added',
  `active` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Default Bank Account',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COMMENT='Bank Accounts of Staff';

--
-- Dumping data for table `bank`
--

INSERT INTO `bank` (`id`, `staff_no`, `account_no`, `account_name`, `account_branch`, `bank_name`, `date_added`, `active`) VALUES
(1, 15666, '203215555', 'Ebenezer Kwabena Blay Ackah', 'Adenta', 'Fidelity Bank Limited, Ghana', '2018-04-19', '1'),
(2, 15666, '34334343434543535435344354', 'Ebenezer Kwabena Blay Ackah', 'Enchi', 'Agriculture Development Bank', '2018-05-22', '0');

-- --------------------------------------------------------

--
-- Table structure for table `certificate`
--

DROP TABLE IF EXISTS `certificate`;
CREATE TABLE IF NOT EXISTS `certificate` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number',
  `cert_title` varchar(255) DEFAULT NULL COMMENT 'Certificate Title',
  `cert_rate` enum('1','2','3','4','5') DEFAULT NULL COMMENT 'Certificate Rating & Weight [ 1 = 1st Degree, 2 = Masters, 3 = PHD, 4 = HND, 5 = NVTI,SHS,A/O-Level',
  `verified` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Verification of Certificate',
  `path` text COMMENT 'Location of File',
  `start_date` date DEFAULT NULL COMMENT 'Start date of Certificate Program',
  `end_date` date DEFAULT NULL COMMENT 'Expected Date of Completion of Program',
  `graduated` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Graduated Status',
  `grad_date` date DEFAULT NULL COMMENT 'Date of Graduation',
  `active` enum('0','1') DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COMMENT='Staff Academic Qualification';

--
-- Dumping data for table `certificate`
--

INSERT INTO `certificate` (`id`, `staff_no`, `cert_title`, `cert_rate`, `verified`, `path`, `start_date`, `end_date`, `graduated`, `grad_date`, `active`) VALUES
(1, 15666, 'BSC.TELECOM ENGINEERING', '1', '1', '\\public\\upload\\cert\\1526984103317_xpay.pdf', '2018-05-24', '2018-05-31', '1', '2018-05-29', '1');

-- --------------------------------------------------------

--
-- Table structure for table `circular`
--

DROP TABLE IF EXISTS `circular`;
CREATE TABLE IF NOT EXISTS `circular` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` text COMMENT 'Path of Letter',
  `type` enum('COPIED','MAIN') NOT NULL DEFAULT 'MAIN' COMMENT 'Mode of Receipt',
  `receivers` varchar(255) DEFAULT NULL COMMENT 'Recipients and Copied',
  `sender` varchar(100) DEFAULT NULL COMMENT 'Sender of Letter',
  `date` date DEFAULT NULL COMMENT 'Date of Letter',
  `certified` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Certification of letter',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Repository of All Letters, both copied and main';

-- --------------------------------------------------------

--
-- Table structure for table `doc`
--

DROP TABLE IF EXISTS `doc`;
CREATE TABLE IF NOT EXISTS `doc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Document being uploaded',
  `path` text COMMENT 'Path of Document',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number of Applicant',
  `category` enum('BIRTH','MARITAL','CV','MEDICAL') DEFAULT NULL COMMENT 'Category of Document',
  `default` int(11) DEFAULT NULL COMMENT 'Default',
  `active` enum('0','1') NOT NULL COMMENT 'Enabled',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `doc`
--

INSERT INTO `doc` (`id`, `title`, `path`, `staff_no`, `category`, `default`, `active`) VALUES
(1, 'Curriculum Vitae', 'iuyuiyiyiuyuiy', 15666, 'CV', NULL, '1'),
(2, 'Birth Ceritificate', 'ghjgghghg', 15666, 'BIRTH', NULL, '1'),
(3, 'BIRTH CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526474880192_March_2018_slip.pdf', 15667, 'BIRTH', NULL, '1'),
(4, 'BIRTH CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526482284092_March_2018_slip.pdf', 15667, 'BIRTH', NULL, '1'),
(5, 'BIRTH CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526482469360_March_2018_slip.pdf', 15667, 'BIRTH', NULL, '1'),
(6, 'CURRICULUM VITAE OF STAFF : 15667', '\\public\\upload\\doc\\1526482469217_Express.js Sessions – A Detailed Tutorial.pdf', 15667, 'CV', NULL, '1'),
(7, 'MARRIAGE CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526482469446_ViewerJS Instructions for installing ViewerJS.pdf', 15667, 'MARITAL', NULL, '1'),
(8, 'MEDICAL DATA OF STAFF : 15667', '\\public\\upload\\doc\\1526482469292_Forms, File Uploads and Security with Node.js and Express — VALIDATIONS.pdf', 15667, 'MEDICAL', NULL, '1'),
(9, 'BIRTH CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526486053819_March_2018_slip.pdf', 15667, 'BIRTH', NULL, '1'),
(10, 'CURRICULUM VITAE OF STAFF : 15667', '\\public\\upload\\doc\\1526486053514_Express.js Sessions – A Detailed Tutorial.pdf', 15667, 'CV', NULL, '1'),
(11, 'MARRIAGE CERTIFICATE OF STAFF : 15667', '\\public\\upload\\doc\\1526486054240_ViewerJS Instructions for installing ViewerJS.pdf', 15667, 'MARITAL', NULL, '1'),
(12, 'MEDICAL DATA OF STAFF : 15667', '\\public\\upload\\doc\\1526486053565_Forms, File Uploads and Security with Node.js and Express — VALIDATIONS.pdf', 15667, 'MEDICAL', NULL, '1'),
(13, 'BIRTH CERTIFICATE OF STAFF : 15668', '\\public\\upload\\doc\\1526487993126_March_2018_slip.pdf', 15668, 'BIRTH', NULL, '1'),
(14, 'CURRICULUM VITAE OF STAFF : 15668', '\\public\\upload\\doc\\1526487993060_Express.js Sessions – A Detailed Tutorial.pdf', 15668, 'CV', NULL, '1'),
(15, 'BIRTH CERTIFICATE OF STAFF : 15668', '\\public\\upload\\doc\\1526488191189_March_2018_slip.pdf', 15668, 'BIRTH', NULL, '1'),
(16, 'CURRICULUM VITAE OF STAFF : 15668', '\\public\\upload\\doc\\1526488191110_Express.js Sessions – A Detailed Tutorial.pdf', 15668, 'CV', NULL, '1'),
(17, 'MARRIAGE CERTIFICATE OF STAFF : 15668', '\\public\\upload\\doc\\1526488191186_Forms, File Uploads and Security with Node.js and Express — VALIDATIONS.pdf', 15668, 'MARITAL', NULL, '1'),
(18, 'BIRTH CERTIFICATE OF STAFF : 15668', '\\public\\upload\\doc\\1526488330458_Express.js Sessions – A Detailed Tutorial.pdf', 15668, 'BIRTH', NULL, '1'),
(19, 'CURRICULUM VITAE OF STAFF : 15668', '\\public\\upload\\doc\\1526488330406_Forms, File Uploads and Security with Node.js and Express — VALIDATIONS.pdf', 15668, 'CV', NULL, '1'),
(20, 'MARRIAGE CERTIFICATE OF STAFF : 15668', '\\public\\upload\\doc\\1526488330449_Express.js Sessions – A Detailed Tutorial.pdf', 15668, 'MARITAL', NULL, '1'),
(21, 'MEDICAL DATA OF STAFF : 15668', '\\public\\upload\\doc\\1526488330554_Forms, File Uploads and Security with Node.js and Express — VALIDATIONS.pdf', 15668, 'MEDICAL', NULL, '1'),
(22, 'BIRTH CERTIFICATE OF STAFF : 15666', '\\public\\upload\\doc\\1526858696738_School Fees Data_Esiama.xlsx', 15666, 'BIRTH', NULL, '1'),
(23, 'BIRTH CERTIFICATE OF STAFF : 15666', '\\public\\upload\\doc\\1526858816759_School Fees Data_Esiama.xlsx', 15666, 'BIRTH', NULL, '1'),
(24, 'CURRICULUM VITAE OF STAFF : 15666', '\\public\\upload\\doc\\1526864655915_March_2018_slip.pdf', 15666, 'CV', NULL, '1'),
(25, 'CURRICULUM VITAE OF STAFF : 15666', '\\public\\upload\\doc\\1526865551581_March_2018_slip.pdf', 15666, 'CV', NULL, '1'),
(26, 'BIRTH CERTIFICATE OF STAFF : 15666', '\\public\\upload\\doc\\1527019599973_xpay.pdf', 15666, 'BIRTH', NULL, '1'),
(27, 'MEDICAL DATA OF STAFF : 15666', '\\public\\upload\\doc\\1527019599978_xpay.pdf', 15666, 'MEDICAL', NULL, '1'),
(28, 'BIRTH CERTIFICATE OF STAFF : 15666', '\\public\\upload\\doc\\1527022713425_xpay.pdf', 15666, 'BIRTH', 1, '1'),
(29, 'MARRIAGE CERTIFICATE OF STAFF : 15666', '\\public\\upload\\doc\\1527022762787_xpay.pdf', 15666, 'MARITAL', 1, '1'),
(30, 'CURRICULUM VITAE OF STAFF : 15666', '\\public\\upload\\doc\\1527027641838_xpay.pdf', 15666, 'CV', 1, '1'),
(31, 'MEDICAL DATA OF STAFF : 15666', '\\public\\upload\\doc\\1527027641842_xpay.pdf', 15666, 'MEDICAL', 1, '1');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
CREATE TABLE IF NOT EXISTS `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Employee ID',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number',
  `fname` varchar(100) DEFAULT NULL COMMENT 'First Name',
  `mname` varchar(150) DEFAULT NULL COMMENT 'Middle Name(s)',
  `lname` varchar(100) DEFAULT NULL COMMENT 'Last Name',
  `phone` varchar(15) DEFAULT NULL COMMENT 'Mobile Number',
  `email` varchar(150) DEFAULT NULL COMMENT 'E-mail Address',
  `address` varchar(255) DEFAULT NULL COMMENT 'Residential Address',
  `gender` enum('M','F') DEFAULT NULL COMMENT 'Gender',
  `staff_group` enum('JS','SS','SM') DEFAULT NULL COMMENT 'Staff Group',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `interview`
--

DROP TABLE IF EXISTS `interview`;
CREATE TABLE IF NOT EXISTS `interview` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Applicant ID',
  `postings_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Job Posting ID',
  `received` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Received Application',
  `interview_date` date DEFAULT NULL COMMENT 'Interview Date',
  `interview_score` float NOT NULL DEFAULT '0' COMMENT 'Total Interview Score in Percentage',
  `interview_sum` text COMMENT 'Interview Scoring Summary',
  `interview_status` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Interview Status',
  `enabled` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Enable Stage',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Applied Jobs status';

-- --------------------------------------------------------

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
CREATE TABLE IF NOT EXISTS `job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL COMMENT 'Job Title',
  `unit_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Assigned Unit',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `job`
--

INSERT INTO `job` (`id`, `title`, `unit_id`, `active`) VALUES
(1, 'ICT ASSISTANT', 1, '1');

-- --------------------------------------------------------

--
-- Table structure for table `leave`
--

DROP TABLE IF EXISTS `leave`;
CREATE TABLE IF NOT EXISTS `leave` (
  `id` int(11) NOT NULL COMMENT 'Identification',
  `start_date` date DEFAULT NULL COMMENT 'Date of Leave Start',
  `end_date` date DEFAULT NULL COMMENT 'Date of Leave Completion',
  `applied_date` date DEFAULT NULL COMMENT 'Date Applied',
  `resume_date` date DEFAULT NULL COMMENT 'Date of Resumption',
  `outstanding` int(11) DEFAULT NULL COMMENT 'Outstanding Leave',
  `entitlement` int(11) DEFAULT NULL COMMENT 'Entitlement of Leave Per Year',
  `approved_days` int(11) DEFAULT NULL COMMENT 'Days Approved',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number',
  `status` enum('DEFFERED','GRANTED','PENDING') NOT NULL DEFAULT 'PENDING' COMMENT 'Leave Status',
  `relieved_by` int(11) DEFAULT NULL COMMENT 'Staff Number of Replacement',
  `emergency_note` text COMMENT 'Emergency Notice and Address'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Leave Application ';

-- --------------------------------------------------------

--
-- Table structure for table `letter`
--

DROP TABLE IF EXISTS `letter`;
CREATE TABLE IF NOT EXISTS `letter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT 'Title of Letter',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `posting_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Posting ID',
  `template_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Appointment template ID',
  `ref_no` varchar(40) DEFAULT NULL COMMENT 'Reference Number',
  `copies` text COMMENT 'Copies to send',
  `signatory_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Signatory',
  `letter_date` date DEFAULT NULL COMMENT 'Date of Letter',
  `letter_token` varchar(50) NOT NULL COMMENT 'Auto-generated ID for every letter',
  `active` enum('0','1') NOT NULL COMMENT 'Enable Letters',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `letter`
--

INSERT INTO `letter` (`id`, `title`, `staff_no`, `posting_id`, `template_id`, `ref_no`, `copies`, `signatory_id`, `letter_date`, `letter_token`, `active`) VALUES
(1, 'Appointment Letter', 15666, 0, 1, 'GTS/67', '100,112', 1, '2018-04-11', 'c4ca4238a0b923820dcc509a6f75849b', '1');

-- --------------------------------------------------------

--
-- Table structure for table `posting`
--

DROP TABLE IF EXISTS `posting`;
CREATE TABLE IF NOT EXISTS `posting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Job being Advertised',
  `owner_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Assigned Group',
  `request_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Number of People being requested',
  `request_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date of Advertisement',
  `chosen_applicant` varchar(255) DEFAULT NULL COMMENT 'Applicants granted job offer',
  `interview_start` date DEFAULT NULL COMMENT 'Interview Start Date',
  `interview_end` date DEFAULT NULL COMMENT 'Last Day of Interview for Applicants of this posting',
  `interviewed` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Job position interviewed',
  `enabled` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Enable Job ',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Job Advertisement and offer';

-- --------------------------------------------------------

--
-- Table structure for table `promo`
--

DROP TABLE IF EXISTS `promo`;
CREATE TABLE IF NOT EXISTS `promo` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Document',
  `path` text COMMENT 'Path of Letter',
  `letter_date` date DEFAULT NULL COMMENT 'Date of Letter',
  `assume_date` date DEFAULT NULL COMMENT 'Date of Assumption',
  `category` enum('APPOINTMENT') DEFAULT 'APPOINTMENT' COMMENT 'Category of Letter',
  `default` int(11) DEFAULT NULL COMMENT 'Default',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `active` enum('0','1') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=36 DEFAULT CHARSET=latin1 COMMENT='Appointments & Promotions Repo';

--
-- Dumping data for table `promo`
--

INSERT INTO `promo` (`id`, `title`, `path`, `letter_date`, `assume_date`, `category`, `default`, `staff_no`, `active`) VALUES
(1, 'APPOINTMENT LETTER OF STAFF : 15667', '\\public\\upload\\doc\\1526473440404_Express.js Sessions – A Detailed Tutorial.pdf', NULL, NULL, 'APPOINTMENT', NULL, 15667, '1'),
(2, 'APPOINTMENT LETTER OF STAFF : 15667', '\\public\\upload\\doc\\1526486054478_Express.js Sessions – A Detailed Tutorial.pdf', '2018-05-16', NULL, 'APPOINTMENT', NULL, 15667, '1'),
(3, 'APPOINTMENT LETTER OF STAFF : 15668', '\\public\\upload\\doc\\1526488330557_Express.js Sessions – A Detailed Tutorial.pdf', '2018-05-16', NULL, 'APPOINTMENT', NULL, 15668, '1'),
(4, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859338564_project1.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(5, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859458583_project1.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(6, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859502381_hr_inner.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(7, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859622384_hr_inner.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(8, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859728237_hms.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(9, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859837449_hms.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(10, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859867904_hostel.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(11, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859902468_hostel.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(12, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526859979234_Student''s Data_Esiama.xlsx', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(13, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526860099272_Student''s Data_Esiama.xlsx', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(14, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526860202411_hms.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(15, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526860235054_hms.sql', '2018-05-20', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(16, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526860912914_Student''s Data_Esiama.xlsx', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(17, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861032931_Student''s Data_Esiama.xlsx', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(18, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861098728_hr_inner.sql', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(19, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861430157_HR_2.sql', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(20, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861708347_hr_inner.sql', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(21, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861806387_HR_2.sql', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(22, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526861926405_HR_2.sql', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(23, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526862070238_Student''s Data_Esiama.xlsx', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(24, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526863516968_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(25, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526863637049_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(26, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526863729876_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(27, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526863849899_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(28, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526863904520_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(29, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526864571217_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(30, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526864760363_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(31, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526865652059_March_2018_slip.pdf', '2018-05-21', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(32, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526992608852_xpay.pdf', '2018-05-22', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(33, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526992662961_xpay.pdf', '2018-05-22', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(34, 'APPOINTMENT LETTER OF STAFF : 15666', '\\public\\upload\\doc\\1526993000126_TOUCH_WALL.docx', '2018-05-22', NULL, 'APPOINTMENT', NULL, 15666, '1'),
(35, 'APPOINTMENT LETTER OF STAFF : 15667', '\\public\\upload\\doc\\1526993463703_xpay.pdf', '2018-05-22', NULL, 'APPOINTMENT', NULL, 15667, '1');

-- --------------------------------------------------------

--
-- Table structure for table `scale_notch`
--

DROP TABLE IF EXISTS `scale_notch`;
CREATE TABLE IF NOT EXISTS `scale_notch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `range_id` int(11) DEFAULT NULL COMMENT 'Grade',
  `amount` float NOT NULL DEFAULT '0' COMMENT 'Notch Amount',
  `notch` int(11) NOT NULL DEFAULT '1' COMMENT 'Current Step/Notch',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Activate Scale',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scale_notch`
--

INSERT INTO `scale_notch` (`id`, `range_id`, `amount`, `notch`, `active`) VALUES
(1, 1, 22406, 1, '1');

-- --------------------------------------------------------

--
-- Table structure for table `scale_range`
--

DROP TABLE IF EXISTS `scale_range`;
CREATE TABLE IF NOT EXISTS `scale_range` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL COMMENT 'Title of Scale',
  `start_amount` float NOT NULL DEFAULT '0' COMMENT 'Start of Scale Range',
  `end_amount` float NOT NULL DEFAULT '0' COMMENT 'End of Scale Range',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Activate Scale',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scale_range`
--

INSERT INTO `scale_range` (`id`, `title`, `start_amount`, `end_amount`, `active`) VALUES
(1, '17H', 22406, 23990, '1');

-- --------------------------------------------------------

--
-- Table structure for table `signatory`
--

DROP TABLE IF EXISTS `signatory`;
CREATE TABLE IF NOT EXISTS `signatory` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `signature` longblob COMMENT 'Signature of Staff  in BLOB',
  `permission` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Permission for Usage',
  `letter_category` enum('APPOINTMENT') NOT NULL DEFAULT 'APPOINTMENT' COMMENT 'Letters Category to assign Signature',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Signatories Data of Letters ';

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificaton',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number',
  `fname` varchar(100) DEFAULT NULL COMMENT 'First Name',
  `mname` varchar(150) DEFAULT NULL COMMENT 'Middle Name(s)',
  `lname` varchar(100) DEFAULT NULL COMMENT 'Last Name',
  `dob` date DEFAULT NULL COMMENT 'Date of Birth',
  `phone` varchar(15) DEFAULT NULL COMMENT 'Mobile Number',
  `email` varchar(150) DEFAULT NULL COMMENT 'E-mail Address',
  `address` varchar(255) DEFAULT NULL COMMENT 'Residential Address',
  `mstatus` enum('SINGLE','MARRIED') DEFAULT NULL COMMENT 'Marital Status',
  `gender` enum('M','F') DEFAULT NULL COMMENT 'Gender',
  `photo` text COMMENT 'Photo of Applicant',
  `hometown` varchar(100) DEFAULT NULL COMMENT 'Hometown',
  `birth_place` varchar(100) DEFAULT NULL COMMENT 'Place of Birth',
  `district` varchar(100) DEFAULT NULL COMMENT 'District',
  `region` varchar(100) DEFAULT NULL COMMENT 'Region',
  `country` varchar(50) DEFAULT NULL COMMENT 'Country of Birth',
  `enabled` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Enable Applicant',
  `staff_group` enum('SM','SS','JS') NOT NULL COMMENT 'Staff Group',
  `unit_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Affliated Unit',
  `job_id` int(11) DEFAULT NULL COMMENT 'Assigned Job Info',
  `scale_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Salary Scale Range Assigned',
  `letter_id` int(11) DEFAULT NULL COMMENT 'Appointment Letter ID',
  `appoint_id` int(11) DEFAULT '0' COMMENT 'First Appointment ID',
  `promo_id` int(11) DEFAULT '0' COMMENT 'Current Promotion ID',
  `ucc_mail` varchar(255) DEFAULT NULL COMMENT 'Mail ID for UCC Domain',
  `ucc_mailpass` varchar(100) DEFAULT NULL COMMENT 'UCC Mail Password',
  `bank_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Default Bank Account ID of Staff',
  `ssnit` varchar(25) DEFAULT NULL COMMENT 'SSNIT NUMBER',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `staff_no`, `fname`, `mname`, `lname`, `dob`, `phone`, `email`, `address`, `mstatus`, `gender`, `photo`, `hometown`, `birth_place`, `district`, `region`, `country`, `enabled`, `staff_group`, `unit_id`, `job_id`, `scale_id`, `letter_id`, `appoint_id`, `promo_id`, `ucc_mail`, `ucc_mailpass`, `bank_id`, `ssnit`) VALUES
(7, 15666, 'Siegfreid', 'Mawuena', 'Koku', '2018-05-09', '0277675089', 'ebenezerkb.ackah@gmail.com', 'P.O. Box DD1', 'SINGLE', 'M', NULL, 'Enchi', 'Enchi', 'Aowin', 'Western', 'Ghana', '1', 'SS', 1, 1, 1, 0, 34, 0, 'dex@hj.com', NULL, 1, 'AAA'),
(8, 15667, 'Messi', 'Roland', 'DARKO', '2018-05-10', '0244545678', 'fringe@gmail.com', 'Cape coast', 'SINGLE', 'M', NULL, 'Abura', 'Abura', 'Cape Coast North', 'Central', 'Ghanaian', '1', 'JS', 1, 1, 1, NULL, 35, 0, '', NULL, 0, '12234484848484');

-- --------------------------------------------------------

--
-- Table structure for table `staff_data`
--

DROP TABLE IF EXISTS `staff_data`;
CREATE TABLE IF NOT EXISTS `staff_data` (
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `staff_group` enum('SM','SS','JS') NOT NULL COMMENT 'Staff Group',
  `unit_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Affliated Unit',
  `job_id` int(11) DEFAULT NULL COMMENT 'Assigned Job Info',
  `scale_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Salary Scale Range Assigned',
  `letter_id` int(11) DEFAULT NULL COMMENT 'Appointment Letter ID',
  `ucc_mail` varchar(255) DEFAULT NULL COMMENT 'Mail ID for UCC Domain',
  `ucc_mailpass` varchar(100) DEFAULT NULL COMMENT 'UCC Mail Password',
  `bank_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Active Bank Accounts',
  `ssnit` varchar(25) DEFAULT NULL COMMENT 'SSNIT NUMBER',
  PRIMARY KEY (`staff_no`),
  UNIQUE KEY `staff_no` (`staff_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Staff Extra Information';

--
-- Dumping data for table `staff_data`
--

INSERT INTO `staff_data` (`staff_no`, `staff_group`, `unit_id`, `job_id`, `scale_id`, `letter_id`, `ucc_mail`, `ucc_mailpass`, `bank_id`, `ssnit`) VALUES
(15666, 'SS', 1, NULL, 1, 1, 'koku@ucc.edu.gh', NULL, 1, 'A123');

-- --------------------------------------------------------

--
-- Table structure for table `staff_rel`
--

DROP TABLE IF EXISTS `staff_rel`;
CREATE TABLE IF NOT EXISTS `staff_rel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_no` int(11) NOT NULL COMMENT 'Staff Number ',
  `fname` varchar(255) DEFAULT NULL COMMENT 'First Name',
  `mname` varchar(255) DEFAULT NULL COMMENT 'Middle Name(s)',
  `lname` varchar(255) DEFAULT NULL COMMENT 'Last Name',
  `dob` date DEFAULT NULL COMMENT 'Date of Birth',
  `code` varchar(20) DEFAULT NULL COMMENT 'Unique Code',
  `gender` enum('M','F') DEFAULT NULL COMMENT 'Gender',
  `photo` varchar(255) DEFAULT NULL COMMENT 'Image Path',
  `path` varchar(300) DEFAULT NULL COMMENT 'Birth Certificate & Document',
  `hometown` varchar(150) DEFAULT NULL COMMENT 'Home Town ',
  `phone` int(10) UNSIGNED ZEROFILL DEFAULT NULL COMMENT 'Contact of Relative',
  `address` varchar(350) DEFAULT NULL COMMENT 'Address of Relative',
  `relation` enum('SPOUSE','CHILD','PARENT','KIN') DEFAULT NULL COMMENT 'Relation to Staff',
  `kin_relation` varchar(150) DEFAULT NULL COMMENT 'Relation to Staff',
  `active` enum('0','1') DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COMMENT='Relatives of Staff including Kins';

--
-- Dumping data for table `staff_rel`
--

INSERT INTO `staff_rel` (`id`, `staff_no`, `fname`, `mname`, `lname`, `dob`, `code`, `gender`, `photo`, `path`, `hometown`, `phone`, `address`, `relation`, `kin_relation`, `active`) VALUES
(1, 15666, 'Susana', 'Yaa', 'Ayertey', '1989-06-22', '15666A', 'F', '/public/images/staff/15666.png', NULL, 'Enchi', 0577587987, 'Enchi', 'SPOUSE', '', '1'),
(2, 15666, 'Albert', 'koko', 'Mensah', '2018-05-12', '15666B', 'M', '\\public\\upload\\relative\\1526913007659IMG_20170604_144119.jpg', '\\public\\upload\\relative\\1526917826793xpay.pdf', 'Enchi', 0277675089, 'P.O. Box 23, Cape Coast', 'CHILD', '', '1'),
(6, 15666, 'John', ' Kwekucher', 'Ackah', '2018-05-25', NULL, 'M', NULL, NULL, 'Enchi', 0206925050, 'Enchi - Calvary Church', 'PARENT', NULL, '1'),
(7, 15666, 'SALOMEY', 'Roland', 'MENSAH', '2018-05-24', '15666C', 'F', '\\public\\upload\\relative\\1527008880669_esiama_logo.jpg', '\\public\\upload\\relative\\1527008880673_office.jpg', 'Abura', 0244545678, 'Kills', 'KIN', NULL, '1'),
(8, 15666, 'VIDA', 'KORKOR ', 'ACHEAMPONG', '2018-05-11', NULL, 'F', NULL, NULL, 'Abura', 0206925050, 'Enchi', 'PARENT', NULL, '1');

-- --------------------------------------------------------

--
-- Table structure for table `template`
--

DROP TABLE IF EXISTS `template`;
CREATE TABLE IF NOT EXISTS `template` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification of Template',
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Template',
  `html` text COMMENT 'Content of Letter',
  `map` varchar(300) DEFAULT NULL COMMENT 'Variable Mapping in Content',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date Created',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `template`
--

INSERT INTO `template` (`id`, `title`, `html`, `map`, `date`) VALUES
(1, 'appointment letter', 'This is the letter of Appointment', 'name', '2018-04-09 10:28:20');

-- --------------------------------------------------------

--
-- Table structure for table `transfer`
--

DROP TABLE IF EXISTS `transfer`;
CREATE TABLE IF NOT EXISTS `transfer` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `from_unit` int(11) NOT NULL DEFAULT '0' COMMENT 'Existing Unit of Staff',
  `to_unit` int(11) NOT NULL DEFAULT '0' COMMENT 'New Unit being Transferred',
  `transfer_date` date DEFAULT NULL COMMENT 'Date Transfered',
  `reason` text COMMENT 'Reason for Transfer Request',
  `remark` text COMMENT 'Remark & Notes on Transfer',
  `request_by` int(11) DEFAULT NULL COMMENT 'Transfer Requested By',
  `request_date` date DEFAULT NULL COMMENT 'Date of Transfer Request',
  `approved_by` int(11) DEFAULT NULL COMMENT 'Approved By',
  `approved_date` date DEFAULT NULL COMMENT 'Date Approved',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Transfers of Staff';

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
CREATE TABLE IF NOT EXISTS `unit` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unit Identification',
  `short_name` text COMMENT 'Short Name of Unit ',
  `long_name` text COMMENT 'Full Name of Unit',
  `type` varchar(20) DEFAULT NULL COMMENT 'Unit Domain',
  `level` int(11) DEFAULT NULL COMMENT 'Unit Level in Heirarchical Chain',
  `faculty_id` varchar(20) DEFAULT NULL COMMENT 'Faculty or Division ID',
  `college_id` varchar(20) DEFAULT NULL COMMENT 'College or Directorate ID',
  `dept_id` int(20) DEFAULT NULL COMMENT 'Department ID',
  `location` varchar(255) DEFAULT NULL COMMENT 'Location of Unit',
  `section_parent` int(11) NOT NULL DEFAULT '0' COMMENT 'Unit''s parent code',
  `unit_head` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number of Head of Unit',
  `active` enum('0','1') DEFAULT '1',
  `parent` int(11) DEFAULT NULL COMMENT 'Unit or Section Parent',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COMMENT='Units of the University Community';

--
-- Dumping data for table `unit`
--

INSERT INTO `unit` (`id`, `short_name`, `long_name`, `type`, `level`, `faculty_id`, `college_id`, `dept_id`, `location`, `section_parent`, `unit_head`, `active`, `parent`) VALUES
(1, 'MIS - DICTS', 'Management Information System - Directorate of ICT Services', NULL, NULL, NULL, NULL, NULL, '', 100, 0, '1', NULL),
(2, 'DICTS', '', NULL, NULL, NULL, NULL, NULL, '', 0, 0, '1', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `roles` enum('1','2','3','4','5','6','7') DEFAULT '7' COMMENT 'User Roles [ 1 = Super Admin , 2 = Administrator, 3 = Registrar, 4 = Dep. Registrar, 5 = Head of Unit , 6 = Moderator, 7 = Staff ]',
  `staff_no` varchar(30) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `password` varchar(150) DEFAULT NULL COMMENT 'Password',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COMMENT='User Accounts';

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `roles`, `staff_no`, `username`, `password`, `active`) VALUES
(1, '1', '15666', 'dexitional', 'kiblee007', '1');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
