# split-components
Create a middleware to split components for some extra props which could be defined separately of props

## Why use
Actually, it's a mini-runtime, if you want to limit developers to create a controled components, you can use it.

Following the `register.ts`, you can see that we use the simple instance of `middleware` to register some components and props, then we can render it in normal react components in our business, don't worry, it has been wrapped by memo.