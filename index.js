var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require('express');
var app = express();
var request = require('request');
var axios = require('axios');
var cheerioParser = require('cheerio');
var db = require('quick.db');
var cors = require('cors');
var getAllFunc = function () { return __awaiter(_this, void 0, void 0, function () {
    var response, err_1, result, html;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios.get('https://www.worldometers.info/coronavirus/')];
            case 1:
                response = _a.sent();
                if (response.status !== 200) {
                    console.log('ERROR');
                }
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                return [2 /*return*/, null];
            case 3:
                result = {};
                html = cheerioParser.load(response.data);
                html('.maincounter-number').filter(function (i, el) {
                    var count = el.children[0].next.children[0].data || '0';
                    count = parseInt(count.replace(/,/g, '') || '0', 10);
                    // first one is
                    if (i === 0) {
                        result.cases = count;
                    }
                    else if (i === 1) {
                        result.deaths = count;
                    }
                    else {
                        result.recovered = count;
                    }
                });
                db.set('all', result);
                console.log('Updated The Cases', result);
                return [2 /*return*/];
        }
    });
}); };
var parseCountryCol = function (cell) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var country = ((_a = cell === null || cell === void 0 ? void 0 : cell.children[0]) === null || _a === void 0 ? void 0 : _a.data) || ((_c = (_b = cell === null || cell === void 0 ? void 0 : cell.children[0]) === null || _b === void 0 ? void 0 : _b.children[0]) === null || _c === void 0 ? void 0 : _c.data) || ((_f = (_e = (_d = 
    // country name with link has another level
    cell === null || 
    // country name with link has another level
    cell === void 0 ? void 0 : 
    // country name with link has another level
    cell.children[0]) === null || _d === void 0 ? void 0 : _d.children[0]) === null || _e === void 0 ? void 0 : _e.children[0]) === null || _f === void 0 ? void 0 : _f.data) || ((_k = (_j = (_h = (_g = cell === null || cell === void 0 ? void 0 : cell.children[0]) === null || _g === void 0 ? void 0 : _g.children[0]) === null || _h === void 0 ? void 0 : _h.children[0]) === null || _j === void 0 ? void 0 : _j.children[0]) === null || _k === void 0 ? void 0 : _k.data) ||
        '';
    country = country === null || country === void 0 ? void 0 : country.trim();
    if ((country === null || country === void 0 ? void 0 : country.length) === 0) {
        // parse with hyperlink
        country = ((_o = (_m = (_l = cell === null || cell === void 0 ? void 0 : cell.children[0]) === null || _l === void 0 ? void 0 : _l.next) === null || _m === void 0 ? void 0 : _m.children[0]) === null || _o === void 0 ? void 0 : _o.data) || '';
    }
    return country;
};
var parseCol = function (cell) {
    var _a;
    var colValue = ((_a = cell === null || cell === void 0 ? void 0 : cell.children[0]) === null || _a === void 0 ? void 0 : _a.data) || '';
    return parseInt((colValue === null || colValue === void 0 ? void 0 : colValue.trim().replace(/,/g, '')) || '0', 10);
};
var getCountriesFunc = function () { return __awaiter(_this, void 0, void 0, function () {
    var response, err_2, result, html, countriesTable, countriesTableCells, totalColumns, countryColIndex, props, i, cell, country;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios.get('https://www.worldometers.info/coronavirus/')];
            case 1:
                response = _a.sent();
                if (response.status !== 200) {
                    console.log('Error', response.status);
                }
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                return [2 /*return*/, null];
            case 3:
                result = [];
                html = cheerioParser.load(response.data);
                countriesTable = html('table#main_table_countries');
                countriesTableCells = countriesTable
                    .children('tbody')
                    .children('tr')
                    .children('td');
                totalColumns = 9;
                countryColIndex = 0;
                props = [
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
                for (i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
                    cell = countriesTableCells[i];
                    if (i % totalColumns === countryColIndex) {
                        country = parseCountryCol(cell);
                        result.push({
                            country: (country === null || country === void 0 ? void 0 : country.trim()) || ''
                        });
                    }
                    else {
                        result[result.length - 1][props[(i - 1) % totalColumns]] = parseCol(cell);
                    }
                }
                db.set('countries', result);
                console.log('Updated The Countries', result);
                return [2 /*return*/];
        }
    });
}); };
var init = function () {
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
app.get('/', c, function (request, response) {
    return __awaiter(this, void 0, void 0, function () {
        var a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.fetch('all')];
                case 1:
                    a = _a.sent();
                    response.send(a.cases + " cases are reported of the COVID-19 Novel Coronavirus strain<br> " + a.deaths + " have died from it <br>\n" + a.recovered + " have recovered from it <br> Get the endpoint /all to get information for all cases <br> get the endpoint /countries for getting the data sorted country wise");
                    return [2 /*return*/];
            }
        });
    });
});
var listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
app.get('/all/', c, function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var all;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.fetch('all')];
                case 1:
                    all = _a.sent();
                    res.send(all);
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/countries/', c, function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var countries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.fetch('countries')];
                case 1:
                    countries = _a.sent();
                    res.send(countries);
                    return [2 /*return*/];
            }
        });
    });
});
