# 🧱 Virtual Process Flow Queue for Node-RED
## Description

Manage persistent FIFO queues for industrial process flows using Node-RED. \
With full MQTT support, file persistence, and dashboard integration.

> ** For pedagogical purposes only. Commercial or industrial use is not recommended. **

* NPM Repository: [npmjs @uopoc/node-red-processstack](https://www.npmjs.com/package/@uopoc/node-red-processstack/)
* GIT Repository: [github @uopoc/node-red-processstack](https://github.com/uopoc/node-red-processstack)
* RED Node: [Node-Red @uopoc/node-red-processstack](https://flows.nodered.org/node/@uopoc/node-red-processstack)

Copyright © 2025, [Université d'Orléans](https://www.univ-orleans.fr)\
Licensed under the MIT License – See [LICENCE](./LICENCE) file included with this package 

---

## ⚠️ Requirements

- Node-RED `v4.0.0+`
- Node.js `v18.0.0+`
- `node-red-dashboard` `v3.6.0+`

## 🧰 Main Features
- **Persistent FIFO** (First-In First-Out) queues (stacks)
- **MQTT commands & events** Optional
- **dashboard UI** ready using a specific node
- Structured by **Process / Cell / Queue**



## 🔧 Available Nodes

| Node         | Description |
|--------------|-------------|
| `pst-push`       | Adds an item to the queue |
| `pst-shift`      | Removes the first item from the queue |
| `pst-transfert`  | Moves an item from a source queue to a target queue |
| `pst-peek` 	   | Same as shift but without removing item |
| `pst-supervisor` | Returns the entire queue contents |
| `pst-clearstack` | Empties the queue completely |
| `ui-pst-table` | in Dashboard panel: display the content of the queue in the dashboard |

## 🛠️ Configuration Nodes

| Node                  			| Description 						|
|-----------------------------------|-----------------------------------|
| `pst-stack` *(config)*              	| Defines a persistent FIFO queue 	|
| `pst-manufacturingcell` *(config)* 	| Defines a production cell 		|
| `pst-processflow` *(config)*       	| Defines a production line  		|


## 💾 Persistence
Each queue is **automatically saved to disk** after every modification:\
/data/pststacks/<processid>/<cellid>/<stackid>.json

## Installation

```
npm install @uopoc/node-red-processstack
```

## ChangeLog
[Voir le changelog](./CHANGELOG.md)

## Nodes details
### PUSH Node
Add (push) an item to the FIFO queue
* **Input**:
 Object with :
	- id Required, string or number (max 128 chars). Allowed characters: a-z, A-Z, 0-9, _, -, 
	- userdata : Required, must be an object with any metadata you want to store (can be empty object)
**Rm**: msg.payload can also be an item provided by the pull node\
**Exemple**:\
	msg.payload = {\
	  "id": "ITEM-001",\
	  "userdata": { "batch": "B001", "weight": 2.5 }\
	} 
* **Output**: 
Object with :
	msg.payload = true/false\
	msg.item = {\
		  _itemid: uniqueid (UID),\
		  _created: creation timestamp (ms from 1970),\
		  _updated: last update timestamp,\
		  id: id providen in the input,\
		  userdata: userdata provided at the Input\
	msg.error = {\
		  code, \
		  string\
	}\
	msg.stackdata:{\
		  processid, \
		  processname, \
		  company, \
		  department, \
		  location, \
		  cellid, \
		  cellname, \
		  manufacturer, \
		  model, \
		  stackid, \
		  stackname\
	}

### SHIFT Node
Remove (shift) an item from the FIFO queue
* input: Dummy message to triger the node
* output: (same as peek or msg.item provided by the output of push node)

### PEEK Node
Get (whithout shift) an item from the FIFO queue
* input: Dummy message to triger the node
* output: (same as shift or msg.item provided by the output of push node)

### TRANSFERT Node
Transfert (pull/push) an item from a queue to another

### CLEAR Node
Delete all items from the FIFO queue

### SUPERVISOR Node
Get items list from the FIFO queue. \ 
Check the autoupdate checkbox in the node property in order to update the status every queue change.\ 
use the ui-pst-table or a ui-template node in order to display the queue in a dashboard.

### UI-PST-TABLE Node
In Dashboard panel: display the content of the queue in the dashboard\ 
Should be connected to the second output of the supervisor node.\ 
It can replace a ui-template node

## MQTT
You can connect the queue config node to a mqttClient and provide 3 topics:
* **Command**: (not implemented) Input command (push, shift, clear, peek)
* **Events**: Every event (push, shift, clear, etc.) will emit message
* **Superv**: Emits complete queue state and profile after event


### Superv
Please configure the topic and the mqtt client in the queue config Node
after each operation, a mqtt message is send to the specified topic: \
**Content**:
* path: (string) processid/stackid, 
* profil: {...}, 
* stack: [item1,...] 
* count: Number of item in the queue 
* length: Maximum number of item in the queue

### Events
Please configure the topic and the mqtt client in the queue config Node\
after each operation, a mqtt message is send to the specified topic: \
**Content**: 
* path: (string) processid/stackid,
* event: (string) type of activity (push, shift, clear...)
* item: (object) item
* count: (number) Number of item in the queue
* length: (number) Maximum number of item in the queue

### Command
Not Implemented Yet

## About Us
* **Company**: Université d'Orléans – France  
* **Department**: Polytech Orléans (Engineering School of the University of Orléans)  
* **Specialization**: Industrial Engineering applied to cosmetics, pharmaceuticals, and food industries [Learn more about our program](https://www.univ-orleans.fr/en/polytech/departments/les-7-specialites-dingenieures-de-lecole/industrial-engineering-applied) 
* **Facility**: Teaching Factory – *Polyfactory* 


