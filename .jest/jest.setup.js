/*
 * This file is executed, before jest runs tests
 */

import { configure } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import JestWebsocketMock from 'jest-websocket-mock'
import 'jest-localstorage-mock'

import { settings } from '../src/settings'

// Mock a websocket server
new JestWebsocketMock(settings.api.websocket)

// Mock broadcast channel
jest.mock('broadcast-channel')

// Preload React, since it is resolved via provide plugin
globalThis.React = require('react')

// Adapter for react
configure({ adapter: new Adapter() })
