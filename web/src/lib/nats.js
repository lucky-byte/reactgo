import { connect, StringCodec, JSONCodec } from "nats.ws";

let broker = null;

const open = async (servers, name) => {
	broker = await connect({
		servers: servers,
		name: name,
		reconnectTimeWait: 3000,
		debug: process.env.NODE_ENV === 'development',
	});
	return broker;
}

const close = async () => {
	console.log('close...')

	if (broker) {
		await broker.close();
	}
}

const getBorker = () => {
	return broker;
}

const exports = {
	StringCodec, JSONCodec, open, close, getBorker,
}

export default exports;
