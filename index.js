const { Client } = require('pg')
const transactions1 = require('./transactions-1.json')
const transactions2 = require('./transactions-2.json')
const {
  createTransactionsTable,
  getValidReceivesForAddresses,
  getValidReceivesForUnknownUsers,
  getSmallestValidReceive,
  getLargestValidReceive,
  populateTransactionsTable
} = require('./db')

const KNOWN_ADDRESSES = {
  'Wesley Crusher': 'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ',
  'Leonard McCoy': 'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp',
  'Jonathan Archer': 'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n',
  'Jadzia Dax': '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo',
  'Montgomery Scott': 'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8',
  'James T. Kirk': 'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM',
  'Spock': 'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV',
}

const DB_CONNECTION_STRING = 'postgresql://user:password@postgres:5432/transactions'

const txIds1 = transactions1.transactions.map(t => t.txid)
const txIds2 = transactions2.transactions.map(t => t.txid)
const intersection = txIds2.filter(t => txIds1.includes(t))

// filter transactions to preclude duplicates
const allTransactions = transactions1.transactions.concat(transactions2.transactions.filter(t => !intersection.includes(t.txid)))

const sumAmount = (acc, tx) => acc + parseFloat(tx.amount)

let client

const logDataForKnownUsers = async () => {
  for (name of Object.keys(KNOWN_ADDRESSES)) {
    const txs = await getValidReceivesForAddresses(client, KNOWN_ADDRESSES[name])
    console.log(`Deposited for ${name}: count=${txs.length} sum=${txs.reduce(sumAmount, 0)}`)
  }
}

const logDataForUnknownUsers = async () => {
  const txs = await getValidReceivesForUnknownUsers(client, KNOWN_ADDRESSES)
  console.log(`Deposited without reference: count=${txs.length} sum=${txs.reduce(sumAmount, 0)}`)
}

const logSmallestValidReceive = async () => {
  getSmallestValidReceive(client)
  const smallest = await getSmallestValidReceive(client)
  console.log('Smallest valid deposit:', smallest)
}

const logLargestValidReceive = async () => {
  const largest = await getLargestValidReceive(client)
  console.log('Largest valid deposit:', largest)
}

const consumeAndLogData = async () => {
  try {
    await createTransactionsTable(client)
    await populateTransactionsTable(client, allTransactions)
    await logDataForKnownUsers(client)
    await logDataForUnknownUsers(client)
    await logSmallestValidReceive(client)
    await logLargestValidReceive(client)
    await client.end()
  } catch (err) {
    console.log('Error running node process: ', err)
  }
}

const run = async () => {
  // don't execute until db client can connect
  try {
    client = new Client({ connectionString: DB_CONNECTION_STRING })
    await client.connect()
    consumeAndLogData()
  } catch (err) {
    await client.end()
    run()
  }
}

run()
