-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 15, 2016 at 11:13 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `diagnosis`
--

CREATE TABLE IF NOT EXISTS `diagnosis` (
  `id` int(11) NOT NULL COMMENT 'Indentification',
  `diagnosis` text NOT NULL COMMENT 'List of Symptons',
  `disease` varchar(150) NOT NULL COMMENT 'Related Sickness or Disease',
  `treatment` text NOT NULL COMMENT 'Treatment to apply',
  `dateCreated` date NOT NULL COMMENT 'Date Added',
  `active` int(11) NOT NULL COMMENT 'Enable '
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Disease diagnosis sheet';

-- --------------------------------------------------------

--
-- Table structure for table `ipd`
--

CREATE TABLE IF NOT EXISTS `ipd` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `room` int(11) NOT NULL COMMENT 'Assigned room',
  `moreVitals` text NOT NULL COMMENT 'Continuous Vitals of In-Patient',
  `doctorRemark` text NOT NULL COMMENT 'Doctor''s Remarks on Patients',
  `admitDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date of Admission',
  `outDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date of Discharge',
  `ipdStatus` int(11) NOT NULL DEFAULT '0' COMMENT 'Discharge Status',
  `patient` int(11) NOT NULL COMMENT 'Patient Identification',
  `active` int(11) NOT NULL COMMENT 'Enable IPD',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='In-Patient Records' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `lab`
--

CREATE TABLE IF NOT EXISTS `lab` (
  `id` int(11) NOT NULL COMMENT 'Indetification',
  `testDate` date NOT NULL COMMENT 'Date of Lab Test',
  `testName` varchar(255) NOT NULL COMMENT 'Name of Lab Test',
  `testDesc` text NOT NULL COMMENT 'Lab Test Description',
  `unitCharge` float NOT NULL DEFAULT '0' COMMENT 'Cost of Lab Test'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Lab Tests';

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE IF NOT EXISTS `patient` (
  `id` int(11) NOT NULL DEFAULT '0',
  `fName` varchar(255) NOT NULL COMMENT 'First Name ',
  `lName` varchar(255) NOT NULL COMMENT 'Last Name',
  `gender` varchar(100) NOT NULL COMMENT 'Gender',
  `dob` date NOT NULL COMMENT 'Date of Birth',
  `address` text NOT NULL COMMENT 'Address',
  `phone` int(10) unsigned zerofill NOT NULL COMMENT 'Phone Number',
  `email` varchar(255) NOT NULL COMMENT 'E-Mail Address',
  `photo` varchar(255) NOT NULL COMMENT 'Photo of Patient',
  `profile` text NOT NULL COMMENT 'Profile of Staff',
  `mStatus` varchar(100) NOT NULL COMMENT 'Marital Status',
  `nhis` varchar(200) NOT NULL COMMENT 'Health Insurance',
  `regNo` varchar(200) NOT NULL COMMENT 'Health Facility Registration ID',
  `lastActivity` timestamp NOT NULL COMMENT 'Last Activity or LastLogin',
  `dateCreated` date NOT NULL COMMENT 'Date of Account Creation',
  `meta` varchar(255) NOT NULL COMMENT 'Biometric Data',
  `username` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active` int(11) NOT NULL COMMENT 'Enable Patient'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`id`, `fName`, `lName`, `gender`, `dob`, `address`, `phone`, `email`, `photo`, `profile`, `mStatus`, `nhis`, `regNo`, `lastActivity`, `dateCreated`, `meta`, `username`, `password`, `active`) VALUES
(1, 'Ebenezer Kwabena Blay', 'Ackah', 'male', '1989-02-28', 'Calvary Methodist CHurch\r\nP.O. Box 10\r\nEnchi', 0277675089, 'dexitional@gmail.com', '', 'I am a Developer.', 'single', 'Receptionist', 'Registration of New Patients', '2016-11-05 14:43:24', '2016-11-09', '', 'dexitional', 'kiblee007', 1);

-- --------------------------------------------------------

--
-- Table structure for table `queue`
--

CREATE TABLE IF NOT EXISTS `queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Indentification',
  `patient` int(11) NOT NULL COMMENT 'Patient ID',
  `appointment` varchar(255) NOT NULL COMMENT 'Appointment Type',
  `status` varchar(50) NOT NULL COMMENT 'Queue Status : [ complete | held | incomplete | clear ] ',
  `timeAdded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of Queue',
  `emergency` int(11) NOT NULL DEFAULT '0' COMMENT 'Type of Service',
  `active` int(11) NOT NULL COMMENT 'Activate Patient in Queue',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Hospital Queuing & Appointment Scheduler' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE IF NOT EXISTS `room` (
  `id` int(11) NOT NULL COMMENT 'Indentification',
  `roomTitle` varchar(250) NOT NULL COMMENT 'Room Designation',
  `roomDesc` text NOT NULL COMMENT 'Room Composition',
  `unitCharge` float NOT NULL DEFAULT '0' COMMENT 'Cost of Room Per day',
  `ward` int(11) NOT NULL COMMENT 'Related Ward',
  `dateCreated` date NOT NULL COMMENT 'Date Established',
  `active` int(11) NOT NULL COMMENT 'Enable Room'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Rooms within wards';

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fName` varchar(255) NOT NULL COMMENT 'First Name ',
  `lName` varchar(255) NOT NULL COMMENT 'Last Name',
  `gender` varchar(100) NOT NULL COMMENT 'Gender',
  `dob` date NOT NULL COMMENT 'Date of Birth',
  `address` text NOT NULL COMMENT 'Address',
  `phone` int(10) unsigned zerofill NOT NULL COMMENT 'Phone Number',
  `email` varchar(255) NOT NULL COMMENT 'E-Mail Address',
  `photo` varchar(255) NOT NULL COMMENT 'Photo of User',
  `profile` text NOT NULL COMMENT 'Profile of Staff',
  `mStatus` varchar(100) NOT NULL COMMENT 'Marital Status',
  `jobTitle` varchar(200) NOT NULL COMMENT 'Job Title',
  `jobDesc` text NOT NULL COMMENT 'Job Description',
  `qualification` varchar(150) NOT NULL COMMENT 'Qualifications and Specializations',
  `cv` varchar(255) NOT NULL COMMENT 'CV FIle Upload',
  `cert` varchar(255) NOT NULL COMMENT 'Certificate File Upload',
  `employDate` date NOT NULL COMMENT 'Date of First Appointment',
  `privilege` int(11) NOT NULL COMMENT 'Member Privileges',
  `lastActivity` timestamp NOT NULL COMMENT 'Last Activity or LastLogin',
  `dateCreated` date NOT NULL COMMENT 'Date of Account Creation',
  `meta` varchar(255) NOT NULL COMMENT 'Meta Data of Staff',
  `username` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userStatus` int(11) NOT NULL DEFAULT '0' COMMENT 'User Activity Status [ 0:offline, 1:online, 2: break]',
  `active` int(11) NOT NULL COMMENT 'Activeness of Staff',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='User & Staff Profile' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fName`, `lName`, `gender`, `dob`, `address`, `phone`, `email`, `photo`, `profile`, `mStatus`, `jobTitle`, `jobDesc`, `qualification`, `cv`, `cert`, `employDate`, `privilege`, `lastActivity`, `dateCreated`, `meta`, `username`, `password`, `userStatus`, `active`) VALUES
(1, 'Ebenezer Kwabena Blay', 'Ackah', 'male', '1989-02-28', 'Calvary Methodist CHurch\r\nP.O. Box 10\r\nEnchi', 0277675089, 'dexitional@gmail.com', '0', 'I am a Developer.', 'single', 'Receptionist', 'Registration of New Patients', 'BSc. Telecom Engineering', '../uploads/cv.pdf', '../uploads/cert.pdf', '2016-11-01', 4, '2016-11-12 00:11:49', '2016-11-09', '', 'dexitional', 'kiblee007', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `visit`
--

CREATE TABLE IF NOT EXISTS `visit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient` int(11) NOT NULL COMMENT 'Patients ID',
  `ipd` int(11) NOT NULL COMMENT 'In-Patient Record ID',
  `diagnosis` text NOT NULL COMMENT 'Sickness DIagnosis',
  `treatment` text NOT NULL COMMENT 'Sickness applied treatment',
  `labResult` text NOT NULL COMMENT 'Lab Results',
  `vitals` varchar(150) NOT NULL COMMENT 'Vitals of Patient',
  `pharmacy` text NOT NULL COMMENT 'Dispensed Drugs',
  `comments` text NOT NULL COMMENT 'Healthworkers'' remarks',
  `appointment` text NOT NULL COMMENT 'Appointment type',
  `medicHistory` text NOT NULL COMMENT 'Medical History of Labs & Sickness',
  `transactHistory` text NOT NULL COMMENT 'Transaction History of visit',
  `payAmount` float NOT NULL DEFAULT '0' COMMENT 'Total Payable Amount',
  `visitDate` int(11) NOT NULL COMMENT 'Time of Visit',
  `exitDate` int(11) NOT NULL COMMENT 'Time of Exit',
  `active` int(11) NOT NULL DEFAULT '0' COMMENT 'Enable Record',
  PRIMARY KEY (`id`),
  KEY `patient` (`patient`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Health Facility Visit records' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `ward`
--

CREATE TABLE IF NOT EXISTS `ward` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Indentification',
  `wardTitle` varchar(255) NOT NULL COMMENT 'Ward Name',
  `wardDesc` text NOT NULL COMMENT 'Description of Ward activities',
  `dateCreated` date NOT NULL COMMENT 'Date of Establishment',
  `active` int(11) NOT NULL COMMENT 'Enable Ward',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Patient Ward ' AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
