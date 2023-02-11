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

### Hooks
#### tailwind fade
To control starting and ending of animation easily
#### Responsive grid component
It could be responsive to parent container's size changed, fixed width and height element will be ordered with animation
#### CallModal
Imperative method to call a modal instead of declarative method.
You can extend modal using `props: type` and use it in your project everywhere
### Observer when to execute action
It is used in pagination when scrolling
### Moved Wrapper Component
A component could be moved 
#### CallDropdown
Imperative method to call a dropdown instead of declarative method.
You can pass the `HTMLElement` and get a auto positioned dropdown modal
#### Cache Request
A Simple SWR, it can cache last response for specify request.
