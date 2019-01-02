import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import iView from 'iview';
import 'iview/dist/styles/iview.css';

import exec from './utils/exec'
import fs from './utils/fs'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.use(iView);
Vue.http = Vue.prototype.$http = axios
Vue.exec = Vue.prototype.$exec = exec
Vue.fs = Vue.prototype.$fs = fs
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
