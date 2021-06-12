import ExternalScriptService from '@/services/external-script-service/external-script-service'

const CONSTANTS = {
  SPOTIFY_PLAYER_NAME: 'app-spotify-player',
  SPOTIFY_SDK_URL: 'https://sdk.scdn.co/spotify-player.js',
  SPOTIFY_TOKEN:
    'BQBLo2kZ5fdOSR0HOMBjnaKy76Wjx0FGbBB3cmfhcwf1x75qmaDnncBWjTnyQ919qQbfURcW8qhf2cQ99lW037a90yHXfoUqQebTMFbpQUX13lDnovWdT8g8pt-lNi283ZxJ6B7iKVRA7mXDXOWLEu9U6TxNkouT',
}

export default class SpotifyPlayerSDK {
  state = {
    spotifyDeviceId: null,
    spotifyPlayer: null,
    spotifySDKReference: null,
    spotifyError: null,
    spotifyState: null,
    spotifyConnectPromise: null,
    spotifyUpdateTime: new Date(),
    isSpotifyConnected: false,
    updateFuncs: [],
  }

  /* Prepare SDK */

  appendSDK = () => {
    this.state.spotifySDKReference = ExternalScriptService.appendScript(CONSTANTS.SPOTIFY_SDK_URL)
  }

  removeSDK = () => {
    if (this.spotifySDKReference) {
      ExternalScriptService.removeScript(this.state.spotifySDKReference)
    }
  }

  registerSpotifySDK = () => {
    const connection = {}
    this.state.spotifyConnectPromise = new Promise((resolve, reject) => {
      connection.ready = resolve
      connection.failed = reject
    })

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = CONSTANTS.SPOTIFY_TOKEN
      this.state.spotifyPlayer = new window.Spotify.Player({
        name: CONSTANTS.SPOTIFY_PLAYER_NAME,
        getOAuthToken: (spotifyAuthtenticate) => {
          spotifyAuthtenticate(token)
        },
      })

      this.state.spotifyPlayer.addListener('initialization_error', ({ message }) => {
        this.state.spotifyError = message
      })
      this.state.spotifyPlayer.addListener('authentication_error', ({ message }) => {
        this.state.spotifyError = message
      })
      this.state.spotifyPlayer.addListener('account_error', ({ message }) => {
        this.state.spotifyError = message
      })
      this.state.spotifyPlayer.addListener('playback_error', ({ message }) => {
        this.state.spotifyError = message
      })

      this.state.spotifyPlayer.addListener('player_state_changed', (state) => {
        this.state.spotifyState = state
        this.state.spotifyUpdateTime = new Date()
        this.onSpotifyPlayerChanged()
      })

      this.state.spotifyPlayer.addListener('ready', ({ device_id: deviceId }) => {
        this.state.spotifyDeviceId = deviceId
        this.state.isSpotifyConnected = true
        connection.ready()
      })

      this.state.spotifyPlayer.addListener('not_ready', () => {
        this.state.spotifyDeviceId = null
        this.state.isSpotifyConnected = false
        connection.failed()
      })

      this.state.spotifyPlayer.connect()
    }
  }

  unregisterSpotifySDK = () => {
    delete window.onSpotifyWebPlaybackSDKReady
    if (this.state.spotifyPlayer) {
      this.state.spotifyPlayer.disconnect()
      this.state.spotifyPlayer = null
    }
  }

  onSpotifyPlayerChanged = () => {
    this.state.updateFuncs.forEach((func) => {
      if (typeof func === 'function') {
        func()
      }
    })
  }

  onSpotifySDKReady = () => {
    this.state.spotifyPlayer.setVolume(1)
  }

  ensureConnection() {
    if (!this.state.isSpotifyConnected) {
      return this.state.spotifyConnectPromise
    }
    return new Promise((resolve) => {
      resolve()
    })
  }

  /* Exposed SDK functions */

  register() {
    this.registerSpotifySDK()
    this.appendSDK()
  }

  unregister() {
    this.unregisterSpotifySDK()
    this.removeSDK()
  }

  onUpdate(func) {
    this.state.updateFuncs.push(func)
  }

  get error() {
    return this.state.spotifyError
  }

  get exactTrackTime() {
    const { spotifyState } = this.state
    if (spotifyState) {
      if (spotifyState.paused) {
        return spotifyState.position
      }
      return spotifyState.position + (new Date().getTime() - this.state.spotifyUpdateTime.getTime())
    }
    return 0
  }

  get trackInformation() {
    const trackInformation = {
      name: '',
      artist: '',
      images: [],
      paused: false,
      duration: 0,
      position: 0,
    }

    const { spotifyState } = this.state
    if (spotifyState && spotifyState.track_window && spotifyState.track_window.current_track) {
      const currentTrack = spotifyState.track_window.current_track
      trackInformation.name = currentTrack.name
      trackInformation.artist = currentTrack.artists.map((artist) => artist.name).join(', ')
      trackInformation.images = currentTrack.album.images
      trackInformation.paused = spotifyState.paused
      trackInformation.duration = currentTrack.duration_ms
      trackInformation.position = this.exactTrackTime
    }

    return trackInformation
  }

  select(trackId) {
    this.ensureConnection()
      .then(() => {
        const { getOAuthToken } = this.state.spotifyPlayer._options
        getOAuthToken((token) => {
          fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${this.state.spotifyDeviceId}`,
            {
              method: 'PUT',
              body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          )
        })
      })
      .catch((error) => {
        throw new Error(error)
      })
  }

  resume() {
    this.ensureConnection()
      .then(() => {
        this.state.spotifyPlayer.resume()
      })
      .catch((error) => {
        throw new Error(error)
      })
  }

  pause() {
    this.ensureConnection()
      .then(() => {
        this.state.spotifyPlayer.pause()
      })
      .catch((error) => {
        throw new Error(error)
      })
  }

  toggle() {
    this.ensureConnection()
      .then(() => {
        this.state.spotifyPlayer.togglePlay()
      })
      .catch((error) => {
        throw new Error(error)
      })
  }
}
