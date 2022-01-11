

// connect to Moralis server
const serverUrl = "Your Server url from Moralis server";
const appId = "Insert app id from Moralis server";
Moralis.start({ serverUrl, appId });

if(Moralis.User.current() == null && window.location.href != "http://127.0.0.1:5500/index.html")
{
    document.querySelector("body").style.display = "none";
    window.location.href = "index.html";
}


//logging in user wallet
login = async () => {
    Moralis.authenticate().then(async function (user) {
        console.log("login successful");
        console.log(document.getElementById("user-username").value);
        console.log(document.getElementById("user-email").value);

        user.set("name", document.getElementById("user-username").value);
        user.set("email", document.getElementById("user-email").value);
        await user.save();

        window.location.href = "dashboard.html";
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}

getTransactions = async () =>{
    const options = { chain: "rinkeby", address: "0xEE80baa52CcBDBab6C36A988E9a49D72025Dd280" };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    console.log(transactions);

    if(transactions.total > 0){
        let table = `
        <table class="table">
        <thead>
            <tr>
                <th scope="col">Transactions</th>
                <th scope="col">Block Number</th>
                <th scope="col">Age</th>
                <th scope="col">Type</th>
                <th scope="col">Fee</th>
                <th scope="col">Value</th>
            </tr>
        </thead>
        <tbody id="theTransactions">
        </tbody>
        </table>
        `
        document.getElementById("tableOfTransactions").innerHTML = table;

        transactions.result.forEach(t => {
            let content = `
            <tr>
                <td><a href='https://rinkeby.etherscan.io/tx/${t.hash}' target="_blank" rel="noopener noreferrer">${t.hash}</a></td>
                <td><a href='https://rinkeby.etherscan.io/block/${t.block_number}' target="_blank" rel="noopener noreferrer">${t.block_number}</a></td>
                <td>${getTime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</td>
                <td>${t.from_address == Moralis.User.current().get('ethAddress') ? "Outgoing" : "Incoming"}</td>
                <td>${((t.gas * t.gas_price) / 1e18).toFixed(5)} ETH</td>
                <td>${((t.value) /1e18).toFixed(5)} ETH</td>
            </tr>
            `
            theTransactions.innerHTML += content;
        });

    }
}

getBalances = async () =>{

    const EthBalance = await Moralis.Web3API.account.getNativeBalance();
    const RinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "rinkeby" });
    const RopstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "ropsten" });

    let content = `
    <table class="table">
    <thead>
        <tr>
            <th scope="col">Chain</th>
            <th scope="col">Balance</th>
        </tr>
    </thead>
    <tbody id="theBalances">
        <tr>
            <th>Ether</th>
            <td>${((EthBalance.balance) / 1e18).toFixed(4)}</td>
        </tr>
        <tr>            
            <th>Ropsten</th>
            <td>${((RopstenBalance.balance) / 1e18).toFixed(4)}</td>
        </tr>
        <tr>
            <th>RInkeby</th>
            <td>${((RinkebyBalance.balance) / 1e18).toFixed(4)}</td>
        </tr>
    </tbody>
    </table>
    `
    document.getElementById("balances").innerHTML = content;
}

getNfts = async () =>{
    let nfts = await Moralis.Web3API.account.getNFTs({chain: "rinkeby"});
    console.log(nfts);
    if(nfts.result.length > 0)
    {
        nfts.result.forEach(n =>{
            let metadata = JSON.parse(n.metadata)
            let content =`
            <div class="card col-md-3" >
                <img src="${fixURL(metadata.image_url)}" class="card-img-top" height=300  >
                <div class="card-body">
                    <h5 class="card-title">${metadata.name}hello</h5>
                    <p class="card-text">${metadata.description}hi there</p>
                </div>
          </div>
            `
            document.getElementById("tableOfNFTs").innerHTML += content;
        })
    }
}

fixURL = (url) =>{
    if(url.startsWith("ipfs")){
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1);
    }

    else
        return url+"?format=json"
}

getTime = (ms) =>{
    let minutes =Math.floor(ms / (1000 * 60))
    let hours = Math.floor(ms / (1000 * 60 * 60))
    let days = Math.floor(ms / (1000 * 60 * 60 * 60))

    if(days < 1){
        if(hours < 1){
            if(minutes < 1){
                return `less than a minute ago`
            }
            else return `${minutes} minute(s) ago`
        }
        else return `${hours} hour(s) ago`
    }
    else return`${days} day(s) ago`  
}



if(document.querySelector("#btn-login"))
    document.querySelector("#btn-login").onclick = login;

if(document.querySelector("#btn-logout"))
    document.querySelector("#btn-logout").onclick = logout;

if(document.querySelector("#get-transactions-link"))
    document.querySelector("#get-transactions-link").onclick = getTransactions;

if(document.querySelector("#get-balances-link"))
    document.querySelector("#get-balances-link").onclick = getBalances;

 if(document.querySelector("#get-NFTs-link"))
    document.querySelector("#get-NFTs-link").onclick = getNfts;
