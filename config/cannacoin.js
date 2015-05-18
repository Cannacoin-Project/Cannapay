var coin            = require('node-cannacoin');
var coin            = coin({
                        host: 'localhost',
                        port: process.env.CANNACOIN_RPCUSER,
                        user: process.env.CANNACOIN_RPCPASS,
                        pass: process.env.CANNACOIN_RPCPORT
                    });

module.exports = coin;