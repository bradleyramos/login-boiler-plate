-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema heroku_b33d2ac8d7f51dc
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema heroku_b33d2ac8d7f51dc
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `heroku_b33d2ac8d7f51dc` DEFAULT CHARACTER SET utf8 ;
USE `heroku_b33d2ac8d7f51dc` ;

-- -----------------------------------------------------
-- Table `heroku_b33d2ac8d7f51dc`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `heroku_b33d2ac8d7f51dc`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NULL,
  `last_name` VARCHAR(45) NULL,
  `email` TEXT NULL,
  `phone_number` TEXT NULL,
  `password` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `heroku_b33d2ac8d7f51dc`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `heroku_b33d2ac8d7f51dc`.`messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_messages_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_messages_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `heroku_b33d2ac8d7f51dc`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `heroku_b33d2ac8d7f51dc`.`friendships`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `heroku_b33d2ac8d7f51dc`.`friendships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `friend_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_friendships_users1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_friendships_users2_idx` (`friend_id` ASC) VISIBLE,
  CONSTRAINT `fk_friendships_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `heroku_b33d2ac8d7f51dc`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_friendships_users2`
    FOREIGN KEY (`friend_id`)
    REFERENCES `heroku_b33d2ac8d7f51dc`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
