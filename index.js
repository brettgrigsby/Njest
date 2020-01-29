const { Client } = require('pg')
const transactions1 = require('./transactions-1.json')
const transactions2 = require('./transactions-2.json')

const addresses = {
  'Wesley Crusher': 'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ',
  'Leonard McCoy': 'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp',
  'Jonathan Archer': 'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n',
  'Jadzia Dax': '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo',
  'Montgomery Scott': 'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8',
  'James T. Kirk': 'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM',
  'Spock': 'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV',
}

const connectionString = 'postgresql://user:password@postgres:5432/transactions'

const sixConfs = tx => tx.confirmations >= 6
const validCategory = tx => ['receive', 'generate'].includes(tx.category)
const sumAmount = (acc, tx) => acc + tx.amount
// can function composition be used to keep these ideas seperate then combined to 1 filtering function
const isValidTransaction = tx => tx.confirmations >= 6 && ['receive', 'generate'].includes(tx.category)

// could be worth it to build the full set of transactions to send to the DB and filter out dupes
// by txid and vout before transacting with db
const txIds1 = transactions1.transactions.filter(sixConfs).map(t => t.txid)
const txIds2 = transactions2.transactions.filter(sixConfs).map(t => t.txid)

const intersection = txIds2.filter(t => txIds1.includes(t))
// console.log({ intersection })


const allTransactions = transactions1.transactions.concat(transactions2.transactions.filter(t => !intersection.includes(t.txid)))
// const allTransactions = transactions1.transactions.concat(transactions2.transactions)

Object.keys(addresses).forEach(name => {
  const addr = addresses[name]
  const transactions = allTransactions.filter(tran => tran.address === addr)
  const validTransactions = transactions.filter(isValidTransaction)
  console.log(`Deposited for ${name}: count=${validTransactions.length} sum=${validTransactions.reduce(sumAmount, 0)}`)
})

console.log('Deposited without reference: count=n sum=x.xxxxxxxx')

let client
const connectToDb = async () => {
  try {
    client = new Client({ connectionString })
    await client.connect()
    run()
  } catch (err) {
    await client.end()
    connectToDb()
  }
}

const TABLE_CREATION_SQL = `CREATE TABLE Transactions (
  id SERIAL PRIMARY KEY,
  txid varchar(255),
  address varchar(255),
  category varchar(255),
  confirmations integer,
  amount numeric
);
`

const createTransactionsTable = async (c) => {
  const tableExists = await c.query(`SELECT to_regclass('public.Transactions');`)
  if (tableExists.rows[0].to_regclass) {
    await c.query('DROP Table Transactions;')
  }
  await c.query(TABLE_CREATION_SQL)
}

const populateTransactionsTable = async (c, txs) => {
  const txValueChunks = txs.map(tx => `(
    '${tx.txid}',
    '${tx.address}',
    '${tx.category}',
    ${tx.confirmations},
    ${tx.amount}
  )`)

  await c.query(`
    INSERT INTO Transactions (
      txid,
      address,
      category,
      confirmations,
      amount
    ) Values ${txValueChunks.join(',')};
  `)
}

const run = async () => {
  try {
    await createTransactionsTable(client)
    await populateTransactionsTable(client, allTransactions)
    const dbm3 = await client.query('SELECT txid from Transactions;')
    const thing = dbm3.rows.map(t => { t.count = 1; return t }).reduce((acc, t) => { acc[t.txid] = (acc[t.txid] || 0) + t.count; return acc }, {})
    console.log({ dupes: Object.keys(thing).filter(tid => thing[tid] > 1) })
  } catch (err) {
    console.log('Error running node process: ', err)
  }
}

connectToDb()







// TODO: there exists an intersection of the transactions of length 12
// (even after filtering the transactions for 6 confirmations)
// so when adding to the db, I need to check if txid already exists
// and update the transaction with new number of confirmations

// const allTransactions = transactions1.transactions.concat(transactions2.transactions)


// a crude way of seeing the actual balances
// only works because dupe transactions are exactly the same

// Smallest valid deposit: x.xxxxxxxx
// Largest valid deposit: x.xxxxxxxx

// const byConfirmations = (first, second) => {
//   if (first.confirmations > second.confirmations) return -1
//   if (second.confirmations > first.confirmations) return 1
//   return 0
// }

