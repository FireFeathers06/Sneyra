const { MusicCommand } = require('../../index');

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
			const [song] = await music.add(msg.author, url);

			if (!song) throw `No songs found for \`${url}\``;
			else msg.sendMessage(`🎵 Added **${song.info.title}** to the queue 🎶`);
		} catch (error) {
			throw `No songs found for \`${url}\``;
		}
	}

};
