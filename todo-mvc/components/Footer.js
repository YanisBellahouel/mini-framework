import { h } from '../../framework/index.js'
import { store } from '../app.js'

export function Footer({ todos, filter, activeTodos }) {
  const completedCount = todos.filter(t => t.completed).length

  return h('footer', { class: 'footer' },
    h('span', { class: 'todo-count' },
      h('strong', {}, String(activeTodos.length)),
      activeTodos.length === 1 ? ' item left' : ' items left'
    ),
    h('ul', { class: 'filters' },
      h('li', {},
        h('a', {
          class: filter === 'all' ? 'selected' : '',
          href: '#/'
        }, 'All')
      ),
      h('li', {},
        h('a', {
          class: filter === 'active' ? 'selected' : '',
          href: '#/active'
        }, 'Active')
      ),
      h('li', {},
        h('a', {
          class: filter === 'completed' ? 'selected' : '',
          href: '#/completed'
        }, 'Completed')
      )
    ),
    completedCount > 0
      ? h('button', {
          class: 'clear-completed',
          onclick: () => store.commit('CLEAR_COMPLETED')
        }, 'Clear completed')
      : h('span', {})
  )
}
