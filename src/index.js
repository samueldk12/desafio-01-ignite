const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user_object = users.find(
    user => user.username === username
  )
  
  if(!user_object)
    return response.status(400).json({error:'User not found!'})

  request.user = user_object;
  
  return next()
}

app.post('/users', (request, response) => {
   const {name, username} = request.body;

   const alredyExistUsername = users.some(
      user => user.username === username
   )

   if(alredyExistUsername)
    return response.status(400).json({error: 'Mensagem do erro'})

   const user = {
     id : uuidv4(),
     name,
     username,
     todos: []
   }

   users.push(user);

   return response.status(201).json({message: 'User Created!'})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const { id } = request.params;

  const todo_object = user.todos.find(
    todo => todo.id === id
  )

  if(!todo_object)
    return response.status(404).json({error:'Todo not found'})

  todo_object.title = title
  todo_object.deadline = deadline

  return response.status(200).json({message: 'Todo Updated!'})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { id } = request.params;

  const todo_object = user.todos.find(
    todo => todo.id === id
  )

  if(!todo_object)
    return response.status(404).json({error:'Todo not found'})

  todo_object.done = true

  return response.status(200).json({message: 'Todo Completed!'})
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { id } = request.params;

  const todo_object = user.todos.find(
    todo => todo.id === id
  )

  if(!todo_object)
    return response.status(404).json({error:'Todo not found'})

  user.todos.splice(todo_object,1)

  return response.status(200).json({message: 'Todo Removed!'})
});

module.exports = app;