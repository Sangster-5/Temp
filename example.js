deposit: (coinName, discordID) => {
        return new Promise((resolve, reject) => {
            if(coinName != null) {
                mysql.getConnection((err, conn) => {
                    if (err) throw err;
                    conn.query(`SELECT * FROM users WHERE discord_id = '${discordID}'`, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        const address = result[0][`${coinName}address`];
                        if(address == null) {
                            const rpcListJSON = JSON.parse(fs.readFileSync("config.json").toString())["rpc_servers"];
                            rpcListJSON.forEach(async (rpc) => {
                                if(rpc["name"] == coinName) {
                                    if(rpc["blockchain"] != "ethereum") {
                                        const client = new Client({
                                            host: rpc["ip"], 
                                            username: rpc["username"], 
                                            password: rpc["password"], 
                                            port: rpc["port"]
                                        });
    
                                        client.getNewAddress((error, addrresult) => {
                                            if(error){
                                                console.log(error);
                                            } else {
                                                conn.query(`UPDATE users SET ${coinName}address = '${addrresult}' WHERE discord_id = '${discordID}'`, (err, result) => {
                                                    if (err) throw err;
                                                    resolve(addrresult);
                                                });
                                            }
                                        });
                                    } else {
                                        const provider = new Web3.providers.HttpProvider(`http://${rpc["ip"]}:${rpc["port"]}`);
                                        const web3 = new Web3(provider);

                                        if(rpc["address"] == undefined) {
                                            const address = await web3.eth.personal.newAccount("e4111fb4b9c81f5e9e08c862324dd44d630370b23b82438cb4ac933d58e3e8ec3cf0f865e494a7020df1dd1954c697dbbfbe3b7e2e61bab57b439e654a3b4d48f91ca2cf531ff3f1a76ddb1b04d3c038");
                                            conn.query(`UPDATE users SET ${coinName}address = '${address}' WHERE discord_id = '${discordID}'`, (err, result) => {
                                                if (err) throw err;
                                                resolve(address);
                                            });
                                        } else {
                                            ///const address = result[0][`${coinName}address`];
                                            console.log("Add ERC20");
                                        }
                                    }   
                                }
                            });
                        } else {
                            resolve(address);
                        }
                    });
                });
            }
        });
    }
