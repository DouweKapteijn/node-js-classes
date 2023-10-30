const express = require('express');
const mysql = require('mysql');

class ReservationApp {
  constructor() {
    this.app = express();
    this.port = 8080;
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "csp3-customers",
    });

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());

    this.setupRoutes();

    this.app.listen(this.port, () => {
      console.log('App listening on port ' + this.port);
    });

    this.con.connect(function (err) {
      if (err) throw err;
      console.log("Database connected!");
    });
  }

  setupRoutes() {
    this.app.get("/NestedReservationsData", this.getNestedReservationsData.bind(this));
  }
  
  getNestedReservationsData(req, res) {
    this.con.query(
      "SELECT reservations.userid, customers.fname, customers.lname, reservations.startdate, reservations.enddate FROM reservations INNER JOIN customers ON reservations.userid = customers.id ORDER BY reservations.userid, customers.fname, customers.lname, reservations.startdate, reservations.enddate;",
      (err, result, fields) => {
        if (err) {
          // Response if no result
          return res.status(500).json({ error: "An error occurred while getting data." });
        }

        const nestedJSONArr = [];

        result.forEach((row) => {
          const { userid, fname, lname, startdate, enddate } = row;

          const nestedJSON = {
            userid,
            name: {
              fname,
              lname
            },
            dates: {
              startdate,
              enddate
            }
          }
          nestedJSONArr.push(nestedJSON);
        });
        // Response if handled correctly
        res.status(200).json({ message: nestedJSONArr });
      }
    );
  }
}

const reservationApp = new ReservationApp();
