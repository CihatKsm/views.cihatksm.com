const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const views_data = mongoose.model("views", mongoose.Schema({
  name: { type: String, required: true },
  views: { type: Number, required: true },
}));

app.get("/", async (req, res) => {
  const file = fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf8");
  return res.send(file);
});

app.get("/:name", async (req, res) => {
  var data = await views_data.findOne({ name: req.params.name }) || new views_data({ name: req.params.name, views: 1 });
  
  data.views++; 
  data.save();

  var svg = 
    `<svg width="150" height="20" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect fill="#555" height="20" width="150" y="0" x="0"/>
        <rect fill="#4c1" height="20" width="100" y="0" x="50"/>
        <rect fill="url(#a)" height="20" width="150" y="0" x="0"/>
      </g>
      <defs>
        <linearGradient id="a" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
      </defs>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="25" y="15" fill="#010101" fill-opacity=".3">views</text>
        <text x="25" y="14">views</text>
        <text x="100" y="15" fill="#010101" fill-opacity=".3">${data.views}</text>
        <text x="100" y="14">${data.views}</text>
      </g>
    </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(svg);
});

app.get("/:name/api", async (req, res) => {
  var data = await views_data.findOne({ name: req.params.name }) || { name: req.params.name, views: 0 };
  return res.json(data);
});

mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('> [server.js] - Connected MongoDB'))
    .catch(err => console.log(err));

app.listen(config.port, () => {
  console.log(`> [server.js] - Website Online : http://localhost:3000/`);
});
