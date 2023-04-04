'use strict';

import pageLayoutUtil from './util.js';
import "./layout.css";
import './style.scss';


let layoutSplitted = false;

async function splitLayout() {
  if (!layoutSplitted) {
    pageLayoutUtil.splitWebPage();
    await pageLayoutUtil.translatePage();
  } else {
    pageLayoutUtil.resetWebPage();
  }
  layoutSplitted = !layoutSplitted;
}

splitLayout();
