const { randomUUID } = require('crypto');
const fs = require("fs");

const dir = "/data/pststacks";
module.exports = function(RED) {
	
	// ##########################################################
    // Push Node
	// ##########################################################
	function PushNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.stack = RED.nodes.getNode(config.stack);
		if (!node.stack) {
			node.error("Stack configuration node is missing.");
			return;
		}
		
		node.stackdata = getStackData(node.stack);
		
		node.status({fill:"green",shape:"dot",text: node.stack.stackmemory.length+"/"+node.stack.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stack.registerNode(node);
		node.onUpdate = function(stackNode) {
			node.status({fill:"green", shape:"dot", text:stackNode.stackmemory.length+"/"+stackNode.maxitem});
		};
		
		// Lors de l'arrivée d'un message
        node.on('input', async function(msg, send, done) {
			let error = false;
			
			// Step 1: Analyse Item
			if(!error){
				msg.item = msg.payload;
				if(msg.item===null) error = 1;
			}
			
			// Step 2: Push Item
			if(!error){
				error = await node.stack.pushItem(msg.item);
			}
			
			if(!error){
				msg.payload = true;
				msg.error = {code:0, string:"ok"};
				msg.stackdata = node.stackdata;
				//node.status({fill:"green",shape:"dot",text:node.stack.stackmemory.length+"/"+node.stack.maxitem});
				send(msg);
				done();
			}
			else
			{
				msg.payload = false;
				msg.error = getError(error);
				msg.stackdata = node.stackdata;
				node.status({fill:"red",shape:"dot",text:"Error: "+msg.error.string});
				send(msg);
				done(msg.error.string);
			}
        });
		
		this.on('close', function(removed, done) {
			node.stack.unregisterNode(node);
			if (removed) {
				
			} else {
				// This node is being restarted
			}
			done();
		});
		
    }
	// ##########################################################
	
	
	
	
	
	// ##########################################################
    // Shift Node
	// ##########################################################
    function ShiftNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        // Retrieve the config node
        node.stack = RED.nodes.getNode(config.stack);
		if (!node.stack) {
			node.error("Stack configuration node is missing.");
			return;
		}
		
		node.stackdata = getStackData(node.stack);
		
		
		node.status({fill:"green",shape:"dot",text: node.stack.stackmemory.length+"/"+node.stack.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stack.registerNode(node);
		node.onUpdate = function(stackNode) {
			node.status({fill:"green", shape:"dot", text:stackNode.stackmemory.length+"/"+stackNode.maxitem});
		};
		
		
        node.on('input', async function(msg, send, done) {
			let error = false;
						
			// Step 2: shiftItem
			if(!error){
				msg.payload = await node.stack.shiftItem();
			}
			
			if(!error){
				msg.error = {code:0, string:"ok"};
				msg.stackdata = node.stackdata;
				send(msg);
				done();
			}
			else
			{
				msg.payload = false;
				msg.error = getError(error);
				msg.stackdata = node.stackdata;
				node.status({fill:"red",shape:"dot",text:"Error: "+msg.error.string});
				send(msg);
				done(msg.error.string);
			}
        });
		
		this.on('close', function(removed, done) {
			node.stack.unregisterNode(node);
			if (removed) {
				// This node is being removed
			} else {
				// This node is being restarted
			}
			done();
		});
    }
	// ##########################################################
	
	
	
	
	
	// ##########################################################
    // transfert Node
	// ##########################################################
    function TransfertNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.stackin = RED.nodes.getNode(config.stackin);
		if (!node.stackin) {
			node.error("Stack in configuration node is missing.");
			return;
		}
        node.stackout = RED.nodes.getNode(config.stackout);
		if (!node.stackout) {
			node.error("Stack out configuration node is missing.");
			return;
		}
		
		node.stackindata = getStackData(node.stackin);
		node.stackoutdata = getStackData(node.stackout);
		
		node.status({fill:"green",shape:"dot",text: node.stackout.stackmemory.length+"/"+node.stackout.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stackout.registerNode(node);
		node.onUpdate = function(stackout) {
			node.status({fill:"green", shape:"dot", text:stackout.stackmemory.length+"/"+stackout.maxitem});
		};
		
        node.on('input', async function(msg, send, done) {
			const item = await node.stackin.shiftItem();
			if (item) {
				const err = await node.stackout.pushItem(item);
				if (err === 0) {
					msg.payload = true;
					msg.error = { code: 0, string: "ok" };
				} else {
					msg.payload = false;
					msg.error = getError(err);
				}
			} else {
				msg.payload = null;
				msg.error = getError(3); // pile in vide
			}
			send(msg);
			done();
        });
		
		this.on('close', function(removed, done) {
			node.stackin.unregisterNode(node);
			node.stackout.unregisterNode(node);
			if (removed) {
				// This node is being removed
			} else {
				// This node is being restarted
			}
			done();
		});
    }
	// ##########################################################
	
	
	
	// ##########################################################
    // Supervisor Node
	// ##########################################################
    function SupervisorNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		
        node.stack = RED.nodes.getNode(config.stack);
		if (!node.stack) {
			node.error("Stack configuration node is missing.");
			return;
		}
		node.autoUpdate = config.autoUpdate; 
		
		node.stackdata = getStackData(node.stack);
		
		node.status({fill:"green",shape:"dot",text: node.stack.stackmemory.length+"/"+node.stack.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stack.registerNode(node);
		node.onUpdate = function(stackNode) {
			//const send = node.send || function() {};
			
			node.status({fill:"green", shape:"dot", text:stackNode.stackmemory.length+"/"+stackNode.maxitem});
			
			// Envoi automatique d’un message à la sortie
			if (node.autoUpdate) {
				const stackdata = stackNode.getStack();
				const msgid = randomUUID();
				const msg1 = {
					_msgid: msgid,
					topic: "stack-update",
					payload: stackdata,
					path: stackNode.path,
					error: { code: 0, string: "ok" }
				};
				const msg2 = {
					_msgid: msgid,
					topic: "ui-table",
					payload: stackdata  // à formatter côté ui_template
				};
				
				node.send([msg1, msg2]); 
			}
		};
		
		
        node.on('input', function(msg, send, done) {
			const stackdata = node.stack.getStack();
			msg.payload = stackdata;
			msg.path = node.stack.path;
			msg.error = { code: 0, string: "ok" };	
			const msgid = msg._msgid || randomUUID();		
			const msg2 = {
				_msgid: msgid,
				topic: "ui-table",
				payload: msg.payload  // à formatter côté ui_template
			};
            send([msg, msg2]);
			if(done) done();
        });
		
		this.on('close', function(removed, done) {
			node.stack.unregisterNode(node);
			if (removed) {
				// This node is being removed
			} else {
				// This node is being restarted
			}
			done();
		});
    }
	// ##########################################################
	
	
	
	// ##########################################################
    // Peek Node
	// ##########################################################
    function PeekNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		
        node.stack = RED.nodes.getNode(config.stack);
		if (!node.stack) {
			node.error("Stack configuration node is missing.");
			return;
		}
		
		node.stackdata = getStackData(node.stack);
		
		node.status({fill:"green",shape:"dot",text: node.stack.stackmemory.length+"/"+node.stack.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stack.registerNode(node);
		node.onUpdate = function(stackNode) {
			node.status({fill:"green", shape:"dot", text:stackNode.stackmemory.length+"/"+stackNode.maxitem});
		};
		
		
        node.on('input', function(msg, send, done) {
			msg.payload = node.stack.peekItem();
			msg.path = node.stack.path;
            send(msg);
			if(done) done();
        });
		
		this.on('close', function(removed, done) {
			node.stack.unregisterNode(node);
			if (removed) {
				// This node is being removed
			} else {
				// This node is being restarted
			}
			done();
		});
    }
	// ##########################################################
	
	
	
	
	
	// ##########################################################
    // Clear Stack Node
	// ##########################################################
    function ClearStackNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		
        node.stack = RED.nodes.getNode(config.stack);
		node.stackdata = getStackData(node.stack);
		
		
		node.status({fill:"green",shape:"dot",text: node.stack.stackmemory.length+"/"+node.stack.maxitem});
		
		// Evenements depuis le noeud de configuration
		node.stack.registerNode(node);
		node.onUpdate = function(stackNode) {
			node.status({fill:"green", shape:"dot", text:stackNode.stackmemory.length+"/"+stackNode.maxitem});
		};
		
		
        node.on('input', async function(msg, send, done) {
			await node.stack.clearStack();
			msg.error = {code:0, string:"ok"};
			msg.stackdata = node.stackdata;
			send(msg);
			done();
        });
		
		this.on('close', function(removed, done) {
			node.stack.unregisterNode(node);
			if (removed) {
				// This node is being removed
			} else {
				// This node is being restarted
			}
			done();
		});
    }
	// ##########################################################
	
	
	
	
	
	// ##########################################################
    // Configuration Nodes
	// ##########################################################
    function ProcessFlowNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.processid = config.processid;
		
        this.company = config.company;
        this.department = config.department;
        this.location = config.location;
    }
	
    function ManufacturingCellNode(config) {
        RED.nodes.createNode(this,config);
        this.processflow = RED.nodes.getNode(config.processflow);
        this.name = config.name;
        this.cellid = config.cellid;
		
		this.manufacturer = config.manufacturer;
		this.model = config.model;
    }
	
    function stackNode(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        const context = node.context();
		const fileLock = createLock();
		
		// ---------------------------------------
		// stack Node Data
		// ---------------------------------------
		// Params
        node.manufacturingcell = RED.nodes.getNode(config.manufacturingcell);
		node.mqttClient = RED.nodes.getNode(config.mqttClient);
        node.name = config.name;
        node.stackid = config.stackid;
		node.maxitem = parseInt(config.maxitem) || 100; // valeur par défaut si vide
		node.mqttTopicEvent = config.mqttTopicEvent || null;
		node.mqttTopicSuperv = config.mqttTopicSuperv || null;
		node.mqttTopicCommand = config.mqttTopicCommand || null;
		
		
		// Internal Data 
		node.stackmemory = context.get("stackmemory") || [];
		node.path = node.manufacturingcell.processflow.processid+'/'+node.manufacturingcell.cellid+'/'+node.stackid;
		node.stackData = getStackData(node);
		node.mqttSuperV = {path:node.path, profil:node.stackData};
		// ---------------------------------------
		
		
		
		
		// ---------------------------------------
		// Manage child Node Events
		// ---------------------------------------
		node.clientNodes = [];
		node.registerNode = function(clientNode) {
			if (!node.clientNodes.includes(clientNode)) {
				node.clientNodes.push(clientNode);
			}
		};
		node.unregisterNode = function(clientNode) {
			const index = node.clientNodes.indexOf(clientNode);
			if (index !== -1) {
				node.clientNodes.splice(index, 1); // retire le client
			}
		};
		node.notifyNodes = function() {
			for (const clientNode of node.clientNodes) {
				if (typeof clientNode.onUpdate === "function") {
					clientNode.onUpdate(node);
				}
			}
		};
		// ---------------------------------------
		
		
		
		
		
		// ---------------------------------------
		// MQTT in Events
		// ---------------------------------------
		if (node.mqttClient && node.mqttTopicCommand && typeof node.mqttClient.register === "function") {
			node.mqttClient.register(node);
			node.on("mqtt:message", function(topic, payload, packet) {
				if (topic === node.mqttTopicCommand) {
					try {
						const message = JSON.parse(payload.toString());

						switch(message.command||null) 
						{
							case "push":
								const item = message.item;
								if(item) node.pushItem(item);
								break;
								
							case "shift":
								node.shiftItem();
								break;
								
							case "clear":
								node.clearStack();
								break;
								
							case "peek":
								node.peekItem();
								break;
								
							case "superv":
								node.notifyNodes();
								node.publishMQTT({ event: "supervRequest" });
								break;
						}

						// Autres commandes personnalisées possibles ici
					} catch (err) {
						node.warn("Error parsing MQTT control message: " + err.message);
					}
				}
			});
		}
		// ---------------------------------------
		
		
		
		
		// ---------------------------------------
		// Child Nodes Methods
		// ---------------------------------------
        node.pushItem = async function(item) {
			if (node.stackmemory.length >= node.maxitem) {
				return 2; // code d’erreur : stack pleine
			}
			item = getItem(item, node.path);
            node.stackmemory.push(item);
            context.set("stackmemory", node.stackmemory);
			await node.saveStack();
			node.notifyNodes();
			node.publishMQTT({ event: "push", item:item });
            return 0;
		}
		
		node.shiftItem = async function () {
			let item = node.stackmemory.shift()||null;
            context.set("stackmemory", node.stackmemory);
			await node.saveStack();
			node.notifyNodes();
			node.publishMQTT({ event: "shift", item:item});
            return item;
		}
		
        node.getStack = function() {
            return node.stackmemory;
        };

        node.clearStack = async function() {
            node.stackmemory = [];
            context.set("stackmemory", node.stackmemory);
			await node.saveStack();
			node.notifyNodes();
			node.publishMQTT({ event: "clear" });
        };
		
		node.peekItem = function () {
			let peek = node.stackmemory.length > 0 ? node.stackmemory[0] : null;
			node.notifyNodes();
			node.publishMQTT({ event: "peek", item: peek });
			return peek;
		};
		// ---------------------------------------
		
		
		
		
		
		
		
		// ---------------------------------------
		// File Access Methods
		// ---------------------------------------
		const stackFile = `${dir}/${node.manufacturingcell.processflow.processid}/${node.manufacturingcell.cellid}/${node.stackid}.json`;
		if (!fs.existsSync(dir)) {fs.mkdirSync(dir, { recursive: true });}
		
		node.loadStack = async function() {
			if (fs.existsSync(stackFile)) {
				try {
					const data = await fs.promises.readFile(stackFile);
					node.stackmemory = JSON.parse(data.toString());
				} catch (e) {
					node.warn("Could not load persisted stack: " + e.message);
				}
			}
		};
		

		node.saveStack = function() {
			return fileLock.run(async () => {
				try {
					// 👇 Créer le dossier parent du fichier s'il n'existe pas
					const dirPath = require("path").dirname(stackFile);
					await fs.promises.mkdir(dirPath, { recursive: true });
					
					await fs.promises.writeFile(stackFile, JSON.stringify(node.stackmemory));
				} catch (e) {
					node.warn("Could not save stack: " + e.message);
				}
			});
		};
		// ---------------------------------------
		
		
		
		
		// ---------------------------------------
		// MQTT out methods
		// ---------------------------------------
		node.publishMQTT = function (payloadEvent) {
			// Publish Event to Topic "Event"
			if (payloadEvent && node.mqttClient && node.mqttTopicEvent) {
				payloadEvent.count = node.stackmemory.length;
				payloadEvent.length = node.maxitem;
				payloadEvent.path = node.path;
				try {
					const msg = {
						topic: node.mqttTopicEvent,
						payload: JSON.stringify(payloadEvent),
						qos: 0,
						retain: false
					};
					node.mqttClient.publish(msg);
				} catch (err) {
					node.warn("MQTT publish error: " + err.message);
				}
			}
			
			// Publish Supervision to Topic "Superv"
			if (node.mqttSuperV && node.mqttClient && node.mqttTopicSuperv) {
				node.mqttSuperV.stack = node.stackmemory;
				node.mqttSuperV.count = node.stackmemory.length;
				node.mqttSuperV.length = node.maxitem;
				try {
					const msg = {
						topic: node.mqttTopicSuperv,
						payload: JSON.stringify(node.mqttSuperV),
						qos: 0,
						retain: false
					};
					node.mqttClient.publish(msg);
				} catch (err) {
					node.warn("MQTT publish error: " + err.message);
				}
			}
		};
		// ---------------------------------------
		
		
		
		
		
		// ---------------------------------------
		// Node Close Event
		// ---------------------------------------
		node.on("close", function() {
			if (node.mqttClient && typeof node.mqttClient.deregister === 'function') {
				node.mqttClient.deregister(node);
			}
		});
		
		
		
		
		// ---------------------------------------
		// loadStack from File after Init
		// ---------------------------------------
		node.loadStack().then(() => {
			context.set("stackmemory", node.stackmemory);
			node.notifyNodes(); // ← met à jour tous les statuts à la reprise
		});
    }
	// ##########################################################
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function createLock() {
		let promise = Promise.resolve();
		return {
			run(fn) {
				const next = promise.then(() => fn()).catch(() => {});
				promise = next;
				return next;
			}
		};
	}
	
	function getStackData(stack)
	{
		if (!stack || !stack.manufacturingcell || !stack.manufacturingcell.processflow) return {};
		return {
			processid:stack.manufacturingcell.processflow.processid||null,
			processname:stack.manufacturingcell.processflow.name||null,
			company:stack.manufacturingcell.processflow.company||null,
			department:stack.manufacturingcell.processflow.department||null,
			location:stack.manufacturingcell.processflow.location||null,
			cellid:stack.manufacturingcell.cellid||null,
			cellname:stack.manufacturingcell.name||null,
			manufacturer:stack.manufacturingcell.manufacturer||null,
			model:stack.manufacturingcell.model||null,
			stackid:stack.stackid||null,
			stackname:stack.name||null,
		};
		
	}
	
	function getError(error)
	{
		switch(error)
		{
			case 0:
			case false:
				return {code:0, string:"ok"};
				
			case 1:
				return {code: error, string:"Error 1: Bad item entry"};
				
			case 2:
				return {code: error, string:"Error 2: stack full"};
				
			case 3:
				return {code: error, string: "Error 3: stack is empty" };
	
			default:
				return {code:-1, string:"Unknown Error"};
		}
		return {code:-1, string:"Unknown Error"};
	}
	
	function getItem(item, path=null, debug = false) {
		let newItem = true;
		
		let ts = Date.now();
		
		if(typeof item == "object" && item.id) newItem=false;

		if (item === null || Array.isArray(item)) {
			if (debug) console.warn("Rejected: null or array");
			return null;
		}

		if (typeof item === "string" || typeof item === "number") {
			item = { id: item };
			newItem = true;
		} else if (typeof item !== "object") {
			if (debug) console.warn("Rejected: not an object, string or number");
			return null;
		}

		if ((item.id ?? null) == null || (typeof item.id !== "string" && typeof item.id !== "number")) {
			if (debug) console.warn("Rejected: missing or invalid 'id' field");
			return null;
		}

		const idStr = String(item.id).trim();
		if(idStr == "") idStr = randomUUID();

		if (!/^[a-zA-Z0-9_\-\/]+$/.test(idStr)) {
			if (debug) console.warn(`Rejected: invalid characters in id "${idStr}"`);
			return null;
		}

		if (idStr.length < 1 || idStr.length > 128) {
			if (debug) console.warn(`Rejected: id length out of bounds (${idStr.length})`);
			return null;
		}
		
		let _history_item = {
			date_from:item._updated||null, 
			date_to:ts, 
			age:(ts-(item._created||ts)),
			duration:(ts(item._updated||ts)),
			path_from:item._path||null, 
			path_to:path
		};
		
		if(newItem)
		{
			return {
				_itemid: randomUUID(),
				_created: ts,
				_updated: ts,
				_history: [_history_item],
				_path:path,
				id: idStr,
				userdata: (typeof item.userdata === "object" && item.userdata !== null && !Array.isArray(item.userdata)) ? item.userdata : {}
			};
		}
		else
		{
			let _history = item._history || [];
			_history.push(_history_item);
			return {
				_itemid: item._itemid || randomUUID(),
				_created: item._created || ts,
				_updated: ts,
				_path:path,
				id: idStr,
				_history: _history,
				userdata: (typeof item.userdata === "object" && item.userdata !== null && !Array.isArray(item.userdata)) ? item.userdata : {}
			};
		}
	}
		
	
	
	
	
	// ##########################################################
	// ##########################################################
	// Register Nodes
	// ##########################################################
	// ##########################################################
    RED.nodes.registerType("pst-push", PushNode);
    RED.nodes.registerType("pst-shift", ShiftNode);
    RED.nodes.registerType("pst-transfert", TransfertNode);
    RED.nodes.registerType("pst-peek", PeekNode);
    RED.nodes.registerType("pst-supervisor", SupervisorNode);
    RED.nodes.registerType("pst-clearstack", ClearStackNode);
	
	// CONFIG Nodes
    RED.nodes.registerType("pst-processflow", ProcessFlowNode);
    RED.nodes.registerType("pst-manufacturingcell", ManufacturingCellNode);
    RED.nodes.registerType("pst-stack",stackNode);
}