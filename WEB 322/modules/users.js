const bcrypt = require('bcryptjs');

let users = []; 

// Add a new user
function addUser(userData) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find(user => userData.username === user.username);

        if (foundUser) {
            reject("User already exists");
        } else {
            if (userData.password === userData.password2) {
                bcrypt.hash(userData.password, 10).then(hashedPassword => {
                    const { username, email } = userData;

                    // Save the new user
                    users.push({ username, email, password: hashedPassword });
                    console.log(users);
                    resolve();
                }).catch(err => {
                    reject("Error in hashing the password.");
                });
            } else {
                reject("Passwords do not match.");
            }
        }
    });
}

// Check user credentials
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find(user => userData.username === user.username);

        if (foundUser) {
            bcrypt.compare(userData.password, foundUser.password).then(match => {
                if (match) {
                    resolve(foundUser); 
                } else {
                    reject("Incorrect password");
                }
            }).catch(err => {
                reject("Error while validating password");
            });
        } else {
            reject("User not found");
        }
    });
}

module.exports = { addUser, checkUser };
