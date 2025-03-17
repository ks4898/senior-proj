DROP DATABASE IF EXISTS TournamentDB;
CREATE DATABASE TournamentDB;
USE TournamentDB;

DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    CreateDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Tournaments;
CREATE TABLE Tournaments (
    TournamentID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Location VARCHAR(255) NOT NULL,
    Status VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS University;
CREATE TABLE University (
    UniversityID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Location VARCHAR(255),
    Founded VARCHAR(255),
    Emblem VARCHAR(255),
    ImageURL VARCHAR(255),
    Description TEXT,
    Link TEXT
);

DROP TABLE IF EXISTS Teams;
CREATE TABLE Teams (
    TeamID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    UniversityID INT,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UniversityID) REFERENCES University(UniversityID)
);

DROP TABLE IF EXISTS Matches;
CREATE TABLE Matches (
    MatchID INT PRIMARY KEY AUTO_INCREMENT,
    TournamentID INT,
    Team1ID INT,
    Team2ID INT,
    MatchDate DATETIME NOT NULL,
    ScoreTeam1 INT DEFAULT 0,
    ScoreTeam2 INT DEFAULT 0,
    WinnerID INT,
    FOREIGN KEY (TournamentID) REFERENCES Tournaments(TournamentID),
    FOREIGN KEY (Team1ID) REFERENCES Teams(TeamID),
    FOREIGN KEY (Team2ID) REFERENCES Teams(TeamID),
    FOREIGN KEY (WinnerID) REFERENCES Teams(TeamID)
);

DROP TABLE IF EXISTS Registrations;
CREATE TABLE Registrations (
    RegistrationID INT PRIMARY KEY AUTO_INCREMENT,
    TournamentID INT,
    UserID INT,
    TeamID INT,
    FOREIGN KEY (TournamentID) REFERENCES Tournaments(TournamentID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID)
);

DROP TABLE IF EXISTS SuperAdmins;
CREATE TABLE SuperAdmins (
    SuperAdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

DROP TABLE IF EXISTS Admins;
CREATE TABLE Admins (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

DROP TABLE IF EXISTS Moderators;
CREATE TABLE Moderators (
    ModeratorID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

DROP TABLE IF EXISTS CollegeRep;
CREATE TABLE CollegeRep (
    CollegeRepID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

DROP TABLE IF EXISTS Players;
CREATE TABLE Players (
    PlayerID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE,
    Role VARCHAR(50) NOT NULL,
    ImageURL VARCHAR(255),
    ValidStudent BOOLEAN DEFAULT FALSE,
    TeamID INT,
    PayedFee BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID)
);

DROP TABLE IF EXISTS Schedule;
CREATE TABLE Schedule (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    MatchID INT,
    ScheduledDate DATETIME NOT NULL,
    FOREIGN KEY (MatchID) REFERENCES Matches(MatchID)
);

DROP TABLE IF EXISTS Posts;
CREATE TABLE Posts (
    PostID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    TextPosted TEXT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);


SELECT * FROM Users;

/*DELETE FROM University WHERE UniversityID = 3;*/
INSERT INTO University (Name, Location, Founded, Emblem, ImageURL, Description) VALUES ("Kyoto University","Kyoto, Japan","June 18, 1897","/media/img/kyoto.png","/media/img/kyoto-university.jpg","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.");
INSERT INTO University (Name, Location, Founded, Emblem, ImageURL, Description) VALUES ("U Pontificia Universidad Catolica de Chile","Santiago, Chile","June 21, 1888","/media/img/chile.png","/media/img/chile-university.jpg","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.");
INSERT INTO University (Name, Location, Founded, Emblem, ImageURL, Description) VALUES ("Indian Institute of Technology","Delhi, India","August 17, 1961","/media/img/india.png","/media/img/india-university.jpg","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.");
SELECT * FROM University;

INSERT INTO Teams (Name, UniversityID) VALUES
("Team Kyoto", (SELECT UniversityID FROM University WHERE Name = "Kyoto University")),
("Team Chile", (SELECT UniversityID FROM University WHERE Name = "U Pontificia Universidad Catolica de Chile")),
("Team India", (SELECT UniversityID FROM University WHERE Name = "Indian Institute of Technology"));
SELECT * FROM Teams;

SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO Players (UserID, Role, ImageURL, ValidStudent, TeamID) VALUES
(1, "Leader", "/media/img/student black-male-ge3ccaa24c_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto")),
(2, "Member", "/media/img/student student-g3ad8fc5db_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto")),
(3, "Leader", "/media/img/student young-man-g13d37ca5c_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team Chile")),
(4, "Member", "/media/img/student woman-g39958ff5b_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team Chile")),
(5, "Leader", "/media/img/student woman-g7b42a69a8_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team India")),
(6, "Member", "/media/img/student boy-g2ba3e74a1_1280.jpg", TRUE, (SELECT TeamID FROM Teams WHERE Name = "Team India"));
DELETE FROM Players WHERE UserID >=0;
SELECT * FROM Players;

INSERT INTO Users (Name, Email, Password, Role) VALUES
('Tim', 'tim@example.com', 'password123', 'Player'),
('Bob', 'bob@example.com', 'password123', 'Player'),
('Alex', 'alex@example.com', 'password123', 'Player'),
('Jordan', 'jordan@example.com', 'password123', 'Player'),
('Sam', 'sam@example.com', 'password123', 'Player'),
('Charles', 'charles@example.com', 'password123', 'Player');
DELETE FROM Users WHERE UserID >=0;
SELECT * FROM Users;
UPDATE Users SET Role = "SuperAdmin" WHERE UserID = 7;

UPDATE Players SET UserID = 1 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto");
UPDATE Players SET UserID = 2 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto");
UPDATE Players SET UserID = 3 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team Chile");
UPDATE Players SET UserID = 4 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team Chile");
UPDATE Players SET UserID = 5 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team India");
UPDATE Players SET UserID = 6 WHERE TeamID = (SELECT TeamID FROM Teams WHERE Name = "Team India");

INSERT INTO Matches (MatchID, TournamentID, Team1ID, Team2ID, MatchDate, ScoreTeam1, ScoreTeam2, WinnerID) VALUES
(1, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-01 18:00:00', 0, 0, NULL),
(2, 1, (SELECT TeamID FROM Teams WHERE Name = "Team India"), (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), '2025-04-02 20:00:00', 0, 0, NULL),
(3, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), (SELECT TeamID FROM Teams WHERE Name = "Team India"), '2025-04-03 16:00:00', 0, 0, NULL);

INSERT INTO Matches (MatchID, TournamentID, Team1ID, Team2ID, MatchDate, ScoreTeam1, ScoreTeam2, WinnerID) VALUES
(4, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-04 18:00:00', 0, 0, NULL),
(5, 1, (SELECT TeamID FROM Teams WHERE Name = "Team India"), (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), '2025-04-05 20:00:00', 0, 0, NULL),
(6, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), (SELECT TeamID FROM Teams WHERE Name = "Team India"), '2025-04-06 16:00:00', 0, 0, NULL);

INSERT INTO Matches (MatchID, TournamentID, Team1ID, Team2ID, MatchDate, ScoreTeam1, ScoreTeam2, WinnerID) VALUES
(7, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-07 18:00:00', 0, 0, NULL),
(8, 1, (SELECT TeamID FROM Teams WHERE Name = "Team India"), (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), '2025-04-08 20:00:00', 0, 0, NULL),
(9, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), (SELECT TeamID FROM Teams WHERE Name = "Team India"), '2025-04-09 16:00:00', 0, 0, NULL);

INSERT INTO Matches (MatchID, TournamentID, Team1ID, Team2ID, MatchDate, ScoreTeam1, ScoreTeam2, WinnerID) VALUES
(10, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-10 18:00:00', 0, 0, NULL),
(11, 1, (SELECT TeamID FROM Teams WHERE Name = "Team India"), (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), '2025-04-11 20:00:00', 0, 0, NULL),
(12, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), (SELECT TeamID FROM Teams WHERE Name = "Team India"), '2025-04-12 16:00:00', 0, 0, NULL);

INSERT INTO Matches (MatchID, TournamentID, Team1ID, Team2ID, MatchDate, ScoreTeam1, ScoreTeam2, WinnerID) VALUES
(13, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-13 18:00:00', 0, 0, NULL),
(14, 1, (SELECT TeamID FROM Teams WHERE Name = "Team India"), (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), '2025-04-14 20:00:00', 0, 0, NULL),
(15, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), (SELECT TeamID FROM Teams WHERE Name = "Team India"), '2025-04-15 16:00:00', 0, 0, NULL),
(16, 1, (SELECT TeamID FROM Teams WHERE Name = "Team Kyoto"), (SELECT TeamID FROM Teams WHERE Name = "Team Chile"), '2025-04-16 18:00:00', 0, 0, NULL);

INSERT INTO Schedule (ScheduleID, MatchID, ScheduledDate) VALUES
(1, 1, '2025-04-01 18:00:00'),
(2, 2, '2025-04-02 20:00:00'),
(3, 3, '2025-04-03 16:00:00');

INSERT INTO Schedule (ScheduleID, MatchID, ScheduledDate) VALUES
(4, 4, '2025-04-04 18:00:00'),
(5, 5, '2025-04-05 20:00:00'),
(6, 6, '2025-04-06 16:00:00');

INSERT INTO Schedule (ScheduleID, MatchID, ScheduledDate) VALUES
(7, 7, '2025-04-07 18:00:00'),
(8, 8, '2025-04-08 20:00:00'),
(9, 9, '2025-04-09 16:00:00');

INSERT INTO Schedule (ScheduleID, MatchID, ScheduledDate) VALUES
(10, 10, '2025-04-10 18:00:00'),
(11, 11, '2025-04-11 20:00:00'),
(12, 12, '2025-04-12 16:00:00');

INSERT INTO Schedule (ScheduleID, MatchID, ScheduledDate) VALUES
(13, 13, '2025-04-13 18:00:00'),
(14, 14, '2025-04-14 20:00:00'),
(15, 15, '2025-04-15 16:00:00'),
(16, 16, '2025-04-16 16:00:00');

SELECT * FROM Schedule;

SELECT s.ScheduleID, m.MatchID, m.Team1ID, m.Team2ID, s.ScheduledDate
FROM Schedule s
JOIN Matches m ON s.MatchID = m.MatchID;




