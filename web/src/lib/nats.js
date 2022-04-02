let broker = null;

const open = async (servers, name) => {
	const { connect } = await import('nats.ws');
	broker = await connect({
		servers: servers,
		name: name,
		reconnectTimeWait: 3000,
		debug: process.env.NODE_ENV === 'development',
	});
	return broker;
}

const close = async () => {
	if (broker) {
		await broker.close();
	}
}

const getBorker = () => {
	return broker;
}

const JSONCodec = async () => {
	const { JSONCodec } = await import('nats.ws');
	return JSONCodec();
}

const exports = {
	JSONCodec, open, close, getBorker,
}

export default exports;
