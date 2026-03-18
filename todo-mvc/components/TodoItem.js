import { h }     from '../../framework/index.js'
import { store } from '../app.js'

export function TodoItem(todo, editingId) {
  const isEditing = editingId === todo.id

  return h('li', {
      class: [
        todo.completed ? 'completed' : '',
        isEditing ? 'editing' : ''
      ].filter(Boolean).join(' '),
      'data-id': String(todo.id)
    },

    h('div', { class: 'view' },
      h('input', {
        class: 'toggle',
        type: 'checkbox',
        ...(todo.completed ? { checked: 'true' } : {}),
        onchange: () => store.commit('TOGGLE_TODO', todo.id)
      }),
      h('label', {
        ondblclick: () => store.commit('SET_EDITING', todo.id)
      }, todo.text),
      h('button', {
        class: 'destroy',
        onclick: () => store.commit('DELETE_TODO', todo.id)
      })
    ),

    h('input', {
      class: 'edit',
      value: todo.text,
      onblur: (e) => {
        store.commit('EDIT_TODO', { id: todo.id, text: e.target.value })
      },
      onkeydown: (e) => {
        if (e.key === 'Enter') {
          store.commit('EDIT_TODO', { id: todo.id, text: e.target.value })
        }
        if (e.key === 'Escape') {
          store.commit('SET_EDITING', null)
        }
      }
    })
  )
}
