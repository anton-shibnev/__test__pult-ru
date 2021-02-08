// import { scrollEvents } from './listeners/scrollEvents';
const importAll = r => r.keys().forEach(r)

// onload
document.addEventListener('DOMContentLoaded', () => {
  // all components
  // eslint-disable-next-line no-undef
  importAll(require.context('../components/', true, /\.js$/))

  // listeners
  // scrollEvents();
})
