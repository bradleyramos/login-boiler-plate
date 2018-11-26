-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bradatabase
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bradatabase
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bradatabase` DEFAULT CHARACTER SET utf8 ;
USE `bradatabase` ;

-- -----------------------------------------------------
-- Table `bradatabase`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bradatabase`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first name` VARCHAR(45) NULL,
  `last name` VARCHAR(45) NULL,
  `email` TEXT NULL,
  `phone number` TEXT NULL,
  `password` TEXT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bradatabase`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bradatabase`.`messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_messages_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_messages_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `bradatabase`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;