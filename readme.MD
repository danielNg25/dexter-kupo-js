# Dexter Kupo js

## Usage

```typescript
const kupo = new KupoApi(`${proccess.env.KUPO_URL}`);

const sundaeswapV1 = new SundaeSwapV1(kupo);

const start = new Date().getTime();
sundaeswapV1
    .liquidityPoolsFromToken(
        'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59'
    )
    .then((values) => {
        console.log(values);
        const end = new Date().getTime();
        console.log(`Execution time: ${(end - start) / 1000}s`);
    });
```
