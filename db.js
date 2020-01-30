const TABLE_CREATION_SQL = `CREATE TABLE Transactions (
  id SERIAL PRIMARY KEY,
  txid varchar(64),
  address varchar(64),
  category varchar(64),
  confirmations integer,
  amount numeric
);
`
const getSmallestValidReceive = async (c) => {
  const amount = await c.query(`
    SELECT MIN (amount) from Transactions
    WHERE confirmations>=6
    AND category IN ('receive', 'generate')
    AND amount>0;
  `)
  return amount.rows[0].min
}

const getLargestValidReceive = async (c) => {
  const amount = await c.query(`
    SELECT MAX (amount) from Transactions
    WHERE confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  return amount.rows[0].max
}

const createTransactionsTable = async (c) => {
  const tableExists = await c.query(`SELECT to_regclass('public.Transactions');`)
  if (tableExists.rows[0].to_regclass) {
    await c.query('DROP TABLE Transactions;')
  }
  await c.query(TABLE_CREATION_SQL)
}

const getValidReceivesForUnknownUsers = async (c, addresses) => {
  const formattedAddrs = Object.values(addresses).map(addr => `'${addr}'`).join(', ')
  const result = await c.query(`
    SELECT * from Transactions WHERE address NOT IN (${formattedAddrs})
    AND confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  return result.rows
}

const getValidReceivesForAddresses = async (c, addr) => {
  const result = await c.query(`
    SELECT * from Transactions WHERE address='${addr}'
    AND confirmations>=6
    AND category IN ('receive', 'generate');
  `)
  return result.rows
}

const  populateTransactionsTable = async (c, txs) => {
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

module.exports = {
  getSmallestValidReceive,
  getLargestValidReceive,
  createTransactionsTable,
  getValidReceivesForUnknownUsers,
  getValidReceivesForAddresses,
  populateTransactionsTable
}
