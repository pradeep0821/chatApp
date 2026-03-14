/**
 * socket.js  (frontend)
 *
 * Key behaviours:
 *  - autoConnect: false  → socket only connects when we explicitly call socket.connect()
 *  - On login  → LoginPage calls socket.connect() after storing token
 *  - On logout → DrawerAppBar calls socket.disconnect() before clearing localStorage
 *
 * This ensures:
 *  1. User is marked online the moment they log in
 *  2. User is marked offline the moment they log out (not after 60s timeout)
 *  3. No stale connection from a previous session bleeds into a new login
 */

import { io } from "socket.io-client";

const getBackendOrigin = () => {
  const raw = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");
  return raw.endsWith("/api") ? raw.slice(0, -4) : raw;
};

const socket = io(getBackendOrigin(), {
  autoConnect: false,       // ← don't connect until login
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

export default socket;