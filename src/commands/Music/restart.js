const { MusicCommand } = require('../../index');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			description: 'Clears the music handler.'
		});
	}

	run(msg) {
		msg.guild.music.clear();
		if (msg.guild.music.player) msg.guild.music.leave();
		msg.sendMessage('Successfully restarted the music module.');
	}

};
