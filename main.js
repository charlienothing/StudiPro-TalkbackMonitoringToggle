// Talkback Record Guard for Fender Studio Pro 8
// Experimental: uses Studio Pro's internal/community-documented scripting API.
//
// Behavior:
//   Transport Record ON  -> Monitor OFF for both talkback channels
//   Transport Record OFF -> Monitor ON  for both talkback channels
//
// This follows the actual transport Record state, so it works regardless of
// whether Record/Stop came from the keyboard, ATOM, RAVEN, mouse, etc.
//
// IMPORTANT: Track/channel labels must exactly match the names below.

var TB_CHANNEL_NAMES = [
    "Talkback",
    "TB - Room"
];

var POLL_MS = 25;
var POLL_MESSAGE = "TalkbackRecordGuard.Poll";

function safeString(value)
{
    try
    {
        if (value === undefined || value === null)
            return "";
        return String(value);
    }
    catch (e)
    {
        return "";
    }
}

function isTargetChannel(channel)
{
    if (!channel)
        return false;

    var label = safeString(channel.label);
    var title = safeString(channel.title);

    for (var i = 0; i < TB_CHANNEL_NAMES.length; i++)
    {
        var target = TB_CHANNEL_NAMES[i];
        if (label === target || title === target)
            return true;
    }

    return false;
}

function TalkbackRecordGuard()
{
    this.interfaces = [
        Host.Interfaces.IComponent,
        Host.Interfaces.IObserver
    ];

    this.running = false;
    this.lastRecordState = -1;
    this.lastTransportPanel = null;

    this.setTalkbackMonitoring = function(enabled)
    {
        var mixer = Host.Objects.getObjectByUrl(
            "://hostapp/DocumentManager/ActiveDocument/Environment/MixerConsole"
        );

        if (!mixer)
            return;

        var channels = mixer.getChannelList(1);
        if (!channels)
            return;

        for (var i = 0; i < channels.numChannels; i++)
        {
            var channel = channels.getChannel(i);
            if (!isTargetChannel(channel))
                continue;

            if (channel.recordUnit)
                channel.recordUnit.monitorActive = enabled ? 1 : 0;
        }
    };

    this.poll = function()
    {
        var transport = Host.Objects.getObjectByUrl(
            "://hostapp/DocumentManager/ActiveDocument/Environment/TransportPanel"
        );

        // No Song currently open.
        if (!transport)
        {
            this.lastTransportPanel = null;
            this.lastRecordState = -1;
            return;
        }

        var recordParam = transport.findParameter("record");
        if (!recordParam)
            return;

        var recording = recordParam.value ? 1 : 0;

        // Force a sync when a Song/document changes, then only act on
        // Record-state transitions so manual monitor changes are otherwise
        // left alone between transitions.
        var documentChanged = (this.lastTransportPanel !== transport);

        if (documentChanged || recording !== this.lastRecordState)
        {
            this.lastTransportPanel = transport;
            this.lastRecordState = recording;

            // Recording = TB monitoring OFF
            // Not recording = TB monitoring ON
            this.setTalkbackMonitoring(recording ? 0 : 1);
        }
    };

    this.schedulePoll = function()
    {
        if (this.running)
            Host.Signals.postMessage(this, POLL_MS, POLL_MESSAGE);
    };

    this.initialize = function(context)
    {
        this.running = true;
        this.lastRecordState = -1;
        this.lastTransportPanel = null;

        try
        {
            Host.Objects.registerObject(this, "TalkbackRecordGuard");
        }
        catch (e) {}

        this.schedulePoll();
        return Host.Results.kResultOk;
    };

    this.notify = function(subject, msg)
    {
        if (!this.running || !msg || msg.id !== POLL_MESSAGE)
            return;

        try
        {
            this.poll();
        }
        catch (e)
        {
            // Intentionally fail quietly so a transient Song/UI state does not
            // interrupt Studio Pro. The next poll will try again.
        }

        this.schedulePoll();
    };

    this.terminate = function()
    {
        this.running = false;

        try
        {
            Host.Objects.unregisterObject("TalkbackRecordGuard");
        }
        catch (e) {}

        return Host.Results.kResultOk;
    };
}

function createInstance()
{
    return new TalkbackRecordGuard();
}
