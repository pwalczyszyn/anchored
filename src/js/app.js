'use strict';

import React from 'react';

import MainView from './views/MainView.react';

import debug from 'debug';

// Enabling debug
debug.enable('*');

let container = document.getElementById('container');
React.render(React.createElement(MainView), container);
