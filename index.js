const { Client } = require('pg')
const transactions1 = require('./transactions-1.json')
const transactions2 = require('./transactions-2.json')

const KNOWN_ADDRESSES = {
  'Wesley Crusher': 'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ',
  'Leonard McCoy': 'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp',
  'Jonathan Archer': 'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n',
  'Jadzia Dax': '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo',
  'Montgomery Scott': 'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8',
  'James T. Kirk': 'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM',
  'Spock': 'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV',
}

const txIds1 = transactions1.transactions.map(t => t.txid)
const txIds2 = transactions2.transactions.map(t => t.txid)
const intersection = txIds2.filter(t => txIds1.includes(t))
const allTransactions = transactions1.transactions.concat(transactions2.transactions.filter(t => !intersection.includes(t.txid)))

const connectionString = 'postgresql://user:password@postgres:5432/transactions'
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
  txid varchar(64),
  address varchar(64),
  category varchar(64),
  confirmations integer,
  amount numeric
);
`

const createTransactionsTable = async (c) => {
  const tableExists = await c.query(`SELECT to_regclass('public.Transactions');`)
  if (tableExists.rows[0].to_regclass) {
    await c.query('DROP TABLE Transactions;')
  }
  await c.query(TABLE_CREATION_SQL)
}

const getValidTxsForAddress = async (c, addr) => {
  const result = await c.query(`
    SELECT * from Transactions WHERE address='${addr}'
    AND confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  return result.rows
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

const sumAmount = (acc, tx) => acc + parseFloat(tx.amount)

const logDataForKnownUsers = async (c) => {
  for (name of Object.keys(KNOWN_ADDRESSES)) {
    const txs = await getValidTxsForAddress(client, KNOWN_ADDRESSES[name])
    console.log(`Deposited for ${name}: count=${txs.length} sum=${txs.reduce(sumAmount, 0)}`)
  }
}

const getValidTxsForUnknownUsers = async (c) => {
  const formattedAddrs = Object.values(KNOWN_ADDRESSES).map(addr => `'${addr}'`).join(', ')
  const result = await c.query(`
    SELECT * from Transactions WHERE address NOT IN (${formattedAddrs})
    AND confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  return result.rows
}

const logDataForUnknownUsers = async (c) => {
  const txs = await getValidTxsForUnknownUsers(client)
  console.log(`Deposited without reference: count=${txs.length} sum=${txs.reduce(sumAmount, 0)}`)
}

const logSmallestValidTx = async (c) => {
  const amount = await c.query(`
    SELECT MIN (amount) from Transactions
    WHERE confirmations>=6
    AND category IN ('receive', 'generate')
    AND amount>0;
  `)
  console.log('Smallest valid deposit:', amount.rows[0].min)
}

const logLargestValidTx = async (c) => {
  const amount = await c.query(`
    SELECT MAX (amount) from Transactions
    WHERE confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  console.log('Largest valid deposit:', amount.rows[0].max)
}


const run = async () => {
  try {
    await createTransactionsTable(client)
    await populateTransactionsTable(client, allTransactions)
    await logDataForKnownUsers(client)
    await logDataForUnknownUsers(client)
    await logSmallestValidTx(client)
    await logLargestValidTx(client)
    await client.end()
  } catch (err) {
    console.log('Error running node process: ', err)
  }
}

connectToDb()

