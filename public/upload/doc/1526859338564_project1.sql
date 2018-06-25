-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 28, 2016 at 11:11 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `project1`
--

-- --------------------------------------------------------

--
-- Table structure for table `grade`
--

CREATE TABLE IF NOT EXISTS `grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Grade ID',
  `grade` varchar(50) NOT NULL COMMENT 'grade',
  `remark` varchar(100) NOT NULL COMMENT 'Remarks',
  `cat` int(11) NOT NULL COMMENT 'Grade Category ID',
  `min_mark` int(11) NOT NULL COMMENT 'Minimum Mark',
  `max_mark` int(11) NOT NULL COMMENT 'Maximum Mark',
  `visibility` int(11) NOT NULL DEFAULT '1' COMMENT 'Vsibility, 0 is inactive, 1 is active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `grade`
--

INSERT INTO `grade` (`id`, `grade`, `remark`, `cat`, `min_mark`, `max_mark`, `visibility`) VALUES
(1, 'A1', 'Excellent', 1, 80, 100, 1),
(2, 'B2', 'Very Good', 1, 75, 79, 1),
(3, 'B3', 'Good', 1, 70, 74, 1),
(4, 'C4', 'Credit', 1, 65, 69, 1),
(5, 'C5', 'Credit', 1, 60, 64, 1),
(6, 'C6', 'Credit', 1, 55, 59, 1),
(7, 'D7', 'Pass', 1, 50, 54, 1),
(8, 'E8', 'Weak Pass', 1, 45, 49, 1),
(9, 'F9', 'Fail', 1, 0, 44, 1);

-- --------------------------------------------------------

--
-- Table structure for table `grade_cat`
--

CREATE TABLE IF NOT EXISTS `grade_cat` (
  `cat` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Grade Category ID',
  `title` varchar(255) NOT NULL COMMENT 'Name of Grading Scheme',
  `date_added` date NOT NULL COMMENT 'Date Introduced',
  `default` int(11) NOT NULL DEFAULT '0' COMMENT 'Default Grading Scheme',
  `visibility` int(11) NOT NULL COMMENT 'Visibility of Scheme, 0 is inactive, 1 is active',
  PRIMARY KEY (`cat`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Grading Category' AUTO_INCREMENT=3 ;

--
-- Dumping data for table `grade_cat`
--

INSERT INTO `grade_cat` (`cat`, `title`, `date_added`, `default`, `visibility`) VALUES
(1, 'WASSCE', '2013-06-01', 1, 1),
(2, 'SSCE', '1994-06-01', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE IF NOT EXISTS `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name` varchar(200) NOT NULL COMMENT 'Name of Institution',
  `school_address` text NOT NULL COMMENT 'Address of Institution',
  `school_size` int(11) NOT NULL COMMENT 'Population of Students',
  `school_email` varchar(150) NOT NULL COMMENT 'Official Email of School',
  `school_web` varchar(150) NOT NULL COMMENT 'Official website of School',
  `school_logo` varchar(255) NOT NULL COMMENT 'Official Logo',
  `school_town` varchar(100) NOT NULL COMMENT 'Town located in',
  `school_region` int(11) NOT NULL COMMENT 'Region located In',
  `school_head` int(11) NOT NULL COMMENT 'Head of Institution ID',
  `head_stamp` varchar(255) NOT NULL COMMENT 'Officially accepted Stamp and Signature',
  `school_accountant` int(11) NOT NULL COMMENT 'Head of Accounts ID',
  `accountant_stamp` varchar(255) NOT NULL COMMENT 'Accounts Stamp and Signature',
  `school_bgcolor` varchar(50) NOT NULL COMMENT 'Institution Primary Color',
  `school_fgcolor` varchar(50) NOT NULL COMMENT 'Institution Secondary Color',
  `school_cover` varchar(255) NOT NULL COMMENT 'Cover Photo of School',
  `admin` varchar(100) NOT NULL COMMENT 'Admin Login details',
  `pass` varchar(100) NOT NULL COMMENT 'Encrypted Password',
  `token` int(11) NOT NULL COMMENT 'Encrypted Access token',
  `default` int(11) NOT NULL DEFAULT '0' COMMENT 'Default Client, 1 is default, 0 is inactive',
  `date_registered` date NOT NULL COMMENT 'Date of Registration',
  `visiblity` int(11) NOT NULL DEFAULT '1' COMMENT 'Visibility',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Client Information and Settings' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `school_name`, `school_address`, `school_size`, `school_email`, `school_web`, `school_logo`, `school_town`, `school_region`, `school_head`, `head_stamp`, `school_accountant`, `accountant_stamp`, `school_bgcolor`, `school_fgcolor`, `school_cover`, `admin`, `pass`, `token`, `default`, `date_registered`, `visiblity`) VALUES
(1, 'GHANATA SENIOR HIGH SCHOOL', '<address>P.O. BOX DD 50<br>\r\n DODOWA</address>', 1560, 'info@ghanata.org', 'http://www.ghanata.org', 'assets/images/logo.png', 'Dodowa', 2, 1, 'assets/images/signature.png', 2, 'assets/images/signature.png', '#f90', 'green', 'assets/images/avatar1.png', 'ghanata', '20162020', 20162020, 1, '2016-05-02', 1);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `privilege` int(11) NOT NULL COMMENT 'Access privilege, 1 = Admin,2 = management, 3 = accounts, 4 = tutors, 5 = main office, 6 = other members',
  `first_name` varchar(255) NOT NULL COMMENT 'First Name',
  `last_name` varchar(255) NOT NULL COMMENT 'Last Name',
  `username` varchar(150) NOT NULL COMMENT 'Username of Staff',
  `password` varchar(150) NOT NULL COMMENT 'Staff Password',
  `visibility` int(11) NOT NULL COMMENT 'Active is 1, inactive is 0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `privilege`, `first_name`, `last_name`, `username`, `password`, `visibility`) VALUES
(1, 1, 'K-Soft', 'GH', 'ksoft', 'ksoft', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_academ`
--

CREATE TABLE IF NOT EXISTS `st_academ` (
  `academ` int(11) NOT NULL AUTO_INCREMENT,
  `term` int(11) NOT NULL,
  `year` year(4) NOT NULL,
  `academ_date` date NOT NULL,
  `academ_endate` date NOT NULL,
  `active` int(11) NOT NULL,
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`academ`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `st_academ`
--

INSERT INTO `st_academ` (`academ`, `term`, `year`, `academ_date`, `academ_endate`, `active`, `visibility`) VALUES
(1, 2, 2016, '2016-06-06', '2016-09-06', 0, 1),
(2, 3, 2016, '2016-09-06', '2016-12-06', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_achieve`
--

CREATE TABLE IF NOT EXISTS `st_achieve` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `html_content` text NOT NULL,
  `issue_date` date NOT NULL,
  `issue_form` int(11) NOT NULL,
  `academ` int(11) NOT NULL COMMENT 'Academic Term',
  `form_status` int(11) NOT NULL COMMENT 'Form of Student',
  `achieve_type` int(11) NOT NULL COMMENT '0 is award, 1 is sanction',
  `student_id` int(11) NOT NULL,
  `meta` text NOT NULL,
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Achievements Table -- Sanctions & Awards' AUTO_INCREMENT=3 ;

--
-- Dumping data for table `st_achieve`
--

INSERT INTO `st_achieve` (`id`, `title`, `html_content`, `issue_date`, `issue_form`, `academ`, `form_status`, `achieve_type`, `student_id`, `meta`, `visibility`) VALUES
(1, 'letter of Temporal suspension', 'Based on the immediate mishandling of funds, we probe to give u the most valuable system of use and thank you.', '2016-05-03', 3, 3, 3, 1, 1, '', 1),
(2, 'Best English Language Student For Form 3', 'This is the best student for the disciplines', '2016-05-10', 3, 3, 3, 0, 1, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_bill`
--

CREATE TABLE IF NOT EXISTS `st_bill` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `academ` int(11) NOT NULL COMMENT 'Academic Year & Term',
  `title` varchar(200) NOT NULL,
  `boarder_content` text NOT NULL,
  `day_content` text NOT NULL COMMENT 'Day Student Bill Content',
  `boarder_amount` int(11) NOT NULL,
  `day_amount` int(11) NOT NULL COMMENT 'Day Student Amount',
  `class_group` text NOT NULL COMMENT 'Groups with bills assigned eg:[class_id,class_id,class_id] ',
  `visibility` int(11) NOT NULL COMMENT 'activation',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `st_bill`
--

INSERT INTO `st_bill` (`id`, `academ`, `title`, `boarder_content`, `day_content`, `boarder_amount`, `day_amount`, `class_group`, `visibility`) VALUES
(1, 1, 'Form 2 General Science & Agric Bill', ' <table style="width:90%;margin:5px auto;">\r\n																																       <thead>\r\n																																	       <tr>  \r\n																																			 <th>Item</th>\r\n																																			 <th>Charge (GHC)</th>																																			 \r\n																																	       </tr>\r\n																																	  </thead>\r\n																																	   <tbody>\r\n																																	       <tr>\r\n																																				<th>Cadet</th>																																			 \r\n																																				<th>GHC 2.00</th>																																			\r\n																																	       </tr>\r\n																																		   <tr>\r\n																																				<th>Utilities</th>																																			 \r\n																																				<th>GHC 6.00</th>																																			\r\n																																	       </tr>\r\n																																		    <tr>\r\n																																				<th>PTA</th>																																			 \r\n																																				<th>GHC 30.00</th>																																			\r\n																																	       </tr>\r\n																																		   <tr>\r\n																																				<th>SIMS-ischool</th>																																			 \r\n																																				<th>GHC 25.00</th>																																			\r\n																																	       </tr>\r\n																																		    <tr>\r\n																																				<th><h3>TOTAL</h3></th>																																			 \r\n																																				<th><h3>GHC 43.00 + <em>Accrued Dept</em></h3></th>																																			\r\n																																	       </tr>\r\n																																	   </tbody>\r\n																																 </table>	', ' <table style="width:90%;margin:5px auto;">\r\n																																       <thead>\r\n																																	       <tr>  \r\n																																			 <th>Item</th>\r\n																																			 <th>Charge (GHC)</th>																																			 \r\n																																	       </tr>\r\n																																	  </thead>\r\n																																	   <tbody>\r\n																																	       <tr>\r\n																																				<th>Cadet</th>																																			 \r\n																																				<th>GHC 2.00</th>																																			\r\n																																	       </tr>\r\n																																		   <tr>\r\n																																				<th>Utilities</th>																																			 \r\n																																				<th>GHC 6.00</th>																																			\r\n																																	       </tr>\r\n																																		    <tr>\r\n																																				<th>PTA</th>																																			 \r\n																																				<th>GHC 30.00</th>																																			\r\n																																	       </tr>\r\n																																		   <tr>\r\n																																				<th>SIMS-ischool</th>																																			 \r\n																																				<th>GHC 5.00</th>																																			\r\n																																	       </tr>\r\n																																		    <tr>\r\n																																				<th><h3>TOTAL</h3></th>																																			 \r\n																																				<th><h3>GHC 253.00 + <em>Accrued Dept</em></h3></th>																																			\r\n																																	       </tr>\r\n																																	   </tbody>\r\n																																 </table>	', 63, 43, '1,2', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_class`
--

CREATE TABLE IF NOT EXISTS `st_class` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'unique ID of Class',
  `course_id` int(11) NOT NULL COMMENT 'Programme of Study',
  `title` varchar(255) NOT NULL COMMENT 'Special Identification of Class',
  `class_size` int(11) NOT NULL COMMENT 'Class Population',
  `class_examtable` int(11) NOT NULL,
  `class_timetable` int(11) NOT NULL,
  `complete_status` int(11) NOT NULL COMMENT 'Completion Status',
  `start_year` date NOT NULL COMMENT 'Start of Class group',
  `end_year` date NOT NULL COMMENT 'End of Class group',
  `class_rep` int(11) NOT NULL COMMENT 'Class Captain''s ID',
  `profile_pic` text NOT NULL COMMENT 'Class group photo - Multiple photos',
  `form_status` int(11) NOT NULL COMMENT 'Current Class Form - increases every year',
  `class_patron` int(11) NOT NULL COMMENT 'Assigned tutor for Class or Patron',
  `meta` text NOT NULL COMMENT 'Extra Data goes here..',
  `visibility` int(11) NOT NULL COMMENT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Classes and groups -- Account Should be deactivated after july 1st' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `st_class`
--

INSERT INTO `st_class` (`id`, `course_id`, `title`, `class_size`, `class_examtable`, `class_timetable`, `complete_status`, `start_year`, `end_year`, `class_rep`, `profile_pic`, `form_status`, `class_patron`, `meta`, `visibility`) VALUES
(1, 1, 'Business 2 Titans', 56, 0, 0, 0, '2014-12-01', '2017-12-01', 1, '', 3, 2, '1,2,3,4,5,6', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_course`
--

CREATE TABLE IF NOT EXISTS `st_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `short_name` varchar(255) NOT NULL COMMENT 'Short name of Course',
  `title` varchar(255) NOT NULL,
  `date_added` date NOT NULL COMMENT 'Date Course was added',
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `st_course`
--

INSERT INTO `st_course` (`id`, `short_name`, `title`, `date_added`, `visibility`) VALUES
(1, '', 'Business 1', '0000-00-00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_payment`
--

CREATE TABLE IF NOT EXISTS `st_payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL COMMENT 'Payment description or Bill',
  `pay_type` int(11) NOT NULL COMMENT '0 is payment, 1 is bill',
  `paid_bill` int(11) NOT NULL COMMENT 'Bill Paid',
  `amount` int(11) NOT NULL COMMENT 'Amount Issued',
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `st_record`
--

CREATE TABLE IF NOT EXISTS `st_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `age` int(11) NOT NULL,
  `gender` varchar(1) NOT NULL,
  `hometown` varchar(200) NOT NULL,
  `locality` varchar(150) NOT NULL,
  `house_no` varchar(150) NOT NULL,
  `personal_phone` int(11) NOT NULL,
  `region` varchar(150) NOT NULL,
  `nationality` varchar(150) NOT NULL,
  `father_name` text NOT NULL,
  `father_occupa` varchar(200) NOT NULL,
  `father_phone` int(11) NOT NULL,
  `mother_name` text NOT NULL,
  `mother_occupa` varchar(200) NOT NULL,
  `mother_phone` int(11) NOT NULL,
  `emergency_phone` int(11) NOT NULL,
  `blood_group` varchar(10) NOT NULL,
  `physical_disability` varchar(100) NOT NULL,
  `languages_spoken` varchar(255) NOT NULL,
  `mother_tongue` varchar(100) NOT NULL,
  `residence_address` varchar(200) NOT NULL,
  `photo` text NOT NULL,
  `past_school` varchar(200) NOT NULL,
  `past_aggregate` int(11) NOT NULL,
  `past_completion` date NOT NULL,
  `admission_date` date NOT NULL,
  `admission_no` varchar(200) NOT NULL COMMENT 'Admission Number',
  `admission_house` varchar(150) NOT NULL COMMENT 'House of Affliation',
  `graduation_date` date NOT NULL,
  `fail_analysis` int(11) NOT NULL COMMENT 'Number of Fails for repetition',
  `class_id` int(11) NOT NULL COMMENT 'Class Group ID',
  `meta` text NOT NULL COMMENT 'Extra Info like Groups, Prefects...',
  `residence_status` int(11) NOT NULL DEFAULT '0' COMMENT 'Status of Student,0 is boarder, 1 is day',
  `repeat_status` int(11) NOT NULL COMMENT 'Repeat Status, 0 is not repeated, 1 is repeated in previous Form_status',
  `affliated_house` varchar(200) NOT NULL COMMENT 'Assigned House',
  `username` varchar(150) NOT NULL,
  `password` varchar(100) NOT NULL,
  `token` varchar(150) NOT NULL,
  `index_no` int(20) NOT NULL,
  `visibility` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `st_record`
--

INSERT INTO `st_record` (`id`, `first_name`, `middle_name`, `last_name`, `dob`, `age`, `gender`, `hometown`, `locality`, `house_no`, `personal_phone`, `region`, `nationality`, `father_name`, `father_occupa`, `father_phone`, `mother_name`, `mother_occupa`, `mother_phone`, `emergency_phone`, `blood_group`, `physical_disability`, `languages_spoken`, `mother_tongue`, `residence_address`, `photo`, `past_school`, `past_aggregate`, `past_completion`, `admission_date`, `admission_no`, `admission_house`, `graduation_date`, `fail_analysis`, `class_id`, `meta`, `residence_status`, `repeat_status`, `affliated_house`, `username`, `password`, `token`, `index_no`, `visibility`) VALUES
(1, 'Rita', 'Adjo', 'Agbesi', '1989-02-28', 27, 'm', 'Enchi', 'Salem', 'HSE 12, KM Hood', 277675089, 'Western', 'Ghanaian', 'Moses Agbesi', 'Farmer', 245776265, 'Comfort Agbesi', 'Trader', 501336174, 245776265, 'AB-', 'None', 'English,Twi,Dandme,Fante', 'Twi', 'Opposite Ogorwu House', 'assets/images/student/201414021.jpg', 'New Life International School', 14, '2016-05-05', '2016-02-03', 'GHSD/14/546', '', '2019-05-03', 5, 1, '', 1, 0, '', 'ebenezerkb.ackah', 'kiblee007', '41329275', 30601021, 1),
(2, 'Johnson', 'Brown', 'Yeboah', '2015-03-24', 32, 'm', 'fring', 'fring', 'dfdsfs', 277675089, 'Greater Accra', 'Ghana', 'Man', 'Farmer', 245776265, 'Emelia', 'Trader', 27766765, 23232323, 'O-', 'None', 'twi', 'twi', 'Agbbogba', 'assets/images/avatar.jpg', 'Presec', 21, '2016-05-04', '2016-05-15', 'GHSD56', '', '2016-05-30', 3, 1, 'none', 0, 0, '', 'berma.fijey', 'kiblee007', '20202020', 20202020, 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_repeat`
--

CREATE TABLE IF NOT EXISTS `st_repeat` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `academ_final` int(11) NOT NULL COMMENT 'Final Term 3 - Academ code',
  `academ_final_year` year(4) NOT NULL COMMENT 'Final Term 3 - Year',
  `form_status` int(11) NOT NULL COMMENT 'Current Form_Status',
  `repeat_to` int(11) NOT NULL COMMENT 'Repeat to Form_status',
  `sack_status` int(11) NOT NULL COMMENT 'Sacking of Student, 0 is repeat, 1 is sack',
  `meta` text NOT NULL COMMENT 'Extra Details',
  `visibility` int(11) NOT NULL COMMENT 'Visibility'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Repeated Students';

-- --------------------------------------------------------

--
-- Table structure for table `st_result`
--

CREATE TABLE IF NOT EXISTS `st_result` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_30` float NOT NULL,
  `exam_70` float NOT NULL,
  `total_100` float NOT NULL,
  `class_100` float NOT NULL,
  `exam_100` float NOT NULL,
  `grade_id` int(11) NOT NULL COMMENT 'Grading ID',
  `grade_cat` int(11) NOT NULL COMMENT 'Grading Type ex: WASSCE or SSCE',
  `result_type` int(11) NOT NULL,
  `academ` int(11) NOT NULL,
  `form_status` int(11) NOT NULL COMMENT 'Form_Status of Student for Academ',
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `certify_status` int(11) NOT NULL,
  `complete_status` int(11) NOT NULL,
  `meta` text NOT NULL,
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Results Database' AUTO_INCREMENT=49 ;

--
-- Dumping data for table `st_result`
--

INSERT INTO `st_result` (`id`, `class_30`, `exam_70`, `total_100`, `class_100`, `exam_100`, `grade_id`, `grade_cat`, `result_type`, `academ`, `form_status`, `subject_id`, `class_id`, `student_id`, `certify_status`, `complete_status`, `meta`, `visibility`) VALUES
(1, 23.45, 34.5, 57.95, 0, 0, 0, 1, 0, 3, 1, 1, 1, 2, 0, 0, '', 1),
(2, 5, 20, 25, 0, 0, 0, 1, 0, 3, 1, 1, 1, 1, 0, 0, '', 1),
(4, 24, 34, 58, 0, 0, 6, 1, 0, 3, 1, 1, 1, 1, 0, 0, '', 1),
(7, 20, 42, 62, 0, 0, 5, 1, 0, 3, 1, 1, 1, 2, 1, 0, '', 1),
(8, 20, 54, 74, 0, 0, 3, 1, 0, 2, 1, 3, 1, 1, 1, 0, '', 1),
(10, 24, 65, 89, 0, 0, 1, 1, 0, 3, 1, 1, 1, 0, 0, 0, '', 0),
(12, 21, 43, 64, 0, 0, 5, 1, 0, 1, 3, 1, 1, 2, 1, 0, '', 1),
(13, 25, 54, 79, 0, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1, 0, '', 1),
(14, 22, 50, 72, 0, 0, 3, 1, 0, 1, 3, 3, 1, 2, 1, 0, '', 1),
(15, 28, 65, 93, 0, 0, 1, 1, 0, 1, 3, 4, 1, 2, 1, 0, '', 1),
(16, 30, 34, 64, 0, 0, 5, 1, 0, 1, 3, 1, 1, 1, 1, 0, '', 1),
(17, 4, 56, 60, 0, 0, 5, 1, 0, 1, 3, 2, 1, 1, 1, 0, '', 1),
(18, 27, 69, 96, 0, 0, 1, 1, 0, 1, 3, 4, 1, 1, 1, 0, '', 1),
(19, 28, 65, 93, 0, 0, 0, 1, 0, 1, 3, 4, 1, 2, 1, 0, '', 1),
(20, 20, 34, 54, 0, 0, 0, 1, 0, 1, 3, 1, 1, 1, 1, 0, '', 1),
(21, 4, 56, 60, 0, 0, 0, 1, 0, 1, 3, 2, 1, 1, 1, 0, '', 1),
(22, 27, 69, 96, 0, 0, 0, 1, 0, 1, 3, 4, 1, 1, 1, 0, '', 1),
(23, 20, 43, 63, 0, 0, 5, 1, 0, 1, 3, 5, 1, 2, 1, 0, '', 1),
(24, 27, 52, 79, 0, 0, 2, 1, 0, 1, 3, 6, 1, 2, 1, 0, '', 1),
(25, 21, 45, 66, 0, 0, 4, 1, 0, 1, 3, 5, 1, 1, 1, 0, '', 1),
(26, 29, 64, 93, 0, 0, 1, 1, 0, 1, 3, 6, 1, 1, 1, 0, '', 1),
(27, 21, 43, 64, 0, 0, 0, 1, 0, 3, 3, 2, 1, 2, 1, 0, '', 1),
(28, 12, 21, 33, 0, 0, 0, 1, 0, 3, 3, 3, 1, 2, 1, 0, '', 1),
(29, 30, 45, 75, 0, 0, 0, 1, 0, 3, 3, 4, 1, 2, 1, 0, '', 1),
(30, 25, 53, 78, 0, 0, 0, 1, 0, 3, 3, 5, 1, 2, 1, 0, '', 1),
(31, 26, 56, 82, 0, 0, 0, 1, 0, 3, 3, 6, 1, 2, 1, 0, '', 1),
(32, 26, 54, 80, 0, 0, 0, 1, 0, 3, 3, 2, 1, 1, 1, 0, '', 1),
(33, 24, 65, 89, 0, 0, 0, 1, 0, 3, 3, 3, 1, 1, 1, 0, '', 1),
(34, 5, 45, 50, 0, 0, 0, 1, 0, 3, 3, 4, 1, 1, 1, 0, '', 1),
(35, 23, 45, 68, 0, 0, 0, 1, 0, 3, 3, 5, 1, 1, 1, 0, '', 1),
(36, 23, 34, 57, 0, 0, 0, 1, 0, 3, 3, 6, 1, 1, 1, 0, '', 1),
(37, 20, 45, 65, 0, 0, 0, 1, 0, 2, 3, 1, 1, 2, 1, 0, '', 1),
(38, 25, 0, 25, 0, 0, 0, 1, 0, 2, 3, 2, 1, 2, 1, 0, '', 1),
(39, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 3, 1, 2, 1, 0, '', 1),
(40, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1, 2, 1, 0, '', 1),
(41, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 5, 1, 2, 1, 0, '', 1),
(42, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 6, 1, 2, 1, 0, '', 1),
(43, 1, 56, 57, 0, 0, 0, 1, 0, 2, 3, 1, 1, 1, 1, 0, '', 1),
(44, 25, 0, 25, 0, 0, 0, 1, 0, 2, 3, 2, 1, 1, 1, 0, '', 1),
(45, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 3, 1, 1, 1, 0, '', 1),
(46, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1, 1, 1, 0, '', 1),
(47, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 5, 1, 1, 1, 0, '', 1),
(48, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 6, 1, 1, 1, 0, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_subject`
--

CREATE TABLE IF NOT EXISTS `st_subject` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `type` int(11) NOT NULL DEFAULT '0' COMMENT 'Subject Type - 0 is Core, 1 is Elective',
  `date_added` date NOT NULL,
  `visibility` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `st_subject`
--

INSERT INTO `st_subject` (`id`, `title`, `type`, `date_added`, `visibility`) VALUES
(1, 'English Language', 0, '2016-05-01', 1),
(2, 'Core Mathematics', 0, '2016-05-03', 1),
(3, 'Social Studies', 0, '2016-05-04', 1),
(4, 'Integrated Science', 0, '2016-05-10', 1),
(5, 'Information & Technology (ICT)', 0, '2016-05-04', 1),
(6, 'Physical Education (PE)', 0, '2016-05-02', 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_timetable`
--

CREATE TABLE IF NOT EXISTS `st_timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `academ` int(11) NOT NULL COMMENT 'Academic Year & Term ID',
  `form_status` int(11) NOT NULL COMMENT 'Applied Form_status',
  `table_type` int(11) NOT NULL COMMENT '0 is class timetable, 1 is exam timetable',
  `title` varchar(200) NOT NULL,
  `html_content` text NOT NULL,
  `class_id` int(11) NOT NULL COMMENT 'Class to assign timetable to.',
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Timetable System' AUTO_INCREMENT=4 ;

--
-- Dumping data for table `st_timetable`
--

INSERT INTO `st_timetable` (`id`, `academ`, `form_status`, `table_type`, `title`, `html_content`, `class_id`, `visibility`) VALUES
(1, 3, 3, 1, 'Form 3 Term 1 - Exam Timetable', '																																				<table class="table">\r\n																																					<thead>\r\n																																						<tr>\r\n																																							<th>&nbsp;</th>\r\n																																							<th>Morning Paper<br/><em>9:00am - 11:30am</em></th>\r\n																																							<th>Afternoon Paper<br/><em>1:00pm - 2:30pm</em></th>																																																\r\n																																						</tr>\r\n																																					</thead>\r\n																																					<tbody>\r\n																																						<tr>\r\n																																							<th>Monday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths<br> English <br>Accounting</th>\r\n																																							<th>General Agric.</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Tuesday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Wednesday<br><em>30-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Thursday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Friday<br>1-05-2016</th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																					</tbody>\r\n																																				</table>\r\n', 0, 1),
(2, 3, 2, 1, 'Form 2 Term 1 - Exam Timetable', '																																				<table class="table">\r\n																																					<thead>\r\n																																						<tr>\r\n																																							<th>&nbsp;</th>\r\n																																							<th>Morning Paper<br/><em>9:00am - 11:30am</em></th>\r\n																																							<th>Afternoon Paper<br/><em>1:00pm - 2:30pm</em></th>																																																\r\n																																						</tr>\r\n																																					</thead>\r\n																																					<tbody>\r\n																																						<tr>\r\n																																							<th>Monday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths<br> English <br>Accounting</th>\r\n																																							<th>General Agric.</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Tuesday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Wednesday<br><em>30-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Thursday<br><em>31-04-2016<em/></th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																						<tr>\r\n																																							<th>Friday<br>1-05-2016</th>\r\n																																							<th>Core Maths</th>\r\n																																							<th>Core Maths</th>																								\r\n																																						</tr>	\r\n																																					</tbody>\r\n																																				</table>\r\n', 0, 1),
(3, 3, 3, 0, 'Class Timetable', '<table class="table">\r\n																						<thead>\r\n																							<tr>\r\n																								<th>&nbsp;</th>\r\n																								<th>1-PRD<br/><em>8:30am-9:10am</em></th>\r\n																								<th>1-PRD<br/><em>9:10am-9:50am</em></th>\r\n																								<th>1-PRD<br/><em>9:50am-10:30am</em></th>\r\n																								<th>20<br>mins</th>\r\n																								<th>1-PRD<br/><em>10:50am-11:30am</em></th>\r\n																								<th>1-PRD<br/><em>11:30am-12:10pm</em></th>\r\n																								<th>1-PRD<br/><em>12:10pm-12:50pm</em></th>\r\n																								<th>1-PRD<br/><em>12:50pm-1:30am</em></th>\r\n																								<th>30<br>min</th>\r\n																								<th>1-PRD<br/><em>8:30am-9:10am</em></th>\r\n																								<th>1-PRD<br/><em>8:30am-9:10am</em></th>																								\r\n																							</tr>\r\n																						</thead>\r\n																						<tbody>\r\n																							<tr>\r\n																								<th>MON</th>\r\n																								<th>Core Maths</th>\r\n																								<th>Core Maths</th>\r\n																								<th>English Lang.</th>\r\n																								<th>B</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>L</th>\r\n																								<th>Social Studies</th>\r\n																								<th>Social Studies</th>	\r\n																							</tr>	\r\n																							<tr>\r\n																								<th>TUE</th>\r\n																								<th>Core Maths</th>\r\n																								<th>Core Maths</th>\r\n																								<th>English Lang.</th>\r\n																								<th>R</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>U</th>\r\n																								<th>Social Studies</th>\r\n																								<th>Social Studies</th>	\r\n																							</tr>	\r\n																							<tr>\r\n																								<th>WED</th>\r\n																								<th>Core Maths</th>\r\n																								<th>Core Maths</th>\r\n																								<th>English Lang.</th>\r\n																								<th>E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>N</th>\r\n																								<th>Social Studies</th>\r\n																								<th>Social Studies</th>	\r\n																							</tr>	\r\n																							<tr>\r\n																								<th>THUR</th>\r\n																								<th>Core Maths</th>\r\n																								<th>Core Maths</th>\r\n																								<th>English Lang.</th>\r\n																								<th>A</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>C</th>\r\n																								<th>Social Studies</th>\r\n																								<th>Social Studies</th>	\r\n																							</tr>	\r\n																							<tr>\r\n																								<th>FRI</th>\r\n																								<th>Core Maths</th>\r\n																								<th>Core Maths</th>\r\n																								<th>English Lang.</th>\r\n																								<th>K</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>P.E</th>\r\n																								<th>H</th>\r\n																								<th>Social Studies</th>\r\n																								<th>Social Studies</th>	\r\n																							</tr>	\r\n																						</tbody>\r\n																					</table>', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `st_token`
--

CREATE TABLE IF NOT EXISTS `st_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(200) NOT NULL,
  `title` varchar(255) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `academ` int(11) NOT NULL,
  `date_created` date NOT NULL,
  `visibility` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Exam Markers tokens' AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
