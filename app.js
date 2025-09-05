const readline = require("readline");
const promisefs = require("fs/promises");
const chalk = require("chalk");

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
      console.log(chalk.red("Invalid input. Thank you for banking with us"));
      rl.close();
  }
}

function showUsersMenu() {
  console.log("3: Change Pin");
  console.log("4: Transfer");
  console.log("5: check Notifications");
  console.log("7: Log out");
}

function showCustomersMenu() {
  console.log("1: Register");
  console.log("2: Log in");
  console.log("6: Exit");
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

async function register() {
  let usersData = await readDatabase();
  let newUser;
  console.log(chalk.green("Thank you for choosing to bank with us"));
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
  console.log(chalk.green("Registration succesfull. Happy banking"));

  const userResponse = await ask(
    "Do you wish to continue?. Press 2. To exit press 6: "
  );
  if (userResponse === "2" || userResponse === "6") {
    CustomersMenu(userResponse);
  } else {
    console.log(chalk.green("Thank you for choosing us always"));
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
    console.log(chalk.green("\nLog in successful."));
    availableNotifications = await existingUser.notifications.filter(
      notice => notice.isRead === false
    );
    console.log(
      chalk.cyan(
        `\nYou have ${availableNotifications.length} unread notifications\n `
      )
    );

    showUsersMenu();

    let input = await ask(
      "\nDo you wish to continue? Enter an option to proceed\n: "
    );

    while (input !== "3" && input !== "4" && input !== "5" && input !== "7") {
      input = await ask("Please enter a valid option: ");
    }
    usersMenu(input);
  } else {
    console.log(
      chalk.red(
        "\nYou have not yet registered an account. Enter 1 to create an account"
      )
    );
    showCustomersMenu();
    let userResponse = await ask(": ");
    CustomersMenu(userResponse);
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
    existingUserOnDB.notifications.push({
      message: "You successfully updated your transaction pin.",
      isReas: false,
    });
    await writeDatabase(usersData);
    console.log(chalk.yellow("\nprocessing..."));
    await delay(1000);
    console.log(chalk.green("\nPin successfully updated\n"));
    showUsersMenu();
    let userResponse = await ask(
      "Do you wish to continue. Select an option: \n"
    );
    usersMenu(userResponse);
  } else {
    console.log("Processing...");
    await delay(1000);
    console.log(
      chalk.red(
        "it seems you forgot your pin. We do not offer pin retrieval yet. sorry for the inconveniences.\n"
      )
    )
    userResponse = await ask("Press 4 to to try again, else press any key to exit: ")
    userResponse === "3" ? usersMenu(userResponse) : usersMenu("7")


    
  }
}

async function transferMoney() {
  const usersData = await readDatabase();

  let currentUserOnDB = await usersData.find(
    user => user.id === currentUser.id
  );

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let receiverEmail = await ask("Enter receiver's email: ");

  while (!emailRegex.test(receiverEmail)) {
    receiverEmail = await ask("Enter a a valid  email: ");
  }

  let receiver = await usersData.find(
    user => user.email === receiverEmail && user.email !== currentUserOnDB.email
  );

  let transferAmount = await ask("Enter amount to send: ");

  while (
    Number(
      transferAmount <= 0 ||
        isNaN(transferAmount) ||
        Number(transferAmount) > Number(currentUserOnDB.amount)
    )
  ) {
    transferAmount = await ask("Enter a valid Number: ");
  }

  if (receiver) {
    currentUserOnDB.amount -= Number(transferAmount);
    receiver.amount += Number(transferAmount);

    currentUserOnDB.notifications.push({
      message: `You sent #${transferAmount} to ${receiverEmail}`,
      isRead: false,
    });

    receiver.notifications.push({
      message: `You received #${transferAmount} from ${currentUser.email}`,
      isRead: false,
    });

    console.log(chalk.yellow("Transaction Processing..."));
    await writeDatabase(usersData);

    delay(1000);
    console.log(chalk.green("Transaction successful."));
    showUsersMenu();
    let userResponse = await ask(
      "Wish to perform another transaction? Enter an option to continue: "
    );
    usersMenu(userResponse);
  } else {
    console.log(chalk.red("Check the user email and try again"));
    usersMenu("4");
  }
}

async function checkNotifications() {
  let usersData = await readDatabase();
  let currentUserOnDB = usersData.find(user => user.id === currentUser.id);
  console.log("\n11: All notifications");
  console.log("12: Unread Notificaons");
  console.log("13: read Notifications");

  let userResponse = await ask("\nEnter an option to continue: ");

  switch (userResponse) {
    case "11":
      let all = currentUserOnDB.notifications;
      console.log(chalk.blue(`\nTotal notifications: ${all.length}\n`));
      all.length > 0 &&
        all.map((notice, index) => {
          console.log(chalk.cyan(`${index + 1}: ${notice.message}\n`));
          notice.isRead = true;
        });
      break;

    case "12":
      let unRead = currentUserOnDB.notifications.filter(
        notice => notice.isRead === false
      );
      console.log(
        chalk.blue(`\nYou have ${unRead.length} unread notifications\n`)
      );
      unRead.length > 0 &&
        unRead.map((notice, index) => {
          console.log(chalk.cyan(`${index + 1}: ${notice.message}\n`));
        });
      break;

    case "13":
      let read = currentUserOnDB.notifications.filter(notice => notice.isRead);
      console.log(chalk.blue(`\nYou have ${read.length} read notifications\n`));
      read.length > 0 &&
        read.map((notice, index) => {
          console.log(chalk.cyan(`${index + 1}: ${notice.message}`));
        });
      break;

    default:
      console.log(chalk.red("\nInvalid Input"));
      usersMenu("5");
      break;
  }

  await writeDatabase(usersData);
  showUsersMenu();
  userResponse = await ask(
    "\nDo you wish to proceed? Enter an option to proceed:"
  );
  usersMenu(userResponse);
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
  console.log("Welcome to terminal banking\n");
  showCustomersMenu();
  let input;
  input = await ask("\nPlease select an option to continue\n: ");

  while (input !== "1" && input !== "2" && input !== "6") {
    input = await ask("Please enter a valid option: ");
  }
  CustomersMenu(input);
}

// start of the app

welcomeMessage();
