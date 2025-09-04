const readline = require("readline");
const  userRegistration = require("./register")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = msg =>
  new Promise(resolve => rl.question(msg, response => resolve(response)));


function CustomersMenu(option) {
  switch (option) {
    case "1":
      userRegistration.register();
      break;

    case "2":
    userRegistration.register();
      break;

    // case "3":
    //     changePin()
    //     break;

    // case "4":
    //     transferMoney()
    //     break;

    // case "5":
    //     checkNotifications()
    //     break;

    case "6":
      rl.close();
      break;

    // default:
    //   console.log("Invalid input. Try again");
    //   welcomeMessage();
  }
}

async function welcomeMessage() {
  console.log("Welcome to terminal banking")
  console.log("1: Register")
  console.log("2: Login")
  console.log("3: Exit")
  let name = await ask("hshshh")

// let input;
// input = await ask("Please select an option to continue: ")

// while(input !== "1" && input !== "2" && input !== "6"){
//     input = await ask("Please enter a valid option: ")
// }

// CustomersMenu(input)


}


// start of the app
welcomeMessage();
