import './App.css'

import { createTodo, deleteTodo, getTodoData, updateTodo } from "./api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useState } from 'react'

function App() {
  const queryClient = useQueryClient()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  // Fetch todos with better error handling
  const { data: todos, isPending, error, refetch } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodoData,
    retry: 2, // Will retry failed requests 2 times
  })

  // Create todo with optimistic update
  const createMutation = useMutation({
    mutationFn: createTodo,
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      // Snapshot current todos
      const previousTodos = queryClient.getQueryData(['todos'])
      
      // Optimistically add new todo
      queryClient.setQueryData(['todos'], (old) => [
        { id: Date.now(), ...newTodo, completed: false },
        ...(old || [])
      ])

      return { previousTodos }
    },
    onError: (err, variables, context) => {
      console.error('Create error:', err)
      if (context) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  // Update todo with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { completed: boolean } }) => updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData(['todos'])
      
      queryClient.setQueryData(['todos'], (old) => 
        old?.map(todo => 
          todo.id === id ? { ...todo, ...data } : todo
        )
      )

      return { previousTodos }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  // Delete todo with optimistic update
  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData(['todos'])
      
      queryClient.setQueryData(['todos'], (old) => 
        old?.filter(todo => todo.id !== id)
      )

      return { previousTodos }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
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
    setNewTodoTitle('')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Todo List</h1>
          
          {/* Create Todo Form */}
          <form onSubmit={handleCreateTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-gray-100 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Todo'}
              </button>
            </div>
          </form>

          {/* Error with Retry Button */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
              <p>Error: {error.message}</p>
              <button 
                onClick={() => refetch()}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isPending && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Todo List */}
          <ul className="space-y-3">
            {todos?.map(todo => (
              <li 
                key={todo.id}
                className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                <button
                  onClick={() => updateMutation.mutate({ 
                    id: todo.id,
                    data: { completed: !todo.completed }
                  })}
                  disabled={updateMutation.isPending}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center
                    ${todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'}`}
                >
                  {todo.completed && '✓'}
                </button>

                <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.todo}
                </span>

                <button
                  onClick={() => deleteMutation.mutate(todo.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '...' : '🗑️'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
