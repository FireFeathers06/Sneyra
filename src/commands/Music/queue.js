const { MusicCommand, util: { showSeconds } } = require('../../index');

module.exports = class extends MusicCommand {

	constructor(...args) {
		super(...args, { description: 'Check the queue list.' });
	}

	run(msg) {
		const { queue } = msg.guild.music;
		if (!queue.length) throw 'There are currently no songs in the queue!';

		const output = [];
		for (let i = 0; i < Math.min(queue.length, 10); i++) {
			output[i] = [
				`[__\`${String(i + 1).padStart(2, 0)}\`__] *${queue[i].info.title.replace(/\*/g, '\\*')}* requested by **${queue[i].requester.tag || queue[i].requester}**`,
				`   └── <${queue[i].info.uri}> (${showSeconds(queue[i].info.length)})`
			].join('\n');
		}
		if (queue.length > 10) output.push(`\nShowing 10 songs of ${queue.length}`);

		msg.sendMessage(output.join('\n'));
	}

};
