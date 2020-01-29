### Valid Deposits

There are 2 transactions in the data set that would qualify as unspendable because
they fall below a reasonable dust limit for the time being. I chose not to filter those
even though they cannot be spent as they are valid transactions and the dust limit will
most likely change over time.

there are 12 intersecting txids from the 2 data sets. They are exactly the same in both
sets so should not be recorded twice

there are 2? transactions in the second set with the same txid but different vout values
and so both transactions are valid

there is 1 'immature' coinbase transaction and 1 valid 'generate' coinbase transaction
and the immature tx has been filtered out
