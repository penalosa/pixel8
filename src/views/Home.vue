<template>
  <div class="home" ref="page">
    <canvas
      id="drawable"
      ref="drawable"
      :width="Math.floor(rect.right-rect.left)"
      :height="Math.floor(rect.bottom-rect.top)"
    ></canvas>
    <canvas
      id="preview"
      width="200"
      height="200"
      ref="preview"
      :style="{transform:`translate(${mouse.x +rect.left}px,${mouse.y+rect.top - 200}px)`}"
    ></canvas>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["color"],
  mounted() {
    (<HTMLElement>this.$refs.drawable).addEventListener(
      "mousedown",
      this.handleMouseDown
    );
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keydown", this.handleKeyDown);
    let bounding = (<HTMLElement>this.$refs.drawable).getBoundingClientRect();
    let { top, right, bottom, left } = bounding;
    this.rect = { top, right, bottom, left };
    this.ctx = (<HTMLCanvasElement>this.$refs.drawable).getContext("2d");
    this.previewCtx = (<HTMLCanvasElement>this.$refs.preview).getContext("2d");

    this.previewCtx!.fillStyle = "rgb(2, 255, 0)";
    this.previewCtx!.fillRect(0, 0, 200, 200);

    // Disable image anti-aliasing
    this.previewCtx!.imageSmoothingEnabled = false;
    this.$server.subscribe("add_event", data => {
      this.handleMouseDown(null, data.colour, data.position);
    });
    let background = new Image();
    background.src = require("../../public/gradient.png");

    // Make sure the image is loaded first otherwise nothing will draw.
    background.onload = () => {
      this.ctx!.drawImage(background, 0, 0);
      this.$server
        .all()
        .then(events =>
          events.forEach(e => this.handleMouseDown(null, e.colour, e.position))
        );
    };
  },
  methods: {
    handleKeyDown(e) {
      if (e.keyCode == "38") {
        this.mouse.y -= 2;
      } else if (e.keyCode == "40") {
        this.mouse.y += 2;
      } else if (e.keyCode == "37") {
        this.mouse.x -= 2;
      } else if (e.keyCode == "39") {
        this.mouse.x += 2;
      } else if (e.keyCode == "32") {
        this.handleMouseDown({
          clientX: Math.floor(this.rect.left) + this.mouse.x,
          clientY: Math.floor(this.rect.top) + this.mouse.y
        });
      }
      this.handleMouseMove({
        clientX: Math.floor(this.rect.left) + this.mouse.x,
        clientY: Math.floor(this.rect.top) + this.mouse.y
      });
    },
    handleMouseMove(e) {
      let { clientX, clientY } = e;
      this.mouse = {
        x: clientX - Math.floor(this.rect.left) - (clientX % 2),
        y: clientY - Math.floor(this.rect.top) - (clientY % 2)
      };
      this.previewCtx!.fillStyle = "rgb(255, 255, 255)";
      this.previewCtx!.fillRect(0, 0, 200, 200);
      this.previewCtx!.drawImage(
        this.ctx!.canvas,
        this.mouse.x - 10,
        this.mouse.y - 10,
        20,
        20,
        0,
        0,
        200,
        200
      );
      this.drawGrid();
    },
    drawGrid() {
      this.previewCtx!.lineWidth = 2;
      this.previewCtx!.beginPath();
      this.previewCtx!.strokeStyle = "black";

      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(p => {
        this.previewCtx!.moveTo(p * 20 - 10, 0);
        this.previewCtx!.lineTo(p * 20 - 10, 200);
        this.previewCtx!.moveTo(0, p * 20 - 10);
        this.previewCtx!.lineTo(200, p * 20 - 10);
      });

      this.previewCtx!.stroke();
      this.previewCtx!.beginPath();

      this.previewCtx!.strokeStyle = "red";

      this.previewCtx!.moveTo(90, 90);
      this.previewCtx!.lineTo(110, 90);
      this.previewCtx!.lineTo(110, 110);
      this.previewCtx!.lineTo(90, 110);
      this.previewCtx!.lineTo(90, 90);

      this.previewCtx!.stroke();
    },
    handleEvent(colour, position) {
      this.ctx!.fillStyle = colour;
      this.ctx!.fillRect(position.x - 1, position.y - 1, 2, 2);
    },
    handleMouseDown(e, colour, p) {
      console.log(e);
      let target_colour = colour || this.color;
      this.ctx!.fillStyle = target_colour;

      let position = p || this.mouse;
      if (!p) {
        this.$server.event({ colour: target_colour, position });
      }

      this.ctx!.fillRect(position.x - 1, position.y - 1, 2, 2);
      if (!p) this.handleMouseMove(e);
    }
  },
  data() {
    return {
      hex: "",
      ctx: null as CanvasRenderingContext2D | null,
      previewCtx: null as CanvasRenderingContext2D | null,
      rect: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      mouse: {
        x: 0,
        y: 0
      }
    };
  },
  name: "home"
});
</script>
<style lang="stylus" scoped>
canvas {
  cursor: crosshair;
}

canvas#preview {
  position: fixed;
  top: 0px;
  left: 0px;
  border-radius: 160px;
  border: 2px solid black;
  display: none;
  z-index: 999;
}

canvas#drawable {
  width: 75vw;
  height: calc(100vh - 20px);
}

canvas#drawable:hover + canvas#preview, canvas#preview:hover {
  display: initial;
}
</style>
