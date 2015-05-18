// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({ 
        username    : String,
        email       : String,
        fullname    : String,
        age         : String,
        location    : String,
        gender      : String,
        local       : {
            email                    : String,
            emailHash                : String,
            verifiedEmail            : Boolean,
            passwordReset            : Boolean,
            passwordReset_timestamp  : Date,
            password                 : String,
            failedAttempts           : Number,
            registeredTimestamp      : Date,
        },
        facebook            : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        twitter             : {
            id           : String,
            token        : String,
            displayName  : String,
            username     : String
        },
        google              : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        apiKeys : {
            yubiKey             : {enabled: Boolean, uuid: String},
            cannapay            : String,
            bittrexApiKey       : String,
            bittrexPrivateKey   : String,
            swisscexApiKey      : String,
            swisscexPrivateKey  : String,
            google2fa : {
                ascii           : String,
                hex             : String,
                base32          : String,
                google_auth_url : String,
                enabled         : Boolean,
            }
        },
        withdraws           : {
            txId: String,
            date: String
        },
        permissions         : {
            
            twoFactorAuth : String
        },
        wallets             : {
            cannacoin : {
                label   : String,
                address : String,
                balance : String
            },
            bittrex : [ 
                {
                    Currency        : String,
                    Balance         : String,
                    Available       : String,
                    Pending         : String,
                    CryptoAddress   : String,
                    Uuid            : String
                }
            ],
            swisscex : [ 
                {
                    Currency        : String,
                    Balance         : String,
                    Available       : String,
                    Pending         : String,
                    CryptoAddress   : String,
                    Uuid            : String
                }
            ]
        }
});

// Schema methods ======================

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// checking if email is verified
userSchema.methods.verifiedEmail = function(email) {
    return bcrypt.compareSync(email, this.local.emailHash);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
