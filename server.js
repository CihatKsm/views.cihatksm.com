let mongodb = "<Paste-your-mongo-db-url>"

const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require("fs");
const app = express();

const views_data = mongoose.model("views_data", mongoose.Schema({
  costum_text: { type: String, required: true },
  views: { type: String, required: true },
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'));
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, './')));

app.get("/", async (req, res) => {
  res.render('index')
});
  
app.get("/:costum_text", async (req, res) => {
  let costum_text = req.params.costum_text;
  let finddata = await views_data.findOne({ costum_text: costum_text }); 
  
  if(!finddata) {
    new views_data({ costum_text: costum_text,views: 1 }).save(); 
  } else { 
    finddata.views++; finddata.save();
  }
  let data;
  if(finddata) { data = finddata } else { data = { costum_text, views: "1"}}

  let svg = ""
  svg += '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
  svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
  svg += '<svg width="150" height="20" xmlns="http://www.w3.org/2000/svg">\n'
  svg += `<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#161b22" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>`
  svg += `<mask id="a"><rect width="150" height="20" rx="3" fill="#fff"/></mask>`
  svg += `<g mask="url(#a)">
            <rect width="80" height="20" fill="#161b22"/>
            <rect x="80" width="70" height="20" fill="#b440f1"/>
            <rect width="150" height="20" fill="url(#b)"/>
          </g>`
  svg += `<g fill="#fff" text-anchor="middle" font-family="Gill Sans, sans-serif" font-size="11">
            <text x="40" y="14">Views:</text>
            <text x="115" y="14">${data.views}</text>
          </g>`
  svg += '</svg>'
  
  fs.writeFile(`${costum_text}.svg`, svg, async (err) => {  
    if (err) throw err;
    await res.sendfile(`${costum_text}.svg`);
    console.clear();
  });
});


app.get("/:costum_text/api", async (req, res) => {
  let costum_text = req.params.costum_text;
  let finddata = await views_data.findOne({ costum_text: costum_text });
  let data;
  if(finddata) { data = finddata } else { data = "undefined"}
  let datas = { views: data.views, costum_text: data.costum_text }
  await res.send(JSON.stringify(data, null, 2))
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`> [server.js] - Website Online.`);
  mongoose.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('> [server.js] - Connected MongoDB')).catch(err => console.log(err));
});
