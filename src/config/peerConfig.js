const peerConfig = {
  host: import.meta.env.VITE_PEERJS_HOST,
  port: import.meta.env.VITE_PEERJS_PORT ? Number(import.meta.env.VITE_PEERJS_PORT) : undefined,
  path: import.meta.env.VITE_PEERJS_PATH,
  secure: import.meta.env.VITE_PEERJS_SECURE === "true",
  config: {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80"
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "1679ad4f11d349b25de02b42",
        credential: "8Kb6apWGLbCbK1Lo"
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "1679ad4f11d349b25de02b42",
        credential: "8Kb6apWGLbCbK1Lo"
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "1679ad4f11d349b25de02b42",
        credential: "8Kb6apWGLbCbK1Lo"
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "1679ad4f11d349b25de02b42",
        credential: "8Kb6apWGLbCbK1Lo"
      }
    ]
  }
}; /* Sample servers, to be exchanged to appropriate ones */

export default peerConfig;