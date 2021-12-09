import { createApp } from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import "./index.css"

library.add(faChevronRight);
library.add(faChevronDown);

createApp(App)
.component("font-awesome-icon", FontAwesomeIcon)
.mount('#app')
