const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "User doesn't exists.",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const findIfExistsAUser = users.some((user) => user.username === username);

  if (findIfExistsAUser) {
    return response.status(400).json({
      error: "User already exists.",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(400).json({
      error: "Please put a title and a deadline.",
    });
  }

  const findToDoById = user.todos.find((idTodo) => idTodo.id === id);

  if (!findToDoById) {
    return response.status(404).json({
      error: "Doesn't exist any todo.",
    });
  }

  findToDoById.title = title;
  findToDoById.deadline = new Date(deadline);

  return response.status(201).json(findToDoById);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const findToDoById = user.todos.find((idTodo) => idTodo.id === id);

  if (!findToDoById) {
    return response.status(404).json({
      error: "Doesn't exist any todo.",
    });
  }

  findToDoById.done = true;

  return response.status(201).json(findToDoById);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const findToDoById = user.todos.find((idTodo) => idTodo.id === id);

  if (!findToDoById) {
    return response.status(404).json({
      error: "Doesn't exist any todo.",
    });
  }

  const indexCustomer = user.todos.indexOf((todo) => todo === findToDoById);

  user.todos.splice(indexCustomer, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
