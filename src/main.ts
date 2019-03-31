import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";
import RealTime from "./ws.js";
Vue.config.productionTip = false;
let store = { events: [] };
RealTime("ws://api.helloworldhack/rpc").then(server => {
  console.log(`Connected to server`);
  setInterval(() => server.ping({ ping: true }), 10000);
  Vue.prototype.$server = server;

  // Vue.prototype.$server.subscribe("add_event", data => {
  //   console.log("cover_update", data);
  //   store.events = [...store.events, data.event];
  // });
  new Vue({
    router,
    data() {
      return {
        store
      };
    },
    render: h => h(App)
  }).$mount("#app");
});
