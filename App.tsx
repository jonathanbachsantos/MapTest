import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
//COMPONENTS
import Map from "./components/Map";

//DATA
import covidData_raw from "./assets/data/who_data.json";
import movingAvarege from './functions/movingAvarege';


import * as d3 from "d3"

export default function App() {
  const dimensions = Dimensions.get("window");

  const [stat, setStat] = useState("New_cases");
  const [date, setDate] = useState("2020-04-24");

  interface CovidData {
    Date_reported:string,
    Country_code:string,
    Country:string,
    WHO_region:string
    New_cases:number,
    Cumulative_cases: number,
    New_deaths:number,
    Cumulative_deaths:number
  }


  const covidData = useMemo(() => {
    const countriesAsArray = Object.keys(covidData_raw).map((key) => (covidData_raw[key]));

    let newCountriesAsArray = countriesAsArray.filter(
      function (value, index, array) {
        if (index == 0) {
          return true
        } else if (value.Country === array[index - 1].Country) {
          return false
        } else {
          return true
        }
      }
    );

    newCountriesAsArray = newCountriesAsArray.map((value) => ({
      name: value.Country,
      data: [value, ...countriesAsArray.filter((value) => value.Country == value.Country)]
    }))

    const windowSize = 7;
    const countriesWithAvg = newCountriesAsArray.map(country => ({
      name: country.name,
      data: [...movingAvarege(country.data, windowSize)]
    }))

    const onlyCountriesWithData = countriesWithAvg.filter(country =>
      country.data.findIndex((d, _) => d[stat] >= 10) != -1
    );

    return onlyCountriesWithData
  }, []);

  const maxY = useMemo(() => {
    return d3.max(covidData, (country) =>
      d3.max(country.data, (d) => d[stat])
    );
  }, [stat])

  const colorize = useMemo(() => {
    const colorScale = d3.scaleSequentialSymlog((d3.interpolateReds)).domain([0, maxY]);
    return colorScale;
  }, []);

  console.log(colorize)

  return (
    <View style={styles.container}>
      <Map
        dimensions={dimensions}
        data={covidData}
        colorize={colorize}
        date={date}
        stat={stat}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#323b44"
  }
});