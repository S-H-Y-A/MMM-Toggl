# MMM-Toggl
This plugin shows today's [Toggl Track](https://toggl.com/) entries.
>[!WARNING]
> This is a personal project. Therefore, I will not be addressing issues or feature requests.

![No Track](./no_track.png)
![Tracking](./tracking.png)
![Not tracking](./not_tracking.png)

## Installation
Berofe you install MMM-Toggl, make sure you can [access your account](https://track.toggl.com/timer).

### Install

In your terminal, go to your [MagicMirror²][mm] Module folder and clone MMM-Toggl:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/S-H-Y-A/MMM-Toggl
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-Toggl
git pull
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```js
    {
        module: 'MMM-Toggl',
        position: 'bottom_bar',
        config: {
            apiToken: "********************************"
            workspaceId: 1234567
            updateInterval: 3 * 1000
        }
    },
```

## Configuration
Key|Possible values|Default|Description
------|------|------|-----------
`apiToken`|`string`|not available|your token, which you can find in [Profile Page](https://track.toggl.com/profile)
`workspaceId`|`number`|not available|the workspaceId of your workspace, which is included in URL of [Reports Page](https://track.toggl.com/reports/)
`updateInterval`|`number`|3000|Interval to synchronise with Toggl server (It is recommended `updateInterval` is more than 1000)

## Sending notifications to the module
not available

## Links
* [Toggl Track API](https://engineering.toggl.com/docs/)
* [Magic Mirror Template](https://github.com/Dennis-Rosenbaum/MMM-Template/)
* [Magic Mirror](https://github.com/MagicMirrorOrg/MagicMirror)