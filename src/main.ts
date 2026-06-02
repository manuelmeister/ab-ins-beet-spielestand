import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import "./styles.css";

import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import App from "./App.vue";

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "garden",
    themes: {
      garden: {
        dark: false,
        colors: {
          background: "#1e9b48",
          surface: "#007234",
          primary: "#1e9b48",
          secondary: "#505050",
          accent: "#1e9b48",
          info: "#386f8f",
          success: "#4f7d3a",
          warning: "#c98224",
          win: "#ffdb00",
          error: "#b23a48",
        },
      },
    },
  },
});

createApp(App).use(vuetify).mount("#app");
