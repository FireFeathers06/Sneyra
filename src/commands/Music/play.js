const { MusicCommand } = require('../../index');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, { description: 'Let\'s start the queue!' });
	}

	// eslint-disable-next-line consistent-return
	async run(msg) {
		const { music } = msg.guild;

		if (!music.queue.length)
			return msg.sendMessage(`Deck's empty my friend, add some songs to the queue with the \`${msg.guild.settings.prefix}add\` command so I can play them.`);

		if (!music.player) await this.store.get('join').run(msg);

		if (music.playing) {
			msg.sendMessage('Hey! The disk is already spinning!');
		} else if (music.paused) {
			music.resume();
			msg.sendMessage(`There was a track going on! Playing it back! Now playing: ${music.queue[0].info.title}!`);
		} else {
			const [song] = music.queue;
			msg.channel.send(`🎧 Playing: **${song.info.title}** as requested by: **${song.requester.tag}**`);

			music.play().on('end', (message) => {
				if (!music.queue.length) {
					msg.channel.send('⏹ From 1 to 10, being 1 the worst score and 10 the best, how would you rate the session? It just ended!')
						.then(() => music.leave());
				} else if (message.reason !== 'REPLACED') {
					music.queue.shift();
					music.play();
				}
			});
		}
	}

};
