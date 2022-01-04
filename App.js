import React, { useState, useEffect, useRef } from "react";
import { FlatList,Animated, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import AppLoading from 'expo-app-loading';
import { useFonts } from "expo-font";
import styled from "styled-components/native";
import Rating from "./Rating";
import Genre from "./Genre";
import { getMovies } from "./api";
import * as CONSTANTS from './constans.js'
import { LinearGradient } from "expo-linear-gradient";

const Container = styled.View`
  flex: 1;
  padding-top: 50px;
  background-color: #000;
  `
const PosterContainer = styled.View`
    width: ${CONSTANTS.ITEM_SIZE}px;
    margin-top: ${CONSTANTS.TOP}px;`

const Poster = styled.View`
  margin-horizontal: ${CONSTANTS.SPACING}px;
  padding: ${CONSTANTS.SPACING * 2}px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;`

const PosterImage = styled.Image`
  width: 100%;
  height: ${CONSTANTS.ITEM_SIZE * 1.2}px;
  resize-mode: cover;
  border-radius: 10px;
  margin: 0 0 10px 0;`
const PosterTitle = styled.Text`
    font-family: Syne-Mono;
    font-size: 18px;
    color: #FFF`
const PosterPegi = styled.Image`
  width: 10%;
  height: 10%;
  position: absolute;
  bottom: 10%;
  right:10%;`
const PosterDescription = styled.Text`
    font-family: Syne-Mono;
    font-size: 12px;
    color: #FFF;`
const DummyContainer = styled.View`
    width: ${CONSTANTS.SPACER_ITEM_SIZE}px;`
const ContentContainer = styled.View`
  position: absolute;
  width: ${CONSTANTS.WIDTH}px;
  height: ${CONSTANTS.BACKDROP_HEIGHT}px;`

const BackdropContainer = styled.View`
  width: ${CONSTANTS.WIDTH}px;
  position: absolute;
  height: ${CONSTANTS.BACKDROP_HEIGHT}px;
  overflow: hidden;`
const BackdropImage = styled.Image`
  position: absolute;
  width: ${CONSTANTS.WIDTH}px;
  height: ${CONSTANTS.BACKDROP_HEIGHT}px;`
  const Backdrop = ({ movies,scrollX}) => {
    return(
      <ContentContainer>
        <FlatList
        data={movies}
        keyExtractor={item =>`${item.key}-back`}
        removeClippedSubviews={false}
        contentContainerStyle={{ width: CONSTANTS.WIDTH, height: CONSTANTS.BACKDROP_HEIGHT}}
        renderItem={({item, index}) => {
          if(!item.backdropPath){
            return null
          }
          const translateX = scrollX.interpolate({
            inputRange: [(index - 1) *  CONSTANTS.ITEM_SIZE, index * CONSTANTS.ITEM_SIZE],
            outputRange: [0, CONSTANTS.WIDTH]
          })
          return (
            <BackdropContainer
            as={Animated.View}
            style={{transform:[{ translateX: translateX}]}}
            >
              <BackdropImage source={{uri: item.backdropPath}} />
            </BackdropContainer>
          )
        }}
    />
    <LinearGradient
    colors={['rgba(0,0,0,0)', 'black']}
    style={{
      height: CONSTANTS.BACKDROP_HEIGHT,
      width: CONSTANTS.WIDTH,
      position: 'absolute',
      bottom: 0,
    }}
    />
      </ContentContainer>
    )
  }
export default function App() {
  const [movies, setMovies] = useState([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      const data = await getMovies()
      setMovies([{key: 'left-spacer' }, ...data, { key: 'right-spacer'}])
      setLoaded(true)
    }
    fetchData()
  }, [])
  let [fontLoaded] = useFonts({
    'Syne-Mono': require('./assets/fonts/SyneMono-Regular.ttf')
  });
  const scrollX = useRef(new Animated.Value(0)).current
  if (!loaded || !fontLoaded) {
    return <AppLoading />;
  }
  else {
    return (
      <Container>
        <Backdrop scrollX={scrollX} movies={movies}/>
        <StatusBar />
        <Animated.FlatList
          showsHorizontalScrollIndicator={false}
          data={movies}
          keyExtractor={item => item.key}
          horizontal
          contentContainerStyle={{
            alignItems: 'center'
          }}
          snapToInterval={CONSTANTS.ITEM_SIZE}
          decelerationRate={0}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 2) * CONSTANTS.ITEM_SIZE,
              (index - 1) * CONSTANTS.ITEM_SIZE,
              index * CONSTANTS.ITEM_SIZE,
            ]
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [0, -50, 0]
            })
            if (!item.originalTitle) {
              return <DummyContainer />
            }
            return (
              <PosterContainer style={{position : 'relative', bottom: 480}}>
                <Poster as={Animated.View} style={{ transform: [{ translateY }] }}>
                  <PosterImage source={{ uri: item.posterPath }} />
                  <PosterTitle numberOfLines={1}>{item.originalTitle}({item.releaseDate.substring(0,4)})</PosterTitle>
                  <PosterPegi source={{uri : item.genres.filter((genres) => genres === 'Family')[0] === 'Family' ? 'https://rating.pegi.info/assets/images/games/age_threshold_icons/3.png' : item.genres.filter(genre => genre ==="Crime")[0] === 'Crime' ? 'https://rating.pegi.info/assets/images/games/age_threshold_icons/18.png' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/PEGI_16.svg/1681px-PEGI_16.svg.png'}} />
                  <Rating rating={item.voteAverage} />
                  <Genre genres={item.genres} />
                  <PosterDescription numberOfLines={5}>{item.description}
                  </PosterDescription>
                </Poster>
              </PosterContainer>
            )
          }}
        />
      </Container>
    )
  }
}