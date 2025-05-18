const BASE_URL = "https://dummyjson.com"

// Get all todos
export const getTodoData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/todos`)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    return json.todos // dummyjson returns { todos: [...] }
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

// Get single todo
export const getSingleTodo = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/todos/${id}`)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

// Add new todo
export const createTodo = async (data: { todo: string, completed: boolean, userId: number }) => {
  try {
    const response = await fetch(`${BASE_URL}/todos/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

// Update todo
export const updateTodo = async (id: number, data: { todo?: string, completed?: boolean }) => {
  try {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT", // dummyjson uses PUT for updates
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

// Delete todo
export const deleteTodo = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    return response.json() // dummyjson returns the deleted todo
  } catch (error) {
    console.error(error.message)
    throw error
  }
}
