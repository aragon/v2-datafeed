# Aragon V2 data feed

This project includes two main parts:

- Worker: In charge of fetching new migrated organizations from a subgraph and store them in a local DB.
- Server: Expose a few endpoints to query data related to the migrated organizations.

## Development

Simply clone this repo and make sure you have installed postgresql.

Once you have done that create a database and populate a `.env` file using `.env.sample` as an example.

Finally, install dependencies simply with `yarn`, and use one of the following commands to start the processes:
- Sever: `yarn start:server` 
- Worker: `yarn start:worker` 

## Server

#### 1. Organizations

##### 1.1. Totals

  Request:

  - Method: `GET`
  - Path: `/organizations`
  - Body: None

  Successful response: 

  - Code: `200 OK`
  - Body:

  ```
  {
    "count": 3,
    "total": 600701.350112537,
    "option": 0.0006007013,
    "last": "2021-03-03T00:00:00.000Z"
  }
  ```

##### 1.2. Get organization data

  Request:

  - Method: `GET`
  - Path: `/organization/<address>`
  - Body: None

  Successful response:

  - Code: `200 OK`
  - Body:

  ```
  {
    "address":"0x51f22ac850d29c879367a77d241734acb276b815",
    "executor":"0x49598e2f08d11980e06c5507070f6dd97ce8f0bb",
    "value": 10281.9657152936,
    "syncedAt":"2021-04-28T00:20:54.991Z",
    "createdAt": "2021-03-03T00:00:00.000Z",
    "balances":[
      {
        "asset": {
          "address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "symbol":"USDC",
          "decimals":"6"
        },
        "price": 1.0026038727,
        "amount": "10000000000",
        "value": 10026.0387275834
      },
      {
        "asset": {
          "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          "symbol": "UNI",
          "decimals": "18"
        },
        "price": 25.592698771,
        "amount": "10000000000000000000",
        "value": 255.9269877101
      }
    ]
  }
  ```
