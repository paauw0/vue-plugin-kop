import "./reset.css";
import Title from "./Title";

const components = [Title];

const install = Vue => {
  if (install.installed) return;
  components.map(component => Vue.component(component.name, component));
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { install, Title };

export default {
  install,
  Title
};
