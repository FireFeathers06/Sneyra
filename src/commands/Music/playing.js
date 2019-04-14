const { MusicCommand, util: { showSeconds } } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, { description: 'Get information from the current song.' });
	}

	async run(msg) {
		const { remaining, queue, playing } = msg.guild.music;
		if (!playing) throw `Are you speaking to me? Because my deck is empty...`;

		const [song] = queue;

		return msg.sendMessage(new MessageEmbed()
			.setColor(12916736)
			.setTitle(song.info.title)
			.setURL(song.info.uri)
			.setAuthor(song.info.author || 'Unknown')
			.setDescription([
				`**Duration**: ${showSeconds(song.info.length)} [Time remaining: ${showSeconds(remaining)}]`
			].join('\n\n'))
			.setTimestamp());
	}

};
