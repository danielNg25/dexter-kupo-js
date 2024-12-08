-   ask: Bán Token lấy ada/usdt <=> Mua ada/usdt bằng token
-   bid: Mua Token bằng ada/usdt <=> Bán ada/usdt bằng token

-   estimateGiveOrderBook: exactIn
    -   isBid: true => bid => give ada/usdt receive token => mình ngược lại phải bán token cho nó lấy ada => estimate token
    -   isBid: false => ask => give token receive ada/usdt => mình ngược lại phải mua token cho nó bằng ada => estimate ada
-   estimateReceiveOrderBook: exactOut
    -   isBid: true => bid => give ada/usdt receive token => mình ngược lại phải bán token cho nó lấy ada => estimate ada
    -   isBid: false => ask => give token receive ada/usdt => mình ngược lại phải mua token cho nó bằng ada => estimate token
