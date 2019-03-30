<template>
  <div class="home" ref="page">
    <canvas id="drawable" width="600" height="600" ref="drawable"></canvas>
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
  mounted() {
    (<HTMLElement>this.$refs.drawable).addEventListener(
      "mousedown",
      this.handleMouseDown
    );
    document.addEventListener("mousemove", this.handleMouseMove);
    let bounding = (<HTMLElement>this.$refs.drawable).getBoundingClientRect();
    let { top, right, bottom, left } = bounding;
    this.rect = { top, right, bottom, left };
    this.ctx = (<HTMLCanvasElement>this.$refs.drawable).getContext("2d");
    this.previewCtx = (<HTMLCanvasElement>this.$refs.preview).getContext("2d");

    this.previewCtx!.fillStyle = "rgb(2, 255, 0)";
    this.previewCtx!.fillRect(0, 0, 200, 200);

    this.ctx!.fillStyle = "rgba(0, 0, 200, 0.5)";
    this.ctx!.fillRect(30, 30, 50, 50);

    // Disable image anti-aliasing
    this.previewCtx!.imageSmoothingEnabled = false;
    this.$server.subscribe("add_event", data => {
      console.log(data);
      this.handleMouseDown(null, data.colour, data.position);
    });
  },
  methods: {
    handleMouseMove(e: MouseEvent) {
      let { clientX, clientY } = e;
      this.mouse = {
        x: clientX - this.rect.left - (clientX % 2),
        y: clientY - this.rect.top - (clientY % 2)
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
      let target_colour = colour || {
        a: 255,
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255
      };
      let position = p || this.mouse;
      if (!p) {
        this.$server.event({ colour: target_colour, position });
      }
      let target_n =
        0x0 +
        (target_colour.a as number) +
        0x100 * (target_colour.b as number) +
        0x10000 * (target_colour.g as number) +
        0x1000000 * (target_colour.r as number);

      this.ctx!.fillStyle = `rgb(${target_colour.r}, ${target_colour.g}, ${
        target_colour.b
      })`;
      let pixels = this.ctx!.getImageData(
        position.x - 5,
        position.y - 5,
        10,
        10
      );
      let colours = [...pixels.data]
        .reduce(
          ({ acc, offset }, curr) => {
            if (offset != 0) {
              acc[acc.length - 1][offset] = curr;
            } else {
              acc.push([curr, 0, 0, 0]);
            }
            return { acc, offset: (offset + 1) % 4 };
          },
          { acc: [] as Number[][], offset: 0 }
        )
        .acc.map(a => ({ r: a[0], g: a[1], b: a[2], a: a[3] }))
        .map((c, i) => ({ x: i % 10, y: Math.floor(i / 10), ...c }))
        .map(({ x, y, ...r }) => ({ x: x - (x % 2), y: y - (y % 2), ...r }));
      let pixel_map = [] as Number[][];
      let scale = (a: number, b: number, m: number) =>
        1 -
        Math.pow(Math.pow(a - m / 2, 2) + Math.pow(b - m / 2, 2), 0.5) /
          Math.pow(Math.pow(0 - m / 2, 2) + Math.pow(0 - m / 2, 2), 0.5);
      colours.forEach(({ x, y, r, g, b, a }) => {
        pixel_map[y / 2] = pixel_map[y / 2] || [];
        let mean =
          (0x0 +
            (a as number) +
            0x100 * (b as number) +
            0x10000 * (g as number) +
            0x1000000 * (r as number) +
            target_n) /
          2;
        pixel_map[y / 2][x / 2] = mean;
      });
      let two_x_pixel_map = pixel_map.reduce(
        (acc, curr) => [...acc, curr, curr],
        [] as Number[][]
      );
      let image_data = two_x_pixel_map
        .reduce((acc, curr) => [...acc, ...curr], [])
        .map(o => [
          ((o as number) & 0xff000000) >> 24,
          ((o as number) & 0xff0000) >> 16,
          ((o as number) & 0xff00) >> 8,
          (o as number) & 0xff,
          ((o as number) & 0xff000000) >> 24,
          ((o as number) & 0xff0000) >> 16,
          ((o as number) & 0xff00) >> 8,
          (o as number) & 0xff
        ])
        .reduce((acc, curr) => [...acc, ...curr], []);
      image_data.forEach((d, i) => {
        pixels.data[i] = d;
      });
      this.ctx!.putImageData(pixels, position.x - 5, position.y - 5);
      if (!p) this.handleMouseMove(e);
    }
  },
  data() {
    return {
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
}
</style>
