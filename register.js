const readline = require("readline");
const fs = require("fs/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = msg =>
  new Promise(resolve => rl.question(msg, response => resolve(response)));

async function register() {
  const usersData = [];
  console.log("Thank you for choosing to bank with us");
  let userEmail;
  let userpassword;
  let userPin;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmail = await ask("Enter your email: ");

  while (!emailRegex.test(userEmail)) {
    userEmail = await ask("Enter a a valid  email: ");
  }

  userpassword = await ask("Enter your password: ");

  while (userpassword.length < 6) {
    userpassword = await ask("password should be at least 6 character: ");
  }

  userPin = await ask("Enter your pin: ");

  while (userPin.length !== 4) {
    userPin = await ask("Pin must be 4 characters only: ");
  }

  fs.readFile("database.json", "utf-8", (e, data) => {
    if(e) {
      console.log(e.message);
      return;
    }
    if (data) {
      try {
        usersData = JSON.parse(data);
      } catch (err) {
        console.log("Error parsing JSON", err);
        return;
      }
    }
  });
}

module.exports = { register };
