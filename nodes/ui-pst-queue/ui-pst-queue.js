module.exports = function(RED) {
	const ui = RED.require("node-red-dashboard")(RED);
    function UiPstTableNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.group = config.group;
        this.width = config.width;
        this.height = config.height;
        this.order = config.order;

        const html = String.raw`<style>
    .stack-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px;
        overflow-x: auto;
    }

    .stack-item {
        width: 30px;
        height: 30px;
        background-color: #4CAF50;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
    }
</style>

<div class="stack-bar" ng-if="msg && msg.payload && msg.payload.length">
	<div class="stack-item" style="width:10px; background-color:black; cursor: inherit;"></div>
    <div class="stack-item" ng-repeat="item in msg.payload" title="{{'Item ID: ' + item.id + '\n' + (item._historyStr || '')}}">
    </div>
</div>

<div ng-if="!msg || !msg.payload || !msg.payload.length">
    <p style="color: gray; font-style: italic;">Empty</p>
</div>
`;

        const done = ui.addWidget({
            node: this,
            group: config.group,
            order: config.order,
            width: config.width,
            height: config.height,
            format: html,
            templateScope: "local",
            emitOnlyNewValues: false,
            forwardInputMessages: true,
            storeFrontEndInputAsState: false,
			convertBack: value => value,
			beforeEmit: function(msg) {
				if (Array.isArray(msg.payload)) {
					msg.payload.forEach(item => {
						if (Array.isArray(item._history)) {
							item._data = Object.entries(item.userdata || {})
							.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
							.join('\n');
							item._historyStr = item._history.map(h => {
								const toDate = new Date(h.date_to || 0).toISOString().replace('T', ' ').substring(0, 19);
								return `${toDate}: ${h.path_from || '-'} ➔ ${h.path_to || '-'}`;
							}).join('\n');
						} else {
							item._historyStr = '';
						}
					});
				}
				return { msg };
			}
        });

        this.on("close", done);
		
		this.on('input', (msg) => {
			this.send(msg); 
		});

    }

    RED.nodes.registerType("ui-pst-queue", UiPstTableNode);
};
