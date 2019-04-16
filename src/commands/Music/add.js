const { MusicCommand } = require('../../index');

// eslint-disable-next-line max-len
const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, {
			description: 'Adds a song the the queue.',
			usage: '<url:string>'
		});
	}

	async run(msg, [url]) {
		const { music } = msg.guild;

		try {
			const metadata = await music.fetchMetadata(url.match(LINK_REGEX) ? url : `ytsearch:${url}`);
			if (!metadata) throw `No songs found for \`${url}\``;
			music.add(msg.author, [metadata[0]]);
			msg.sendMessage(`🎵 Added **${metadata[0].info.title}** to the queue 🎶`);
		} catch (error) {
			throw `No songs found for \`${url}\``;
		}
	}

};
