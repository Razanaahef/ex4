// Majd Saad 315685586, Razan Abo alhija 322509118.
let express = require("express");
let app = express();
let path = require("path");
const PORT = 3000;
const fs = require("fs");
const fs1 = require("fs").promises;
const mysql = require("mysql");
// set the view engine to ejs
app.set("view engine", "ejs");
// set the public file folder to public
app.use(express.static(path.join(__dirname, "public")));

//Init mysql connection with all the details
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "profiles",
});

//Connect to the mysql database using the connection above
connection.connect((error) => {
  console.log("Successfully connected to the database.");
});

app.get("/profile", async function (req, res) {
  // returns ejs object when gets profile request
  let id = req.query.id; // get the if from the request
  let title = "";
  let bioText = "";
  let titleDescribtion = "";
  console.log("the following user has been connected to the server " + id);
  //Query the profile title text and description from title table
  connection.query(
    `SELECT * FROM title WHERE profile = ?`,
    [id],
    (error, results, fields) => {
      //Handle empty results
      if (results.length === 0) return;
      //Take the first data row
      const profileData = results[0];
      titleDescribtion = profileData.long_text;
      title = profileData.title;

      //read the bio text file - NOT IN THE MYSQL DATABASE
      bioText = fs.readFileSync(
        path.join(__dirname, "private", id, "bio.txt"),
        "utf8"
      );
      // init a list that will get all bio text.
      let bioList = [];
      //split by lines
      let lines = bioText.split("\n");
      lines.forEach((line) => {
        const index = line.indexOf(":");
        let bio = {
          bioKey: line.substring(0, index),
          bioData: line.substring(index + 1),
        };
        bioList.push(bio);
      });

      let filteredFiles = [];
      //Query the endorsments data by recommend and recommender from text table
      connection.query(
        `SELECT * FROM text WHERE profile = ?`,
        [id],
        (error, results, fields) => {
          results.forEach((data) => {
            //Mapping the text to filteredFiles
            filteredFiles.push({
              recommend: data.long_text,
              recommender: data.signature,
            });
          });

          let files = [];
          //Query the profiles names from title table
          connection.query(
            `SELECT profile FROM title`,
            (error, results, fields) => {
              //Mapping the names to files
              for (let index = 0; index < results.length; index++) {
                const text = results[index];
                files.push(text.profile);
              }

              res.render("profile", {
                id,
                title,
                titleDescribtion,
                bioList: bioList,
                filteredFiles: filteredFiles,
                friends: files,
              });
            }
          );
        }
      );
    }
  );
});

app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
