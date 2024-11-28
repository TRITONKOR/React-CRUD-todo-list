const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = "./database/tasks.json";

const readTasks = () => {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
};

const writeTasks = (tasks) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
};

app.get("/todos", (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).send("Error reading tasks");
    }
});

app.post("/todos", (req, res) => {
    try {
        const tasks = readTasks();
        const newTask = { ...req.body, id: tasks.length + 1 };
        tasks.push(newTask);
        writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).send("Error adding task");
    }
});

app.put("/todos/:id", (req, res) => {
    try {
        const tasks = readTasks();
        const taskId = parseInt(req.params.id, 10);
        const updatedTasks = tasks.map((task) =>
            task.id === taskId
                ? {
                      ...task,
                      completed: req.body.completed,
                      title: req.body.title,
                  }
                : task
        );
        writeTasks(updatedTasks);
        res.json(updatedTasks.find((task) => task.id === taskId));
    } catch (error) {
        res.status(500).send("Error updating task");
    }
});

app.delete("/todos/:id", (req, res) => {
    try {
        const tasks = readTasks();
        const taskId = parseInt(req.params.id, 10);
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        writeTasks(updatedTasks);
        res.status(200).send("Task deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting task");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
