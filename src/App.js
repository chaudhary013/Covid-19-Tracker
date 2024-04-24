// App.js

import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@mui/material';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import numeral from 'numeral';
import { sortData, prettyPrintStat } from './util';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [casesType, setCasesType] = useState('cases');
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.469152 });
  const [mapZoom, setMapZoom] = useState(3);
  const[mapCountries, setMapCountries] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      await fetch('https://disease.sh/v3/covid-19/all')
        .then(response => response.json())
        .then(data => {
          setCountryInfo(data);
        });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url =
      countryCode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className='app'>
      <div className='app_left'>
        <div className='app_header'>
          <h1>Covid-19 Tracker</h1>
          <FormControl className='app_dropdown'>
            <Select variant='outlined' onChange={onCountryChange} value={country}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem key={country.value} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className='app_stats'>
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title='Coronavirus cases'
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(numeral(countryInfo.cases).format('0.0a'))}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title='Recovered cases'
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(numeral(countryInfo.recovered).format('0.0a'))}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title='Deaths'
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(numeral(countryInfo.deaths).format('0.0a'))}
          />
        </div>
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>
      <div>
        <Card className='app_right'>
          <CardContent>
              <div className='app__information'>
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />
              <h3>Worldwide new {casesType}</h3>
              <LineGraph className="app_graph" casesType={casesType} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
