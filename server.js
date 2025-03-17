const express = require("express"); // import express
const path = require("path"); // to resolve file and dir paths
const mysql = require("mysql2");
const bcrypt = require("bcryptjs"); // safe password encryption
const session = require("express-session");
require("dotenv").config(); // safe config
const { verifyRole } = require("./assets/js/auth.js"); // user authorization
const { body, validationResult } = require("express-validator");
require('express-async-errors');
const errorHandler = require('./assets/js/errorhandler'); // custom error handler
const helmet = require('helmet'); // for setting security-related HTTP headers
const rateLimit = require('express-rate-limit'); // for rate limiting
const createDOMPurify = require('dompurify'); // for input sanitization
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();
const port = 3000;

// secure database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets")); // serve static files from assets folder
app.use(express.static(path.join(__dirname, "public"))); // serve static files from public folder (pages)
app.use(errorHandler); // error handling middleware
app.use(helmet()); // set security-related HTTP headers

// rate limiting middleware to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,     // ensure cookie is only accessible by the server
        secure: false,      // set to true for HTTPS in production
        maxAge: 86400000,   // cookie expires in 1 day
        sameSite: 'lax'     // helps avoid issues with cross-origin cookies
    }
}));

// ======================== HOME PAGE & CHECKING ========================

// serve home page
app.get("/", (req, res) => {
    if (req.session.userId) {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    }
});

// check if user is already logged in
app.get("/login", (req, res) => {
    if (req.session.userId) {
        // user is already logged in, redirect to home page
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// same check for sign up
app.get("/signup", (req, res) => {
    if (req.session.userId) {
        // user is already logged in, redirect to home page
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// session check
app.get("/check-session", (req, res) => {
    return res.json({ loggedIn: !!req.session.userId });
});

// ======================== USER AUTHENTICATION ========================

// login route with input validation and sanitization
app.post("/login", [
    body('email').isEmail().normalizeEmail(), // Validate and normalize email format
    body('password').not().isEmpty() // Ensure password is not empty
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.execute("SELECT * FROM Users WHERE Email = ?", [email], async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password. Please retry." });
        }

        const user = results[0];
        console.log(results[0]);

        // compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password. Please retry." });
        }

        // store user info in session
        req.session.userId = user.UserID;
        req.session.username = user.Name;
        req.session.role = user.Role; // role saved to session for authorization purposes

        res.json({ message: "Login successful!" });
    });
});

// sign up route with input validation and sanitization
app.post("/signup", [
    body('username').trim().escape(), // sanitize username input 
    body('email').isEmail().normalizeEmail(), // validate and normalize email input 
    body('password').isLength({ min: 6 }) // ensure password meets length requirement 
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    db.execute("SELECT * FROM Users WHERE Email = ?", [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error. Please try again later." });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already in use. Try logging in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = "User";

        db.execute(
            "INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, ?)", 
            [username, email, hashedPassword, role], 
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database error. Please try again later." });
                }

                res.status(201).json({ message: "User registered successfully!" });
            }
        );
    });
});

// logout route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });

        res.clearCookie("connect.sid", { path: "/" });
        res.status(200).json({ success: true, message: "Logged out successfully!" });
    });
});

// ======================== COLLEGE & TEAM MANAGEMENT ========================

// route to fetch all colleges
app.get("/universities", (req, res) => {
    db.execute("SELECT * FROM University", (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results); // Send all universities as JSON
    });
});

// fetch college by id
app.get("/university", (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing college id" });
    }

    db.execute("SELECT * FROM University WHERE UniversityID = ?", [id], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "College not found" });
        }

        res.json(results[0]);
    });
});

// route to fetch all teams
app.get("/teams", (req, res) => {
    db.execute("SELECT * FROM Teams", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        
      	res.json(results); 
	});
});

// add college (Admins & SuperAdmins)
app.post("/add-college", verifyRole(["SuperAdmin", "Admin"]), [
  	body('name').trim().escape(), 
  	body('location').trim().escape()
], (req, res) => {

  	const errors = validationResult(req);
  	if (!errors.isEmpty()) { 
      	return res.status(400).json({ errors: errors.array() }); 
  	}

  	const { name, location } = req.body;

  	db.execute("INSERT INTO University (Name, Location) VALUES (?, ?)", [name, location], (err, result) => {
      	if (err) return res.status(500).json({ message: "Database error. Please try again later." });

      	res.status(201).json({ message: "College added successfully!" });
  	});
});

// edit college (Admins & SuperAdmins)
app.put("/edit-college/:collegeId", verifyRole(["SuperAdmin", "Admin"]), [
  	body('name').trim().escape(), 
  	body('location').trim().escape()
], (req, res) => {

  	const errors = validationResult(req);
  	if (!errors.isEmpty()) { 
      	return res.status(400).json({ errors: errors.array() }); 
  	}

  	const { name, location } = req.body;
  	const collegeId = req.params.collegeId;

  	db.execute("UPDATE University SET Name = ?, Location = ? WHERE UniversityID = ?", [name, location, collegeId], (err, result) => {
      	if (err) return res.status(500).json({ message: "Database error. Please try again later." });

      	res.json({ message: "College updated successfully!" });
  	});
});

// add team (SuperAdmins, Admins & CollegeReps)
app.post("/add-team", verifyRole(["SuperAdmin", "Admin", "CollegeRep"]), [
  	body('name').trim().escape(), 
  	body('universityId').isInt()
], (req, res) => {

  	const errors = validationResult(req);
  	if (!errors.isEmpty()) { 
      	return res.status(400).json({ errors: errors.array() }); 
  	}

  	const { name, universityId } = req.body;

  	db.execute("INSERT INTO Teams (Name, UniversityID) VALUES (?, ?)", [name, universityId], (err, result) => {
      	if (err) return res.status(500).json({ message: "Database error. Please try again later." });

      	res.status(201).json({ message: "Team added successfully!" });
  	});
});

// edit team (Admins & SuperAdmins)
app.put("/edit-team/:teamId", verifyRole(["SuperAdmin", "Admin"]), [
  	body('name').trim().escape()
], (req, res) => {

  	const errors = validationResult(req);
  	if (!errors.isEmpty()) { 
      	return res.status(400).json({ errors: errors.array() }); 
  	}

  	const { name } = req.body;
  	const teamId = req.params.teamId;

  	db.execute("UPDATE Teams SET Name = ? WHERE TeamID = ?", [name, teamId], (err, result) => {
      	if (err) return res.status(500).json({ message: "Database error. Please try again later." });

      	res.json({ message: "Team updated successfully!" });
  	});
});

// ======================== TOURNAMENT MANAGEMENT ========================

// sign up for a tournament with validation and sanitization on inputs
app.post("/signup-tournament", [
  	body('tournamentId').isInt(), 
  	body('teamId').optional().isInt()
], async (req, res) => {

  	const errors = validationResult(req);
  	if (!errors.isEmpty()) { 
      	return res.status(400).json({ errors: errors.array() }); 
  	}

  	const { tournamentId, teamId } = req.body;
  	const userId = req.session.userId;

	db.execute("SELECT TeamID FROM Users WHERE UserID=?", [userId], async(err,result)=>{
		if(err){
			console.log(err)
			return;
		}
		
		console.log(result);

	})
	
	db.execute(
	   `INSERT INTO Registrations(UserID,TournamentID , TeamID ) VALUES (?, ?, ?)`,
	   [userId,tournamentId , teamId || null],
	   async(err,result)=>{
	       if(err){
	           console.log(err)
	           return;
	       }
	       console.log(result);
	   }
	)

	
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

// cancel tournament sign up with validation on inputs

app.delete("/cancel-tournament-signup/:tournamentId", async(req,res)=>{
     const tournamentId=req.params.tournamentId;
     const userId=req.session.userId;

     if(!userId){
         return; 

     }


     db.execute(`SELECT * FROM Registrations WHERE TournamentID=? AND UserID=?`,[tournamentId,userId],
     async(err,result)=>{
         if(err){
             console.log(err)
             return;
         }
         console.log(result);

     })
});


// leave a team with role verification

app.delete("/leave-team", verifyRole(["Player"]), async(req,res)=>{
     const user=req.session.user;

     db.execute(`UPDATE Users SET TeamID=NULL WHERE UserID=?`,[user],
     async(err,result)=>{
         if(err){
             console.log(err)
             return;
         }
         console.log(result);

     })
});


// create a tournament with role verification

app.post("/add-tournament", verifyRole(["SuperAdmin","Admin"]), async(req,res)=>{
     const{tournamentName,startDate,endDate}=req.body;

     db.execute(`INSERT INTO Tournaments(TournamentName , StartDate , EndDate ) VALUES (?, ?, ?)`,[tournamentName,startDate,endDate],
     async(err,result)=>{
         if(err){
             console.log(err)
             return;
         }
         console.log(result);

     })
});


// ======================== SEARCH FUNCTIONALITY ========================

app.get("/search-teams", async(req,res)=>{
     const query=req.query.query; 

     if(!query){
         return; 

     }

     db.execute(`SELECT * FROM Teams WHERE Name LIKE ? OR UniversityID IN SELECT UniversityID FROM University WHERE Name LIKE ?`,[`%${query}%`,`%${query}%`],
      async(err,result)=>{
          if(err){
              console.log(err)
              return;
          }
          console.log(result);

      })
});


// ======================== TOURNAMENT EXECUTION MANAGEMENT ========================

app.post("/add-schedule", verifyRole(["SuperAdmin","Admin"]), async(req,res)=>{
     const{tournamentID,scheduleDate}=req.body;

     db.execute(`INSERT INTO Schedule(TournamentID,ScheduledDate ) VALUES (?, ?)`,[tournamentID,scheduleDate],
      async(err,result)=>{
          if(err){
              console.log(err)
              return;
          }
          console.log(result);

      })
});


// post match results 
app.post("/post-results", verifyRole(["SuperAdmin", "Admin"]), async (req, res) => {
    const { matchId, scoreTeam1, scoreTeam2 } = req.body;
  
    const winnerId = scoreTeam1 > scoreTeam2 ? 'Team1ID' : 'Team2ID';
  
    db.execute(
      `UPDATE Matches SET ScoreTeam1 = ?, ScoreTeam2 = ?, WinnerID = (SELECT ${winnerId} FROM Matches WHERE MatchID = ?) WHERE MatchID = ?`,
      [scoreTeam1, scoreTeam2, matchId, matchId],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error." });
        res.json({ message: "Results posted successfully!" });
      }
    );
  });
  

// start the server

app.listen(port);

/* app.listen(port , () =>{
console.log(`Server running on http://localhost:${port}`);
}); */
