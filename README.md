### Valid Deposits

There are 2 transactions in the data set that would qualify as unspendable because
they fall below a reasonable dust limit for the time being. I chose not to filter those
even though they cannot be spent as they are valid transactions and the dust limit will
most likely change over time.

both txs are for Montgomery Scott?

there are 12 intersecting txids from the 2 data sets. They are exactly the same in both
sets so should not be recorded twice

```
'8aa80d8d09ec01163984e214295c2177563aaba4a595267b8a2c0215be8b4d7d',
'c828a14c948aadb71f4fd25e898bf4c147c6bfa4c26cf950d6026c536c855c9a'
'6feb5e58452e07b074497f0082659b0463759418479e166a74b92b98eeed1a15'
'1ab5c27a4896b8fb241271e2d7bba0306bb2da18bd763eecc8cbb6476449b56c'
'c7af9e3d47ea1e526227ae34d297ca57d95de89397fdf20342fe5d39d93b1041'
'd2344f32357fcde1464c7dcd643a0e38f58283e4eaaa630831777d9ebcce8817'
'58c33ad7c98754cce27b0ad60cc8bb612d8a37946d5a1439806c8ee4c0d295fd'
'fa96000f88693427485181510f57119a1704015b9f96b9c19efffb277d202548'
'f674a728f69e3f27054fd4cf1fcbb953275b214bf9a48936017a7a85fa6e2663'
'ecebebf6ea1a46bf7df9ba3d38ffebcdd8f5b284b8b94b523ca131f751219554'
'111dc83db39d452daf199b1aa3829c39d79e802a9d7ba416a7560b2a4ceee3f0'
'5862934ea32180ea6d8ccc2de7a937568f94277a74c2c37be6596041806d1984'
```

there are 2? transactions in the second set with the same txid but different vout values
and so both transactions are valid

```
'b1c7e3b67d128088c829c31a323c883a05bd9fa8b9a5a7bfd56d67c8579f6473'
```

there is 1 'immature' coinbase transaction and 1 valid 'generate' coinbase transaction
and the immature tx has been filtered out


I turned off logging for the postgres db service in the docker-compose file
