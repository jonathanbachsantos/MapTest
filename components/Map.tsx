import React, { useState, useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
//LIBRARIES
import Svg, { G, Path, Circle } from "react-native-svg";
import * as d3 from "d3";
//CONSTANTS
import { COUNTRIES } from "../constants/CountryShapes";

import { PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';

//components

import Button from './Button'

const Map = props => {
   const { dimensions, data, date, colorize, stat } = props;

   const [countryList, setCountryList] = useState([]);
   const [translateX, setTranslateX] = useState(0);
   const [translateY, setTranslateY] = useState(0);
   const [lastTranslateX, setLastTranslateX] = useState(0);
   const [lastTranslateY, setLastTranslateY] = useState(0);
   const [buttonOpacity, _] = useState(new Animated.Value(0));
   const [scale, setScale] = useState(1);
   const [prevScale, setPrevScale] = useState(1);
   const [lastScaleOffset, setLastScaleOffset] = useState(1);

   const panGestureHandler = event => {
      setTranslateX(-event.nativeEvent.translationX / scale + lastTranslateX)
      setTranslateY(-event.nativeEvent.translationY / scale + lastTranslateY)
   }

   const panStateHandler = event => {
      if (event.nativeEvent.oldState === State.UNDETERMINED) {
         setLastTranslateX(translateX)
         setLastTranslateY(translateY)
      }

      if (event.nativeEvent.oldState === State.ACTIVE) {
         Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
         }).start();
      }
   }
   const pinchStateHandler = event => {
      if (event.nativeEvent.oldState === State.UNDETERMINED) {
         setLastScaleOffset(-1 + scale)
      }
      if (event.nativeEvent.oldState === State.ACTIVE) {
         Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
         }).start();
      }
   }
   const pinchGestureHandler = event => {
      if (event.nativeEvent.scale + lastScaleOffset >= 1 &&
         event.nativeEvent.scale + lastScaleOffset <= 5) {
         setPrevScale(scale);
         setScale(event.nativeEvent.scale + lastScaleOffset);
         setTranslateX(
            translateX - (
               event.nativeEvent.focalX / scale -
               event.nativeEvent.focalX / prevScale
            )
         )
         setTranslateY(
            translateY - (
               event.nativeEvent.focalY / scale -
               event.nativeEvent.focalY / prevScale
            )
         )
      }
   }



   const initilizeMap = () => {
      setTranslateX(0)
      setTranslateY(0)
      setScale(1)
      setPrevScale(1)
      setLastScaleOffset(0)
      Animated.timing(buttonOpacity, {
         toValue: 0,
         duration: 1000,
         useNativeDriver: true
      }).start();
   }

   const mapExtent = useMemo(() => {
      return dimensions.width > dimensions.height / 2
         ? dimensions.height / 2
         : dimensions.width;
   }, [dimensions]);

   const countryPaths = useMemo(() => {
      const projection = d3.geoAzimuthalEqualArea()
         .rotate([0, -90])
         .clipAngle(150)
         .fitSize([mapExtent, mapExtent], { type: "FeatureCollection", features: COUNTRIES })
         .translate([dimensions.width / 2, mapExtent / 2]);
      const geoPath = d3.geoPath().projection(projection);
      const svgPaths = COUNTRIES.map(geoPath);
      return svgPaths;
   }, [dimensions]);

   useEffect(() => {
      setCountryList(
         countryPaths.map((path, i) => {
            const curCountry = COUNTRIES[i].properties.name;

            const isCountryNameInData = data.some(country => country.name === curCountry);

            const curCountryData = isCountryNameInData
               ? data.find(country => country.name === curCountry)["data"]
               : null;

            const isDataAvailable = isCountryNameInData
               ? curCountryData.some(data => data.Date_reported == date)
               : false;

            const dateIndex = isDataAvailable
               ? curCountryData.findIndex(x => x.Date_reported === date)
               : null;

            return (
               <Path
                  key={COUNTRIES[i].properties.name}
                  d={path}
                  stroke={"#aaa"}
                  strokeOpacity={0.3}
                  strokeWidth={0.6}
                  fill={isDataAvailable ? colorize(curCountryData[dateIndex][stat]) : "#aaa"} //
                  opacity={isDataAvailable ? 1 : 0.4}
               />
            )
         })
      );
   }, []);
   return (
      <View>
         <PanGestureHandler
            onGestureEvent={(e) => panGestureHandler(e)}
            onHandlerStateChange={(e) => panStateHandler(e)}
         >

            <PinchGestureHandler
               onGestureEvent={(e) => pinchGestureHandler(e)}
               onHandlerStateChange={(e) => pinchStateHandler(e)}
            >
               <Svg
                  width={dimensions.width}
                  height={dimensions.height / 2}
               >
                  <G transform={`scale(${scale}) translate(${-translateX}, ${-translateY})`}>
                     <Circle
                        cx={dimensions.width / 2}
                        cy={mapExtent / 2}
                        r={mapExtent / 2}
                        fill={"#3b454f"}
                     />
                     {countryList.map(x => x)}
                  </G>
               </Svg>
            </PinchGestureHandler>
         </PanGestureHandler>
         <Button
            buttonStyle={{
               opacity: buttonOpacity
            }}
            onPress={initilizeMap}
            text={<>&#x21bb;</>}
         />
      </View>
   );
};
export default Map;