const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

class MusicManager {

	constructor(guild) {
		/**
		 * The Client that manages this instance
		 * @since 1.0.0
		 * @type {Sneyra}
		 * @name MusicManager#client
		 */
		Object.defineProperty(this, 'client', { value: guild.client });

		/**
		 * The SneyraGuild instance that manages this instance
		 * @since 1.0.0
		 * @type {SneyraGuild}
		 * @name MusicManager#guild
		 */
		Object.defineProperty(this, 'guild', { value: guild });

		/**
		 * The ids of the 10 latest played videos
		 * @since 1.0.0
		 * @type {string[]}
		 */
		this.recentlyPlayed = [];

		/**
		 * The current queue for this manager
		 * @since 1.0.0
		 * @type {MusicManagerSong[]}
		 */
		this.queue = [];

		this.voiceChannel = null;
		this.player = null;

		this.musicStart = null;
		this.musicPauseAll = null;
		this.musicPause = null;
	}

	/**
	 * Whether Sneyra is playing a song or not
	 * @since 2.0.0
	 * @type {boolean}
	 * @readonly
	 */
	get playing() {
		return !this.paused && !this.idling;
	}

	/**
	 * Whether Sneyra has the queue paused or not
	 * @since 2.0.0
	 * @type {?boolean}
	 * @readonly
	 */
	get paused() {
		const { player } = this;
		return player ? player.paused : null;
	}

	/**
	 * Whether Sneyra is doing nothing
	 * @since 2.0.0
	 * @type {boolean}
	 * @readonly
	 */
	get idling() {
		const { player } = this;
		return !this.queue.length || (player ? !player.playing : null);
	}


	/**
	 * The current volume
	 * @since 1.0.0
	 * @type {?number}
	 * @readonly
	 */
	get volume() {
		const { player } = this;
		return player ? player.state.volume : null;
	}

	/**
	 * The current playtime of the song
	 * @since 1.0.0
	 * @type {?number}
	 * @readonly
	 */
	get playtime() {
		try {
			if (this.musicPauseAll && this.musicPause) {
				return ((new Date()).getTime() - this.musicStart.getTime()) - (this.musicPauseAll + ((new Date()).getTime() - this.musicPause.getTime()));
			} else if (this.musicPause) {
				// (now - start) - (now - pause)
				return ((new Date()).getTime() - this.musicStart.getTime()) - ((new Date()).getTime() - this.musicPause.getTime());
			} else if (this.musicPauseAll) {
				// (now - start) - all
				return ((new Date()).getTime() - this.musicStart.getTime()) - this.musicPauseAll;
			} else {
				// (now - start) - (all + (now - pause)
				return (new Date()).getTime() - this.musicStart.getTime();
			}
		} catch (error) {
			return null;
		}
	}

	/**
	 * The current playtime of the song
	 * @since 1.0.0
	 * @type {?number}
	 * @readonly
	 */
	get remaining() {
		const { player } = this;

		if (player && this.queue.length) return this.queue[0].info.length - this.playtime;
		return null;
	}

	/**
	 * Add a song to the queue
	 * @since 1.0.0
	 * @param {KlasaUser} user The user that requests this song
	 * @param {string} url The url to add
	 * @returns {Promise<SongMetadata>}
	 */
	async add(user, url) {
		const node = this.client.lavalink.nodes.first();

		const params = new URLSearchParams();
		params.append('identifier', url);

		try {
			const metadatas = await fetch(`http://${node.host}:${node.port}/loadtracks?${params.toString()}`, { headers: { Authorization: node.password } })
				.then(res => res.json())
				.then(data => data.tracks);

			metadatas.forEach(metadata => this.queue.push({
				...metadata,
				requester: user
			}));

			return Promise.resolve(metadatas);
		} catch (error) {
			this.client.emit('error', error);
			return Promise.reject(error);
		}
	}

	/**
	 * Join a voice channel, handling ECONNRESETs
	 * @since 1.0.0
	 * @param {VoiceChannel} voiceChannel Join a voice channel
	 * @returns {Promise<VoiceConnection>}
	 */
	join(voiceChannel) {
		const player = this.client.lavalink.join({
			guild: this.guild.id,
			channel: voiceChannel.id,
			host: 'localhost'
		});

		this.player = player;
		this.voiceChannel = voiceChannel;

		return this;
	}

	/**
	 * Leave the voice channel, reseating all the current data
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	leave() {
		if (this.player) this.player.stop().destroy();
		this.client.lavalink.leave(this.guild.id);

		// Reset the status
		return this.clear();
	}

	/**
	 * Play the first song in the queue
	 * @since 1.0.0
	 * @returns {Player}
	 */
	play() {
		const [song] = this.queue;

		if (song) {
			this.player.play(song.track);
			this.pushPlayed(song.info.uri);
		}

		this.musicStart = new Date();
		this.musicPauseAll = null;
		this.musicPause = null;

		return this.player;
	}

	/**
	 * Push a song url to the recently played array
	 * @since 1.0.0
	 * @param {string} url The song url
	 * @returns {void}
	 */
	pushPlayed(url) {
		this.recentlyPlayed.push(url);
		if (this.recentlyPlayed.length > 10) this.recentlyPlayed.shift();
	}

	/**
	 * Pause the player
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	pause() {
		const { player } = this;
		if (player) player.pause(true);
		this.musicPause = new Date();
		return this;
	}

	/**
	 * Resume the player
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	resume() {
		const { player } = this;
		if (player) player.pause(false);

		if (this.musicPauseAll) this.musicPauseAll += (new Date()).getTime() - this.musicPause.getTime();
		else this.musicPauseAll = (new Date()).getTime() - this.musicPause.getTime();

		this.musicPause = null;

		return this;
	}

	/**
	 * Skip the current song
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	skip() {
		const { player } = this;

		if (player) {
			this.queue.shift();
			this.play();
		}

		return this;
	}

	/**
	 * Stop the player
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	stop() {
		const { player } = this;

		if (player) {
			this.player.stop();
			this.clear();
		}

		this.musicStart = null;
		this.musicPauseAll = null;
		this.musicPause = null;

		return this;
	}

	/**
	 * Set the volume
	 * @since 1.0.0
	 * @param {number} vol The volume to set the player to
	 * @returns {MusicManager}
	 */
	setVolume(vol) {
		const { player } = this;
		if (player) player.volume(vol);
		return this;
	}

	/**
	 * Prune the queue
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	prune() {
		this.queue.length = 0;
		return this;
	}

	/**
	 * Reset all values for this instance of MusicManager
	 * @since 1.0.0
	 * @returns {MusicManager}
	 */
	clear() {
		this.recentlyPlayed.length = 0;
		this.queue.length = 0;
		this.player = null;
		this.voiceChannel = null;
		this.musicStart = null;
		this.musicPauseAll = null;
		this.musicPause = null;

		return this;
	}

}

module.exports = MusicManager;
