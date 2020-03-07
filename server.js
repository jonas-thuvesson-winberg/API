var express = require('express');
var app = express();
var request = require('request');
var axios = require('axios');
var cheerio = require('cheerio');
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
  const result = {};

  // get HTML and parse death rates
  const html = cheerio.load(response.data);
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
  const html = cheerio.load(response.data);
  const countriesTable = html('table#main_table_countries');
  const countriesTableCells = countriesTable
    .children('tbody')
    .children('tr')
    .children('td');

  // NOTE: this will change when table format change in website
  const totalColumns = 8;
  const countryColIndex = 0;
  const casesColIndex = 1;
  const todayCasesColIndex = 2;
  const deathsColIndex = 3;
  const todayDeathsColIndex = 4;
  const curedColIndex = 6;
  const criticalColIndex = 7;

  // minus totalColumns to skip last row, which is total
  for (let i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
    const cell = countriesTableCells[i];

    // get country
    if (i % totalColumns === countryColIndex) {
      let country = '';
      if (cell.children && cell.children.length > 0) {
        country =
          cell.children[0].data ||
          cell.children[0].children[0].data ||
          // country name with link has another level
          cell.children[0].children[0].children[0].data ||
          cell.children[0].children[0].children[0].children[0].data ||
          '';
      }

      country = country.trim();
      if (country.length === 0) {
        // parse with hyperlink
        country = '';
        if (
          cell.children &&
          cell.children.length > 0 &&
          cell.children[0].next &&
          cell.children[0].next.children &&
          cell.children[0].next.children.length > 0 &&
          cell.children[0].next.children[0].data
        ) {
          country = cell.children[0].next.children[0].data;
        }
      }
      // var x = new RegExp('^[A-Za-z]+$');
      // if (country.match(x)) {
      result.push({ country: country.trim() || '' });
      // }
    }
    // get cases
    if (i % totalColumns === casesColIndex) {
      let cases = '';
      if (cell.children && cell.children[0]) {
        cases = cell.children[0].data || '';
      }
      result[result.length - 1].cases = parseInt(
        cases.trim().replace(/,/g, '') || '0',
        10
      );
    }
    // get today cases
    if (i % totalColumns === todayCasesColIndex) {
      let cases = '';
      if (cell.children && cell.children > 0) {
        cases = cell.children[0].data || '';
      }
      result[result.length - 1].todayCases = parseInt(
        cases.trim().replace(/,/g, '') || '0',
        10
      );
    }
    // get deaths
    if (i % totalColumns === deathsColIndex) {
      let deaths = '';
      if (cell.children && cell.children.length > 0) {
        deaths = cell.children[0].data || '';
      }
      result[result.length - 1].deaths = parseInt(
        deaths.trim().replace(/,/g, '') || '0',
        10
      );
    }
    // get today deaths
    if (i % totalColumns === todayDeathsColIndex) {
      let deaths = '';
      if (cell.children && cell.children.length > 0) {
        deaths = cell.children[0].data || '';
      }
      result[result.length - 1].todayDeaths = parseInt(
        deaths.trim().replace(/,/g, '') || '0',
        10
      );
    }
    // get cured
    if (i % totalColumns === curedColIndex) {
      let cured = '';
      if (cell.children && cell.children.length > 0) {
        cured = cell.children[0].data || '';
      }
      result[result.length - 1].recovered = parseInt(
        cured.trim().replace(/,/g, '') || 0,
        10
      );
    }
    // get critical
    if (i % totalColumns === criticalColIndex) {
      let critical = '';
      if (cell.children && cell.children > 0) {
        critical = cell.children[0].data || '';
      }
      result[result.length - 1].critical = parseInt(
        critical.trim().replace(/,/g, '') || '0',
        10
      );
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

app.get('/', cors(), async function(request, response) {
  let a = await db.fetch('all');
  response.send(
    `${a.cases} cases are reported of the COVID-19 Novel Coronavirus strain<br> ${a.deaths} have died from it <br>\n${a.recovered} have recovered from it <br> Get the endpoint /all to get information for all cases <br> get the endpoint /countries for getting the data sorted country wise`
  );
});

var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/all/', cors(), async function(req, res) {
  let all = await db.fetch('all');
  res.send(all);
});

app.get('/countries/', cors(), async function(req, res) {
  let countries = await db.fetch('countries');
  res.send(countries);
});
