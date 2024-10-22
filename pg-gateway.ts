import { PGlite } from "@electric-sql/pglite";
import net from "node:net";
import { fromNodeSocket } from "pg-gateway/node";
import { PostgresConnection } from "pg-gateway";

/* * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Open socket to connect to PGLite via DataGrip etc.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const db = new PGlite("./data/okane");

const server = net.createServer(async (socket) => {
	// const connection = new PostgresConnection(socket, {
	await fromNodeSocket(socket, {
		serverVersion: "16.3 (PGlite 0.2.0)",
		// authMode: "cleartextPassword",
		auth: {
			// No password required
			method: "trust",
		},

		// Validate user credentials based on auth mode chosen
		async validateCredentials(credentials) {
			if (credentials.authMode === "cleartextPassword") {
				const { user, password } = credentials;
				return user === "postgres" && password === "postgres";
			}
			return false;
		},

		async onStartup() {
			// Wait for PGlite to be ready before further processing
			await db.waitReady;
			return false;
		},

		// Hook into each client message
		async onMessage(data, { isAuthenticated }) {
			// Only forward messages to PGlite after authentication
			if (!isAuthenticated) {
				return false;
			}

			// Forward raw message to PGlite
			try {
				const [[_, responseData]] = await db.execProtocol(data);
				connection.sendData(responseData);
			} catch (err) {
				connection.sendError(err);
				connection.sendReadyForQuery();
			}
			return true;
		},
	});

	socket.on("end", () => {
		console.log("Client disconnected");
	});
});

server.listen(5432, () => {
	console.log("Server listening on port 5432");
});
