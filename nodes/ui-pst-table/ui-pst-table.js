module.exports = function(RED) {
	const ui = RED.require("node-red-dashboard")(RED);
    function UiPstTableNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.group = config.group;
        this.width = config.width;
        this.height = config.height;
        this.order = config.order;

        const html = String.raw`
<style>
    .custom-table {
        width: 100%;
        border-collapse: collapse;
        font-family: "Segoe UI", sans-serif;
        font-size: 14px;
    }

    .custom-table th,
    .custom-table td {
        border-bottom: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    .custom-table th {
        background-color: #f0f4f8;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;
        color: #444;
    }

    .custom-table tr:hover {
        background-color: #f9f9f9;
    }

    .tag {
        display: inline-block;
        background-color: #d9edf7;
        color: #31708f;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        cursor: help;
    }
</style>

<div ng-if="msg && msg.payload && msg.payload.length > 0">
    <table class="custom-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Item ID</th>
                <th>Data</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="item in msg.payload">
                <td>{{$index + 1}}</td>
                <td>
					<span class="tag" title="Item first created on {{item._created | date:'yyyy-MM-dd HH:mm:ss'}}&#10;Updated on {{item._updated | date:'yyyy-MM-dd HH:mm:ss'}}&#10;&#10;HISTORY:&#10;{{item._historyStr}}">
						{{item.id}}
					</span>
                </td>
                <td>
                    <div ng-if="item.userdata && (item.userdata | json) !== '{}'">
                        <pre style="margin: 0; white-space: pre-wrap;">{{item.userdata | json}}</pre>
                    </div>
                    <div ng-if="!item.userdata || (item.userdata | json) === '{}'">
                        <span style="color: #aaa; font-style: italic;">(Empty)</span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<div ng-if="!msg || !msg.payload || msg.payload.length === 0">
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
							item._historyStr = item._history.map(h => {
								const toDate = new Date(h.date_to || 0).toISOString().replace('T', ' ').substring(0, 19);
								return `${toDate}:  ${h.path_from || 'N/A'} ➔ ${h.path_to || 'N/A'}`;
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
			//console.log("ui-pst-table received input:", msg);
			this.send(msg); 
		});

    }

    RED.nodes.registerType("ui-pst-table", UiPstTableNode);
};
