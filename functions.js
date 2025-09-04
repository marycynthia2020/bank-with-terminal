function CustomersMenu(option){
    switch (option) {

    case "1":
        register()
        break;

    case "2":
        register()
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
        rl.close()
        break;

    default:
        console.log("Invalid input. Try again")
        break;
}

}

module.exports = {CustomersMenu}