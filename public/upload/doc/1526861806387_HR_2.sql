-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 27, 2018 at 06:39 PM
-- Server version: 5.7.19
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `ucchr`
--
CREATE DATABASE `ucchr` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `ucchr`;

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE IF NOT EXISTS `appointment` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Document',
  `path` text COMMENT 'Path of Letter',
  `date` date DEFAULT NULL COMMENT 'Date of Letter',
  `category` enum('APPOINTMENT') DEFAULT 'APPOINTMENT' COMMENT 'Category of Letter',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `employee_id` int(11) DEFAULT NULL COMMENT 'Employee ID',
  `active` enum('0','1') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Appointments & Promotions Repo' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `bank`
--

CREATE TABLE IF NOT EXISTS `bank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_no` int(11) NOT NULL COMMENT 'Staff Number',
  `account_no` int(11) NOT NULL COMMENT 'Account Number',
  `account_name` varchar(350) NOT NULL COMMENT 'Account Name',
  `account_branch` varchar(150) NOT NULL COMMENT 'Account Branch',
  `bank_name` varchar(255) NOT NULL COMMENT 'Name of Bank',
  `date_added` date DEFAULT NULL COMMENT 'Date Added',
  `active` enum('0','1') NOT NULL COMMENT 'Default Bank Account',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COMMENT='Bank Accounts of Staff' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `bank`
--

INSERT INTO `bank` (`id`, `staff_no`, `account_no`, `account_name`, `account_branch`, `bank_name`, `date_added`, `active`) VALUES
(1, 15666, 203214778, 'Ebenezer K.B. Ackah', 'Adenta', 'Fidelity Bank Limited, Ghana', '2018-04-19', '1');

-- --------------------------------------------------------

--
-- Table structure for table `certificate`
--

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Staff Academic Qualification' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `circular`
--

CREATE TABLE IF NOT EXISTS `circular` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` text COMMENT 'Path of Letter',
  `type` enum('COPIED','MAIN') NOT NULL DEFAULT 'MAIN' COMMENT 'Mode of Receipt',
  `receivers` varchar(255) DEFAULT NULL COMMENT 'Recipients and Copied',
  `sender` varchar(100) DEFAULT NULL COMMENT 'Sender of Letter',
  `date` date DEFAULT NULL COMMENT 'Date of Letter',
  `certified` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Certification of letter',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Repository of All Letters, both copied and main' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `doc`
--

CREATE TABLE IF NOT EXISTS `doc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Document being uploaded',
  `path` text COMMENT 'Path of Document',
  `staff_no` int(11) DEFAULT NULL COMMENT 'Staff Number of Applicant',
  `category` enum('BIRTH','MARITAL','CV','CERT','MEDLAB','MEDREP','MEDHIS','XRAY') DEFAULT NULL COMMENT 'Category of Document',
  `active` enum('0','1') NOT NULL COMMENT 'Enabled',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `doc`
--

INSERT INTO `doc` (`id`, `title`, `path`, `staff_no`, `category`, `active`) VALUES
(1, 'Curriculum Vitae', 'iuyuiyiyiuyuiy', 15666, 'CV', '1'),
(2, 'Birth Ceritificate', 'ghjgghghg', 15666, 'BIRTH', '1');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

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
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `grade`
--

CREATE TABLE IF NOT EXISTS `grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL COMMENT 'Title of Scale',
  `start_amount` float NOT NULL DEFAULT '0' COMMENT 'Start of Scale Range',
  `end_amount` float NOT NULL DEFAULT '0' COMMENT 'End of Scale Range',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Activate Scale',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `grade`
--

INSERT INTO `grade` (`id`, `title`, `start_amount`, `end_amount`, `active`) VALUES
(1, '17H', 22406, 23990, '1');

-- --------------------------------------------------------

--
-- Table structure for table `interview`
--

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Applied Jobs status' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `job`
--

CREATE TABLE IF NOT EXISTS `job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL COMMENT 'Job Title',
  `unit_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Assigned Unit',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `job`
--

INSERT INTO `job` (`id`, `title`, `unit_id`, `active`) VALUES
(1, 'ICT ASSISTANT', 1, '1');

-- --------------------------------------------------------

--
-- Table structure for table `leave`
--

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
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `letter`
--

INSERT INTO `letter` (`id`, `title`, `staff_no`, `posting_id`, `template_id`, `ref_no`, `copies`, `signatory_id`, `letter_date`, `letter_token`, `active`) VALUES
(1, 'Appointment Letter', 15666, 0, 1, 'GTS/67', '100,112', 1, '2018-04-11', 'c4ca4238a0b923820dcc509a6f75849b', '1');

-- --------------------------------------------------------

--
-- Table structure for table `posting`
--

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Job Advertisement and offer' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `scale`
--

CREATE TABLE IF NOT EXISTS `scale` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grade_id` int(11) DEFAULT NULL COMMENT 'Grade',
  `amount` float NOT NULL DEFAULT '0' COMMENT 'Notch Amount',
  `notch` int(11) NOT NULL DEFAULT '1' COMMENT 'Current Step/Notch',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Activate Scale',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `scale`
--

INSERT INTO `scale` (`id`, `grade_id`, `amount`, `notch`, `active`) VALUES
(1, 0, 22406, 1, '1');

-- --------------------------------------------------------

--
-- Table structure for table `signatory`
--

CREATE TABLE IF NOT EXISTS `signatory` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `staff_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `signature` longblob COMMENT 'Signature of Staff  in BLOB',
  `permission` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Permission for Usage',
  `letter_category` enum('APPOINTMENT') NOT NULL DEFAULT 'APPOINTMENT' COMMENT 'Letters Category to assign Signature',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Signatories Data of Letters ' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `staff_bio`
--

CREATE TABLE IF NOT EXISTS `staff_bio` (
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
  `father` varchar(200) DEFAULT NULL COMMENT 'Father''s Full name',
  `father_address` varchar(255) DEFAULT NULL COMMENT 'Father''s Address',
  `father_hometown` varchar(100) DEFAULT NULL COMMENT 'Father''s Home Town',
  `mother` varchar(255) DEFAULT NULL COMMENT 'Mother''s Full Name',
  `mother_address` varchar(350) DEFAULT NULL COMMENT 'Mother''s Address',
  `mother_hometown` varchar(100) DEFAULT NULL COMMENT 'Mother''s Home Town',
  `children_no` int(11) NOT NULL DEFAULT '0' COMMENT 'Number of Children',
  `children_info` text,
  `spouse` varchar(255) DEFAULT NULL COMMENT 'Name of Spouse (if married)',
  `spouse_photo` longblob COMMENT 'Spouse Photo',
  `spouse_mime` varchar(50) DEFAULT NULL COMMENT 'Spouse Photo Mime Type',
  `next_kin` varchar(255) DEFAULT NULL COMMENT 'Name of Next of Kin',
  `rel_kin` varchar(100) DEFAULT NULL COMMENT 'Relationship to Next of Kin',
  `kin_address` varchar(350) DEFAULT NULL COMMENT 'Address of Next of Kin',
  `acad_qualification` text COMMENT 'Educational Qualification',
  `username` varchar(50) DEFAULT NULL COMMENT 'Username ',
  `password` varchar(45) DEFAULT NULL COMMENT 'Password',
  `enabled` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Enable Applicant',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `staff_bio`
--

INSERT INTO `staff_bio` (`id`, `staff_no`, `fname`, `mname`, `lname`, `dob`, `phone`, `email`, `address`, `mstatus`, `gender`, `photo`, `hometown`, `birth_place`, `district`, `region`, `country`, `father`, `father_address`, `father_hometown`, `mother`, `mother_address`, `mother_hometown`, `children_no`, `children_info`, `spouse`, `spouse_photo`, `spouse_mime`, `next_kin`, `rel_kin`, `kin_address`, `acad_qualification`, `username`, `password`, `enabled`) VALUES
(2, 15666, 'Siegfreid', 'Mawuena', 'Koku', '2018-04-24', '0277675089', 'koku@gmail.com', '', 'SINGLE', 'M', 'hjhkjjjj', 'Cape Coast', 'Anloga', 'Aowin', 'Western', 'Ghana', 'John Dramani', 'lashibi', 'Enchi', 'Emelia Duncan', 'Lashibi', 'Lashibi', 2, NULL, 'Susana Ayertey', NULL, NULL, 'Ama Koku', 'Brother', 'Cape Coast', NULL, NULL, NULL, '1'),
(3, 0, 'Nana', 'Mawuena', 'Koku', '2018-04-18', '0277675089', 'koku@gmail.com', 'Enchi', 'SINGLE', NULL, NULL, 'Cape Coast', 'Anloga', 'Aowin', 'Western', 'Ghana', NULL, NULL, NULL, NULL, NULL, NULL, 5, NULL, '', NULL, NULL, 'Ama Koku', 'Brother', 'Cape Coast', NULL, NULL, NULL, '1');

-- --------------------------------------------------------

--
-- Table structure for table `staff_data`
--

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
  `phone` int(10) unsigned zerofill DEFAULT NULL COMMENT 'Contact of Relative',
  `address` varchar(350) DEFAULT NULL COMMENT 'Address of Relative',
  `relation` enum('SPOUSE','CHILD','PARENT','KIN') DEFAULT NULL COMMENT 'Relation to Staff',
  `verified` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'Birth certificates verification',
  `active` enum('0','1') DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COMMENT='Relatives of Staff including Kins' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `staff_rel`
--

INSERT INTO `staff_rel` (`id`, `staff_no`, `fname`, `mname`, `lname`, `dob`, `code`, `gender`, `photo`, `path`, `hometown`, `phone`, `address`, `relation`, `verified`, `active`) VALUES
(1, 15666, 'Susana', 'Yaa', 'Ayertey', '1989-06-22', '15666A', 'F', '/public/images/staff/15666.png', NULL, 'Enchi', 0577587987, 'Enchi', 'SPOUSE', '1', '1');

-- --------------------------------------------------------

--
-- Table structure for table `template`
--

CREATE TABLE IF NOT EXISTS `template` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification of Template',
  `title` varchar(255) DEFAULT NULL COMMENT 'Title of Template',
  `html` text COMMENT 'Content of Letter',
  `map` varchar(300) DEFAULT NULL COMMENT 'Variable Mapping in Content',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date Created',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `template`
--

INSERT INTO `template` (`id`, `title`, `html`, `map`, `date`) VALUES
(1, 'appointment letter', 'This is the letter of Appointment', 'name', '2018-04-09 10:28:20');

-- --------------------------------------------------------

--
-- Table structure for table `transfer`
--

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Transfers of Staff' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

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
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COMMENT='Units of the University Community' AUTO_INCREMENT=3 ;

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

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `roles` enum('1','2','3','4','5','6','7') DEFAULT '7' COMMENT 'User Roles [ 1 = Super Admin , 2 = Administrator, 3 = Registrar, 4 = Dep. Registrar, 5 = Head of Unit , 6 = Moderator, 7 = Staff ]',
  `staff_no` varchar(30) NOT NULL DEFAULT '0' COMMENT 'Staff Number',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `password` varchar(150) DEFAULT NULL COMMENT 'Password',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COMMENT='User Accounts' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `roles`, `staff_no`, `username`, `password`, `active`) VALUES
(1, '1', '15666', 'dexitional', 'kiblee007', '1');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
