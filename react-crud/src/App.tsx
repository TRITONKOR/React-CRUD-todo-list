import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [title, setTitle] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState<string>("");

    useEffect(() => {
        async function fetchTodos() {
            try {
                const response = await fetch("http://localhost:5000/todos");
                const data: Todo[] = await response.json();
                setTodos(data);
            } catch (error) {
                console.error("Failed to fetch todos:", error);
            }
        }
        fetchTodos();
    }, []);

    const handleClick = async () => {
        if (!title.trim()) return;

        try {
            const response = await fetch("http://localhost:5000/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), completed: false }),
            });
            const newTodo = await response.json();
            setTodos((prevTodos) => [...prevTodos, newTodo]);
            setTitle("");
        } catch (error) {
            console.error("Failed to create todo:", error);
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const todo = todos.find((todo) => todo.id === id);
            if (!todo) return;

            const response = await fetch(`http://localhost:5000/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !todo.completed }),
            });
            const updatedTodo = await response.json();

            setTodos((prevTodos) =>
                prevTodos.map((todo) =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                )
            );
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await fetch(`http://localhost:5000/todos/${id}`, {
                method: "DELETE",
            });
            setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    const handleEdit = (id: number, currentTitle: string) => {
        setEditingId(id);
        setEditTitle(currentTitle);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editTitle.trim()) return;

        try {
            const response = await fetch(
                `http://localhost:5000/todos/${editingId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editTitle.trim(),
                        completed: false,
                    }),
                }
            );
            console.log(response);
            const updatedTodo = await response.json();

            setTodos((prevTodos) =>
                prevTodos.map((todo) =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                )
            );
            setEditingId(null); // Exit edit mode
            setEditTitle("");
        } catch (error) {
            console.error("Failed to save edited todo:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    return (
        <div className="container">
            <h2 className="mb-4 mt-4">Todo list</h2>
            <div id="form-check" className="d-flex gap-2 mb-4">
                <input
                    id="task-input"
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "400px" }}
                    placeholder="Enter a new task"
                    onChange={handleInputChange}
                    value={title}
                />
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClick}
                >
                    Create
                </button>
            </div>
            <div id="todo-list">
                <ul className="list-unstyled">
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            className={`d-flex align-items-center justify-content-between mb-2${
                                todo.completed ? "completed" : ""
                            }`}
                        >
                            {editingId === todo.id ? (
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(e.target.value)
                                        }
                                    />
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={handleSaveEdit}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() =>
                                            handleToggleStatus(todo.id)
                                        }
                                    />
                                    <span className="ms-2">{todo.title}</span>
                                </div>
                            )}
                            {editingId !== todo.id && (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() =>
                                            handleEdit(todo.id, todo.title)
                                        }
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(todo.id)}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

export default App;
