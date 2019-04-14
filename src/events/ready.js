const { Event } = require('klasa');
const { PlayerManager } = require('discord.js-lavalink');
const { lavalinkNodes } = require('../../config');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			name: 'ready',
			enabled: true,
			event: 'ready',
			once: true
		});
	}

	run() {
		this.client.lavalink = new PlayerManager(this.client, lavalinkNodes, {
			user: this.client.user.id,
			shards: this.client.shard ? this.client.shard.count : 0
		});
	}

};
