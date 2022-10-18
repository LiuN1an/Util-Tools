# split-components
Create a middleware to split components for some extra props which could be defined separately of props

## Why use
Actually, it's a mini-runtime, if you want to limit developers to create controlled components, you can use it.

Following the `register.ts`, you can see that we use the single instance of `middleware` to register some components and props, then we can render it in normal react components in our business, don't worry, it has been wrapped by memo.

Then, we could split the work from component's developer, we can add a dev character called DataIOer, they are professional to specify which props could components get, one component is mapped to one dataIO unless there have duplicate names.
