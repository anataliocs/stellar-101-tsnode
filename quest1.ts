import { BASE_FEE, Horizon, Keypair, Networks, Operation, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";

module.exports = (async function () {

    // Ensure secret key is passed in
    if (!process.argv[2]) {
        console.error(`You must provide a SECRET_KEY as a parameter \n`);
        return;
    }

    // Generate keypair from passed in secret key
    const secretkey: string = process.argv[2];
    const questKeypair = Keypair.fromSecret(secretkey);

    const newKeypair = Keypair.random()

    // Load up testnet Stellar account of passed in secret key
    const server: Horizon.Server = new Horizon.Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    // Build a Stellar Transaction to execute create account operation
    // That will create a account on testnet with 1000 test XLM
    // 1000 XLM will be debited from the Quest Keypair passed in as a secret key
    let transaction: Transaction = new TransactionBuilder(
        questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    }).addOperation(Operation.createAccount({
        destination: newKeypair.publicKey(),
        startingBalance: "1000"
    }))
        .setTimeout(30)
        .build();

    transaction.sign(questKeypair);

    const xdr: string = transaction.toXDR();
    console.log(xdr);

    try {
        let res = await server.submitTransaction(transaction)
        console.log("Stellar Account Created! Transaction Details: ");
        console.log(`https://stellar.expert/explorer/testnet/tx/${res.hash}`);
    } catch (error) {
        console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
    }

})();