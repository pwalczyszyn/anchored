'use strict';

import React from 'react';

import MainView from './views/MainView.react';

// Initializing communication with bg script
import bgPort from './utils/bgport';

import debug from 'debug';

// Enabling debug
debug.enable('*');

let container = document.getElementById('container');
React.render(React.createElement(MainView), container);
