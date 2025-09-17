class User{
    constructor(phone, password, username, walletAddress){
        this.phone = phone;
        this.pin = password;
        this.username = username;
        this.walletAddress = walletAddress;
    }
}

module.exports = User;