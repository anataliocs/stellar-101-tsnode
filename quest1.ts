import { BASE_FEE, Horizon, Keypair, Networks, Operation, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";

module.exports = (async function () {

    if (!process.argv[2]) {
        console.error(`You must provide a SECRET_KEY as a parameter \n`);
        return;
    }

    const secretkey: string = process.argv[2];
    const questKeypair = Keypair.fromSecret(secretkey);
    const newKeypair = Keypair.random()

    const server: Horizon.Server = new Horizon.Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    let transaction: Transaction = new TransactionBuilder(
        questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    }).addOperation(Operation.createAccount({
        destination: newKeypair.publicKey(),
        startingBalance: "1000" // You can make this any amount you want (as long as you have the funds!)
    }))
        .setTimeout(30)
        .build();

    transaction.sign(questKeypair);

    const xdr: string = transaction.toXDR();
    console.log(xdr);

    try {
        let res = await server.submitTransaction(transaction)
        console.log(`Transaction Successful! Hash: ${res.hash}`)
    } catch (error) {
        console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
    }

})();