import { h }        from '../../framework/index.js'
import { store }    from '../app.js'
import { TodoItem } from './TodoItem.js'
import { Footer }   from './Footer.js'

export function TodoApp(state) {
  const { todos, filter } = state

  // Filtre les todos selon le filtre actif
  const filtered = todos.filter(todo => {
    if (filter === 'active')    return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeTodos = todos.filter(t => !t.completed)
  const allCompleted = todos.length > 0 && todos.every(t => t.completed)

  return h('section', { class: 'todoapp' },

    // Header
    h('header', { class: 'header' },
      h('h1', {}, 'todos'),
      h('input', {
        class: 'new-todo',
        placeholder: 'What needs to be done?',
        autofocus: 'true',
        onkeydown: (e) => {
          if (e.key === 'Enter') {
            store.commit('ADD_TODO', e.target.value)
            e.target.value = ''
          }
        }
      })
    ),

    // Main (visible seulement si des todos existent)
    todos.length > 0
      ? h('section', { class: 'main' },
          h('input', {
            id: 'toggle-all',
            class: 'toggle-all',
            type: 'checkbox',
            ...(allCompleted ? { checked: 'true' } : {}),
            onchange: () => store.commit('TOGGLE_ALL')
          }),
          h('label', { for: 'toggle-all' }, 'Mark all as complete'),
          h('ul', { class: 'todo-list' },
            ...filtered.map(todo => TodoItem(todo))
          )
        )
      : h('span', {}),

    // Footer
    todos.length > 0
      ? Footer({ todos, filter, activeTodos })
      : h('span', {})
  )
}
