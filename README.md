## Njest

A btc transaction ingester.

### Considerations for valid transactions

Beyond the obvious considerations we must make to require >=6 confirmations, there are a few
other considerations I made to ensure transactions that contribute to a users balance are
'valid':

#### Intersecting txids

There are 12 intersecting txids from the 2 data sets, which would make sense if the `listsinceblock`
intervals overlapped at all. All 12 of these transactions are completely identical which is odd,
as I would assume that the `confirmations` value would increase over time. This may be an artifact
of manually created test data or misunderstanding on my part. If confirmations did increase with
subsequent calls, I would add more logic to update the `confirmations` value in the db for detected
intersections.

txids:
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

#### Same txid Different vout

There are 2 transactions in `transactions-2.json` with the same `txid` and `amount` but different
`vout` values so both transactions, though odd, are valid.

txid:
```
'b1c7e3b67d128088c829c31a323c883a05bd9fa8b9a5a7bfd56d67c8579f6473'
```

#### Coinbase Transactions

There are 2 coinbase transactions, 1 'immature' and 1 'generate'. The sql queries to get
valid receive transactions are all confined to `category IN ('recieve', 'generate')`.


#### Dust Limit

There are a few transactions in the data set that are really small. 1 tx.amout `<` 1000 sats.
I chose not to filter transactions for any minimum amount as the dust limit will fluctuate over
time and 'unspendable' outputs may rise from the dust at some point in the future. 

### Notes

- I disabled logging for the postgres service.
- The github repo is private, but I'm happy to invite anyone who would like access.
- The requirements had `x.xxxxxxxx` as the placeholder value for answers, but I left values at full precision.
