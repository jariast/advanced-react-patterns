// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import warning from 'warning'
import {Switch} from '../switch'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
  readOnly = false,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on
  const hasOnChangeFunction = !!onChange

  const isInitiallyControlled = React.useRef(onIsControlled)

  //Extra 01 Before Watching solution
  // if (onIsControlled) {
  //   const shouldNotWarnReadOnly = !!onChange
  //
  //   warning(
  //     shouldNotWarnReadOnly,
  //     'Failed prop type: You provided a `on` prop without an `onChange handler` ',
  //   )
  // }
  // const shouldNotWarnReadOnly = onIsControlled || !!onChange

  // Extra 01 After watching solution
  React.useEffect(() => {
    const shouldWarnReadOnly =
      onIsControlled && !hasOnChangeFunction && !readOnly

    warning(
      !shouldWarnReadOnly,
      'Passed on without an onChange function, set readOnly to avoid this warning',
    )
  }, [onIsControlled, hasOnChangeFunction, readOnly])

  // Extra 02 Before watching solution
  React.useEffect(() => {
    const switchedMode = isInitiallyControlled.current !== onIsControlled

    const shouldWarnUncontrolledToControlled =
      switchedMode && !isInitiallyControlled.current
    warning(
      !shouldWarnUncontrolledToControlled,
      'Going from Uncontrolled to Controlled',
    )

    const shouldWarnControlledToUncontrolled =
      switchedMode && isInitiallyControlled.current
    warning(
      !shouldWarnControlledToUncontrolled,
      'Going from Controlled to Uncontrolled',
    )
  }, [onIsControlled])

  // We want to call `onChange` any time we need to make a state change, but we
  // only want to call `dispatch` if `!onIsControlled` (otherwise we could get
  // unnecessary renders).
  // 🐨 To simplify things a bit, let's make a `dispatchWithOnChange` function
  // right here. This will:
  // 1. accept an action
  // 2. if onIsControlled is false, call dispatch with that action
  // 3. Then call `onChange` with our "suggested changes" and the action.
  const dispatchWithOnChange = action => {
    if (!onIsControlled) {
      dispatch(action)
    }

    if (onChange) {
      onChange(reducer({...state, on}, action), action)
    }
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange, initialOn, reducer, readOnly}) {
  const {on, getTogglerProps} = useToggle({
    on: controlledOn,
    onChange,
    initialOn,
    reducer,
    readOnly,
  })
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  // const [bothOn, setBothOn] = React.useState(false)

  // Extra 02
  const [bothOn, setBothOn] = React.useState()
  const [testOn, setTestOn] = React.useState(true)

  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        {/* <Toggle on={bothOn} onChange={handleToggleChange} /> */}

        {/*Extra 01*/}
        {/* <Toggle on={bothOn} readOnly={true} /> */}
        {/* <Toggle on={bothOn} /> */}

        {/*Extra 02*/}
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={testOn} onChange={() => setTestOn()} />

        {/* <Toggle on={bothOn} onChange={handleToggleChange} /> */}
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
