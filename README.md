# Util tools


### split-components
Split components' development work into pure developers and dataIO developers. If you control the props of a component, you can control the lifecycle of components in your project. Even you can employee another one to write components following your rules.

#### Why use
Actually, it's a mini-runtime, if you want to limit developers to create controlled components, you can use it.

Following the `register.ts`, you can see that we use the single instance of `middleware` to register some components and props, then we can render it in normal react components in our business, don't worry, it has been wrapped by memo.

Then, we could split the work from component's developer, we can add a dev character called DataIOer, they are professional to specify which props components could get, one component is mapped to one dataIO unless there have duplicate names.

### Request Wrapper

Wrap post and get function with mock registerization

### Hook of Form data model with states and reducer

You could use a hook to get a complete form model, even you are face with an array format

### Hook of tailwind fade

To control starting and ending of animation easily
