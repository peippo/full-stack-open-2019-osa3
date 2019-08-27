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

const errorHandler = (error, req, res, next) => {
	console.error(error.message);

	if (error.name === "CastError" && error.kind == "ObjectId") {
		return res.status(400).send({ error: "Malformed ID" });
	}

	next(error);
};

app.use(errorHandler);

app.get("/api/persons", (req, res) => {
	Person.find({}).then(people => {
		res.json(people.map(person => person.toJSON()));
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person.toJSON());
			} else {
				res.status(404).end();
			}
		})
		.catch(error => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
	const body = req.body;

	const person = {
		name: body.name,
		number: body.number
	};

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then(updatedPerson => {
			res.json(updatedPerson.toJSON());
		})
		.catch(error => next(error));
});

app.get("/info", (req, res) => {
	Person.countDocuments().then(documentCount => {
		res.send(
			`<p>Phonebook has info for ${documentCount} people</p><p>${new Date()}</p>`
		);
	});
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

app.delete("/api/persons/:id", (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).end();
		})
		.catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
