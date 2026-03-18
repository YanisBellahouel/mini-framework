# Mini-Framework — Documentation

A lightweight JavaScript framework with Virtual DOM, Routing, State Management and Event Handling.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Virtual DOM](#virtual-dom)
   - [Creating an element](#creating-an-element)
   - [Nesting elements](#nesting-elements)
   - [Adding attributes](#adding-attributes)
   - [Rendering to the page](#rendering-to-the-page)
4. [Event Handling](#event-handling)
   - [Listening to events](#listening-to-events)
   - [Removing a listener](#removing-a-listener)
   - [Emitting custom events](#emitting-custom-events)
5. [State Management](#state-management)
   - [Creating a store](#creating-a-store)
   - [Reading the state](#reading-the-state)
   - [Mutating the state](#mutating-the-state)
   - [Reacting to state changes](#reacting-to-state-changes)
6. [Routing](#routing)
   - [Defining routes](#defining-routes)
   - [Navigating programmatically](#navigating-programmatically)
7. [Why these technical choices](#why-these-technical-choices)

---

## Introduction

Mini-Framework is a lightweight JavaScript framework built from scratch.
It provides four core features:

- **Virtual DOM** — describe your UI in JavaScript, the framework updates only what changed in the real DOM
- **Event Handling** — a custom event system based on event delegation, different from native `addEventListener`
- **State Management** — a global store that keeps your app data in one place and notifies components when it changes
- **Routing** — hash-based routing that synchronizes the URL with the state of the app

The framework follows the principle of **inversion of control**: you define your components and mutations, the framework calls them at the right time.

---

## Getting Started

### Folder structure
```
mini-framework/
├── framework/        ← the framework source files
│   ├── index.js      ← single entry point, import everything from here
│   ├── vdom.js
│   ├── events.js
│   ├── store.js
│   └── router.js
├── todo-mvc/         ← example app built with the framework
└── docs/             ← this documentation
```

### Importing the framework

Always import from `framework/index.js`:
```js
import { h, mount, diff, patch } from '../framework/index.js'
import { on, off, emit }         from '../framework/index.js'
import { createStore }           from '../framework/index.js'
import { createRouter, navigate } from '../framework/index.js'
```

### Running the TodoMVC app

Open `todo-mvc/index.html` directly in your browser using a local server
(e.g. Live Server in VS Code), or run:
```bash
npm start
```

---

## Virtual DOM

### Why a Virtual DOM?

When you update the real DOM directly (e.g. `innerHTML = ...`), the browser
repaints everything — even the parts that didn't change. This is slow.

The Virtual DOM solves this by working in two steps:
1. Describe the UI as a plain JavaScript object (fast)
2. Compare it with the previous version and update **only what changed** in the real DOM

### Creating an element

Use the `h()` function (short for *hyperscript*) to create a virtual node (vnode):
```js
import { h } from '../framework/index.js'

// h(tag, attributes, ...children)
const vnode = h('div', { class: 'box' }, 'Hello world')

// Result (plain JS object):
// {
//   tag: 'div',
//   attrs: { class: 'box' },
//   children: ['Hello world']
// }
```

### Nesting elements

Pass other `h()` calls as children:
```js
const vnode = h('div', { class: 'container' },
  h('h1', {}, 'Title'),
  h('p', {}, 'A paragraph'),
  h('button', {}, 'Click me')
)
```

This represents:
```html
<div class="container">
  <h1>Title</h1>
  <p>A paragraph</p>
  <button>Click me</button>
</div>
```

### Adding attributes

Pass any HTML attribute as a key/value pair in the second argument:
```js
h('input', {
  type: 'text',
  class: 'my-input',
  placeholder: 'Type something...',
  id: 'main-input'
})
```

For event listeners, use the `on` prefix with a capital letter:
```js
h('button', {
  class: 'btn',
  onclick: () => console.log('clicked!'),
  onmouseover: () => console.log('hovered!')
}, 'Click me')
```

### Rendering to the page

Use `mount()` to inject a vnode into a real DOM container:
```js
import { h, mount } from '../framework/index.js'

const vnode = h('h1', {}, 'Hello world')
const container = document.getElementById('app')

mount(vnode, container)
// → <div id="app"><h1>Hello world</h1></div>
```

To update the UI after a change, use `diff()` and `patch()`:
```js
import { h, mount, diff, patch } from '../framework/index.js'

const container = document.getElementById('app')

// First render
const vnode1 = h('p', {}, 'Hello')
mount(vnode1, container)

// Later, something changed
const vnode2 = h('p', {}, 'Hello world')
const patchObj = diff(vnode1, vnode2)   // find what changed
patch(container.firstChild, patchObj)   // apply only that change
```

---

## Event Handling

### Why a custom event system?

The native `addEventListener` requires a direct reference to the DOM element:
```js
// Native — requires the element to already exist in the DOM
document.getElementById('btn').addEventListener('click', handler)
```

This is a problem when elements are created dynamically (e.g. a list of todos).
Our system uses **event delegation**: one single listener on the `document`
intercepts all events and dispatches them to the right handler.

### Listening to events
```js
import { on } from '../framework/index.js'

// on(eventType, selector, handler)
on('click', '#my-button', (event) => {
  console.log('Button clicked!')
})

on('input', '.search-field', (event) => {
  console.log('Input value:', event.target.value)
})

on('keydown', '.edit', (event) => {
  if (event.key === 'Enter') console.log('Enter pressed!')
})
```

The selector supports any valid CSS selector (`#id`, `.class`, `tag`, etc.).

### Removing a listener
```js
import { on, off } from '../framework/index.js'

function handleClick(event) {
  console.log('clicked')
}

on('click', '#btn', handleClick)

// Later, remove it — pass the exact same function reference
off('click', '#btn', handleClick)
```

### Emitting custom events

Use `emit()` to trigger an event manually, without user interaction:
```js
import { on, emit } from '../framework/index.js'

// Listen for a custom event
on('userLoggedIn', 'body', (event) => {
  console.log('User:', event.detail.username)
})

// Trigger it from anywhere in the app
emit('userLoggedIn', { username: 'Alice' })
```

---

## State Management

### Why a global store?

In a multi-component app, several parts of the UI may need the same data
(e.g. a todo list displayed in the main view and counted in the footer).
Without a store, each component keeps its own copy — they quickly go out of sync.

The store is a **single source of truth**: all data lives there, all
modifications go through it, and all components are notified when it changes.

### Creating a store
```js
import { createStore } from '../framework/index.js'

const store = createStore({
  // Initial state of the app
  state: {
    todos: [],
    filter: 'all'
  },
  // The only way to modify the state
  mutations: {
    ADD_TODO(state, text) {
      state.todos.push({ id: Date.now(), text, completed: false })
    },
    TOGGLE_TODO(state, id) {
      const todo = state.todos.find(t => t.id === id)
      if (todo) todo.completed = !todo.completed
    },
    SET_FILTER(state, filter) {
      state.filter = filter
    }
  }
})
```

### Reading the state
```js
const state = store.getState()
console.log(state.todos)   // []
console.log(state.filter)  // 'all'
```

`getState()` returns a **copy** of the state — modifying it directly has no effect.
Always use `commit()` to make changes.

### Mutating the state
```js
// commit(mutationName, payload)
store.commit('ADD_TODO', 'Learn the framework')
store.commit('TOGGLE_TODO', 1234567890)
store.commit('SET_FILTER', 'active')
```

### Reacting to state changes

Use `subscribe()` to run a function every time the state changes:
```js
store.subscribe((newState) => {
  console.log('State changed:', newState)
  // Re-render your UI here
  renderApp()
})
```

---

## Routing

### Why hash-based routing?

Hash routing uses the `#` part of the URL (e.g. `myapp.com/#/active`).
Changes to the hash do **not** reload the page, making navigation instant.
It also works without a server configuration — just open the HTML file.

### Defining routes
```js
import { createRouter } from '../framework/index.js'

const router = createRouter([
  {
    path: '/',
    component: () => {
      // called when URL is myapp.com/#/
      store.commit('SET_FILTER', 'all')
    }
  },
  {
    path: '/active',
    component: () => {
      // called when URL is myapp.com/#/active
      store.commit('SET_FILTER', 'active')
    }
  },
  {
    path: '/completed',
    component: () => {
      store.commit('SET_FILTER', 'completed')
    }
  }
])

// Start the router — resolves the current URL immediately
router.init()
```

### Navigating programmatically
```js
import { navigate } from '../framework/index.js'

// Changes the URL and triggers the matching route
navigate('/active')    // → myapp.com/#/active
navigate('/')          // → myapp.com/#/
```

You can also use plain HTML anchor tags:
```html
<a href="#/">All</a>
<a href="#/active">Active</a>
<a href="#/completed">Completed</a>
```

---

## Why these technical choices

### Virtual DOM over direct DOM manipulation

Directly manipulating the DOM (e.g. with `innerHTML`) is simple but expensive:
the browser has to recalculate styles and repaint the page on every change.
The Virtual DOM lets us batch and minimize those changes by computing a diff
in plain JavaScript first — which is much faster.

### Event delegation over individual listeners

Attaching one `addEventListener` per element means:
- You need the element to exist before attaching the listener
- You have to manually remove listeners to avoid memory leaks
- Dynamic elements (added after page load) need special handling

Event delegation solves all three: one listener on `document` catches every
event that bubbles up, checks if it matches a registered selector, and calls
the right handler. Dynamic elements work automatically.

### Centralized store over component state

When state is scattered across components, keeping them in sync requires
passing data up and down through every layer. A centralized store makes
the data flow predictable: state goes in one direction (store → component),
and mutations are the only way to change it. This makes bugs easier to trace.

### Hash routing over History API

The History API (`pushState`) produces cleaner URLs but requires a server
configured to serve `index.html` for every route. Hash routing works with
any static file server (or even no server at all), making it the right
choice for a framework meant to be easy to run locally.

---

## Canvas

### Why a Canvas?

For games running at 60fps, the Virtual DOM is too slow — it's designed for
UIs, not for redrawing hundreds of elements every frame. The Canvas API lets
you draw directly on a 2D surface, which is much faster for games.

### Creating a canvas
```js
import { createCanvas } from '../framework/index.js'

const screen = createCanvas({
  containerId: 'app',  // id of the HTML container
  width: 800,
  height: 600
})
```

### Drawing methods
```js
// Fill the background
screen.setBackground('#1a1a2e')

// Draw a filled rectangle — x, y, width, height, color
screen.drawRect(100, 100, 40, 40, '#e94560')

// Draw a circle — x, y, radius, color
screen.drawCircle(200, 200, 20, '#fff')

// Draw text — text, x, y, options
screen.drawText('Score: 0', 10, 30, { color: '#fff', font: 'bold 16px Arial' })

// Draw an image/sprite
screen.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)

// Clear the canvas (call at the start of each frame)
screen.clear()
```

---

## Game Loop

### Why a game loop?

A game needs to update and redraw itself continuously — typically 60 times
per second. `requestAnimationFrame` is the browser's built-in way to do this
efficiently, synchronized with the screen refresh rate.

The `deltaTime` parameter tells you how much time passed since the last frame
(in seconds). Always multiply speeds by `deltaTime` so the game runs at the
same speed on every machine.

### Creating a game loop
```js
import { createCanvas, createGameLoop } from '../framework/index.js'

const screen = createCanvas({ containerId: 'app', width: 800, height: 600 })

let playerX = 0

const loop = createGameLoop({

  // update — game logic (positions, collisions, score...)
  update(deltaTime) {
    playerX += 150 * deltaTime  // move 150px per second
  },

  // draw — render everything on the canvas
  draw() {
    screen.setBackground('#1a1a2e')
    screen.drawRect(playerX, 300, 40, 40, '#e94560')
  }
})

loop.start()  // start the loop
loop.stop()   // pause the loop
loop.isRunning()  // returns true/false
```
