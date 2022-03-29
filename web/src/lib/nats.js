import { connect } from "nats.ws";

let broker = null;

const open = async (servers, name) => {
	broker = await connect({
		servers: servers,
		name: name,
		debug: process.env.NODE_ENV === 'development',
	});
}

const close = async () => {
	console.log('close...')

	if (broker) {
		await broker.close();
	}
}

const sub = async topic => {
	broker.subscript(topic)
}

const exports = {
	open, close, sub,
}
export default exports;
