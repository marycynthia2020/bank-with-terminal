const readline = require("readline");
const promisefs = require("fs/promises");
const chalk = require("chalk");
const { isReadable } = require("stream");

let currentUser;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = msg =>
  new Promise(resolve => rl.question(msg, response => resolve(response)));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function writeDatabase(newUsersData) {
  let usersData = await readDatabase();
  try {
    promisefs.writeFile("database.json", JSON.stringify(newUsersData));
  } catch (e) {
    console.log(e.message);
  }
}

function CustomersMenu(option) {
  switch (option) {
    case "1":
      register();
      break;

    case "2":
      login();
      break;

    case "6":
      console.log(chalk.green("Thank you for banking with us"));
      rl.close();
      break;

    default:
      console.log("Invalid input. Try again");
      welcomeMessage();
  }
}

function usersMenu(option) {
  switch (option) {
    case "3":
      changePin();
      break;

    case "4":
      transferMoney();
      break;

    case "5":
      checkNotifications();
      break;

    case "7":
      logout();
      break;

    default:
      console.log(
        "Invalid input. You will need to log in again to Ensure you own this account"
      );
      CustomersMenu("2");
  }
}

async function readDatabase() {
  let usersData = [];
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

async function register() {
  let usersData = await readDatabase();
  let newUser;
  console.log("Thank you for choosing to bank with us");
  let userEmail;
  let userpassword;
  let userPin;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmail = await ask("Enter your email:");

  let existingUser = await usersData.find(user => user.email === userEmail);

  while (existingUser && existingUser.email === userEmail) {
    userEmail = await ask(
      "User already exist in the database. Enter a unique email: "
    );
  }

  while (!emailRegex.test(userEmail)) {
    userEmail = await ask("Enter a a valid  email: ");
  }

  userpassword = await ask("Enter your password: ");

  while (userpassword.length < 6) {
    userpassword = await ask("password should be at least 6 character: ");
  }

  userPin = await ask(
    "Enter your pin. This is a 4 digit pin that will be used for signing transactions: "
  );

  while (userPin.length !== 4) {
    userPin = await ask("Pin must be 4 characters only: ");
  }

  newUser = {
    id: crypto.randomUUID(),
    email: userEmail,
    password: userpassword,
    pin: userPin,
    isLoggedIn: false,
    amount: 2000,
    notifications: [],
  };
  usersData.push(newUser);
  await writeDatabase(usersData);
  console.log("Processing...");
  await delay(2000);
  console.log("Registration succesfull. happy banking");

  const userResponse = await ask(
    "Do you wish to continue?. Press 2. To exit press 6: "
  );
  if (userResponse === "2" || userResponse === "6") {
    CustomersMenu(userResponse);
  } else {
    console.log("Thank you for choosing us always");
    rl.close();
  }
}

async function login() {
  console.log("Welcome back");
  let userEmail;
  let userPassword;
  let usersData = await readDatabase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmail = await ask("Please enter your email: ");
  while (!emailRegex.test(userEmail)) {
    userEmail = await ask("Enter a a valid  email: ");
  }

  userPassword = await ask("Enter your password: ");

  while (userPassword.length < 6) {
    userPassword = await ask("password should be at least 6 character: ");
  }

  let existingUser = await usersData.find(
    user => user.email === userEmail && user.password === userPassword
  );

  if (existingUser) {
    currentUser = existingUser;
    existingUser.isLoggedIn = true;

    await writeDatabase(usersData);
    console.log(chalk.green("log in successful."));

    console.log("3: Change Pin");
    console.log("4: Transfer");
    console.log("5: check Notifications");
    console.log("7: Log out");

    let input = await ask(
      "Do you wish to continue? Enter an option to proceed: "
    );

    while (input !== "3" && input !== "4" && input !== "5" && input !== "7") {
      input = await ask("Please enter a valid option: ");
    }
    usersMenu(input);
  } else {
    console.log(
      "You have not yet register an account. press 1 to open an account. Press 6 to exit. "
    );
    let userResponse = await ask(": ");
    userResponse === "1" || userResponse === "6"
      ? CustomersMenu(userResponse)
      : CustomersMenu("6");
  }
}

async function changePin() {
  let currentPin;
  let usersData = await readDatabase();
  let existingUserOnDB = await usersData.find(
    user => user.id === currentUser.id
  );

  currentPin = await ask("Enter your current 4 pin: ");

  while (currentPin.length !== 4) {
    currentPin = await ask("pin must be 4 characters: ");
  }

  if (existingUserOnDB.pin === currentPin) {
    let newPin = await ask("Enter a new pin: ");
    while (newPin.length !== 4) {
      newPin = await ask("pin must be 4 characters: ");
    }
    existingUserOnDB.pin = newPin;
    await writeDatabase(usersData);
    console.log("processing...");
    await delay(1000);
    console.log("Pin successfully updated");
    console.log("You need to re-login to continue using this service");
    console.log("Thank you for banking with us");
    rl.close();
  } else {
    console.log("Processing...");
    await delay(1000);
    console.log(
      chalk.red(
        "it seems you forgot your pin. We do not offer pin retrieval yet. sorry for the inconveniences"
      )
    );
    console.log("Thank you for banking with us");
    rl.close();
  }
}

async function transferMoney() {
  const usersData = await readDatabase();

  let currentUserOnDB = await usersData.find(user => user.id === currentUser.id);

  let receiver = await usersData.find(
    user => user.email == receiverEmail && user.email !== currentUserOnDB.email
  );

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let receiverEmail = await ask("Enter receiver's email: ");

  while (!emailRegex.test(receiverEmail)) {
    receiverEmail = await ask("Enter a a valid  email: ");
  }

  
  let transferAmount = await ask("Enter amount to send: ");

  while (
    Number(transferAmount > 0 && typeof Number(transferAmount) !== "number")
  ) {
    transferAmount = await ask("Enter a valid Number");
  }

  while (Number(transferAmount > Number(currentUserOnDB.amount))) {
    transferAmount = await ask(
      "You account is low for this transaction. Enter an below within your balance range: "
    );
  }

  if (receiver) {
    currentUserOnDB.amount -= Number(transferAmount);
    receiver.amount += Number(transferAmount);

    currentUserOnDB.notifications.push = [
      {
        message: `You sent #${transferAmount} to ${receiverEmail}`,
        isRead: false,
      },
    ];
    receiver.notifications.push = [
      {
        message: `You received #${transferAmount} from ${currentUser.email}`,
        isRead: false,
      },
    ];
    await writeDatabase(usersData);

    console.log(
      chalk.green("Transaction successful. Thank you for banking with use")
    );
    rl.close();
  } else {
    console.log(
      chalk.red(
        "Transaction failed. Check the receiver's email and try again later"
      )
    );
    rl.close();
  }
}

async function checkNotifications() {
  console.log("notification succesfully seen");
  rl.close();
}

async function logout() {
  const usersData = await readDatabase();
  const existingUser = await usersData.find(user => user.id === currentUser.id);
  existingUser.isLoggedIn = false;
  await writeDatabase(usersData);
  console.log(
    chalk.green("Log out succesful. Thank you you for banking with us")
  );
  rl.close();
}

async function welcomeMessage() {
  console.log("Welcome to terminal banking");
  console.log("1: Register");
  console.log("2: Log in");
  console.log("6: Exit");
  let input;
  input = await ask("Please select an option to continue: ");

  while (input !== "1" && input !== "2" && input !== "6") {
    input = await ask("Please enter a valid option: ");
  }
  CustomersMenu(input);
}

// start of the app

welcomeMessage();
