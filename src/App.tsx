import './App.css'
import { useState } from 'react'
import { createTodo, getTodoData } from './api'
import { useMutation, useQuery } from '@tanstack/react-query'

// TypeScript interface for Todo
interface Todo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

function App() {
  const [newTodoTitle, setNewTodoTitle] = useState('')

  // 1. Fetch todos with loading and error states
  const { 
    data: todos,   // The actual todos
    isPending,     // Loading state
    error,        // Error state
    refetch       // Retry function
  } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: getTodoData,
    retry: 2
  })

  // 2. Create new todo
  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      setNewTodoTitle('')
      refetch()
    }
  })

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return

    createMutation.mutate({
      todo: newTodoTitle,
      completed: false,
      userId: 1
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Todo List</h1>
          
          {/* Add Todo Form */}
          <form onSubmit={handleCreateTodo} className="mb-6">
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="sr-only">New todo</span>
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </label>
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Todo'}
              </button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>Error loading todos: {error.message}</p>
              <button 
                onClick={() => refetch()} 
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isPending ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                  <div className="h-4 w-4 bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-600 rounded flex-1"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Todo List */
            <ul className="space-y-3">
              {todos?.map(todo => (
                <li key={todo.id} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg text-white">
                  <input 
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                    aria-label={`Mark ${todo.todo} as ${todo.completed ? 'incomplete' : 'complete'}`}
                    className="w-4 h-4"
                  />
                  <span className={todo.completed ? 'line-through' : ''}>
                    {todo.todo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
