var express = require('express');
var app = express();
var request = require('request');
var axios = require('axios');
var cheerioParser = require('cheerio');
var db = require('quick.db');
var cors = require('cors');

var getAllFunc = async () => {
  let response;
  try {
    response = await axios.get('https://www.worldometers.info/coronavirus/');
    if (response.status !== 200) {
      console.log('ERROR');
    }
  } catch (err) {
    return null;
  }

  // to store parsed data
  const result: { [key: string]: string } = {};

  // get HTML and parse death rates
  const html = cheerioParser.load(response.data);
  html('.maincounter-number').filter((i, el) => {
    let count = el.children[0].next.children[0].data || '0';
    count = parseInt(count.replace(/,/g, '') || '0', 10);
    // first one is
    if (i === 0) {
      result.cases = count;
    } else if (i === 1) {
      result.deaths = count;
    } else {
      result.recovered = count;
    }
  });

  db.set('all', result);
  console.log('Updated The Cases', result);
};

const parseCountryCol = (cell): string => {
  let country =
    cell?.children[0]?.data ||
    cell?.children[0]?.children[0]?.data ||
    // country name with link has another level
    cell?.children[0]?.children[0]?.children[0]?.data ||
    cell?.children[0]?.children[0]?.children[0]?.children[0]?.data ||
    '';
  country = country?.trim();
  if (country?.length === 0) {
    // parse with hyperlink
    country = cell?.children[0]?.next?.children[0]?.data || '';
  }
  return country;
};

const parseCol = cell => {
  let colValue = cell?.children[0]?.data || '';
  return parseInt(colValue?.trim().replace(/,/g, '') || '0', 10);
};

var getCountriesFunc = async () => {
  let response;
  try {
    response = await axios.get('https://www.worldometers.info/coronavirus/');
    if (response.status !== 200) {
      console.log('Error', response.status);
    }
  } catch (err) {
    return null;
  }

  // to store parsed data
  const result = [];

  // get HTML and parse death rates
  const html = cheerioParser.load(response.data);
  const countriesTable = html('table#main_table_countries');
  const countriesTableCells = countriesTable
    .children('tbody')
    .children('tr')
    .children('td');

  // NOTE: this will change when table format change in website
  const totalColumns = 9;
  const countryColIndex = 0;

  const props = [
    'cases',
    'todayCases',
    'deaths',
    'todayDeaths',
    'recovered',
    'active',
    'critical',
    'casesPerMillionPopulation'
  ];

  // minus totalColumns to skip last row, which is total
  for (let i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
    const cell = countriesTableCells[i];

    if (i % totalColumns === countryColIndex) {
      let country = parseCountryCol(cell);
      result.push({
        country: country?.trim() || ''
      });
    } else {
      result[result.length - 1][props[(i - 1) % totalColumns]] = parseCol(cell);
    }
  }

  db.set('countries', result);
  console.log('Updated The Countries', result);
};

var init = () => {
  getAllFunc();
  getCountriesFunc();
};

init();

var getAll = setInterval(getAllFunc, 60000);
var getCountries = setInterval(getCountriesFunc, 60000);

var corsOptions = {
  origin: '*'
};

var c = cors(corsOptions);

app.get('/', c, async function(request, response) {
  let a = await db.fetch('all');
  response.send(
    `${a.cases} cases are reported of the COVID-19 Novel Coronavirus strain<br> ${a.deaths} have died from it <br>\n${a.recovered} have recovered from it <br> Get the endpoint /all to get information for all cases <br> get the endpoint /countries for getting the data sorted country wise`
  );
});

var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/all/', c, async function(req, res) {
  let all = await db.fetch('all');
  res.send(all);
});

app.get('/countries/', c, async function(req, res) {
  let countries = await db.fetch('countries');
  res.send(countries);
});
