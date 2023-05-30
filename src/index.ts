import express, { Request, Response } from "express";
import fs from "fs";
import bodyParser from "body-parser";

interface User {
  id: number;
  username: string;
  name?: string;
}

let users: User[] = [];
let nextUserId = 1;

const app = express();
app.use(bodyParser.json());
fs.mkdirSync("./data", { recursive: true }); // Створення теки
fs.writeFile("./data/users.json", '', function (err) { // Створення файлу
  
    console.log('A new text file was created successfully.');
    
}); 

// Загрузка даних користувачів з файлу
const loadUsers = () => {
	try {
	  const data = fs.readFileSync("./data/users.json", 'utf8');
	  if (data.trim() === '') {
		users = [];
	  } else {
		users = JSON.parse(data);
		nextUserId = Math.max(...users.map((user) => user.id), 0) + 1;
	  }
	} catch (err) {
	  console.error('Error loading users', err);
	  users = []; // Ініціалцізація масиву користувачів
	  nextUserId = 1;
	}
  };
  

// Збереження даних користувачів у файл
const saveUsers = () => {
  try {
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync("./data/users.json", data, "utf8");
  } catch (err) {
    console.error("Error saving users", err);
  }
};

loadUsers();

// Створення користувача
app.post('/users', (req: Request, res: Response) => {
  const { username, name } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const newUser: User = {
    id: nextUserId++,
    username,
    ...(name && { name }),
  };

  users.push(newUser);
  saveUsers();
  loadUsers();

  return res.status(201).json(newUser);
});

app.get("/users/:id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

app.get("/users", (_req: Request, res: Response) => {
  return res.json(users);
});

app.put("/users/:id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { username, name } = req.body;
  user.username = username || user.username;
  user.name = name || user.name;

  return res.json(user);
});

app.delete("/users/:id", (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = users.splice(index, 1)[0];
  saveUsers();

  return res.json(deletedUser);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
