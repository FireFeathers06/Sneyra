const { MusicCommand } = require('../../index');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, {
			description: 'Leaves the voice channel.',
			requireMusic: true
		});
	}

	async run(msg) {
		if (!msg.guild.music.player) throw 'I already left the voice channel! You might want me to be in one in order to leave it...';

		msg.guild.music.leave();
		msg.sendMessage(`Successfully left the voice channel ${msg.guild.me.voice.channel}`);
	}

};
