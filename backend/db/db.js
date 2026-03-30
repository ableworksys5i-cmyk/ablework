const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ableworksystem_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        // Try reconnecting after 3 seconds
        setTimeout(() => {
            console.log("Retrying database connection...");
            db.connect();
        }, 3000);
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = db;