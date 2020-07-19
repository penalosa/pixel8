<template>
  <div id="app">
    <div class="Title" id="Title">
      <!-- import logo -->
      <img
        src="../public/assets/Pixel8-logo-horizontal.svg"
        alt="Pixel8_logo"
        width="80%"
        height="80%"
      >
    </div>

    <!-- Import javascript for Timeline -->

    <!-- import javascript for Live_photo -->
    <div class="Live_Photo">
      <Home :color="`rgb(${c.red}, ${c.green}, ${c.blue})`"/>
    </div>

    <aside>
      <div class="Colours">
        <h2>Change Colour</h2>

        <div class="slide1container">
          <input
            v-model="c.red"
            type="range"
            min="1"
            max="255"
            value="128"
            class="slider"
            id="myRange1"
            style="background-image: linear-gradient(to right, white, red , black); outline: solid; outline-color: black;"
          >
         
        </div>
        <div class="slide2container">
          <input
            v-model="c.green"
            type="range"
            min="1"
            max="255"
            value="128"
            class="slider"
            id="myRange2"
            style="background-image: linear-gradient(to right, white, green , black);outline: solid; outline-color: black;"
          >
          
        </div>
        <div class="slide3container">
          <input
            v-model="c.blue"
            type="range"
            min="1"
            max="255"
            value="128"
            class="slider"
            id="myRange3"
            style="background-image: linear-gradient(to right, white, blue , black);outline: solid; outline-color: black;"
          >
          
        </div>
        <div :style="{'text-align':'center'}">
          <div
            class="slide4container"
            :style="{background:`rgb(${c.red}, ${c.green}, ${c.blue})`, height:`40px`, display:'inline-block', 'margin-left':'0px'}"
          ></div>
        </div>
      </div>
    </aside>
  </div>
</template>
<script>
import Home from "./views/Home";
export default {
  components: {
    Home
  },
  data() {
    return {
      c: {
        red: "0",
        green: "0",
        blue: "0"
      }
    };
  }
};
</script>

<style src="../public/pixel8style.css">
</style>
