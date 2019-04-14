const { MusicCommand } = require('../../index');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, {
			enabled: true,
			aliases: ['vol'],
			usage: '[control:number]',
			description: 'Manage the volume for current song.',
			requireMusic: true
		});
	}

	// eslint-disable-next-line consistent-return
	run(msg, [vol]) {
		const { playing } = msg.guild.music;
		if (!playing) throw `The party isn't going on! One shouldn't touch the volume wheel without a song first!`;

		if (vol === undefined) return msg.sendMessage(`📢 Volume: ${msg.guild.music.volume}%`);

		if (vol < 0) throw "You can't set the volume less than 0%!";
		else if (vol > 100) throw "You can't set the volume greater than 100%!";

		msg.guild.music.setVolume(vol);
		msg.sendMessage(`The volume has been set to ${vol}%!`);
	}

};
