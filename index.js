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


const sixConfs = tran => tran.confirmations >= 6
const validCategory = tran => ['receive', 'generate'].includes(tran.category)
const sumAmount = (acc, tran) => acc + tran.amount
const isValidTransaction = tran => tran.confirmations >= 6 && ['receive', 'generate'].includes(tran.category)

const txIds1 = transactions1.transactions.filter(sixConfs).map(t => t.txid)
const txIds2 = transactions2.transactions.filter(sixConfs).map(t => t.txid)

const intersection = txIds2.filter(t => txIds1.includes(t))
// TODO: there exists an intersection of the transactions of length 12
// (even after filtering the transactions for 6 confirmations)
// so when adding to the db, I need to check if txid already exists
// and update the transaction with new number of confirmations

// const allTransactions = transactions1.transactions.concat(transactions2.transactions)

// a crude way of seeing the actual balances
// only works because dupe transactions are exactly the same
const allTransactions = transactions1.transactions.concat(transactions2.transactions.filter(t => !intersection.includes(t.txid)))

Object.keys(addresses).forEach(name => {
  const addr = addresses[name]
  const transactions = allTransactions.filter(tran => tran.address === addr)
  const validTransactions = transactions.filter(isValidTransaction)
  console.log(`Deposited for ${name}: count=${validTransactions.length} sum=${validTransactions.reduce(sumAmount, 0)}`)
})


console.log('Deposited without reference: count=n sum=x.xxxxxxxx')
// Smallest valid deposit: x.xxxxxxxx
// Largest valid deposit: x.xxxxxxxx

// const byConfirmations = (first, second) => {
//   if (first.confirmations > second.confirmations) return -1
//   if (second.confirmations > first.confirmations) return 1
//   return 0
// }

