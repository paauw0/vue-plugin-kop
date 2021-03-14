import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

function load(component) {
  return resolve => require([`../views/${component}`], resolve);
}

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      redirect: "/home"
    },
    {
      path: "/home",
      name: "home",
      component: load("home")
    }
  ]
});
