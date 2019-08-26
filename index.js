require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const Person = require("./models/person");

app.use(express.static("build"));
app.use(cors());
app.use(bodyParser.json());
app.use(
	morgan(function(tokens, req, res) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			tokens.postContent(req, res)
		].join(" ");
	})
);

morgan.token("postContent", function(req, res) {
	return JSON.stringify(req.body);
});

const generateId = () => {
	return Math.floor(Math.random() * 10000000);
};

let persons = [
	{
		name: "Arto Hellas",
		number: "040-123456",
		id: 1
	},
	{
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: 2
	},
	{
		name: "Dan Abramov",
		number: "12-43-234345",
		id: 3
	},
	{
		name: "Mary Poppendieck",
		number: "39-23-6423122",
		id: 4
	}
];

app.get("/api/persons", (req, res) => {
	Person.find({}).then(people => {
		res.json(people.map(person => person.toJSON()));
	});
});

app.get("/api/persons/:id", (req, res) => {
	Person.findById(req.params.id).then(person => {
		res.json(person.toJSON());
	});
});

app.get("/info", (req, res) => {
	res.send(
		`<p>Phonebook has info for ${
			persons.length
		} people</p><p>${new Date()}</p>`
	);
});

app.post("/api/persons", (req, res) => {
	const body = req.body;

	if (!body || !body.name || !body.number) {
		return res.status(400).json({
			error: "Name and number required!"
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number
	});

	person.save().then(savedPerson => {
		res.json(savedPerson.toJSON());
	});
});

app.delete("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id);
	persons = persons.filter(person => person.id !== id);
	res.status(204).end();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
