 const url = "https://jsonplaceholder.typicode.com/todos/1";
export async function getTodoData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
export async function deleteTodo(id: number) {
  try {
    const response = await fetch(`${url}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.ok;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function updateTodo(id: number, data: { title: string; completed: boolean }) {
  try {
    const response = await fetch(`${url}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function createTodo(data: { title: string; completed: boolean }) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
