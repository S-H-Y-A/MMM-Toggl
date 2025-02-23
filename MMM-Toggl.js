Module.register("MMM-Toggl", {
  defaults: {
    updateInterval: 3 * 1 * 1000, // Every 3 seconds
  },
  getStyles() {
    return ["toggl.css"];
  },
  getScripts: function () {
    return ["moment.js"];
  },
  start() {
    this.currentEntry = null;
    this.list = [];

    this.token = this.config.apiToken;
    this.workspaceId = this.config.workspaceId;
    setInterval(() => this.updateEntry(), this.config.updateInterval);

    const delayCalculator = () => {
      const EXTRA_DELAY = 50;
      return 1000 - moment().milliseconds() + EXTRA_DELAY;
    };
    const notificationTimer = () => {
      this.updateDom();
      setTimeout(notificationTimer, delayCalculator());
    };
    setTimeout(notificationTimer, delayCalculator());

    moment.locale(config.language);
  },

  getDom() {
    const wrapper = document.createElement("div")
    if (this.currentEntry !== null) {
      const durationSec = this.getDurationFormat(new Date(this.currentEntry.start));
      const dration = this.secToDayTime(durationSec);
      if (this.currentEntry.description) {
        wrapper.innerHTML = `Tracking: 【${this.currentEntry.description} (${dration})】`;
      } else {
        wrapper.innerHTML = `Tracking: 【No name (${dration})】`;
      }
      wrapper.innerHTML += '<button id="stop_button">■</button>';
    } else if (this.list.length > 0) {
      const lastEntry = this.list[this.list.length - 1];
      const todayTotal = this.secToDayTime(this.list.reduce((acc, cur) => acc + cur.duration, 0));

      if (lastEntry.description) {
        const entryTotal = this.secToDayTime(this.list.filter(entry => entry.description === lastEntry.description).reduce((acc, cur) => acc + cur.duration, 0));
        wrapper.innerHTML = `Last entry:【${lastEntry.description} (total: ${entryTotal})】`;
      } else {
        wrapper.innerHTML = `Last entry:【No name (${this.secToDayTime(lastEntry.duration)})】`;
      }
      wrapper.innerHTML += `Today's total: ${todayTotal}`;
      wrapper.innerHTML += '<button id="start_button">▶</button>';
    } else {
      wrapper.innerHTML = "Track now! There is no entry today.";
      wrapper.innerHTML += '<button id="start_button">▶</button>';
    }
    wrapper.addEventListener("click", () => this.toggleTrack());
    return wrapper;
  },
  updateEntry() {
    fetch("https://api.track.toggl.com/api/v9/me/time_entries/current", {
      method: "GET",
      headers: this.getHeaders(),
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json === null) {
          this.currentEntry = null;
        } else {
          this.currentEntry = json;
        }
      })
      .catch(err => this.currentEntry = null);
    if (this.currentEntry === null) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayLast = new Date();
      todayLast.setHours(23, 59, 59, 999);
      fetch(`https://api.track.toggl.com/api/v9/me/time_entries?start_date=${todayStart.toISOString()}&end_date=${todayLast.toISOString()}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
        .then((resp) => resp.json())
        .then((json) => {
          if (json === null) {
            this.list = [];
          } else {
            this.list = json.filter((entry) => entry.duration > 0).reverse(); // sort by ascend time
          }
        })
        .catch(err => this.list = []);
    }
  },

  toggleTrack() {
    if (this.currentEntry !== null) {
      fetch(`https://api.track.toggl.com/api/v9/workspaces/${this.workspaceId}/time_entries/${this.currentEntry.id}/stop`, {
        method: "PATCH",
        headers: this.getHeaders(),
      })
        .then((resp) => resp.json())
        .finally(() => {
          this.updateEntry();
        });
    } else {
      let body = {
        created_with: "MMM-Toggl",
        start: new Date().toISOString(),
        workspaceId: this.workspaceId,
        wid: this.workspaceId,
        duration: -1,
      }
      if (this.list.length > 0) {
        const lastEntry = this.list[this.list.length - 1];
        const extra = {
          description: lastEntry.description,
          project_id: lastEntry.project_id,
          tag_ids: lastEntry.tag_ids
        };
        body = {...body, ...extra};
      }
      fetch(`https://api.track.toggl.com/api/v9/workspaces/${this.workspaceId}/time_entries`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      })
        .then((resp) => resp.json())
        .finally(() => {
          this.updateEntry();
        });
    }
  },
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${this.token}:api_token`)}`
    }
  },
  getDurationFormat(time) {
    let t1 = new Date();
    let t2 = time;
    let diff = t1.getTime() - t2.getTime();
    return Math.floor(diff / 1000);
  },
  secToDayTime(seconds) {
    const hour = Math.floor(seconds % 86400 / 3600).toString().padStart(2, '0');
    const min = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    const time = `${hour}:${min}:${sec}`;
    return time;
  }
});
