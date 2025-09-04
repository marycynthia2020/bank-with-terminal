const readline = require("readline");
const promisefs = require("fs/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function readDatabase() {
  let usersData = [];
  let data;
  try {
    data = await promisefs.readFile("database.json", "utf-8");
    if (data) {
      usersData = JSON.parse(data);
    }
  } catch (e) {
    console.log(e.message);
  }
  return usersData;
}
