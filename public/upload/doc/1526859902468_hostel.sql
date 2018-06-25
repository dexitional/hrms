-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 11, 2018 at 08:57 PM
-- Server version: 5.7.19
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `hostel`
--
CREATE DATABASE `hostel` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `hostel`;

-- --------------------------------------------------------

--
-- Table structure for table `book`
--

CREATE TABLE IF NOT EXISTS `book` (
  `id` int(11) NOT NULL COMMENT 'Identification',
  `room_id` int(11) DEFAULT NULL COMMENT 'Room Identification',
  `book_date` date DEFAULT NULL COMMENT 'Book Date of Hostel Room',
  `entry_date` date DEFAULT NULL COMMENT 'Expected Date of Reporting ',
  `exit_date` date DEFAULT NULL COMMENT 'Expected Date of Exit',
  `pay_status` enum('0','1') DEFAULT NULL COMMENT 'Payment Status',
  `verified` enum('0','1') DEFAULT NULL COMMENT 'Payment Verified By Manager',
  `member_id` int(11) DEFAULT NULL COMMENT 'Member Identification',
  `token` varchar(100) DEFAULT NULL COMMENT 'Token of Transaction'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Booked Rooms or Transactions of Hostel';

-- --------------------------------------------------------

--
-- Table structure for table `hostel`
--

CREATE TABLE IF NOT EXISTS `hostel` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `name` varchar(300) DEFAULT NULL COMMENT 'Name of Hostel',
  `desc` text COMMENT 'Full Description of Hostel',
  `facility` text COMMENT 'Facilites',
  `location` varchar(300) DEFAULT NULL COMMENT 'Location of Hostel',
  `address` text COMMENT 'Address of Hostel',
  `email` varchar(255) DEFAULT NULL COMMENT 'E-mail Address of Hostel',
  `mobile` int(10) unsigned zerofill DEFAULT NULL COMMENT 'Mobile Contact of Hostel',
  `office` int(10) unsigned zerofill DEFAULT NULL COMMENT 'Office Contact of Hostel',
  `img1` varchar(350) DEFAULT NULL COMMENT 'First Image of Hostel',
  `img2` varchar(350) DEFAULT NULL COMMENT 'Second Image of Hostel',
  `img3` varchar(350) DEFAULT NULL COMMENT 'Third Image of Hostel',
  `manager_id` int(11) DEFAULT NULL COMMENT 'Manger of Hostel Identification',
  `active` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE IF NOT EXISTS `member` (
  `id` int(11) NOT NULL COMMENT 'Ide',
  `name` varchar(350) DEFAULT NULL COMMENT 'Name of Hostel Member',
  `mobile` int(10) unsigned zerofill DEFAULT NULL COMMENT 'Mobile Contact of Member',
  `email` varchar(200) DEFAULT NULL COMMENT 'Email Address of Member',
  `username` varchar(50) DEFAULT NULL COMMENT 'Username',
  `password` varchar(50) DEFAULT NULL COMMENT 'Password',
  `active` enum('0','1') DEFAULT '1' COMMENT 'Active Status'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Members of Hostel Data';

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE IF NOT EXISTS `room` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `hostel_id` int(11) DEFAULT NULL COMMENT 'Hostel Identification',
  `room` int(11) DEFAULT NULL COMMENT 'Room Number',
  `desc` int(11) DEFAULT NULL COMMENT 'Room Description',
  `img` int(11) DEFAULT NULL COMMENT 'Image of Room',
  `price` int(11) DEFAULT NULL COMMENT 'Rent Cost in GHC',
  `occupa_state` int(11) DEFAULT NULL COMMENT 'Number of Current Members',
  `occupa_full` int(11) DEFAULT NULL COMMENT 'Full Capacity Number',
  `members` int(11) DEFAULT NULL COMMENT 'IDs of Members in Room',
  `active` enum('0','1') DEFAULT NULL COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Rooms Data ' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identification',
  `name` varchar(350) DEFAULT NULL COMMENT 'Full Name of Manager',
  `mobile` int(10) unsigned zerofill DEFAULT NULL COMMENT 'Mobile Contact',
  `email` varchar(200) DEFAULT NULL COMMENT 'Email Address',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `password` varchar(50) DEFAULT NULL COMMENT 'Password',
  `privilege` enum('MANAGER','ADMIN') DEFAULT 'MANAGER' COMMENT 'Privilege of User [ Hostel Manager, Administrator ]',
  `ACTIVE` enum('0','1') NOT NULL DEFAULT '1' COMMENT 'Active Status',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Users or Administrators of the System' AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
