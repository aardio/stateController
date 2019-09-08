# State Controller

<a href="https://npmjs.org/package/state-controller"><img alt="NPM version" src="https://img.shields.io/npm/v/state-controller.svg?style=flat-square"></a>
<a href="https://npmjs.org/package/state-controller"><img alt="NPM downloads" src="https://img.shields.io/npm/dm/state-controller.svg?style=flat-square"></a>
<a href="https://unpkg.com/state-controller"><img alt="Size" src="https://img.badgesize.io/https://unpkg.com/state-controller?style=flat-square"></a>

State management with React Hooks

## Installation

```sh
npm i state-controller
yarn add state-controller
```

## Example 

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/floral-browser-lpimg)

![Screenshot](https://raw.githubusercontent.com/aardio/stateController/master/screenshots/screenshot.gif)

###   store/useCounterController.ts

```js
import { useState } from "react"
import stateController from "state-controller" 
import useUserController from "./useUserController"
 
let useCounterStore = ({n=0}) => {
 
    let [counter, setCounter] = useState({
        value: n,
    })

    let [ ,userController] = useUserController()
 
    let controller = {
        
        increment(n: number){
            setCounter({ ...counter, value: counter.value + n })
            userController.setLastActiveTime( new Date() )
        }
    }
 
    return [counter,controller] as const;
}

let useCounterController = stateController.create(useCounterStore)
export default useCounterController
```

###   store/useUserController.ts

```js
import { useState, useMemo } from "react"
import stateController from "state-controller" 
 
let useUserStore = ({n=0}) => {
 
    let [user, setUser] = useState({
        name: "", 
        lastActiveTime: new Date()
    }) 
 
    let controller = useMemo( ()=>({ 
        setName(n: string){
            setUser( user=>({ ...user, name: n }) )
        }, 
        setLastActiveTime(d:Date){
            setUser( user=>( { ...user,  lastActiveTime: d} ) )
        },
    }),[])

    return [user,controller] as const;
}

let useUserController = stateController.create(useUserStore)
export default useUserController
```

###  "Counter.tsx"

```js

import React, { useEffect } from "react"
import useCounterController from "./store/useCounterController"
import useUserController from "./store/useUserController"

let Counter:React.FC<{}> = () =>  {
 
  let [counter,counterController] = useCounterController()
  let [user,userController] = useUserController()

  useEffect(
     ()=>{
        userController.setName("stateController")
     },[userController]
  )
  
  return (
    <div>
      name: { user.name }<br /> 
      value: {counter.value}<br /> 
      <button onClick={ () => { 
        counterController.increment(1);  
      } }>add</button>  { user.lastActiveTime.toLocaleString() }
      <br /> <br /> 
    </div>
  )
}
 
export default Counter;
```
### index.tsx

```js
import React from "react"
import ReactDOM from 'react-dom'; 
import Counter from "./Counter"
import useUserController from "./store/useUserController";
import useCounterController from "./store/useCounterController";
import stateController from "state-controller" 

const App: React.FC = () => {  
    
  let  useStore = stateController.combine(useUserController,useCounterController)
  return ( 
      <useStore.Provider > 
        <Counter />
        <Counter />
      </useStore.Provider>  
  );
}
 
ReactDOM.render(<App />, document.getElementById('root'));
```