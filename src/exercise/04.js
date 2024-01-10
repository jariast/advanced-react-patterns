// Prop Collections and Getters
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {Switch} from '../switch'

// This helper function calls all the provided functions
// in order
const callAllFunctions =
  (...functions) =>
  (...args) =>
    functions.forEach(fn => fn?.(...args))

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  // 🐨 Add a property called `togglerProps`. It should be an object that has
  // `aria-pressed` and `onClick` properties.
  // 💰 {'aria-pressed': on, onClick: toggle}

  const getTogglerProps = ({onClick, ...props} = {}) => {
    const togglerProps = {
      'aria-pressed': on,
      onClick: callAllFunctions(onClick, toggle),
    }
    return {...togglerProps, ...props}
  }

  // We still return the toggle function, just in case
  // the consumer wants to make a custom implementation
  // or something
  return {on, toggle, getTogglerProps}
}

function App() {
  const {on, getTogglerProps} = useToggle()
  return (
    <div>
      <Switch {...getTogglerProps({on})} />
      <hr />
      <button
        {...getTogglerProps({
          'aria-label': 'custom-button',
          onClick: () => console.info('onButtonClick'),
          id: 'custom-button-id',
        })}
      >
        {on ? 'on' : 'off'}
      </button>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
