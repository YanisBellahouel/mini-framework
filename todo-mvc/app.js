import { h, mount }              from '../framework/index.js'
import { createStore }           from '../framework/index.js'
import { createRouter }          from '../framework/index.js'
import { TodoApp }               from './components/TodoApp.js'

export const store = createStore({
  state: {
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
    filter: 'all',
    editingId: null
  },
  mutations: {
    ADD_TODO(state, text) {
      if (!text.trim()) return
      state.todos.push({ id: Date.now(), text: text.trim(), completed: false })
      localStorage.setItem('todos', JSON.stringify(state.todos))
    },
    TOGGLE_TODO(state, id) {
      const todo = state.todos.find(t => t.id === id)
      if (todo) todo.completed = !todo.completed
      localStorage.setItem('todos', JSON.stringify(state.todos))
    },
    DELETE_TODO(state, id) {
      state.todos = state.todos.filter(t => t.id !== id)
      localStorage.setItem('todos', JSON.stringify(state.todos))
    },
    EDIT_TODO(state, { id, text }) {
      const todo = state.todos.find(t => t.id === id)
      if (todo && text.trim()) {
        todo.text = text.trim()
        localStorage.setItem('todos', JSON.stringify(state.todos))
      }
      state.editingId = null
    },
    TOGGLE_ALL(state) {
      const allDone = state.todos.every(t => t.completed)
      state.todos.forEach(t => t.completed = !allDone)
      localStorage.setItem('todos', JSON.stringify(state.todos))
    },
    CLEAR_COMPLETED(state) {
      state.todos = state.todos.filter(t => !t.completed)
      localStorage.setItem('todos', JSON.stringify(state.todos))
    },
    SET_FILTER(state, filter) {
      state.filter = filter
    },
    SET_EDITING(state, id) {
      state.editingId = id
    }
  }
})

const router = createRouter([
  { path: '/',          component: () => store.commit('SET_FILTER', 'all') },
  { path: '/active',    component: () => store.commit('SET_FILTER', 'active') },
  { path: '/completed', component: () => store.commit('SET_FILTER', 'completed') }
])

const container = document.getElementById('app')

function renderApp() {
  const vnode = TodoApp(store.getState())
  // Mount complet à chaque render — plus simple et fiable
  mount(vnode, container)

  // Si un todo est en édition, on focus l'input après le render
  const { editingId } = store.getState()
  if (editingId !== null) {
    const li = container.querySelector(`li[data-id="${editingId}"]`)
    if (li) {
      li.classList.add('editing')
      const input = li.querySelector('.edit')
      if (input) {
        input.focus()
        input.select()
      }
    }
  }
}

store.subscribe(() => renderApp())
router.init()
renderApp()
